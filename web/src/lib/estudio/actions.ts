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
import {
  loadEstudioState,
  saveEstudioState,
  saveSiteConfig,
  loadMensajes,
  type EstadoPersistencia,
  type MensajeContacto,
} from "./persistence";
import { allReleasesAdmin } from "@/lib/store";
import type { MasterStatus, Release, TrackSpec } from "@/lib/catalog";
import type { SectionKey } from "@/lib/site";

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
  try {
    return await saveReleaseInner(formData);
  } catch (err) {
    if (esRedirect(err)) throw err; // redirect() usa errores propios: deben propagar
    console.error("[estudio] fallo al guardar release:", err);
    return {
      ok: false,
      message:
        "No se pudo guardar el release. Causa más común: archivo demasiado grande (portada ≤ 3 MB; audio ≤ 10 MB por pista y ≤ 20 MB en total por guardado).",
    };
  }
}

function esRedirect(err: unknown): boolean {
  const digest = (err as { digest?: string } | null)?.digest;
  return typeof digest === "string" && digest.startsWith("NEXT_REDIRECT");
}

async function saveReleaseInner(
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
  const parsed = parseTracksJson(String(formData.get("tracks_json") ?? "[]"), fieldErrors);
  const tracks = parsed.specs;

  // --- portada ---
  const snapshotExistente = (await allReleasesAdmin()).find((r) => r.slug === slug);
  if (mode === "nuevo" && snapshotExistente) {
    fieldErrors.slug = "Ya existe un release con ese slug.";
  }

  let coverImage: string | undefined = snapshotExistente?.coverImage;
  const removeCover = formData.get("removeCover") === "1";
  const file = formData.get("cover");
  const AUDIO_TOTAL_CAP_BYTES = process.env.VERCEL === "1" ? 3_200_000 : 20_000_000;
  const AUDIO_FILE_CAP_BYTES = process.env.VERCEL === "1" ? 3_000_000 : 10_000_000;
  let audioBytesTotal = 0;
  const audioResult: (string | undefined | null)[] = [];
  if (file instanceof File && file.size > 0) {
    const allowed = ["image/png", "image/jpeg", "image/webp", "image/svg+xml"];
    if (!allowed.includes(file.type)) {
      fieldErrors.cover = "Formato no soportado: usa PNG, JPG, WEBP o SVG.";
    } else if (file.size > 3_000_000) {
      fieldErrors.cover = "La portada no debe superar 3 MB.";
    } else {
      audioBytesTotal += file.size;
      const buf = Buffer.from(await file.arrayBuffer());
      coverImage = `data:${file.type};base64,${buf.toString("base64")}`;
    }
  } else if (removeCover) {
    coverImage = undefined;
  }

  // --- audio de las pistas (previews reales; pareado por uid estable) ---
  if (tracks.length > 0) {
    for (let i = 0; i < tracks.length; i += 1) {
      const prevUrl = snapshotExistente?.tracks[i]?.previewUrl;
      const rowUid = parsed.uids[i];
      const aFile = formData.get(`audio_${rowUid}`);
      const removeAudio = formData.get(`audio_remove_${rowUid}`) === "1" || parsed.removeFlags[i];
      if (aFile instanceof File && aFile.size > 0) {
        if (!String(aFile.type).startsWith("audio/")) {
          fieldErrors.tracksAudio ??= `El archivo de «${tracks[i].title}» no es un audio (usa MP3, M4A, WAV o FLAC).`;
        } else if (aFile.size > AUDIO_FILE_CAP_BYTES) {
          fieldErrors.tracksAudio ??= `«${tracks[i].title}» supera ${Math.round(AUDIO_FILE_CAP_BYTES / 1_000_000)} MB por pista.`;
        } else if (audioBytesTotal + aFile.size > AUDIO_TOTAL_CAP_BYTES) {
          fieldErrors.tracksAudio ??= `El total de audio por guardado excede ${Math.round(AUDIO_TOTAL_CAP_BYTES / 1_000_000)} MB.`;
        } else {
          audioBytesTotal += aFile.size;
          const ab = Buffer.from(await aFile.arrayBuffer());
          audioResult[i] = `data:${aFile.type};base64,${ab.toString("base64")}`;
        }
      } else if (removeAudio) {
        audioResult[i] = null; // quitar
      } else {
        audioResult[i] = prevUrl; // conservar
      }
    }
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
    tracks: tracks.map((t, i) => {
      const audio = audioResult[i];
      const previewUrl = audio === null ? undefined : audio ?? snapshotExistente?.tracks[i]?.previewUrl;
      return { ...t, ...(previewUrl ? { previewUrl } : {}) };
    }),
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

function parseTracksJson(
  raw: string,
  fieldErrors: Record<string, string>
): { specs: TrackSpec[]; uids: string[]; removeFlags: boolean[] } {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    fieldErrors.tracks = "No se pudo leer el tracklist (error interno).";
    return { specs: [], uids: [], removeFlags: [] };
  }
  if (!Array.isArray(parsed)) {
    fieldErrors.tracks = "Tracklist inválido.";
    return { specs: [], uids: [], removeFlags: [] };
  }
  if (parsed.length === 0) {
    fieldErrors.tracks = "Agrega al menos una pista.";
    return { specs: [], uids: [], removeFlags: [] };
  }

  const out: TrackSpec[] = [];
  const uids: string[] = [];
  const removeFlags: boolean[] = [];
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
    const uidClean = String(row.uid ?? "").replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 40);

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
    uids.push(uidClean || `i${i}`);
    removeFlags.push(Boolean(row.audioRemove));
  });
  return { specs: out, uids, removeFlags };
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

