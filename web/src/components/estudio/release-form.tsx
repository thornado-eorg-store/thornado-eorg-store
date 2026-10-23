"use client";

// ============================================================
// Formulario de release del Modo Edición: datos, precios,
// tracklist editable (añadir/quitar filas), paleta y portada.
// Un solo envío → server action → catálogo público al día.
// ============================================================
import { useActionState, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { saveReleaseAction } from "@/lib/estudio/actions";
import type { FormState, TrackRow } from "@/lib/estudio/types";
import { PALETTES, STATUS_OPTIONS, TAG_CHIPS, emptyTrackRow, durationLabel } from "@/lib/estudio/types";
import type { Release } from "@/lib/catalog";

const INITIAL: FormState = { ok: false };

function toRow(t: Release["tracks"][number]): TrackRow {
  return {
    title: t.title,
    duration: durationLabel(t.durationSec),
    bpm: t.bpm != null ? String(t.bpm) : "",
    musicalKey: t.musicalKey ?? "",
    bitDepth: t.bitDepth != null ? String(t.bitDepth) : "",
    sampleRateHz: t.sampleRateHz != null ? String(t.sampleRateHz) : "",
    status: t.status,
  };
}

export function ReleaseForm({ release }: { release?: Release }) {
  const mode = release ? "editar" : "nuevo";
  const router = useRouter();
  const [state, formAction] = useActionState(saveReleaseAction, INITIAL);
  const [rows, setRows] = useState<TrackRow[]>(
    (release?.tracks ?? []).map(toRow).concat(release?.tracks ? [] : [emptyTrackRow()])
  );
  const [paletteId, setPaletteId] = useState<string>(
    (PALETTES.find(
      (p) => release && p.colors[0] === release.palette[0] && p.colors[1] === release.palette[1]
    )?.id) ?? "aurora"
  );
  // portada: preview local al elegir archivo
  const [coverPreview, setCoverPreview] = useState<string | null>(release?.coverImage ?? null);

  useEffect(() => {
    if (state.ok) router.refresh();
  }, [state, router]);

  const palette = PALETTES.find((p) => p.id === paletteId) ?? PALETTES[0];
  const err = (field: string) =>
    state.fieldErrors?.[field] ? (
      <p className="mt-1 text-xs text-rose-400">{state.fieldErrors[field]}</p>
    ) : null;

  const updateRow = (i: number, patch: Partial<TrackRow>) =>
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  const removeRow = (i: number) => setRows((prev) => prev.filter((_, idx) => idx !== i));
  const addRow = () => setRows((prev) => [...prev, emptyTrackRow()]);

  return (
    <form action={formAction} encType="multipart/form-data" className="pb-20">
      <input type="hidden" name="mode" value={mode} />
      <input type="hidden" name="palette" value={`${palette.colors[0]}|${palette.colors[1]}`} />
      <input
        type="hidden"
        name="tracks_json"
        value={JSON.stringify(rows)}
        readOnly
      />

      {/* Encabezado + guardar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {mode === "nuevo" ? "Publicar nuevo release" : `Editar · ${release?.title}`}
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Al guardar, la ficha pública, el catálogo y el checkout usan estos datos al instante.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/estudio"
            className="rounded-full border border-zinc-700 px-4 py-2 text-sm text-zinc-300 transition hover:border-zinc-500"
          >
            Cancelar
          </Link>
          <SubmitButton />
        </div>
      </div>

      {/* Banner de resultado */}
      {state.message && (
        <div
          className={`mt-4 rounded-xl border p-4 text-sm ${
            state.ok
              ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-200"
              : "border-rose-400/40 bg-rose-400/10 text-rose-200"
          }`}
        >
          {state.ok ? "✓ " : "✕ "}
          {state.message}
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-[2fr_1fr]">
        {/* Columna izquierda */}
        <div className="space-y-6">
          {/* Datos base */}
          <fieldset className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
            <legend className="px-2 text-xs font-semibold uppercase tracking-widest text-cyan-300/80">
              Datos del release
            </legend>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Título">
                <input name="title" defaultValue={release?.title ?? ""} required maxLength={120} className={inputCls} />
              </Field>
              <Field label="Slug (URL)" hint={mode === "nuevo" ? "en blanco se genera del título" : undefined}>
                <input name="slug" defaultValue={release?.slug ?? ""} placeholder="mi-album-01" className={`${inputCls} font-mono`} />
                {err("slug")}
              </Field>
              <Field label="Tipo">
                <select name="type" defaultValue={release?.type ?? "ALBUM"} className={inputCls}>
                  <option value="ALBUM">Álbum</option>
                  <option value="EP">EP</option>
                  <option value="SINGLE">Sencillo</option>
                </select>
              </Field>
              <Field label="Año">
                <input name="year" type="number" min={2015} max={2030} defaultValue={release?.year ?? new Date().getFullYear()} className={inputCls} />
                {err("year")}
              </Field>
              <Field label="Géneros (separados por coma)" wide>
                <input name="genres" defaultValue={(release?.genres ?? []).join(", ")} placeholder="Synthwave, Ambient" className={inputCls} />
              </Field>
              <Field label="Texto editorial (lo que ve el fan en la ficha)" wide>
                <textarea name="editorial" required rows={4} defaultValue={release?.editorial ?? ""} maxLength={2000} className={`${inputCls} leading-relaxed`} />
                {err("editorial")}
              </Field>
            </div>

            {/* Etiquetas */}
            <div className="mt-4">
              <span className="text-xs font-medium text-zinc-400">Etiquetas de colección</span>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {TAG_CHIPS.map((t) => <Chip key={t} label={t} />)}
              </div>
              <input name="tags" defaultValue={(release?.tags ?? []).join(", ")} placeholder="novedad, hires, dj-tools" className={`${inputCls} mt-2`} />
            </div>
          </fieldset>

          {/* Precios */}
          <fieldset className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
            <legend className="px-2 text-xs font-semibold uppercase tracking-widest text-cyan-300/80">
              Precio y formatos digitales
            </legend>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Modo de precio">
                <select name="pricingMode" defaultValue={release?.pricingMode ?? "FIXED"} className={inputCls}>
                  <option value="FIXED">Precio fijo</option>
                  <option value="PWYW">Elige tú (PWYW — mínimo)</option>
                </select>
              </Field>
              <Field label={release?.pricingMode === "PWYW" ? "Precio mínimo (USD)" : "Precio (USD)"}>
                <input name="minPrice" type="number" min={0} max={1000} step={0.01} defaultValue={release?.minPrice ?? 7} className={`${inputCls} font-mono`} />
                {err("minPrice")}
              </Field>
              <Field label="Formatos de descarga (coma)" wide>
                <input name="formats" defaultValue={(release?.formats ?? []).join(", ")} placeholder="MP3 320, FLAC 24/192, WAV, AIFF" className={inputCls} />
              </Field>
            </div>
          </fieldset>

          {/* Vinilo */}
          <fieldset className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
            <legend className="px-2 text-xs font-semibold uppercase tracking-widest text-cyan-300/80">
              Edición física (opcional)
            </legend>
            <label className="inline-flex cursor-pointer items-center gap-2 text-sm">
              <input name="hasVinyl" type="checkbox" defaultChecked={Boolean(release?.hasVinyl)} className="h-4 w-4 accent-cyan-400" />
              Ofrecer edición en vinilo (incluye descarga digital)
            </label>
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              <Field label="Precio vinilo (USD)">
                <input name="vinylPrice" type="number" min={0} max={1000} step={0.01} defaultValue={release?.vinylPrice ?? 25} className={`${inputCls} font-mono`} />
                {err("vinylPrice")}
              </Field>
              <Field label="Stock (piezas)">
                <input name="vinylStock" type="number" min={0} max={10000} defaultValue={release?.vinylStock ?? 0} className={`${inputCls} font-mono`} />
                {err("vinylStock")}
              </Field>
            </div>
          </fieldset>

          {/* Tracklist */}
          <fieldset className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
            <legend className="px-2 text-xs font-semibold uppercase tracking-widest text-cyan-300/80">
              Tracklist ({rows.length} pistas)
            </legend>
            {err("tracks")}
            <div className="mt-2 space-y-3">
              {rows.map((row, i) => (
                <div key={i} className="grid grid-cols-[2rem_1fr_auto] gap-2 rounded-xl border border-zinc-800 bg-zinc-950/60 p-3 sm:grid-cols-[2rem_1fr_auto]">
                  <span className="font-mono text-xs text-zinc-600 sm:pt-2">{i + 1}</span>
                  <div className="grid gap-2 sm:grid-cols-12">
                    <input
                      value={row.title}
                      onChange={(e) => updateRow(i, { title: e.target.value })}
                      placeholder={`Pista ${i + 1} — título`}
                      className={`${inputCls} sm:col-span-6`}
                      maxLength={140}
                    />
                    <input
                      value={row.duration}
                      onChange={(e) => updateRow(i, { duration: e.target.value })}
                      placeholder="4:30"
                      title="Duración en formato m:ss o segundos"
                      className={`${inputCls} font-mono sm:col-span-2`}
                    />
                    <input
                      value={row.bpm}
                      onChange={(e) => updateRow(i, { bpm: e.target.value })}
                      placeholder="BPM"
                      className={`${inputCls} font-mono sm:col-span-1`}
                      inputMode="numeric"
                    />
                    <input
                      value={row.musicalKey}
                      onChange={(e) => updateRow(i, { musicalKey: e.target.value })}
                      placeholder="8A"
                      title="Tonalidad (formato de DJ)"
                      className={`${inputCls} font-mono sm:col-span-3`}
                      maxLength={8}
                    />
                    <select
                      value={`${row.bitDepth}|${row.sampleRateHz}`}
                      onChange={(e) => {
                        const [bit, rate] = e.target.value.split("|");
                        updateRow(i, { bitDepth: bit, sampleRateHz: rate });
                      }}
                      className={`${inputCls} sm:col-span-6`}
                    >
                      {SPEC_PRESETS.map((p) => (
                        <option key={p.value} value={p.value}>{p.label}</option>
                      ))}
                    </select>
                    <select
                      value={row.status}
                      onChange={(e) => updateRow(i, { status: e.target.value as TrackRow["status"] })}
                      className={`${inputCls} sm:col-span-6`}
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeRow(i)}
                    aria-label={`Quitar pista ${i + 1}`}
                    className="self-start px-2 py-1 text-zinc-600 transition hover:text-rose-400"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addRow}
              className="mt-3 rounded-full border border-zinc-700 px-4 py-1.5 text-xs text-zinc-300 transition hover:border-cyan-400/50 hover:text-cyan-200"
            >
              + Agregar pista
            </button>
          </fieldset>
        </div>

        {/* Columna derecha: portada y visibilidad */}
        <div className="space-y-6">
          <fieldset className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
            <legend className="px-2 text-xs font-semibold uppercase tracking-widest text-cyan-300/80">
              Portada (miniatura)
            </legend>
            <div
              className="relative mx-auto aspect-square w-full max-w-[220px] overflow-hidden rounded-xl border border-zinc-700"
              style={{
                backgroundImage: coverPreview
                  ? `url(${coverPreview})`
                  : `url(/covers/${release?.slug ?? "demo"}.svg), linear-gradient(135deg, ${palette.colors[0]}, ${palette.colors[1]})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              <span aria-hidden className="scanlines absolute inset-0" />
            </div>
            <input
              name="cover"
              type="file"
              accept="image/png,image/jpeg,image/webp,image/svg+xml"
              onChange={(e) => {
                const f = e.target.files?.[0];
                setCoverPreview(f ? URL.createObjectURL(f) : release?.coverImage ?? null);
              }}
              className="mt-3 block w-full cursor-pointer text-xs text-zinc-400 file:mr-3 file:cursor-pointer file:rounded-full file:border-0 file:bg-zinc-800 file:px-3 file:py-1.5 file:text-zinc-200 file:transition hover:file:bg-zinc-700"
            />
            {err("cover")}
            <p className="mt-2 text-[11px] leading-relaxed text-zinc-600">
              PNG/JPG/WEBP/SVG, máx. 1.2 MB · cuadrado recomendado. Si subes otra
              imagen, reemplaza la actual al guardar.
            </p>
            {release?.coverImage && (
              <label className="mt-2 inline-flex cursor-pointer items-center gap-2 text-xs text-rose-300/90">
                <input name="removeCover" type="checkbox" value="1" className="h-3.5 w-3.5 accent-rose-400" />
                Quitar portada actual (queda el fondo generativo)
              </label>
            )}
          </fieldset>

          <fieldset className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
            <legend className="px-2 text-xs font-semibold uppercase tracking-widest text-cyan-300/80">
              Paleta visual
            </legend>
            <div className="grid gap-2">
              {PALETTES.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPaletteId(p.id)}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-left text-xs transition ${
                    paletteId === p.id
                      ? "ring-1 ring-cyan-400/60 bg-zinc-800 text-zinc-100"
                      : "text-zinc-400 hover:bg-zinc-800/60"
                  }`}
                >
                  <span
                    aria-hidden
                    className="h-6 w-10 rounded"
                    style={{ backgroundImage: `linear-gradient(135deg, ${p.colors[0]}, ${p.colors[1]})` }}
                  />
                  {p.label}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
            <legend className="px-2 text-xs font-semibold uppercase tracking-widest text-cyan-300/80">
              Publicación
            </legend>
            <label className="inline-flex cursor-pointer items-center gap-2 text-sm">
              <input name="visible" type="checkbox" defaultChecked={!release?.hidden} className="h-4 w-4 accent-cyan-400" />
              Visible en la tienda pública
            </label>
            <p className="mt-2 text-[11px] leading-relaxed text-zinc-600">
              Desmárcalo para dejar de venderlo sin borrarlo: la ficha pública
              devuelve «no encontrado» y desaparece del catálogo; en el
              dashboard queda con el sello «oculto».
            </p>
          </fieldset>
        </div>
      </div>

      {/* Barra inferior fija de guardado */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-zinc-800 bg-zinc-950/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <p className="text-xs text-zinc-500">
            {mode === "nuevo" ? "El release se publicará de inmediato al guardar." : "Los cambios prenden en público al instante."}
          </p>
          <SubmitButton />
        </div>
      </div>
    </form>
  );
}

const SPEC_PRESETS: { value: string; label: string }[] = [
  { value: "24|192000", label: "24-bit · 192 kHz" },
  { value: "24|96000", label: "24-bit · 96 kHz" },
  { value: "24|48000", label: "24-bit · 48 kHz" },
  { value: "16|44100", label: "16-bit · 44.1 kHz" },
  { value: "|", label: "sin especificar" },
];

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-full bg-gradient-to-r from-cyan-400 to-fuchsia-500 px-5 py-2 text-sm font-bold text-zinc-950 transition hover:brightness-110 disabled:opacity-60"
    >
      {pending ? "Guardando…" : "Guardar cambios"}
    </button>
  );
}

const inputCls =
  "w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm outline-none transition focus:border-cyan-400/60";

function Field({
  label,
  hint,
  wide,
  children,
}: {
  label: string;
  hint?: string;
  wide?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={wide ? "sm:col-span-2" : undefined}>
      <span className="mb-1 block text-xs font-medium text-zinc-400">{label}</span>
      {children}
      {hint && <p className="mt-1 text-[11px] text-zinc-600">{hint}</p>}
    </div>
  );
}

function Chip({ label }: { label: string }) {
  return (
    <span className="rounded-full border border-zinc-700 px-2.5 py-0.5 font-mono text-[11px] text-zinc-400">
      {label}
    </span>
  );
}
