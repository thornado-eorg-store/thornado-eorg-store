"use client";

// Interruptor rápido de visibilidad (mostrar/ocultar en la tienda).
import { useState, useTransition } from "react";
import { toggleVisibilityAction } from "@/lib/estudio/actions";

export function VisibilityToggle({
  slug,
  hidden,
  title,
}: {
  slug: string;
  hidden: boolean;
  title: string;
}) {
  const [isHidden, setIsHidden] = useState(hidden);
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      title={
        isHidden
          ? `Mostrar «${title}» en la tienda`
          : `Ocultar «${title}» de la tienda (queda editable)`
      }
      onClick={() => {
        startTransition(async () => {
          const next = !isHidden;
          const res = await toggleVisibilityAction(slug, next);
          if (res.ok) setIsHidden(next);
        });
      }}
      className={`rounded-full px-3 py-1 text-xs font-medium transition ${
        isHidden
          ? "bg-zinc-800 text-zinc-400 hover:text-emerald-300"
          : "bg-emerald-500/15 text-emerald-300 hover:text-emerald-200"
      } disabled:opacity-50`}
    >
      {pending ? "…" : isHidden ? "▲ Publicar" : "✓ Visible"}
    </button>
  );
}
