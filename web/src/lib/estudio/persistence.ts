// ============================================================
// Persistencia del Modo Edición (panel /estudio).
//
// Drivers (auto-detectado, en este orden):
//   1. PostgreSQL (tabla EstudioState) — cuando DATABASE_URL está
//      configurada. Persistente en producción.
//   2. Archivo JSON — desarrollo local (web/.estudio/state.json) o,
//      en serverless sin BD, carpeta temporal (/tmp → volátil).
//
// El estado guarda snapshots completos de Release (editados o
// nuevos). El catálogo público es base (demo/DB) ⊕ overlay.
// ============================================================
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import type { Release } from "@/lib/catalog";
import { getDb } from "@/lib/db";

export type PersistenciaDriver = "postgres" | "archivo-local" | "archivo-temporal";

const ESTUDIO_ROW_ID = "estudio-releases";

export interface EstadoPersistencia {
  driver: PersistenciaDriver;
  /** ruta del archivo cuando driver = archivo-* */
  archivo?: string;
}

function candidatePaths(): { ruta: string; tipo: "archivo-local" | "archivo-temporal" }[] {
  return [
    { ruta: path.join(process.cwd(), ".estudio", "state.json"), tipo: "archivo-local" },
    { ruta: path.join(os.tmpdir(), "te-estudio", "state.json"), tipo: "archivo-temporal" },
  ];
}

export function driverActual(): PersistenciaDriver {
  if (getDb()) return "postgres";
  return "archivo-local"; // se degrada a archivo-temporal al escribir si cwd no admite escritura
}

/** Lee el estado superpuesto (releases editados/creados desde /estudio). */
export async function loadEstudioState(): Promise<{ releases: Release[]; estadoPersistencia: EstadoPersistencia }> {
  const db = getDb();
  if (db) {
    try {
      const row = await db.estudioState.findUnique({ where: { id: ESTUDIO_ROW_ID } });
      return {
        releases: sanitizeReleases(row?.releases as unknown),
        estadoPersistencia: { driver: "postgres" },
      };
    } catch (err) {
      console.error("[estudio] BD no accesible para el modo edición:", err);
    }
  }

  for (const c of candidatePaths()) {
    try {
      const raw = await fs.readFile(/*turbopackIgnore: true*/ c.ruta, "utf8");
      return {
        releases: sanitizeReleases(JSON.parse(raw)?.releases),
        estadoPersistencia: { driver: c.tipo, archivo: c.ruta },
      };
    } catch {
      // archivo inexistente → siguiente candidato
    }
  }
  return { releases: [], estadoPersistencia: { driver: "archivo-local", archivo: candidatePaths()[0].ruta } };
}

/** Guarda el estado completo. Devuelve cómo quedó persistido (para el UI). */
export async function saveEstudioState(state: { releases: Release[] }): Promise<EstadoPersistencia> {
  const db = getDb();
  const releases = state.releases;
  if (db) {
    try {
      await db.estudioState.upsert({
        where: { id: ESTUDIO_ROW_ID },
        update: { releases: releases as never },
        create: { id: ESTUDIO_ROW_ID, releases: releases as never },
      });
      return { driver: "postgres" };
    } catch (err) {
      console.error("[estudio] no se pudo escribir en la BD, usando archivo:", err);
    }
  }

  const writable: EstadoPersistencia[] = [
    { driver: "archivo-local", archivo: candidatePaths()[0].ruta },
    { driver: "archivo-temporal", archivo: candidatePaths()[1].ruta },
  ];
  let lastErr: unknown = null;
  for (const target of writable) {
    try {
      const dir = path.dirname(target.archivo ?? "");
      await fs.mkdir(dir, { recursive: true });
      await fs.writeFile(
        /*turbopackIgnore: true*/ target.archivo ?? "",
        JSON.stringify({ releases, updatedAt: new Date().toISOString() }, null, 2),
        "utf8"
      );
      return target;
    } catch (err) {
      lastErr = err;
    }
  }
  throw new Error(
    `No se pudo persistir el estado del modo edición (ni en carpeta del proyecto ni en temporal): ${String(lastErr)}`
  );
}

/** Sanity check de lectura: solo releases plausibles. */
function sanitizeReleases(input: unknown): Release[] {
  if (!Array.isArray(input)) return [];
  return input.filter(
    (r): r is Release =>
      r != null &&
      typeof (r as Release).slug === "string" &&
      typeof (r as Release).title === "string" &&
      Array.isArray((r as Release).tracks)
  );
}
