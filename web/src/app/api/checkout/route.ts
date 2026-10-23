// Checkout con Stripe Checkout Sessions.
// POST { items: [{ slug, kind: "digital" | "vinyl" }] }
// - Los precios SIEMPRE se resuelven en el servidor (nunca se confía en el cliente).
// - Si Stripe no está configurado, responde 503 con un fallback demo claro.
import { NextResponse } from "next/server";
import { getStripe, isStripeConfigured } from "@/lib/stripe";
import { allReleases } from "@/lib/store";

interface IncomingItem {
  slug: string;
  kind: "digital" | "vinyl";
}

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://thornado-eorg-store.vercel.app";

export async function POST(req: Request) {
  let body: { items?: IncomingItem[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid-json" }, { status: 400 });
  }

  const items = (body.items ?? []).slice(0, 50);
  if (items.length === 0) {
    return NextResponse.json({ ok: false, error: "empty-cart" }, { status: 400 });
  }

  if (!isStripeConfigured()) {
    return NextResponse.json(
      {
        ok: false,
        error: "STRIPE_NOT_CONFIGURED",
        message:
          "Modo demo: pagos simulados. Configura STRIPE_SECRET_KEY para activar el checkout real.",
        total: await computeTotal(items),
      },
      { status: 503 }
    );
  }

  // Precios — resueltos en servidor desde el catálogo (anti-tampering)
  const catalog = await allReleases();
  const lineItems = [];
  for (const item of items) {
    const release = catalog.find((r) => r.slug === item.slug);
    if (!release) continue;
    if (item.kind === "vinyl" && release.hasVinyl && (release.vinylStock ?? 0) > 0) {
      lineItems.push({
        price_data: priceData(release.vinylPrice!, release.title, "Vinilo edición limitada — incluye descarga digital", release.slug),
        quantity: 1,
      });
    } else {
      lineItems.push({
        price_data: priceData(release.minPrice, release.title, "Descarga digital (WAV/FLAC/AIFF)", release.slug),
        quantity: 1,
      });
    }
  }

  if (lineItems.length === 0) {
    return NextResponse.json({ ok: false, error: "no-valid-items" }, { status: 400 });
  }

  const stripe = getStripe()!;
  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems as never,
      success_url: `${SITE_URL}/cart/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${SITE_URL}/cart`,
      metadata: { store: "thornado-eorg" },
    });
    return NextResponse.json({ ok: true, url: session.url });
  } catch (err) {
    console.error("[checkout] Stripe error:", err);
    return NextResponse.json(
      { ok: false, error: "stripe-error", message: String(err) },
      { status: 500 }
    );
  }
}

function priceData(
  unitAmount: number,
  product: string,
  desc: string,
  slug: string
) {
  return {
    currency: "usd",
    unit_amount: Math.round(unitAmount * 100),
    product_data: {
      name: `${product} · THORNADO EORG`,
      description: desc,
      ...(process.env.NEXT_PUBLIC_SITE_URL
        ? { images: [`${process.env.NEXT_PUBLIC_SITE_URL}/covers/${slug}.svg`] }
        : {}),
    },
  };
}

async function computeTotal(items: IncomingItem[]): Promise<number> {
  const catalog = await allReleases();
  let total = 0;
  for (const i of items) {
    const r = catalog.find((x) => x.slug === i.slug);
    if (!r) continue;
    total += i.kind === "vinyl" && r.hasVinyl ? (r.vinylPrice ?? r.minPrice) : r.minPrice;
  }
  return Number(total.toFixed(2));
}
