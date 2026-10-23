"use client";

// ============================================================
// Formulario de Apariencia y contenido: textos de la portada,
// orden de secciones y tema de fondo. Guarda con una server
// action y publica al instante (revalidateTag("site")).
// ============================================================
import { useActionState, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useFormStatus } from "react-dom";
import { saveSiteConfigAction } from "@/lib/estudio/actions";
import type { FormState } from "@/lib/estudio/types";
import { BG_THEMES, SECTION_LABELS, type SectionKey, type SiteConfig } from "@/lib/site";

const INITIAL: FormState = { ok: false };

export function AppearanceForm({ config }: { config: SiteConfig }) {
  const router = useRouter();
  const [state, formAction] = useActionState(saveSiteConfigAction, INITIAL);
  const [order, setOrder] = useState<SectionKey[]>(config.sections);
  const [theme, setTheme] = useState(config.theme);

  useEffect(() => {
    if (state.ok) router.refresh();
  }, [state, router]);

  const move = (i: number, dir: -1 | 1) =>
    setOrder((prev) => {
      const next = [...prev];
      const j = i + dir;
      if (j < 0 || j >= next.length) return prev;
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });

  const err = (field: string) =>
    state.fieldErrors?.[field] ? (
      <p className="mt-1 text-xs text-rose-400">{state.fieldErrors[field]}</p>
    ) : null;

  return (
    <form action={formAction} className="pb-16">
      <input type="hidden" name="sections_json" value={JSON.stringify(order)} readOnly />
      <input type="hidden" name="theme" value={theme} readOnly />

      {/* Encabezado + guardar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Apariencia y contenido</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Textos de la portada, orden de las secciones y fondo visual. Publica en la tienda al guardar.
          </p>
        </div>
        <SubmitButton />
      </div>

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

      <div className="mt-6 space-y-6">
        {/* Portada */}
        <fieldset className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
          <legend className="px-2 text-xs font-semibold uppercase tracking-widest text-cyan-300/80">
            Titular de la portada
          </legend>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Línea pequeña (sobre el titular)">
              <input name="kicker" defaultValue={config.texts.kicker} maxLength={90} className={`${inputCls} font-mono`} />
              {err("kicker")}
            </Field>
            <div />
            <Field label="Palabra blanca del titular">
              <input name="titleA" defaultValue={config.texts.titleA} maxLength={40} className={inputCls} />
              {err("titleA")}
            </Field>
            <Field label="Palabra con degradado del titular">
              <input name="titleB" defaultValue={config.texts.titleB} maxLength={40} className={inputCls} />
              {err("titleB")}
            </Field>
            <Field label="Subtítulo (párrafo)" wide>
              <textarea name="subtitle" rows={4} defaultValue={config.texts.subtitle} maxLength={600} className={`${inputCls} leading-relaxed`} />
              {err("subtitle")}
            </Field>
            <Field label="Botón principal">
              <input name="ctaPrimario" defaultValue={config.texts.ctaPrimario} maxLength={60} className={inputCls} />
            </Field>
            <Field label="Botón secundario">
              <input name="ctaSecundario" defaultValue={config.texts.ctaSecundario} maxLength={60} className={inputCls} />
            </Field>
          </div>
        </fieldset>

        {/* Destacado */}
        <fieldset className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
          <legend className="px-2 text-xs font-semibold uppercase tracking-widest text-cyan-300/80">
            Bloque destacado del estudio
          </legend>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Etiqueta pequeña">
              <input name="destacadoKicker" defaultValue={config.texts.destacadoKicker} maxLength={60} className={`${inputCls} font-mono`} />
            </Field>
            <Field label="Título">
              <input name="destacadoTitle" defaultValue={config.texts.destacadoTitle} maxLength={80} className={inputCls} />
            </Field>
            <Field label="Texto descriptivo" wide>
              <textarea name="destacadoBody" rows={3} defaultValue={config.texts.destacadoBody} maxLength={600} className={`${inputCls} leading-relaxed`} />
              {err("destacado")}
            </Field>
            <Field label="Botón «ver ficha»">
              <input name="destacadoCta" defaultValue={config.texts.destacadoCta} maxLength={60} className={inputCls} />
            </Field>
          </div>
        </fieldset>

        {/* Franja de valor */}
        <fieldset className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
          <legend className="px-2 text-xs font-semibold uppercase tracking-widest text-cyan-300/80">
            Franja de valor (tres tarjetas)
          </legend>
          <div className="space-y-4">
            {([0, 1, 2] as const).map((i) => (
              <div key={i} className="grid gap-3 rounded-xl border border-zinc-800 bg-zinc-950/50 p-3 sm:grid-cols-2">
                <Field label={`Tarjeta ${i + 1} · título`}>
                  <input name={`valor_t_${i}`} defaultValue={config.texts.valor[i].title} maxLength={60} className={inputCls} />
                </Field>
                <Field label={`Tarjeta ${i + 1} · texto`}>
                  <textarea name={`valor_x_${i}`} rows={2} defaultValue={config.texts.valor[i].text} maxLength={300} className={`${inputCls} leading-relaxed`} />
                </Field>
              </div>
            ))}
            {err("valor")}
          </div>
        </fieldset>

        {/* Pie de página */}
        <fieldset className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
          <legend className="px-2 text-xs font-semibold uppercase tracking-widest text-cyan-300/80">
            Pie de página
          </legend>
          <Field label="Frase final (todas las páginas)">
            <input name="footerTagline" defaultValue={config.texts.footerTagline} maxLength={300} className={inputCls} />
          </Field>
        </fieldset>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Orden de secciones */}
          <fieldset className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
            <legend className="px-2 text-xs font-semibold uppercase tracking-widest text-cyan-300/80">
              Orden de las secciones de la portada
            </legend>
            <ol className="space-y-2">
              {order.map((key, i) => (
                <li
                  key={key}
                  className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-950/60 px-3 py-2"
                >
                  <span className="text-sm text-zinc-200">
                    <span className="mr-2 font-mono text-xs text-zinc-600">{i + 1}</span>
                    {SECTION_LABELS[key]}
                  </span>
                  <span className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => move(i, -1)}
                      disabled={i === 0}
                      aria-label="Subir sección"
                      className="rounded px-2 py-0.5 text-zinc-400 transition hover:bg-zinc-800 hover:text-cyan-200 disabled:opacity-30"
                    >
                      ▲
                    </button>
                    <button
                      type="button"
                      onClick={() => move(i, 1)}
                      disabled={i === order.length - 1}
                      aria-label="Bajar sección"
                      className="rounded px-2 py-0.5 text-zinc-400 transition hover:bg-zinc-800 hover:text-cyan-200 disabled:opacity-30"
                    >
                      ▼
                    </button>
                  </span>
                </li>
              ))}
            </ol>
            {err("secciones")}
            <p className="mt-2 text-[11px] leading-relaxed text-zinc-600">
              El orden que veas aquí (de arriba hacia abajo) es el orden en que
              aparecen en la portada pública.
            </p>
          </fieldset>

          {/* Fondo */}
          <fieldset className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
            <legend className="px-2 text-xs font-semibold uppercase tracking-widest text-cyan-300/80">
              Fondo visual de la tienda
            </legend>
            <div className="grid gap-2">
              {BG_THEMES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTheme(t.id)}
                  className={`rounded-lg px-3 py-2 text-left transition ${
                    theme === t.id
                      ? "ring-1 ring-cyan-400/60 bg-zinc-800/80 text-zinc-100"
                      : "text-zinc-400 hover:bg-zinc-800/60"
                  }`}
                >
                  <span className="block text-sm font-medium text-zinc-100">{t.label}</span>
                  <span className="mt-0.5 block text-xs text-zinc-500">{t.desc}</span>
                </button>
              ))}
            </div>
          </fieldset>
        </div>
      </div>

      {/* Barra inferior fija */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-zinc-800 bg-zinc-950/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <p className="text-xs text-zinc-500">Los cambios prenden en la tienda al instante.</p>
          <SubmitButton />
        </div>
      </div>
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-full bg-gradient-to-r from-cyan-400 to-fuchsia-500 px-5 py-2 text-sm font-bold text-zinc-950 transition hover:brightness-110 disabled:opacity-60"
    >
      {pending ? "Publicando…" : "Publicar apariencia"}
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
