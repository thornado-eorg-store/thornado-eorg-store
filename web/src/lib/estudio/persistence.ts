// ============================================================
// Persistencia del Modo Edición (panel /estudio).
//
// Drivers (auto-detectado, en este orden):
//   1. PostgreSQL (tabla EstudioState) — cuando DATABASE_URL está
//      configurada. Persistente en producción.
//   2. Archivo JSON — desarrollo local (web/.estudio/state.json) o,
//      en serverless sin BD, carpeta temporal (/tmp → volátil).
//
// Guarda: releases editados/nuevos (snapshot completo), la
// configuración del sitio (textos, secciones, fondo) y los mensajes
// de contacto. Catálogo público = base (demo/DB) ⊕ overlay.
// ============================================================
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import type { Release } from "@/lib/catalog";
import { normalizeSiteConfig, type SiteConfig } from "@/lib/site";
import { getDb } from "@/lib/db";

export type PersistenciaDriver = "postgres" | "archivo-local" | "archivo-temporal";

export interface EstadoPersistencia {
  driver: PersistenciaDriver;
  /** ruta del archivo cuando driver = archivo-* */
  archivo?: string;
}

const ESTUDIO_ROW_ID = "estudio-releases";

export interface MensajeContacto {
  id: string;
  fecha: string; // ISO
  nombre: string;
  email: string;
  asunto: string;
  texto: string;
  leido: boolean;
}

/** Campos que puede tocar una escritura; los omitidos se conservan. */
interface EstadoEscritura {
  releases?: Release[];
  site?: unknown;
  messages?: unknown;
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

// ---------- lectura ----------

/** Estado completo (bruto): releases + site + messages. */
async function readEstado(): Promise<EstadoEscritura> {
  const db = getDb();
  if (db) {
    try {
      const row = await db.estudioState.findUnique({ where: { id: ESTUDIO_ROW_ID } });
      return { releases: sanitizeReleases(row?.releases), site: row?.site ?? undefined, messages: row?.messages ?? undefined };
    } catch (err) {
      console.error("[estudio] BD no accesible, usando archivo:", err);
    }
  }
  for (const c of candidatePaths()) {
    try {
      const raw = await fs.readFile(/*turbopackIgnore: true*/ c.ruta, "utf8");
      const parsed = JSON.parse(raw);
      return { releases: sanitizeReleases(parsed?.releases), site: parsed?.site ?? undefined, messages: parsed?.messages ?? undefined };
    } catch {
      // inexistente → siguiente candidato
    }
  }
  return { releases: [], site: undefined, messages: undefined };
}

/** Releases del overlay (para el catálogo). */
export async function loadEstudioState(): Promise<{ releases: Release[]; estadoPersistencia: EstadoPersistencia }> {
  const db = getDb();
  if (db) {
    try {
      const row = await db.estudioState.findUnique({ where: { id: ESTUDIO_ROW_ID } });
      return {
        releases: sanitizeReleases(row?.releases),
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
      // inexistente → siguiente candidato
    }
  }
  return { releases: [], estadoPersistencia: { driver: "archivo-local", archivo: candidatePaths()[0].ruta } };
}

/** Config de sitio normalizada (o undefined si nunca se editó). */
export async function loadSiteConfig(): Promise<SiteConfig | undefined> {
  const estado = await readEstado();
  return estado.site == null ? undefined : normalizeSiteConfig(estado.site);
}

export async function loadMensajes(): Promise<MensajeContacto[]> {
  const estado = await readEstado();
  return sanitizeMensajes(estado.messages);
}

// ---------- escritura ----------

/** Guarda los campos tocados; los demás se conservan tal cual. */
export async function saveEstudioState(state: EstadoEscritura): Promise<EstadoPersistencia> {
  const prev = await readEstado();
  const releases = state.releases ?? prev.releases ?? [];
  const site = state.site !== undefined ? state.site : prev.site;
  const messages = state.messages !== undefined ? state.messages : prev.messages;

  const db = getDb();
  if (db) {
    try {
      await db.estudioState.upsert({
        where: { id: ESTUDIO_ROW_ID },
        update: { releases: releases as never, site: (site ?? undefined) as never, messages: (messages ?? undefined) as never },
        create: { id: ESTUDIO_ROW_ID, releases: releases as never, site: (site ?? undefined) as never, messages: (messages ?? undefined) as never },
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
        JSON.stringify({ releases, site, messages, updatedAt: new Date().toISOString() }, null, 2),
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

export async function saveSiteConfig(config: SiteConfig): Promise<EstadoPersistencia> {
  return saveEstudioState({ site: config });
}

// ---------- sanity checks ----------

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

function sanitizeMensajes(input: unknown): MensajeContacto[] {
  if (!Array.isArray(input)) return [];
  return input
    .filter(
      (m): m is MensajeContacto =>
        m != null &&
        typeof (m as MensajeContacto).id === "string" &&
        typeof (m as MensajeContacto).texto === "string"
    )
    .map((m) => ({ ...m, leido: Boolean(m.leido) }));
}
