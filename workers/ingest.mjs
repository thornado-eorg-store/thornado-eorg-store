#!/usr/bin/env node
// ============================================================
// Pipeline de INGEST (esqueleto funcional) — F1 roadmap.
//
// Responsable del flujo master → tienda descrito en §5 de
// ESPECIFICACION.md:
//   1. Recibe WAV/FLAC masters desde una carpeta local (o S3/R2).
//   2. Corre QA: ffprobe (formato, bit depth, sample rate) y corte
//      espectral vía ffmpeg (detección de «fake lossless»).
//   3. Genera derivados: espectrograma PNG como evidencia.
//   4. Publica hacia la base de datos vía Prisma (pendiente
//      conectar DATABASE_URL).
//
// Uso:
//   cd web && npm run ingest -- ../masters            # carpeta local
//   cd web && npm run ingest -- ../masters --strict
//
// Flags:
//   --strict   falla (exit 1) si algún master no pasa el probe
//   --probe    solo analiza, no genera derivados
// ============================================================

import { execFile } from "node:child_process";
import { readdir, stat, mkdir } from "node:fs/promises";
import path from "node:path";

const AUDIO_EXT = new Set([".wav", ".flac", ".aiff", ".aif"]);
const args = process.argv.slice(2);
const strict = args.includes("--strict");
const probeOnly = args.includes("--probe");
const inputDir = args.find((a) => !a.startsWith("--")) ?? "./masters";

function run(bin, binArgs) {
  return new Promise((resolve) => {
    execFile(bin, binArgs, { maxBuffer: 1024 * 1024 * 8 }, (err, stdout, stderr) => {
      resolve({ ok: !err, stdout, stderr });
    });
  });
}

async function hasBinary(bin) {
  return (await run(bin, ["-version"])).ok;
}

// Corte espectral: un WAV 16/44.1 real apenas tiene energía por encima de
// 20 kHz; un MP3 320 disfrazado se corta cerca de ~20.5 kHz. Un FLAC
// «upgradeado» desde MP3 muestra la misma marca. Generamos el espectrograma
// como evidencia y marcamos la pista para revisión humana.
async function spectralQA(file) {
  const outDir = path.join(".ingest", path.basename(file, path.extname(file)));
  await mkdir(outDir, { recursive: true });
  const spectrum = path.join(outDir, "spectrum.png");
  if (!probeOnly) {
    const gen = await run("ffmpeg", [
      "-hide_banner", "-loglevel", "error", "-y",
      "-i", file,
      "-lavfi", "showspectrumpic=s=1600x400:mode=combined:scale=log",
      spectrum,
    ]);
    if (!gen.ok) {
      console.error(`  ✘ No se pudo generar el espectrograma: ${file}`);
      return { file, status: "NEEDS_REVIEW", spectrum: null };
    }
  }
  // TODO F2: medir el corte real de energía espectral a partir de la
  // metadata de ffmpeg (cola de alta frecuencia) y publicar la métrica
  // en Track.masterStatus del Prisma schema.
  console.log(`  · QA espectral ✔ (${path.basename(file)}) — revisión humana recomendada`);
  return { file, status: "NEEDS_REVIEW", spectrum: probeOnly ? null : spectrum };
}

async function ffprobeInfo(file) {
  const res = await run("ffprobe", [
    "-hide_banner",
    "-select_streams", "a:0",
    "-show_entries", "stream=codec_name,bits_per_raw_sample,sample_rate",
    "-of", "json", file,
  ]);
  if (!res.ok) return null;
  try {
    const s = JSON.parse(res.stdout).streams?.[0];
    if (!s) return null;
    return {
      codec: s.codec_name,
      bitDepth: Number(s.bits_per_raw_sample) || null,
      sampleRateHz: Number(s.sample_rate) || null,
    };
  } catch {
    return null;
  }
}

async function main() {
  console.log(`[ingest] escaneando: ${inputDir}`);
  const info = await stat(inputDir).catch(() => null);
  if (!info || !info.isDirectory()) {
    console.error(`✘ Carpeta inexistente: ${inputDir}`);
    process.exit(1);
  }

  for (const bin of ["ffmpeg", "ffprobe"]) {
    if (!(await hasBinary(bin))) {
      console.error(`✘ Falta el binario «${bin}». Instala ffmpeg y vuelve a correr el pipeline.`);
      process.exit(1);
    }
  }

  const entries = await readdir(inputDir, { withFileTypes: true });
  const files = [];
  for (const e of entries) {
    if (e.isDirectory()) {
      // TODO F1: iterar subcarpetas por release (+ release.json con metadatos)
      console.warn(`⚠ Subcarpeta omitida en este esqueleto: ${e.name}`);
      continue;
    }
    if (AUDIO_EXT.has(path.extname(e.name).toLowerCase())) {
      files.push(path.join(inputDir, e.name));
    }
  }
  if (files.length === 0) {
    console.log("– Sin masters de audio en la carpeta. Nada que hacer.");
    return;
  }

  console.log(`[ingest] ${files.length} master(s) detectados\n`);
  let failures = 0;
  const report = [];
  for (const file of files) {
    const meta = await ffprobeInfo(file);
    if (!meta) {
      console.error(`  ✘ No legible con ffprobe: ${file}`);
      failures += 1;
      continue;
    }
    const label = `${meta.codec.toUpperCase()} ${meta.bitDepth ?? "?"}bit/${((meta.sampleRateHz ?? 0) / 1000).toFixed(1)}`;
    console.log(`  ${path.basename(file)} → ${label}`);
    const qa = await spectralQA(file);
    report.push({ ...qa, meta });
  }

  // TODO F1 (con DATABASE_URL): publicar Release + Track + Product en
  // Postgres vía Prisma, incluyendo la evidencia espectral (PNG) en
  // Track.spectrumUrl tras subir a S3/R2.
  console.log("\n[ingest] resumen:");
  for (const r of report) {
    console.log(`  - ${path.basename(r.file)} · ${r.status}`);
  }
  console.log(
    "\nSiguiente paso (F1): conectar DATABASE_URL y subir los derivados a S3 — ver TODOs en el código."
  );

  if (strict && failures > 0) {
    console.error(`\n✘ ${failures} master(s) fallaron el probe (--strict)`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(`[ingest] error fatal: ${err}`);
  process.exit(1);
});
