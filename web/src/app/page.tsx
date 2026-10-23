import Link from "next/link";
import { CoverArt, ReleaseCard } from "@/components/release-cards";
import { allReleases, releasesByTag, liveFeed } from "@/lib/catalog";

const valuePoints = [
  {
    icon: "🛰️",
    title: "100% IA · Suno Premier",
    text: "Toda la música se genera en Suno modo Premier y pasa por arreglo, masterización y QA humanos.",
  },
  {
    icon: "🔬",
    title: "Lossless verificado",
    text: "Análisis espectral de cada master antes de liberar: nada de MP3 disfrazado de WAV.",
  },
  {
    icon: "💎",
    title: "Hi-Res hasta DSD",
    text: "FLAC 24/192, DSD y fichas técnicas visibles en cada pista. Vinilo con descarga instantánea.",
  },
];

export default function Home() {
  const novedades = releasesByTag("novedad");
  const hires = releasesByTag("hires");
  return (
    <div className="mx-auto max-w-6xl px-4">
      {/* Hero futurista */}
      <section className="relative overflow-hidden py-24 text-center">
        <div aria-hidden className="hero-grid absolute inset-0 -mx-24 -my-20 opacity-70" />
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 60% 55% at 50% 40%, transparent 0%, #05060f 90%)",
          }}
        />
        <div className="relative">
          <p className="mb-3 font-mono text-xs tracking-[0.35em] text-cyan-300/90">
            COMPOSITOR · ARREGLISTA · PRODUCTOR
          </p>
          <h1 className="neon-glow mx-auto max-w-4xl text-5xl font-bold leading-tight tracking-tight text-white sm:text-6xl">
            THORNADO{" "}
            <span className="bg-gradient-to-r from-cyan-300 via-sky-400 to-fuchsia-400 bg-clip-text text-transparent">
              EORG
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-zinc-300">
            Música <strong className="text-cyan-200">100% generada con IA</strong>{" "}
            (Suno, modo Premier), terminada a mano: estructura, arreglo,
            masterización Hi-Res y verificación espectral. Aquí compras el
            master real — WAV, FLAC 24-bit, DSD y vinilo.
          </p>
          <div className="relative mt-9 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/discover"
              className="rounded-full bg-gradient-to-r from-cyan-400 to-fuchsia-500 px-7 py-3 text-sm font-bold text-zinc-950 shadow-[0_0_32px_rgba(34,211,238,0.35)] transition hover:brightness-110"
            >
              Entrar al catálogo
            </Link>
            <Link
              href="/release/voltage-requiem"
              className="rounded-full border border-cyan-400/40 px-7 py-3 text-sm font-medium text-cyan-100 transition hover:border-cyan-300 hover:text-white"
            >
              Escuchar el Requiem →
            </Link>
          </div>
        </div>
      </section>

      {/* Franja de valor */}
      <section className="grid gap-4 border-y border-zinc-800/80 py-10 sm:grid-cols-3">
        {valuePoints.map((p) => (
          <div
            key={p.title}
            className="rounded-xl border border-zinc-800/70 bg-zinc-900/40 p-5 backdrop-blur-sm"
          >
            <p className="mb-2 text-2xl" aria-hidden>
              {p.icon}
            </p>
            <h3 className="text-sm font-semibold text-zinc-100">{p.title}</h3>
            <p className="mt-1 text-sm leading-relaxed text-zinc-400">
              {p.text}
            </p>
          </div>
        ))}
      </section>

      {/* Destacado del estudio */}
      <section className="py-12">
        <div className="grid items-center gap-8 rounded-2xl border border-zinc-800/70 bg-zinc-900/40 p-6 backdrop-blur-sm lg:grid-cols-[260px_1fr]">
          <div className="overflow-hidden rounded-xl border border-cyan-400/25 shadow-[0_0_40px_rgba(34,211,238,0.2)]">
            <CoverArt release={allReleases()[0]} />
          </div>
          <div>
            <p className="font-mono text-xs tracking-widest text-fuchsia-300/80">
              DEL ESTUDIO · ÚLTIMO ÁLBUM
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-white">
              Voltage Requiem
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-400">
              Réquiem + sintetizadores, crecido en Suno Premier y terminado
              bajo decisión humana: cinco movimientos a 24-bit/192 kHz, con
              edición limitada en vinilo. Escucha la obertura abajo en la
              barra del reproductor.
            </p>
            <Link
              href="/release/voltage-requiem"
              className="mt-5 inline-block rounded-full border border-cyan-400/40 px-5 py-2 text-sm font-medium text-cyan-100 transition hover:border-cyan-300"
            >
              Ver ficha completa
            </Link>
          </div>
        </div>
      </section>

      {/* Novedades */}
      <section className="py-8">
        <div className="mb-6 flex items-baseline justify-between">
          <h2 className="text-2xl font-semibold tracking-tight text-white">
            Novedades
          </h2>
          <Link href="/discover" className="text-sm text-cyan-300/90 hover:underline">
            ver todo →
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-5">
          {novedades.map((r) => (
            <ReleaseCard key={r.slug} release={r} />
          ))}
        </div>
      </section>

      {/* Colección Hi-Res + feed de ventas */}
      <section id="hires" className="grid gap-10 py-8 lg:grid-cols-[2fr_1fr]">
        <div>
          <h2 className="mb-6 text-2xl font-semibold tracking-tight text-white">
            Colección{" "}
            <span className="bg-gradient-to-r from-cyan-300 to-fuchsia-400 bg-clip-text text-transparent">
              Hi-Res · 24-bit
            </span>
          </h2>
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3">
            {hires.map((r) => (
              <ReleaseCard key={r.slug} release={r} />
            ))}
          </div>
        </div>
        <div>
          <h2 className="mb-6 text-2xl font-semibold tracking-tight text-white">
            Ventas en vivo
          </h2>
          <div className="rounded-xl border border-zinc-800/70 bg-zinc-900/50 p-4 backdrop-blur-sm">
            <ul className="space-y-3">
              {liveFeed.map((f) => (
                <li key={f.text} className="flex gap-3 text-xs">
                  <span
                    className="pulse-dot mt-1 h-2 w-2 shrink-0 rounded-full bg-cyan-400"
                    aria-hidden
                  />
                  <span className="text-zinc-400">
                    <span className="font-mono text-zinc-500">{f.when}</span> ·{" "}
                    {f.text}
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-4 border-t border-zinc-800 pt-3 text-[11px] text-zinc-500">
              Feed en tiempo real (demo estático). En producción: Redis
              Pub/Sub + WebSocket.
            </p>
          </div>
        </div>
      </section>

      {/* Catálogo completo */}
      <section className="py-12">
        <h2 className="mb-6 text-2xl font-semibold tracking-tight text-white">
          Catálogo completo
        </h2>
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-6">
          {allReleases().map((r) => (
            <ReleaseCard key={r.slug} release={r} />
          ))}
        </div>
      </section>
    </div>
  );
}
