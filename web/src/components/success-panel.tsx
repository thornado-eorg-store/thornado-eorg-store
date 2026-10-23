"use client";

// Panel de confirmación: necesita leer session_id de la URL,
// por eso vive detrás de una frontera <Suspense> en la página.
import { useSearchParams } from "next/navigation";

export function SuccessPanel() {
  const params = useSearchParams();
  const sessionId = params.get("session_id");

  if (!sessionId) {
    return (
      <p className="mt-4 text-sm text-zinc-400">
        Pago registrado. Gracias por apoyar la música de THORNADO EORG — el 90%
        va directo al artista.
      </p>
    );
  }
  return (
    <p className="mt-4 text-sm text-zinc-400">
      Orden{" "}
      <span className="font-mono text-cyan-300">
        #{sessionId.slice(-8).toUpperCase()}
      </span>{" "}
      confirmada. Recibirás tu descarga digital (WAV/FLAC/AIFF) por correo —
      re-descargas ilimitadas e incluidas.
    </p>
  );
}
