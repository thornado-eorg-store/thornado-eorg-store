"use client";

// Acceso al panel de mantenimiento. Sin estado de sesión → puerta.
import { useActionState } from "react";
import { loginAction } from "@/lib/estudio/actions";
import type { FormState } from "@/lib/estudio/types";

const INITIAL: FormState = { ok: false };

export function LoginCard({ defaultPasswordInUse }: { defaultPasswordInUse: boolean }) {
  const [state, formAction, pending] = useActionState(loginAction, INITIAL);

  return (
    <div className="w-full max-w-sm">
      <div className="rounded-2xl border border-cyan-400/20 bg-zinc-900/70 p-8 shadow-[0_0_60px_rgba(34,211,238,0.12)]">
        <p className="font-mono text-[11px] tracking-[0.3em] text-cyan-300/80">
          MODO EDICIÓN
        </p>
        <h1 className="mt-2 text-xl font-semibold tracking-tight">
          Estudio interno
        </h1>
        <p className="mt-1 text-xs text-zinc-500">
          Acceso de mantenimiento — invisible para el público.
        </p>

        {defaultPasswordInUse && (
          <div className="mt-4 rounded-lg border border-amber-400/40 bg-amber-400/10 p-3 text-[11px] leading-relaxed text-amber-200">
            ⚠ Esta instancia aún usa la contraseña provisional. Configura{" "}
            <code className="font-mono">ESTUDIO_PASSWORD</code> en Vercel para
            fijar la definitiva antes de publicar la tienda.
          </div>
        )}

        <form action={formAction} className="mt-5 space-y-3">
          <div>
            <label
              htmlFor="password"
              className="block text-xs font-medium text-zinc-400"
            >
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoFocus
              autoComplete="current-password"
              className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm outline-none transition focus:border-cyan-400/60"
            />
          </div>
          {state.message && !state.ok && (
            <p className="text-xs text-rose-400">{state.message}</p>
          )}
          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-full bg-gradient-to-r from-cyan-400 to-fuchsia-500 py-2.5 text-sm font-bold text-zinc-950 transition hover:brightness-110 disabled:opacity-60"
          >
            {pending ? "Verificando…" : "Entrar al estudio"}
          </button>
        </form>
      </div>
      <p className="mt-4 text-center text-[11px] text-zinc-600">
        Sesión firmada · bloqueo de 1 min tras 5 intentos fallidos
      </p>
    </div>
  );
}
