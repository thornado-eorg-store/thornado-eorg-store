// ============================================================
// Capa de datos del servidor.
// Fuentes (auto-detectada):
//   1. PostgreSQL vía Prisma (cuando DATABASE_URL está configurada)
//   2. Catálogo demo estático (src/lib/catalog.ts) — fallback total
// ⊕ Overlay del Modo Edición (web/src/lib/estudio/persistence.ts):
//   releases creados o editados desde /estudio se encima a la base.
//
// Todo lo público vive en caché propia de Cache Components, etiquetada
// como "catalog". Las mutaciones del estudio llaman revalidateTag()
// y los cambios se reflejan al siguiente request.
// ============================================================
import { cacheTag } from "next/cache";
import { getDb } from "./db";
import { loadEstudioState, loadSiteConfig } from "./estudio/persistence";
import {
  allReleases as demoAllReleases,
  getArtist as demoGetArtist,
  releases as demoReleases,
  type Release,
  type ArtistBio,
  type MasterStatus,
} from "./catalog";
import { normalizeSiteConfig, type SiteConfig } from "./site";

// Re-export de los tipos del catálogo para las páginas que buscan en "@/lib/store".
export type { Release, ArtistBio, MasterStatus } from "./catalog";

// ---------- base (DB o demo) ----------

async function baseAllReleases(): Promise<Release[]> {
  "use cache";
  cacheTag("catalog");
  const db = getDb();
  if (!db) return demoAllReleases();
  try {
    const rows = await db.release.findMany({
      include: { artist: true, label: true, tracks: true, products: true },
      orderBy: { releaseDate: "desc" },
    });
    if (rows.length === 0) return demoAllReleases();
    return rows.map(rowToRelease);
  } catch (err) {
    console.error("[store] DB no accesible, usando demo:", err);
    return demoAllReleases();
  }
}

// ---------- overlay del estudio ----------

function mergeOverlay(base: Release[], overrides: Release[]): Release[] {
  const map = new Map<string, Release>();
  for (const r of base) map.set(r.slug, r);
  for (const o of overrides) {
    if (!o || typeof o.slug !== "string") continue;
    map.set(o.slug, o); // snapshot completo del estudio gana sobre la base
  }
  return Array.from(map.values()).sort(
    (a, b) => b.year - a.year || a.title.localeCompare(b.title)
  );
}

// ---------- catálogo público ----------

export async function allReleases(): Promise<Release[]> {
  "use cache";
  cacheTag("catalog");
  const [base, estudio] = await Promise.all([baseAllReleases(), loadEstudioState()]);
  return mergeOverlay(base, estudio.releases).filter((r) => !r.hidden);
}

export async function getRelease(slug: string): Promise<Release | undefined> {
  "use cache";
  cacheTag("catalog");
  const [base, estudio] = await Promise.all([baseAllReleases(), loadEstudioState()]);
  return mergeOverlay(base, estudio.releases)
    .filter((r) => !r.hidden)
    .find((r) => r.slug === slug);
}

/** Versión admin: incluye ocultos y overrides; sin caché propia. */
export async function allReleasesAdmin(): Promise<Release[]> {
  const [base, estudio] = await Promise.all([baseAllReleases(), loadEstudioState()]);
  return mergeOverlay(base, estudio.releases);
}

/** Config del sitio (textos, secciones, fondo) — cacheada, tag "site". */
export async function getSiteConfig(): Promise<SiteConfig> {
  "use cache";
  cacheTag("site");
  return normalizeSiteConfig(await loadSiteConfig());
}

/** Config editable para el panel (sin caché, para prellenar el formulario). */
export async function getSiteConfigAdmin(): Promise<SiteConfig> {
  return normalizeSiteConfig(await loadSiteConfig());
}

// ---------- artistas y filtros ----------

export async function getArtist(slug: string): Promise<ArtistBio | undefined> {
  "use cache";
  cacheTag("catalog");
  const db = getDb();
  if (!db) return demoGetArtist(slug);
  try {
    const row = await db.artistProfile.findUnique({ where: { slug } });
    if (!row) return demoGetArtist(slug);
    return {
      slug: row.slug,
      name: row.name,
      tagline: row.bio?.slice(0, 90) ?? "Artista verificado",
      bio: row.bio ?? "Bio pendiente.",
      palette: ["#06b6d4", "#a21caf"],
    };
  } catch (err) {
    console.error("[store] error leyendo artista:", err);
    return demoGetArtist(slug);
  }
}

