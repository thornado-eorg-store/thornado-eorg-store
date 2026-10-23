// ============================================================
// Catalogo demo — THORNADO EORG
// Musica 100% generada con IA (Suno, modo Premier) — masterizada,
// verificada espectralmente y publicada en alta resolucion.
// Demo F1 sin backend; en produccion viene de PostgreSQL/Prisma.
// ============================================================

export type MasterStatus = "VERIFIED_LOSSLESS" | "UNVERIFIED" | "NEEDS_REVIEW";

export interface TrackSpec {
  id: string;
  title: string;
  durationSec: number;
  bpm?: number;
  musicalKey?: string;
  bitDepth?: number;
  sampleRateHz?: number;
  status: MasterStatus;
}

export interface Release {
  slug: string;
  title: string;
  artistSlug: string;
  artist: string;
  type: "ALBUM" | "EP" | "SINGLE";
  year: number;
  genres: string[];
  tags: string[]; // "hires", "vinilo", "dj-tools", "novedad", "suno-premier"…
  pricingMode: "FIXED" | "PWYW";
  minPrice: number;
  formats: string[];
  hasVinyl?: boolean;
  vinylPrice?: number;
  vinylStock?: number;
  editorial: string;
  palette: [string, string]; // gradiente futurista de la caratula
  glyph?: string; // glifo de portada improvisado (demo F1)
  tracks: TrackSpec[];
  /** Portada subida desde /estudio (data URL). Gana sobre el SVG demo. */
  coverImage?: string;
  /** Oculto para el público; sigo editable en /estudio. */
  hidden?: boolean;
}

export interface ArtistBio {
  slug: string;
  name: string;
  tagline: string;
  bio: string;
  palette: [string, string];
}

export const artists: ArtistBio[] = [
  {
    slug: "thornado-eorg",
    name: "Thornado Eorg",
    tagline:
      "Compositor · Arreglista · Productor — música 100% generada con IA (Suno, modo Premier)",
    bio: "Estudio-laboratorio de THORNADO EORG: cada pieza se concibe en Suno (modo Premier), se compone y arregla con decisiones humanas de estructura, se masteriza en alta resolución (24-bit/192 kHz y DSD) y pasa control de calidad espectral antes de liberarse. Nada sale «así quedó»: sale masterizado, verificado y a la venta.",
    palette: ["#06b6d4", "#a21caf"],
  },
];

