"use server";

// ============================================================
// Server Actions del Modo Edición (/estudio).
// - login/logout con cookie firmada + throttle anti-fuerza bruta
// - guardar release (crear/editar) con validación en servidor
// - mostrar/ocultar del catálogo público
// Toda mutación llama revalidateTag("catalog") para refrescar
// el catálogo público al instante.
// ============================================================
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidateTag } from "next/cache";
import type { FormState } from "./types";
import { parseDuration, slugify } from "./types";
import {
  checkPassword,
  clearSessionCookie,
  isSessionValid,
  saveSessionCookie,
} from "./session";
import { loadEstudioState, saveEstudioState, type EstadoPersistencia } from "./persistence";
import { allReleasesAdmin } from "@/lib/store";
import type { MasterStatus, Release, TrackSpec } from "@/lib/catalog";

const MAX_FAILS = 5;
const LOCK_MS = 60_000;
const MASTER_STATUS_VALUES: MasterStatus[] = ["VERIFIED_LOSSLESS", "UNVERIFIED", "NEEDS_REVIEW"];

// ---------- login ----------

interface Bucket {
  fails: number;
  until: number;
}
const globalThrottle = globalThis as typeof globalThis & {
  __teLoginThrottle?: Map<string, Bucket>;
};
const throttle = (globalThrottle.__teLoginThrottle ??= new Map());

export async function loginAction(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const h = await headers();
  const ip =
    h.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const now = Date.now();
  const bucket = throttle.get(ip);

  if (bucket && bucket.until > now) {
    return {
      ok: false,
      message: `Demasiados intentos fallidos. Espera ${Math.ceil((bucket.until - now) / 1000)} s e inténtalo de nuevo.`,
    };
  }

  const password = String(formData.get("password") ?? "");
  if (!checkPassword(password)) {
    const fails = (bucket && bucket.until > now ? 0 : bucket?.fails ?? 0) + 1;
    throttle.set(ip, { fails, until: fails >= MAX_FAILS ? now + LOCK_MS : 0 });
    return {
      ok: false,
      message: `Contraseña incorrecta${fails >= MAX_FAILS ? " — bloqueo de 1 minuto activado" : ""}.`,
    };
  }

  throttle.delete(ip);
  await saveSessionCookie();
  redirect("/estudio");
}

export async function logoutAction(): Promise<void> {
  await clearSessionCookie();
  redirect("/estudio");
}

// ---------- guardar release ----------

