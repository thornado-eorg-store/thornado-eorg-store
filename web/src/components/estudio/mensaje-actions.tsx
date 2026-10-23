"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { messageCloseOperation } from "@/lib/estudio/actions";

export function MensajeActions({
  id,
  nombre,
  leido,
}: {
  id: string;
  nombre: string;
  leido: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [aviso, setAviso] = useState<string | null>(null);

  const ejecutar = (op: "procesar" | "borrar") => {
    if (op === "borrar" && !window.confirm(`¿Borrar el mensaje de ${nombre}?`)) return;
    startTransition(async () => {
      const res = await messageCloseOperation(id, op);
      setAviso(res.ok ? null : res.message);
      router.refresh();
    });
  };

  return (
    <span className="flex items-center gap-2">
      {aviso && <span className="text-xs text-rose-400">{aviso}</span>}
      <button
        type="button"
        disabled={pending}
        onClick={() => ejecutar("procesar")}
        className="rounded-full border border-zinc-700 px-3 py-1 text-xs text-zinc-400 transition hover:border-cyan-400/50 hover:text-cyan-200 disabled:opacity-60"
      >
        {pending ? "…" : leido ? "marcar sin leer" : "marcar leído"}
      </button>
      <button
        type="button"
        disabled={pending}
        onClick={() => ejecutar("borrar")}
        className="rounded-full border border-zinc-700 px-3 py-1 text-xs text-zinc-400 transition hover:border-rose-400/60 hover:text-rose-300 disabled:opacity-60"
      >
        borrar
      </button>
    </span>
  );
}