export const releases: Release[] = [
  {
    slug: "voltage-requiem",
    title: "Voltage Requiem",
    artist: "Thornado Eorg",
    artistSlug: "thornado-eorg",
    type: "ALBUM",
    year: 2026,
    genres: ["Cinematico", "Synthwave", "Orquestal IA"],
    tags: ["novedad", "hires", "vinilo", "suno-premier"],
    pricingMode: "PWYW",
    minPrice: 6.0,
    formats: ["MP3 320", "FLAC 24/192", "WAV", "AIFF"],
    hasVinyl: true,
    vinylPrice: 27.0,
    vinylStock: 88,
    editorial:
      "Réquiem + sintetizadores: arreglos cinematográficos que crecen desde Suno Premier y terminan bajo la batuta humana. La pieza piloto de la etiqueta de alta gama.",
    palette: ["#06b6d4", "#a21caf"],
    glyph: "TE·01",
    tracks: [
      { id: "vr-1", title: "Voltage Requiem (obertura)", durationSec: 402, bitDepth: 24, sampleRateHz: 192000, status: "VERIFIED_LOSSLESS" },
      { id: "vr-2", title: "Catedral de Plasma", durationSec: 349, bitDepth: 24, sampleRateHz: 192000, status: "VERIFIED_LOSSLESS" },
      { id: "vr-3", title: "Misericordia robotica", durationSec: 275, bitDepth: 24, sampleRateHz: 192000, status: "VERIFIED_LOSSLESS" },
      { id: "vr-4", title: "Kyrie de neon", durationSec: 391, bitDepth: 24, sampleRateHz: 192000, status: "VERIFIED_LOSSLESS" },
      { id: "vr-5", title: "Dies Irae sintetico", durationSec: 458, bitDepth: 24, sampleRateHz: 192000, status: "UNVERIFIED" },
    ],
  },
  {
    slug: "neon-basalt",
    title: "Neon Basalt",
    artist: "Thornado Eorg",
    artistSlug: "thornado-eorg",
    type: "EP",
    year: 2026,
    genres: ["Techno", "Industrial IA"],
    tags: ["novedad", "dj-tools", "hires", "suno-premier", "vinilo"],
    pricingMode: "FIXED",
    minPrice: 4.99,
    formats: ["MP3 320", "FLAC 24/96", "WAV", "AIFF"],
    hasVinyl: true,
    vinylPrice: 22.0,
    vinylStock: 130,
    editorial:
      "Cuatro herramientas de club extraidas de Suno Premier y vestidas para CDJ en 24-bit/96 kHz. Intro larga, giro cliptico y mezclas compatibles con vinilo; tono electronico de basalto.",
    palette: ["#22d3ee", "#4338ca"],
    glyph: "TE·02",
    tracks: [
      { id: "nb-1", title: "Neon Basalt (club cut)", durationSec: 511, bpm: 128, musicalKey: "8A", bitDepth: 24, sampleRateHz: 96000, status: "VERIFIED_LOSSLESS" },
      { id: "nb-2", title: "Tormenta de cobre", durationSec: 446, bpm: 130, musicalKey: "5A", bitDepth: 24, sampleRateHz: 96000, status: "VERIFIED_LOSSLESS" },
      { id: "nb-3", title: "Basalto caliente", durationSec: 388, bpm: 126, musicalKey: "2A", bitDepth: 24, sampleRateHz: 96000, status: "VERIFIED_LOSSLESS" },
      { id: "nb-4", title: "Neon Basalt (dub)", durationSec: 299, bpm: 124, musicalKey: "8B", bitDepth: 24, sampleRateHz: 96000, status: "VERIFIED_LOSSLESS" },
    ],
  },
  {
    slug: "suno-premier-sessions-001",
    title: "Suno Premier: Sessions 001",
    artist: "Thornado Eorg",
    artistSlug: "thornado-eorg",
    type: "ALBUM",
    year: 2026,
    genres: ["Ambient", "Modular IA"],
    tags: ["novedad", "hires", "suno-premier"],
    pricingMode: "FIXED",
    minPrice: 9.0,
    formats: ["MP3 320", "FLAC 24/192", "DSD", "WAV"],
    editorial:
      "Primera colección de sesiones del laboratorio: seeds de Suno en modo Premier convertidas en estudios ambientales profundamente masterizados. Disponible a 24/192 y DSD para audiófilos.",
    palette: ["#8b5cf6", "#0f172a"],
    glyph: "TE·03",
    tracks: [
      { id: "sp-1", title: "Seed 001 — deriva orbital", durationSec: 622, bitDepth: 24, sampleRateHz: 192000, status: "VERIFIED_LOSSLESS" },
      { id: "sp-2", title: "Seed 002 — congreso estelar", durationSec: 547, bitDepth: 24, sampleRateHz: 192000, status: "VERIFIED_LOSSLESS" },
      { id: "sp-3", title: "Seed 003 — pasaje corto", durationSec: 421, bitDepth: 24, sampleRateHz: 192000, status: "VERIFIED_LOSSLESS" },
      { id: "sp-4", title: "Seed 004 — resplandor bajo", durationSec: 690, bitDepth: 24, sampleRateHz: 192000, status: "VERIFIED_LOSSLESS" },
    ],
  },
  {
    slug: "orbital-drift",
    title: "Orbital Drift",
    artist: "Thornado Eorg",
    artistSlug: "thornado-eorg",
    type: "SINGLE",
    year: 2026,
    genres: ["Techno", "Synthwave"],
    tags: ["dj-tools", "novedad", "suno-premier"],
    pricingMode: "FIXED",
    minPrice: 2.49,
    formats: ["MP3 320", "FLAC 24/48", "WAV", "AIFF"],
    editorial:
      "Sencillo de club: intro de 90 segundos, breakdown de cinturón y una voz servo que anuncia la caída. Master de club en 24-bit/48 kHz.",
    palette: ["#e879f9", "#0e7490"],
    glyph: "TE·04",
    tracks: [
      { id: "od-1", title: "Orbital Drift (servo mix)", durationSec: 534, bpm: 132, musicalKey: "4A", bitDepth: 24, sampleRateHz: 48000, status: "VERIFIED_LOSSLESS" },
    ],
  },
  {
    slug: "tormenta-solar",
    title: "Tormenta Solar",
    artist: "Thornado Eorg",
    artistSlug: "thornado-eorg",
    type: "EP",
    year: 2025,
    genres: ["Synthwave", "Retrowave"],
    tags: ["vinilo", "novedad"],
    pricingMode: "PWYW",
    minPrice: 5.0,
    formats: ["MP3 320", "FLAC 24/96", "WAV"],
    hasVinyl: true,
    vinylPrice: 19.0,
    vinylStock: 0,
    editorial:
      "Edición limitada: 300 copias en vinilo dorado reflectivo. Agotado; el digital queda con la remasterización 2026.",
    palette: ["#f59e0b", "#7c1d6f"],
    glyph: "TE·05",
    tracks: [
      { id: "ts-1", title: "Fusion lluvia", durationSec: 371, bitDepth: 24, sampleRateHz: 96000, status: "VERIFIED_LOSSLESS" },
      { id: "ts-2", title: "Radiacion amable", durationSec: 305, bitDepth: 24, sampleRateHz: 96000, status: "VERIFIED_LOSSLESS" },
      { id: "ts-3", title: "Tormenta Solar (extended)", durationSec: 491, bitDepth: 24, sampleRateHz: 96000, status: "VERIFIED_LOSSLESS" },
    ],
  },
  {
    slug: "catedral-de-plasma",
    title: "Catedral de Plasma",
    artist: "Thornado Eorg",
    artistSlug: "thornado-eorg",
    type: "ALBUM",
    year: 2024,
    genres: ["Cinematico", "Ambient"],
    tags: [],
    pricingMode: "FIXED",
    minPrice: 11.0,
    formats: ["MP3 320", "FLAC 16/44.1", "WAV"],
    editorial:
      "El álbum del derretimiento inicial. Remasterizado en 2026 sobre el master original de la era pre-Premier de Suno.",
    palette: ["#6366f1", "#1e1b4b"],
    glyph: "TE·06",
    tracks: [
      { id: "cp-1", title: "Termoclina", durationSec: 405, bitDepth: 16, sampleRateHz: 44100, status: "VERIFIED_LOSSLESS" },
      { id: "cp-2", title: "Vitral infernal", durationSec: 349, bitDepth: 16, sampleRateHz: 44100, status: "VERIFIED_LOSSLESS" },
      { id: "cp-3", title: "Gigantesco nicho", durationSec: 587, bitDepth: 16, sampleRateHz: 44100, status: "NEEDS_REVIEW" },
    ],
  },
];

