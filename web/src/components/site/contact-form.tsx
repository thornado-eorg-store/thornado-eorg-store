"use client";

import { useActionState } from "react";
import { sendContactMessageAction } from "@/lib/estudio/actions";
import type { FormState } from "@/lib/estudio/types";

const INITIAL: FormState = { ok: false };

const inputCls =
  "w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm outline-none transition focus:border-cyan-400/60";

export function ContactForm() {
  const [state, formAction] = useActionState(sendContactMessageAction, INITIAL);

  if (state.ok) {
    return (
      <div className="rounded-2xl border border-emerald-400/40 bg-emerald-400/10 p-6 text-sm leading-relaxed text-emerald-200">
        ✓ {state.message}
      </div>
    );
  }

  const err = (field: string) =>
    state.fieldErrors?.[field] ? (
      <p className="mt-1 text-xs text-rose-400">{state.fieldErrors[field]}</p>
    ) : null;

  return (
    <form action={formAction} className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 backdrop-blur-sm">
      {state.message && !state.ok && (
        <div className="mb-4 rounded-xl border border-rose-400/40 bg-rose-400/10 p-3 text-sm text-rose-200">
          ✕ {state.message}
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <span className="mb-1 block text-xs font-medium text-zinc-400">Tu nombre *</span>
          <input name="nombre" required maxLength={80} className={inputCls} />
          {err("nombre")}
        </div>
        <div>
          <span className="mb-1 block text-xs font-medium text-zinc-400">Correo (si quieres respuesta)</span>
          <input name="email" type="email" maxLength={120} placeholder="tucorreo@ejemplo.com" className={inputCls} />
          {err("email")}
        </div>
        <div className="sm:col-span-2">
          <span className="mb-1 block text-xs font-medium text-zinc-400">Asunto</span>
          <input name="asunto" maxLength={120} placeholder="Licencia para un vídeo, pedido de vinilo, colaboraciones…" className={inputCls} />
        </div>
        <div className="sm:col-span-2">
          <span className="mb-1 block text-xs font-medium text-zinc-400">Mensaje *</span>
          <textarea name="texto" required rows={5} minLength={10} maxLength={4000} className={`${inputCls} leading-relaxed`} />
          {err("texto")}
        </div>
      </div>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <p className="text-[11px] text-zinc-600">
          Tu mensaje llega directo al panel del estudio (generalmente se revisa el mismo día).
        </p>
        <button
          type="submit"
          className="rounded-full bg-gradient-to-r from-cyan-400 to-fuchsia-500 px-6 py-2.5 text-sm font-bold text-zinc-950 transition hover:brightness-110"
        >
          Enviar mensaje
        </button>
      </div>
    </form>
  );
}
