import Link from "next/link";
import type { Release } from "@/lib/catalog";
import { usd } from "@/lib/catalog";

/** Portada con imagen en miniatura (SVG generativo en public/covers).
 *  Fallback: gradiente de la paleta. El chip SUNO PREMIER queda como overlay.
 */
export function CoverArt({
  release,
  subtle = false,
}: {
  release: Release;
  subtle?: boolean;
}) {
  return (
    <div className="relative flex aspect-square items-center justify-center overflow-hidden"
      style={{
        backgroundImage: `url(/covers/${release.slug}.svg), linear-gradient(135deg, ${release.palette[0]}, ${release.palette[1]})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <span aria-hidden className="scanlines absolute inset-0" />
      <span
        aria-hidden
        className={`absolute bottom-3 right-3 rounded-full border border-white/25 bg-black/30 px-2 py-0.5 font-mono text-[10px] text-white/80 ${
          subtle ? "hidden sm:inline-block" : ""
        }`}
      >
        SUNO PREMIER
      </span>
    </div>
  );
}

/** Tarjeta de release (portada generativa + info). */
export function ReleaseCard({ release }: { release: Release }) {
  return (
    <Link href={`/release/${release.slug}`} className="group block">
      <div className="overflow-hidden rounded-xl border border-zinc-800 transition group-hover:border-cyan-400/50 group-hover:shadow-[0_0_28px_rgba(34,211,238,0.18)]">
        <CoverArt release={release} subtle />
      </div>
      <div className="mt-3 space-y-0.5">
        <p className="truncate text-sm font-medium text-zinc-100">
          {release.title}
        </p>
        <p className="truncate text-xs text-zinc-400">{release.artist}</p>
        <p className="pt-1 font-mono text-xs text-cyan-300/90">
          {release.pricingMode === "PWYW"
            ? `desde ${usd(release.minPrice)} (elige tú)`
            : usd(release.minPrice)}
        </p>
      </div>
    </Link>
  );
}

/** Pseudoespectrograma determinista (demo). En producción, PNG real de ffmpeg. */
export function Spectrum({
  palette,
  seed = 7,
  bars = 96,
}: {
  palette: [string, string];
  seed?: number;
  bars?: number;
}) {
  const heights = Array.from({ length: bars }, (_, i) => {
    const v = Math.abs(Math.sin((i + seed * 13) * 12.9898 * 43758.5453)) % 1;
    return 10 + Math.round(v * 80);
  });
  return (
    <svg
      viewBox={`0 0 ${bars} 100`}
      preserveAspectRatio="none"
      className="h-full w-full"
      role="img"
      aria-label="Espectrograma (demo)"
    >
      <defs>
        <linearGradient id="specgrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={palette[0]} />
          <stop offset="100%" stopColor={palette[1]} />
        </linearGradient>
      </defs>
      {heights.map((h, i) => (
        <rect
          key={i}
          x={i}
          y={100 - h}
          width={0.6}
          height={h}
          fill="url(#specgrad)"
          rx={0.3}
        />
      ))}
    </svg>
  );
}
