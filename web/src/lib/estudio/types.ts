// ============================================================
// Tipos y constantes compartidos del Modo Edición (/estudio).
// Seguro para cliente y servidor (sin node APIs).
// ============================================================
import type { MasterStatus } from "@/lib/catalog";

export interface FormState {
  ok: boolean;
  message?: string;
  fieldErrors?: Record<string, string>;
}

export interface PaletteOption {
  id: string;
  label: string;
  colors: [string, string];
}

/** Paletas de marca; mismas que usa el catálogo demo. */
export const PALETTES: PaletteOption[] = [
  { id: "aurora", label: "Aurora (Requiem)", colors: ["#06b6d4", "#a21caf"] },
  { id: "basalto", label: "Basalto Neón", colors: ["#22d3ee", "#4338ca"] },
  { id: "violeta", label: "Sessions Violeta", colors: ["#8b5cf6", "#0f172a"] },
  { id: "fucsia", label: "Orbital Fucsia", colors: ["#e879f9", "#0e7490"] },
  { id: "ambar", label: "Tormenta Ámbar", colors: ["#f59e0b", "#7c1d6f"] },
  { id: "indigo", label: "Catedral Índigo", colors: ["#6366f1", "#1e1b4b"] },
];

export const STATUS_OPTIONS: { value: MasterStatus; label: string }[] = [
  { value: "VERIFIED_LOSSLESS", label: "✓ verificado lossless" },
  { value: "UNVERIFIED", label: "sin verificar" },
  { value: "NEEDS_REVIEW", label: "requiere revisión" },
];

export const TAG_CHIPS = ["novedad", "hires", "vinilo", "dj-tools", "suno-premier", "preorder"];

export interface TrackRow {
  title: string;
  duration: string; // "m:ss" o segundos
  bpm: string;
  musicalKey: string;
  bitDepth: string; // "" | "16" | "24"
  sampleRateHz: string; // "" | "44100" | "48000" | "96000" | "192000"
  status: MasterStatus;
  /** Identificador estable de la fila en el formulario (para parear el audio aunque se quiten filas). */
  uid?: string;
  /** El artista marcó «quitar audio» en esta fila (viaja en el JSON del formulario). */
  audioRemove?: boolean;
}

export function emptyTrackRow(): TrackRow {
  return {
    title: "",
    duration: "",
    bpm: "",
    musicalKey: "",
    bitDepth: "24",
    sampleRateHz: "48000",
    status: "UNVERIFIED",
    uid: `u${Math.random().toString(36).slice(2, 10)}`,
  };
}

/** Convierte un título en slug: minúsculas, sin acentos, guiones. */
export function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}

/** Acepta «4:30» o «270» → segundos. null si no es válido. */
export function parseDuration(raw: string): number | null {
  const s = raw.trim();
  if (/^\d{1,3}:\d{2}$/.test(s)) {
    const [m, sec] = s.split(":").map(Number);
    const total = m * 60 + sec;
    return total >= 1 && total <= 3600 ? total : null;
  }
  if (/^\d{1,4}$/.test(s)) {
    const n = Number(s);
    return n >= 1 && n <= 3600 ? n : null;
  }
  return null;
}

export function durationLabel(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}
