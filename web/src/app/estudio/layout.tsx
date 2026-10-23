import type { Metadata } from "next";
import Link from "next/link";
import { logoutAction } from "@/lib/estudio/actions";
import { isSessionValid, isUsingDefaultPassword } from "@/lib/estudio/session";
import { LoginCard } from "@/components/estudio/login-card";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Estudio · THORNADO EORG",
  robots: { index: false, follow: false },
};

// Ruta bloqueante: /estudio nunca se prerenderiza (puerta de sesión).
export const instant = false;

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const authed = await isSessionValid();

  if (!authed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4">
        <LoginCard defaultPasswordInUse={isUsingDefaultPassword()} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <header className="sticky top-0 z-40 border-b border-zinc-800/80 bg-zinc-950/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <span className="font-mono text-sm font-bold tracking-widest text-cyan-300">
              ESTUDIO · THORNADO EORG
            </span>
            <Link
              href="/estudio"
              className="text-sm text-zinc-500 transition hover:text-cyan-200"
            >
              inicio del panel
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/"
              className="text-xs text-zinc-500 transition hover:text-cyan-200"
            >
              ver tienda ↗
            </a>
            <form action={logoutAction}>
              <button
                type="submit"
                className="rounded-full border border-zinc-700 px-3 py-1 text-xs text-zinc-400 transition hover:border-rose-400/60 hover:text-rose-300"
              >
                Salir
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
      <footer className="border-t border-zinc-900 py-6 text-center text-[11px] text-zinc-600">
        Acceso de mantenimiento · no indexado por buscadores · sesión de 12 h
      </footer>
    </div>
  );
}
