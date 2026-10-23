import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Magazine — THORNADO EORG",
  description:
    "Editorial de la tienda: notas sobre la producción musical con IA, masterización Hi-Res y la cultura del coleccionismo en formatos físicos.",
};

const posts = [
  {
    slug: "suno-premier-como-se-compone",
    tag: "PROCESO",
    title: "Cómo se compone un álbum en Suno Premier",
    excerpt:
      "Del prompt al master: el flujo completo detrás de Voltage Requiem — selección de takes, re-armonización a mano y decisiones estructurales que ninguna IA puede hacer sola.",
    readMin: 7,
    date: "2026-10-12",
    cover: "covers/suno-premier-sessions-001.svg",
    accent: "from-cyan-300 to-sky-500",
  },
  {
    slug: "fake-lossless-como-detectarlo",
    tag: "QA TÉCNICO",
    title: "Fake lossless: cómo detectar un MP3 disfrazado de WAV",
    excerpt:
      "Corte espectral a 16 kHz, entropía de canales centrales y asimetría del histograma de magnitudes. El arsenal de análisis que libera cada master de esta tienda antes de ponerse a la venta.",
    readMin: 9,
    date: "2026-10-05",
    cover: "covers/voltage-requiem.svg",
    accent: "from-fuchsia-400 to-violet-500",
  },
  {
    slug: "vinilo-180g-por-que-sigue-vivo",
    tag: "COLECCIONISMO",
    title: "Vinilo 180g reciclado: por qué el formato físico sigue vivo",
    excerpt:
      "En una era de streaming infinito, el vinilo de edición numerada apuesta por lo contrario: 300 copias, arte físico y una descarga digital instantánea incluida — lo mejor de los dos mundos.",
    readMin: 5,
    date: "2026-09-28",
    cover: "covers/neon-basalt.svg",
    accent: "from-amber-300 to-rose-400",
  },
];

export default function MagazinePage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <p className="mb-2 font-mono text-xs tracking-widest text-amber-300/80">
        MAGAZINE
      </p>
      <h1 className="text-3xl font-semibold tracking-tight">
        Editorial de la tienda
      </h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-400">
        Notas de estudio, análisis técnicos y contexto cultural. Nada de
        relleno algorítmico: aquí se publica lo que apoya la compra informada —
        saber exactamente qué estás comprando y por qué importa.
      </p>

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {posts.map((p) => (
          <article
            key={p.slug}
            className="group flex flex-col overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/50 transition hover:border-cyan-400/40"
          >
            <div
              className={`relative aspect-[16/9] bg-zinc-800`}
              aria-hidden
            >
              <span
                className={`absolute inset-0 bg-gradient-to-br ${p.accent} opacity-25 transition group-hover:opacity-40`}
              />
              <span className="scanlines absolute inset-0" />
            </div>
            <div className="flex flex-1 flex-col p-5">
              <p className="font-mono text-[11px] tracking-widest text-cyan-300/80">
                {p.tag}{" "}
                <span className="text-zinc-600">
                  · {p.readMin} min ·{" "}
                  {new Date(p.date + "T12:00:00Z").toLocaleDateString("es-MX", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </p>
              <h2 className="mt-2 text-lg font-semibold leading-snug text-zinc-100">
                {p.title}
              </h2>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-zinc-400">
                {p.excerpt}
              </p>
              <span className="mt-4 text-xs font-medium text-cyan-300/90">
                Leer nota →
              </span>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-12 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 text-center">
        <p className="text-sm text-zinc-400">
          Las notas completas llegarán con la F2 del roadmap (CMS de la
          editorial). Las miniaturas y títulos están curados desde el catálogo
          real de la tienda.
        </p>
        <Link
          href="/discover"
          className="mt-4 inline-block rounded-full border border-cyan-400/40 px-5 py-2 text-sm text-cyan-100 transition hover:border-cyan-300"
        >
          Ir al catálogo →
        </Link>
      </div>
    </div>
  );
}