export async function releasesByTag(tag: string): Promise<Release[]> {
  "use cache";
  cacheTag("catalog");
  return (await allReleases()).filter((r) => r.tags.includes(tag));
}

export async function releasesByArtist(artistSlug: string): Promise<Release[]> {
  "use cache";
  cacheTag("catalog");
  return (await allReleases()).filter((r) => r.artistSlug === artistSlug);
}

/** Slugs para prerender estático (siempre desde el demo). */
export function staticSlugs(): { slug: string }[] {
  return demoReleases.map((r) => ({ slug: r.slug }));
}

// ---------- mapeo DB → modelo de la app ----------

type DbRelease = {
  slug: string;
  title: string;
  type: string;
  releaseDate: Date;
  preorderDate: Date | null;
  pricingMode: string;
  minPrice: unknown;
  masterQuality: unknown;
  genres: string[];
  artist: { name: string; slug: string };
  label: { name: string } | null;
  products: {
    kind: string;
    active: boolean;
    price: unknown;
    stock: number | null;
  }[];
  tracks: {
    id: string;
    position: number;
    title: string;
    durationSec: number;
    bpm: number | null;
    musicalKey: string | null;
    bitDepth: number | null;
    sampleRateHz: number | null;
    masterStatus: string;
  }[];
};

function rowToRelease(row: DbRelease): Release {
  const vinyl = row.products.find((p) => p.kind === "VINYL" && p.active);
  const master =
    (row.masterQuality as { bit_depth?: number; sample_rate?: number } | null) ??
    null;

  const tags: string[] = [];
  if (master?.bit_depth && master.bit_depth >= 24) tags.push("hires");
  if (vinyl) tags.push("vinilo");
  if (row.preorderDate && row.preorderDate > new Date()) tags.push("preorder");

  return {
    slug: row.slug,
    title: row.title,
    artist: row.artist.name,
    artistSlug: row.artist.slug,
    type: row.type === "EP" ? "EP" : row.type === "SINGLE" ? "SINGLE" : "ALBUM",
    year: row.releaseDate.getFullYear(),
    genres: row.genres,
    tags,
    pricingMode: row.pricingMode === "PWYW" ? "PWYW" : "FIXED",
    minPrice: Number(row.minPrice ?? 0),
    formats: deriveFormats(master?.bit_depth, master?.sample_rate),
    hasVinyl: Boolean(vinyl),
    vinylPrice: vinyl ? Number(vinyl.price) : undefined,
    vinylStock: vinyl?.stock ?? undefined,
    editorial: row.label?.name
      ? `Publicado por ${row.label.name}. Master verificado por el pipeline de ingest.`
      : "Master disponible para descarga inmediata; editorial en camino.",
    palette: ["#06b6d4", "#a21caf"] as [string, string],
    tracks: row.tracks
      .slice()
      .sort((a, b) => a.position - b.position)
      .map((t) => ({
        id: t.id,
        title: t.title,
        durationSec: t.durationSec,
        bpm: t.bpm ?? undefined,
        musicalKey: t.musicalKey ?? undefined,
        bitDepth: t.bitDepth ?? undefined,
        sampleRateHz: t.sampleRateHz ?? undefined,
        status: mapMasterStatus(t.masterStatus) as MasterStatus,
      })),
  };
}

function mapMasterStatus(s: string): MasterStatus {
  if (s === "VERIFIED_LOSSLESS") return "VERIFIED_LOSSLESS";
  if (s === "UNVERIFIED") return "UNVERIFIED";
  return "NEEDS_REVIEW"; // FAKE_LOSSLESS / NEEDS_REVIEW jamás se muestran como verificados
}

function deriveFormats(bit?: number, rate?: number): string[] {
  const formats = ["MP3 320"];
  if (bit && rate) formats.push(`FLAC 24/${(rate / 1000).toFixed(1)} kHz`);
  else formats.push("FLAC 16/44.1");
  formats.push("WAV");
  if ((rate ?? 0) >= 48000) formats.push("AIFF");
  return formats;
}