// ---------- apariencia y contenido del sitio ----------

export async function saveSiteConfigAction(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  if (!(await isSessionValid())) {
    return { ok: false, message: "Tu sesión expiró. Vuelve a entrar al estudio." };
  }
  try {
    const texts = {
      kicker: String(formData.get("kicker") ?? "").trim().slice(0, 90),
      titleA: String(formData.get("titleA") ?? "").trim().slice(0, 40),
      titleB: String(formData.get("titleB") ?? "").trim().slice(0, 40),
      subtitle: String(formData.get("subtitle") ?? "").trim().slice(0, 600),
      ctaPrimario: String(formData.get("ctaPrimario") ?? "").trim().slice(0, 60) || "Entrar al catálogo",
      ctaSecundario: String(formData.get("ctaSecundario") ?? "").trim().slice(0, 60) || "Escuchar el featured →",
      destacadoKicker: String(formData.get("destacadoKicker") ?? "").trim().slice(0, 60),
      destacadoTitle: String(formData.get("destacadoTitle") ?? "").trim().slice(0, 80),
      destacadoBody: String(formData.get("destacadoBody") ?? "").trim().slice(0, 600),
      destacadoCta: String(formData.get("destacadoCta") ?? "").trim().slice(0, 60) || "Ver ficha completa",
      valor: [0, 1, 2].map((i) => ({
        title: String(formData.get(`valor_t_${i}`) ?? "").trim().slice(0, 60),
        text: String(formData.get(`valor_x_${i}`) ?? "").trim().slice(0, 300),
      })),
      footerTagline: String(formData.get("footerTagline") ?? "").trim().slice(0, 300),
    };
    const fieldErrors: Record<string, string> = {};
    if (!texts.kicker) fieldErrors.kicker = "Obligatorio.";
    if (!texts.titleA) fieldErrors.titleA = "Obligatorio.";
    if (!texts.titleB) fieldErrors.titleB = "Obligatorio.";
    if (!texts.subtitle) fieldErrors.subtitle = "Obligatorio.";
    for (const v of texts.valor) {
      if (!v.title || !v.text) {
        fieldErrors.valor = "Las tres tarjetas necesitan título y texto.";
        break;
      }
    }
    if (!texts.destacadoTitle || !texts.destacadoBody) {
      fieldErrors.destacado = "El destacado necesita título y texto.";
    }
    let order: SectionKey[] = [];
    try {
      const raw: unknown = JSON.parse(String(formData.get("sections_json") ?? "[]"));
      order = Array.isArray(raw) ? (raw as SectionKey[]).filter(isSectionKey) : [];
    } catch {
      fieldErrors.secciones = "No se pudo leer el orden de secciones.";
    }
    if (Object.keys(fieldErrors).length > 0) {
      return { ok: false, message: "Revisa los campos marcados.", fieldErrors };
    }

    await saveSiteConfig({ texts, sections: order, theme: themeValidado(formData) });    revalidateTag("site", "max");
    revalidateTag("catalog", "max");
    return { ok: true, message: "Apariencia publicada ✓ — portada, secciones y fondo ya están al día." };
  } catch (err) {
    console.error("[estudio] fallo al guardar apariencia:", err);
    return { ok: false, message: "No se pudo guardar la apariencia. Intenta de nuevo." };
  }
}

