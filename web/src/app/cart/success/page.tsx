import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { SuccessPanel } from "@/components/success-panel";

export const metadata: Metadata = {
  title: "Compra completada",
  robots: { index: false },
};

export default function CartSuccessPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-20 text-center">
      <p className="text-5xl" aria-hidden>
        ✅
      </p>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight">
        ¡Compra completada!
      </h1>
      <Suspense
        fallback={
          <p className="mt-4 text-sm text-zinc-500">Verificando la orden…</p>
        }
      >
        <SuccessPanel />
      </Suspense>
      <div className="mt-9 flex flex-wrap justify-center gap-3">
        <Link
          href="/discover"
          className="rounded-full bg-gradient-to-r from-cyan-400 to-fuchsia-500 px-6 py-3 text-sm font-bold text-zinc-950 transition hover:brightness-110"
        >
          Volver al catálogo
        </Link>
        <Link
          href="/"
          className="rounded-full border border-zinc-700 px-6 py-3 text-sm text-zinc-300 transition hover:border-amber-400/50 hover:text-amber-200"
        >
          Ir al inicio
        </Link>
      </div>
    </div>
  );
}
