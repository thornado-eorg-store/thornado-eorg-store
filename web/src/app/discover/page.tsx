import Link from "next/link";
import { ReleaseCard } from "@/components/release-cards";
import { allReleases, releasesByTag, type Release } from "@/lib/store";

export const metadata = {
  title: "Descubrir",
};

export default async function DiscoverPage() {
  const [catalog, hires, djTools, suno] = await Promise.all([
    allReleases(),
    releasesByTag("hires"),
    releasesByTag("dj-tools"),
    releasesByTag("suno-premier"),
  ]);
  const vinilos = catalog.filter((r) => r.hasVinyl);
  const pwyw = catalog.filter((r) => r.pricingMode === "PWYW");

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <p className="mb-2 font-mono text-xs tracking-widest text-amber-300/80">
        DESCUBRIR
      </p>
      <h1 className="text-3xl font-semibold tracking-tight">
        Todo el catálogo
      </h1>
      <p className="mt-2 max-w-2xl text-zinc-400">
        Colecciones curadas por la editorial. Sin algoritmo de caja negra:
        cuando llegue la IA de descubrimiento, explicará por qué te
        recomendamos cada cosa.
      </p>

      <div className="mt-6 flex flex-wrap gap-2 text-sm">
        {[
          ["Hi-Res 24-bit", "#hires"],
          ["Suno Premier Mode", "#suno-premier"],
          ["Vinilos en stock", "#vinilos"],
          ["DJ Tools (BPM/Tonalidad)", "#dj-tools"],
          ["Elige tu precio", "#pwyw"],
        ].map(([label, href]) => (
          <Link
            key={label}
            href={href}
            className="rounded-full border border-zinc-700 px-4 py-1.5 text-zinc-300 transition hover:border-amber-400/50 hover:text-amber-200"
          >
            {label}
          </Link>
        ))}
      </div>

      <Section
        id="hires"
        title="Colección Hi-Res · 24/96 o superior"
        releases={hires}
      />
      <Section
        id="suno-premier"
        title="⚡ Generada en Suno · Modo Premier"
        releases={suno}
      />
      <Section
        id="vinilos"
        title="Vinilos disponibles"
        releases={vinilos}
        note={(r) =>
          (r.vinylStock ?? 0) === 0
            ? "AGOTADO"
            : `${r.vinylStock} copias`
        }
      />
      <Section
        id="dj-tools"
        title="DJ Tools — con BPM y tonalidad"
        releases={djTools}
      />
      <Section
        id="pwyw"
        title="Elige tu precio (PWYW)"
        releases={pwyw}
      />

      <section className="border-t border-zinc-800 py-10">
        <h2 className="mb-6 text-xl font-semibold tracking-tight">
          Catálogo completo ({catalog.length})
        </h2>
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-5">
          {catalog.map((r) => (
            <ReleaseCard key={r.slug} release={r} />
          ))}
        </div>
      </section>
    </div>
  );
}

function Section({
  id,
  title,
  releases,
  note,
}: {
  id: string;
  title: string;
  releases: Release[];
  note?: (r: Release) => string;
}) {
  return (
    <section
      id={id}
      className="scroll-mt-24 border-t border-zinc-800 py-10"
    >
      <h2 className="mb-6 text-xl font-semibold tracking-tight">{title}</h2>
      <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-5">
        {releases.map((r) => (
          <div key={r.slug}>
            <ReleaseCard release={r} />
            {note && (
              <p
                className={`mt-1 font-mono text-[11px] ${
                  note(r) === "AGOTADO" ? "text-rose-400" : "text-zinc-500"
                }`}
              >
                {note(r)}
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
