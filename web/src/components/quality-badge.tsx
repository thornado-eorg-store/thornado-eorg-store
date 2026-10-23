import type { MasterStatus } from "@/lib/catalog";

const styles: Record<
  MasterStatus,
  { cls: string; icon: string; label: string }
> = {
  VERIFIED_LOSSLESS: {
    cls: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
    icon: "✓",
    label: "Lossless verificado",
  },
  UNVERIFIED: {
    cls: "border-amber-500/40 bg-amber-500/10 text-amber-300",
    icon: "~",
    label: "Lossless sin verificar",
  },
  NEEDS_REVIEW: {
    cls: "border-zinc-600 bg-zinc-800 text-zinc-400",
    icon: "…",
    label: "En revisión espectral",
  },
};

/** Insignia del pipeline de QA espectral (diferenciador clave de la F1). */
export function QualityBadge({
  status,
  className = "",
}: {
  status: MasterStatus;
  className?: string;
}) {
  const s = styles[status];
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium ${s.cls} ${className}`}
    >
      <span aria-hidden>{s.icon}</span>
      {s.label}
    </span>
  );
}