function isSectionKey(v: unknown): v is SectionKey {
  return v === "destacado" || v === "novedades" || v === "hires" || v === "ventas" || v === "catalogo";
}

function themeValidado(v: FormData): "aurora" | "carbono" | "estelar" {
  const t = String(v.get("theme") ?? "aurora");
  return ["aurora", "carbono", "estelar"].includes(t) ? (t as "aurora" | "carbono" | "estelar") : "aurora";
}

// ---------- contacto (público) ----------

const globalMsgThrottle = globalThis as typeof globalThis & {
  __teMsgThrottle?: Map<string, number>;
};
const msgThrottle = (globalMsgThrottle.__teMsgThrottle ??= new Map());
const MSG_COOLDOWN_MS = 20_000;
const MAX_MENSAJES = 200;

export async function sendContactMessageAction(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const now = Date.now();
  const last = msgThrottle.get(ip) ?? 0;
  if (now - last < MSG_COOLDOWN_MS) {
    return { ok: false, message: "Acabas de enviar un mensaje. Espera unos segundos si quieres enviar otro." };
  }

  const nombre = String(formData.get("nombre") ?? "").trim().slice(0, 80);
  const email = String(formData.get("email") ?? "").trim().slice(0, 120);
  const asunto = String(formData.get("asunto") ?? "").trim().slice(0, 120) || "Sin asunto";
  const texto = String(formData.get("texto") ?? "").trim().slice(0, 4000);

  const fieldErrors: Record<string, string> = {};
  if (!nombre) fieldErrors.nombre = "Tu nombre es obligatorio.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) fieldErrors.email = "Correo no válido.";
  if (!texto || texto.length < 10) fieldErrors.texto = "El mensaje necesita al menos 10 caracteres.";
  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, message: "Revisa los campos marcados.", fieldErrors };
  }

  const mensaje: MensajeContacto = {
    id: `m${now.toString(36)}`,
    fecha: new Date().toISOString(),
    nombre,
    email,
    asunto,
    texto,
    leido: false,
  };
  try {
    const actuales = await loadMensajes();
    const lista = [mensaje, ...actuales].slice(0, MAX_MENSAJES);
    await saveEstudioState({ messages: lista });
  } catch (err) {
    console.error("[contacto] no se pudo guardar el mensaje:", err);
    return { ok: false, message: "El mensaje no pudo guardarse por un problema técnico. Intenta de nuevo en un momento." };
  }
  msgThrottle.set(ip, now);
  return {
    ok: true,
    message: "Mensaje recibido ✓ — llega directo al panel del estudio. Si dejas tu correo, THORNADO te responderá.",
  };
}

// ---------- bandeja de mensajes (solo estudio) ----------

export async function messageCloseOperation(
  id: string,
  op: "procesar" | "borrar"
): Promise<{ ok: boolean; message: string }> {
  if (!(await isSessionValid())) return { ok: false, message: "Sesión expirada." };
  const actuales = await loadMensajes();
  let lista: MensajeContacto[];
  if (op === "borrar") {
    lista = actuales.filter((m) => m.id !== id);
  } else {
    lista = actuales.map((m) => (m.id === id ? { ...m, leido: !m.leido } : m));
  }
  await saveEstudioState({ messages: lista });
  return { ok: true, message: op === "borrar" ? "Mensaje eliminado." : "Estado del mensaje actualizado." };
}
