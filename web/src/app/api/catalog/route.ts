// Catálogo público en JSON (consumible por apps móviles o integraciones).
import { NextResponse } from "next/server";
import { allReleases, getArtist } from "@/lib/store";

export async function GET() {
  const releases = await allReleases();
  const artists = new Map<string, Awaited<ReturnType<typeof getArtist>>>();
  for (const r of releases) {
    if (!artists.has(r.artistSlug)) artists.set(r.artistSlug, await getArtist(r.artistSlug));
  }
  return NextResponse.json({
    source: process.env.DATABASE_URL ? "db-or-demo" : "demo",
    releases: releases.map((r) => ({
      slug: r.slug,
      title: r.title,
      artist: r.artist,
      type: r.type,
      year: r.year,
      genres: r.genres,
      pricingMode: r.pricingMode,
      minPrice: r.minPrice,
      hasVinyl: r.hasVinyl ?? false,
    })),
    artists: Array.from(artists.values(), (a) =>
      a ? { slug: a.slug, name: a.name, tagline: a.tagline } : null
    ).filter(Boolean),
  });
}