export async function saveReleaseAction(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  if (!(await isSessionValid())) {
    return { ok: false, message: "Tu sesión expiró. Vuelve a entrar al estudio." };
  }

  const fieldErrors: Record<string, string> = {};
  const mode = String(formData.get("mode") ?? "editar");

  // --- campos básicos ---
  const title = String(formData.get("title") ?? "").trim();
  if (!title) fieldErrors.title = "El título es obligatorio.";
  else if (title.length > 120) fieldErrors.title = "Máximo 120 caracteres.";

  let slug = String(formData.get("slug") ?? "").trim() || slugify(title);
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    fieldErrors.slug = "Solo minúsculas, números y guiones (ej. mi-album-01).";
  }

  const year = Number(formData.get("year"));
  if (!Number.isInteger(year) || year < 2015 || year > 2030) {
    fieldErrors.year = "Año entre 2015 y 2030.";
  }

  const typeRaw = String(formData.get("type") ?? "ALBUM");
  const type: Release["type"] = typeRaw === "EP" || typeRaw === "SINGLE" ? typeRaw : "ALBUM";

  const pricingMode: Release["pricingMode"] =
    String(formData.get("pricingMode") ?? "FIXED") === "PWYW" ? "PWYW" : "FIXED";

  const minPrice = Number(formData.get("minPrice"));
  if (Number.isNaN(minPrice) || minPrice < 0 || minPrice > 1000) {
    fieldErrors.minPrice = "Precio entre 0 y 1000 USD.";
  }

  const editorial = String(formData.get("editorial") ?? "").trim();
  if (!editorial) {
    fieldErrors.editorial = "El texto editorial es obligatorio: es lo que ve el fan en la ficha.";
  } else if (editorial.length > 2000) {
    fieldErrors.editorial = "Máximo 2000 caracteres.";
  }

  const genres = splitList(String(formData.get("genres") ?? "")).slice(0, 8);
  const formatsList = splitList(String(formData.get("formats") ?? "")).slice(0, 12);
  const tags = normalizeTags(splitList(String(formData.get("tags") ?? ""))).slice(0, 12);
  const visible = formData.get("visible") === "on";

  // --- paleta ---
  const paletteRaw = String(formData.get("palette") ?? "#06b6d4|#a21caf");
  const [c0, c1] = paletteRaw.split("|");
  const hex = /^#[0-9a-fA-F]{6}$/;
  const palette: [string, string] =
    hex.test(c0) && hex.test(c1) ? [c0, c1] : ["#06b6d4", "#a21caf"];

  // --- vinilo ---
  const hasVinyl = formData.get("hasVinyl") === "on";
  let vinylPrice: number | undefined;
  let vinylStock: number | undefined;
  if (hasVinyl) {
    vinylPrice = Number(formData.get("vinylPrice"));
    if (Number.isNaN(vinylPrice) || vinylPrice < 0 || vinylPrice > 1000) {
      fieldErrors.vinylPrice = "Precio del vinilo entre 0 y 1000 USD.";
    }
    const stock = Number(formData.get("vinylStock"));
    if (!Number.isInteger(stock) || stock < 0 || stock > 10_000) {
      fieldErrors.vinylStock = "Stock entre 0 y 10 000.";
    } else {
      vinylStock = stock;
    }
  }

  // --- tracklist ---
  const tracks = parseTracksJson(String(formData.get("tracks_json") ?? "[]"), fieldErrors);

  // --- portada ---
  const snapshotExistente = (await allReleasesAdmin()).find((r) => r.slug === slug);
  if (mode === "nuevo" && snapshotExistente) {
    fieldErrors.slug = "Ya existe un release con ese slug.";
  }

  let coverImage: string | undefined = snapshotExistente?.coverImage;
  const removeCover = formData.get("removeCover") === "1";
  const file = formData.get("cover");
  if (file instanceof File && file.size > 0) {
    const allowed = ["image/png", "image/jpeg", "image/webp", "image/svg+xml"];
    if (!allowed.includes(file.type)) {
      fieldErrors.cover = "Formato no soportado: usa PNG, JPG, WEBP o SVG.";
    } else if (file.size > 1_200_000) {
      fieldErrors.cover = "La portada no debe superar 1.2 MB.";
    } else {
      const buf = Buffer.from(await file.arrayBuffer());
      coverImage = `data:${file.type};base64,${buf.toString("base64")}`;
    }
  } else if (removeCover) {
    coverImage = undefined;
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, message: "Revisa los campos marcados.", fieldErrors };
  }

  const release: Release = {
    slug,
    title,
    artist: snapshotExistente?.artist ?? "Thornado Eorg",
    artistSlug: "thornado-eorg",
    type,
    year,
    genres,
    tags,
    pricingMode,
    minPrice,
    formats: formatsList.length > 0 ? formatsList : defaultFormats(tracks),
    hasVinyl,
    vinylPrice,
    vinylStock,
    editorial,
    palette,
    glyph: snapshotExistente?.glyph,
    tracks,
    coverImage,
    hidden: !visible,
  };

  // --- persistir + refrescar catálogo público ---
  const { releases } = await loadEstudioState();
  const idx = releases.findIndex((r) => r.slug === slug);
  if (idx >= 0) releases[idx] = release;
  else releases.push(release);
  const persist = await saveEstudioState({ releases });
  revalidateTag("catalog", "max");

  if (mode === "nuevo") {
    redirect(`/estudio/release/${slug}`);
  }
  return {
    ok: true,
    message: `Cambios publicados ✓ — el catálogo público ya está al día (${driverLabel(persist)}).`,
  };
}

// ---------- visibilidad rápida (dashboard) ----------

