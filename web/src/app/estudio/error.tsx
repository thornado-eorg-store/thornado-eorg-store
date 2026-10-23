"use client";

// Límite de error del panel: si un guardado falla de forma inesperada,
// el artista ve esta pantalla amable en lugar del error técnico.

export default function EstudioError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto mt-16 max-w-lg rounded-2xl border border-rose-400/30 bg-rose-400/5 p-8 text-center">
      <p className="text-3xl" aria-hidden>
        🔌
      </p>
      <h1 className="mt-3 text-lg font-semibold text-rose-200">
        Algo no terminó de ir bien en el panel
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-zinc-300">
        No te preocupes: nada se borró. Los archivos demasiado pesados (portada
        mayor a 3 MB o audio mayor a 10 MB por pista) son la causa más común.
      </p>
      <p className="mt-3 font-mono text-[11px] text-zinc-500">
        {error.digest ? `código: ${error.digest}` : "código: interno"}
      </p>
      <div className="mt-5 flex justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-full bg-gradient-to-r from-cyan-400 to-fuchsia-500 px-5 py-2 text-sm font-bold text-zinc-950 transition hover:brightness-110"
        >
          Intentar de nuevo
        </button>
        <a
          href="/estudio"
          className="rounded-full border border-zinc-700 px-5 py-2 text-sm text-zinc-300 transition hover:border-zinc-500"
        >
          Volver al panel
        </a>
      </div>
    </div>
  );
}