// ---------- helpers ----------

export function usd(n: number): string {
  return `$${n.toFixed(2)}`;
}

export function allReleases(): Release[] {
  return [...releases].sort(
    (a, b) => b.year - a.year || a.title.localeCompare(b.title)
  );
}

export function getRelease(slug: string): Release | undefined {
  return releases.find((r) => r.slug === slug);
}

export function getArtist(slug: string): ArtistBio | undefined {
  return artists.find((a) => a.slug === slug);
}

export function releasesByArtist(artistSlug: string): Release[] {
  return allReleases().filter((r) => r.artistSlug === artistSlug);
}

export function releasesByTag(tag: string): Release[] {
  return allReleases().filter((r) => r.tags.includes(tag));
}

export function verifiedCount(r: Release): number {
  return r.tracks.filter((t) => t.status === "VERIFIED_LOSSLESS").length;
}

export function specLabel(t: TrackSpec): string {
  if (!t.bitDepth || !t.sampleRateHz) return "spec. n/d";
  return `${t.bitDepth}-bit · ${(t.sampleRateHz / 1000).toFixed(1)} kHz`;
}

export function durationLabel(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/** Feed de ventas de demo para el homepage (Redis realtime en produccion). */
export const liveFeed = [
  { when: "hace 1 min", text: "Un fan en Madrid adquirió «Voltage Requiem» (FLAC 24/192) — $7.00 PWYW" },
  { when: "hace 4 min", text: "Vinilo «Neon Basalt» vendido — quedan 129 de 500" },
  { when: "hace 7 min", text: "Un fan en Osaka compró «Suno Premier: Sessions 001» (DSD) — $9.00" },
  { when: "hace 12 min", text: "Pack de 4 tracks DJ («Orbital Drift» + remixes) comprado por un club en Medellín — $8.96" },
];
