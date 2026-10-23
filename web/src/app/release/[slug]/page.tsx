import Link from "next/link";
import type { Metadata } from "next";
import { QualityBadge } from "@/components/quality-badge";
import { PreviewButton } from "@/components/player";
import { Spectrum, CoverArt } from "@/components/release-cards";
import { AddToCartButton } from "@/components/cart";
import { getRelease } from "@/lib/store";
import { releases, usd, specLabel, durationLabel } from "@/lib/catalog";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return releases.map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/release/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const release = await getRelease(slug);
  if (!release) return { title: "No encontrado" };
  return {
    title: `${release.title} — ${release.artist}`,
    description: release.editorial,
  };
}

export default async function ReleasePage({
  params,
}: PageProps<"/release/[slug]">) {
  const { slug } = await params;
  const release = await getRelease(slug);
  if (!release) notFound();

  const artist = release.artist;
  const verified = release.tracks.filter(
    (t) => t.status === "VERIFIED_LOSSLESS"
  ).length;

  return (
    <article className="mx-auto max-w-6xl px-4 py-10">
      <div className="grid gap-10 lg:grid-cols-[380px_1fr]">
        {/* Columna: portada y compra */}
        <div>
          <div className="overflow-hidden rounded-2xl border border-cyan-400/25 shadow-[0_0_44px_rgba(34,211,238,0.22)]">
            <CoverArt release={release} />
          </div>

          {/* Panel de compra */}
          <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
            <h2 className="text-sm font-semibold text-zinc-100">
              Formatos y precio
            </h2>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {release.formats.map((f) => (
                <span
                  key={f}
                  className="rounded-md border border-zinc-700 bg-zinc-800 px-2 py-0.5 font-mono text-[11px] text-zinc-300"
                >
                  {f}
                </span>
              ))}
            </div>
            <p className="mt-4 text-sm text-zinc-400">
              {release.pricingMode === "PWYW" ? (
                <>
                  <span className="font-mono text-lg text-amber-300">
                    elige tú
                  </span>{" "}
                  (mínimo {usd(release.minPrice)})
                </>
              ) : (
                <>
                  digital:{" "}
                  <span className="font-mono text-lg text-amber-300">
                    {usd(release.minPrice)}
                  </span>
                </>
              )}
            </p>

            {release.hasVinyl && (
              <div
                className={`mt-4 rounded-xl p-3 ${
                  (release.vinylStock ?? 0) === 0
                    ? "bg-rose-950/40 text-rose-300"
                    : "bg-zinc-800/60 text-zinc-300"
                }`}
              >
                <p className="text-xs font-semibold uppercase tracking-wide">
                  Vinilo edición limitada
                </p>
                <p className="mt-0.5 text-sm">
                  {(release.vinylStock ?? 0) === 0
                    ? "AGOTADO — queda disponible el digital"
                    : `${usd(release.vinylPrice!)} · quedan ${release.vinylStock} de 300 · incluye descarga digital inmediata`}
                </p>
              </div>
            )}

            <div className="mt-5 space-y-2">
              <AddToCartButton
                item={{
                  slug: release.slug,
                  title: release.title,
                  artist,
                  kind: "digital",
                  price: release.minPrice,
                }}
                label={
                  release.pricingMode === "PWYW"
                    ? `Añadir al carrito · desde ${usd(release.minPrice)}`
                    : `Añadir al carrito · ${usd(release.minPrice)}`
                }
                className="w-full"
              />
              {release.hasVinyl && (release.vinylStock ?? 0) > 0 && (
                <AddToCartButton
                  item={{
                    slug: release.slug,
                    title: `${release.title} — vinilo`,
                    artist,
                    kind: "vinyl",
                    price: release.vinylPrice!,
                  }}
                  label={`Añadir vinilo · ${usd(release.vinylPrice!)}`}
                  variant="secondary"
                  className="w-full"
                />
              )}
            </div>
            <Link
              href="/cart"
              className="mt-3 block text-center text-xs text-cyan-300/90 transition hover:underline"
            >
              Ir al carrito →
            </Link>
            <p className="mt-3 text-center text-[11px] text-zinc-500">
              Re-descargas ilimitadas · entregas WAV/FLAC/AIFF del mismo master ·
              facturas automáticas
            </p>
          </div>
        </div>

        {/* Columna: info */}
        <div>
          <p className="font-mono text-xs tracking-widest text-amber-300/80">
            RELEASE
          </p>
          <h1 className="mt-1 text-4xl font-semibold tracking-tight">
            {release.title}
          </h1>
          <p className="mt-2 text-lg text-zinc-300">
            por{" "}
            <Link
              href={`/artist/${release.artistSlug}`}
              className="text-amber-200/90 hover:underline"
            >
              {artist}
            </Link>
          </p>
          <p className="mt-1 flex flex-wrap gap-2 text-xs text-zinc-500">
            {release.genres.map((g) => (
              <span
                key={g}
                className="rounded-full border border-zinc-800 px-2.5 py-1"
              >
                {g}
              </span>
            ))}
            <span className="rounded-full border border-fuchsia-500/40 bg-fuchsia-500/10 px-2.5 py-1 font-semibold text-fuchsia-300">
              ⚡ 100% SUNO · MODO PREMIER
            </span>
          </p>

          <blockquote className="mt-6 border-l-2 border-amber-400/50 pl-4 text-sm italic leading-relaxed text-zinc-300">
            «{release.editorial}» — Editorial AURALIA
          </blockquote>

          {/* Tracklist */}
          <section className="mt-8">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-400">
              Tracklist · {verified}/{release.tracks.length} masterizados
              verificados
            </h2>
            <ol className="overflow-hidden rounded-2xl border border-zinc-800">
              {release.tracks.map((t, i) => (
                <li
                  key={t.id}
                  className={`flex items-center gap-3 px-4 py-3 ${
                    i % 2 ? "bg-zinc-900/40" : "bg-zinc-900/70"
                  }`}
                >
                  <span className="w-6 font-mono text-xs text-zinc-500">
                    {i + 1}
                  </span>
                  <PreviewButton
                    item={{
                      id: t.id,
                      trackTitle: t.title,
                      artist,
                      release: release.title,
                      spec: specLabel(t),
                      palette: release.palette,
                      audioUrl: t.previewUrl,
                    }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-zinc-100">
                      {t.title}
                    </p>
                    <p className="font-mono text-[11px] text-zinc-500">
                      {specLabel(t)}
                      {t.bpm
                        ? ` · ${t.bpm} BPM · ${t.musicalKey}`
                        : ""}
                    </p>
                  </div>
                  <QualityBadge status={t.status} />
                  <span className="font-mono text-xs text-zinc-400">
                    {durationLabel(t.durationSec)}
                  </span>
                </li>
              ))}
            </ol>
          </section>

          {/* QA espectral */}
          <section className="mt-8">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-400">
              Verificación espectral (extracto)
            </h2>
            <div className="overflow-hidden rounded-2xl border border-zinc-800">
              <div className="aspect-[16/6] bg-zinc-900">
                <Spectrum
                  palette={release.palette}
                  seed={release.title.length}
                />
              </div>
              <p className="border-t border-zinc-800 bg-zinc-900/70 px-4 py-3 text-xs leading-relaxed text-zinc-400">
                Análisis de corte de frecuencia generado automáticamente por el
                pipeline de ingest (demo estático). Detecta MP3 disfrazados de
                lossless antes de que lleguen a tu cadena de audio.
              </p>
            </div>
          </section>
        </div>
      </div>
    </article>
  );
}
