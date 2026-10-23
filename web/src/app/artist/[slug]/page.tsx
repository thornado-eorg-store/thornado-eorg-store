import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ReleaseCard } from "@/components/release-cards";
import { getArtist, releases, releasesByArtist } from "@/lib/catalog";

export function generateStaticParams() {
  return releases.map((r) => ({ slug: r.artistSlug })).filter(
    (v, i, a) => a.findIndex((x) => x.slug === v.slug) === i
  );
}

export async function generateMetadata({
  params,
}: PageProps<"/artist/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const artist = getArtist(slug);
  if (!artist) return { title: "No encontrado" };
  return { title: artist.name, description: artist.tagline };
}

export default async function ArtistPage({
  params,
}: PageProps<"/artist/[slug]">) {
  const { slug } = await params;
  const artist = getArtist(slug);
  if (!artist) notFound();

  const discography = releasesByArtist(slug);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      {/* banner */}
      <div
        className="relative h-48 overflow-hidden rounded-2xl border border-cyan-400/25 shadow-[0_0_50px_rgba(34,211,238,0.25)] sm:h-64"
        style={{
          background: `
            radial-gradient(circle at 25% 20%, rgba(255,255,255,0.15), transparent 45%),
            linear-gradient(120deg, ${artist.palette[0]}, ${artist.palette[1]})`,
        }}
      >
        <span aria-hidden className="scanlines absolute inset-0 rounded-[inherit]" />
        <span className="absolute bottom-4 left-4 font-mono text-sm font-bold tracking-[0.3em] text-white/85">
          SUNO · MODO PREMIER · 24/192
        </span>
      </div>
      <h1 className="mt-6 text-4xl font-semibold tracking-tight">
        {artist.name}
      </h1>
      <p className="mt-1 font-mono text-sm text-amber-300/80">
        {artist.tagline}
      </p>
      <p className="relative mt-4 max-w-3xl text-sm leading-relaxed text-zinc-400">
        {artist.bio}
      </p>
      <div className="mt-4 flex gap-2 text-xs">
        <span className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-emerald-300">
          ✓ Artista verificado — pagos en 24–48h
        </span>
        <span className="rounded-full border border-fuchsia-500/40 bg-fuchsia-500/10 px-3 py-1 font-semibold text-fuchsia-300">
          ⚡ Música 100% IA — Suno modo Premier
        </span>
        <span className="rounded-full border border-zinc-700 px-3 py-1 text-zinc-400">
          100% de sus masters pasaron QA espectral
        </span>
      </div>

      <section className="mt-10 border-t border-zinc-800 py-10">
        <h2 className="mb-6 text-xl font-semibold tracking-tight">
          Discografía ({discography.length})
        </h2>
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
          {discography.map((r) => (
            <ReleaseCard key={r.slug} release={r} />
          ))}
        </div>
      </section>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
        <h3 className="text-sm font-semibold text-zinc-100">
          Mensaje directo al artista
        </h3>
        <p className="mt-1 text-xs text-zinc-400">
          Función de F2: los fans podrán escribir al artista — y recibir un
          «gracias» que irá directo a su correo. Sin intermediarios.
        </p>
        <Link
          href="/discover"
          className="mt-3 inline-block rounded-full border border-zinc-700 px-4 py-2 text-sm text-zinc-300 transition hover:border-amber-400/50 hover:text-amber-200"
        >
          Explorar más artistas →
        </Link>
      </div>
    </div>
  );
}