export async function toggleVisibilityAction(
  slug: string,
  makeHidden: boolean
): Promise<{ ok: boolean; message: string }> {
  if (!(await isSessionValid())) {
    return { ok: false, message: "Sesión expirada." };
  }
  const admin = await allReleasesAdmin();
  const base = admin.find((r) => r.slug === slug);
  if (!base) return { ok: false, message: "Release no encontrado." };

  const { releases } = await loadEstudioState();
  const idx = releases.findIndex((r) => r.slug === slug);
  const snapshot = idx >= 0 ? releases[idx] : base;
  const updated = { ...snapshot, hidden: makeHidden };
  if (idx >= 0) releases[idx] = updated;
  else releases.push(updated);
  await saveEstudioState({ releases });
  revalidateTag("catalog", "max");
  return {
    ok: true,
    message: makeHidden
      ? "«" + base.title + "» oculto del catálogo público."
      : "«" + base.title + "» vuelve a ser visible al público.",
  };
}

// ---------- helpers ----------

function splitList(raw: string): string[] {
  return raw
    .split(/[,;\n]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function normalizeTags(tags: string[]): string[] {
  return tags
    .map((t) =>
      t
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "")
        .replace(/-+/g, "-")
        .replace(/^-+|-+$/g, "")
    )
    .filter(Boolean);
}

function parseTracksJson(raw: string, fieldErrors: Record<string, string>): TrackSpec[] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    fieldErrors.tracks = "No se pudo leer el tracklist (error interno).";
    return [];
  }
  if (!Array.isArray(parsed)) {
    fieldErrors.tracks = "Tracklist inválido.";
    return [];
  }
  if (parsed.length === 0) {
    fieldErrors.tracks = "Agrega al menos una pista.";
    return [];
  }

  const out: TrackSpec[] = [];
  const rows = parsed.slice(0, 40);
  rows.forEach((entry, i) => {
    const row = (entry ?? {}) as Record<string, unknown>;
    const title = String(row.title ?? "").trim();
    if (!title) {
      fieldErrors.tracks = `La pista ${i + 1} necesita título.`;
      return;
    }
    const dur = parseDuration(String(row.duration ?? ""));
    if (dur === null) {
      fieldErrors.tracks = `La pista ${i + 1} (${title}) necesita duración válida (ej. 4:30).`;
      return;
    }
    const bpmRaw = String(row.bpm ?? "").trim();
    let bpm: number | undefined;
    if (bpmRaw) {
      const n = Number(bpmRaw);
      if (!Number.isInteger(n) || n < 20 || n > 300) {
        fieldErrors.tracks = `BPM inválido en «${title}» (20–300).`;
        return;
      }
      bpm = n;
    }
    const statusRaw = String(row.status ?? "UNVERIFIED");
    const status: MasterStatus = MASTER_STATUS_VALUES.includes(statusRaw as MasterStatus)
      ? (statusRaw as MasterStatus)
      : "UNVERIFIED";
    const bitRaw = Number(row.bitDepth);
    const bitDepth = bitRaw === 16 || bitRaw === 24 ? bitRaw : undefined;
    const rateRaw = Number(row.sampleRateHz);
    const sampleRateHz = [44100, 48000, 96000, 192000].includes(rateRaw) ? rateRaw : undefined;
    const key = String(row.musicalKey ?? "").trim().slice(0, 8);

    out.push({
      id: `t${i + 1}-${Date.now().toString(36)}`,
      title: title.slice(0, 140),
      durationSec: dur,
      bpm,
      musicalKey: key || undefined,
      bitDepth,
      sampleRateHz,
      status,
    });
  });
  return out;
}

function defaultFormats(tracks: TrackSpec[]): string[] {
  const first = tracks[0];
  const formats = ["MP3 320"];
  if (first?.bitDepth && first?.sampleRateHz) {
    formats.push(`FLAC ${first.bitDepth}/${(first.sampleRateHz / 1000).toFixed(0)}`);
  } else {
    formats.push("FLAC 16/44.1");
  }
  formats.push("WAV");
  return formats;
}

function driverLabel(p: EstadoPersistencia): string {
  if (p.driver === "postgres") return "persistido en Postgres";
  if (p.driver === "archivo-temporal") return "guardado temporal (activa DATABASE_URL para persistir)";
  return "persistido en archivo local";
}
