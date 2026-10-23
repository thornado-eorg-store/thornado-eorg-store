// ============================================================
// Carrito del lado cliente: localStorage + evento global.
// - AddToCartButton: se coloca en las fichas de release
// - CartView: página /cart — totales + checkout Stripe real o demo
// ============================================================

"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

export interface CartItem {
  slug: string;
  title: string;
  artist: string;
  kind: "digital" | "vinyl";
  price: number;
}

const KEY = "te-cart-v1";

function readCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed = raw ? (JSON.parse(raw) as CartItem[]) : [];
    return Array.isArray(parsed)
      ? parsed.filter(
          (i) => i && typeof i.slug === "string" && typeof i.price === "number"
        )
      : [];
  } catch {
    return [];
  }
}

function writeCart(items: CartItem[]) {
  window.localStorage.setItem(KEY, JSON.stringify(items));
  window.dispatchEvent(new Event("te-cart:updated"));
}

export function addToCart(item: CartItem) {
  const cart = readCart();
  const exists = cart.some((i) => i.slug === item.slug && i.kind === item.kind);
  if (!exists) cart.push(item);
  writeCart(cart);
}

export function AddToCartButton({
  item,
  label = "Añadir al carrito",
  variant = "primary",
  className = "",
}: {
  item: Omit<CartItem, "kind"> & { kind?: "digital" | "vinyl" };
  label?: string;
  variant?: "primary" | "secondary";
  className?: string;
}) {
  const [added, setAdded] = useState(false);
  const onClick = useCallback(() => {
    addToCart({ ...item, kind: item.kind ?? "digital" });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 2000);
  }, [item]);
  const base =
    variant === "primary"
      ? "bg-gradient-to-r from-cyan-400 to-fuchsia-500 text-zinc-950 hover:brightness-110"
      : "bg-zinc-800 text-zinc-100 ring-1 ring-cyan-400/40 hover:bg-zinc-700";
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-5 py-2.5 text-sm font-semibold transition ${
        added ? "bg-emerald-400 text-zinc-950" : base
      } ${className}`}
    >
      {added ? "✓ Añadido" : label}
    </button>
  );
}

export function CartView() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [busy, setBusy] = useState(false);
  const [banner, setBanner] = useState<string | null>(null);

  useEffect(() => {
    const sync = () => setItems(readCart());
    sync();
    window.addEventListener("te-cart:updated", sync);
    return () => window.removeEventListener("te-cart:updated", sync);
  }, []);

  const remove = (idx: number) => {
    const next = items.filter((_, i) => i !== idx);
    writeCart(next);
  };

  const subtotal = items.reduce((a, b) => a + b.price, 0);

  const pay = async () => {
    setBusy(true);
    setBanner(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({ slug: i.slug, kind: i.kind })),
        }),
      });
      const data = await res.json();
      if (data.ok && data.url) {
        window.location.href = data.url;
        return;
      }
      if (data.error === "STRIPE_NOT_CONFIGURED") {
        setBanner(
          `🧪 Modo demo de pagos — total simulado $${data.total?.toFixed(2)} USD. Para activar el checkout real, configura STRIPE_SECRET_KEY (modo test) en Vercel.`
        );
      } else {
        setBanner(`No se pudo iniciar el pago: ${data.message ?? data.error}`);
      }
    } catch (err) {
      setBanner(`Error de red: ${String(err)}`);
    } finally {
      setBusy(false);
    }
  };

  if (items.length === 0 && !busy) {
    return (
      <div className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-10 text-center">
        <p className="text-3xl">🛰️</p>
        <p className="mt-3 text-sm text-zinc-400">
          Tu carrito está vacío. Explora el catálogo — cada release tiene su
          miniatura y master disponible.
        </p>
        <Link
          href="/discover"
          className="mt-5 inline-block rounded-full bg-gradient-to-r from-cyan-400 to-fuchsia-500 px-6 py-3 text-sm font-bold text-zinc-950 transition hover:brightness-110"
        >
          Ir al catálogo
        </Link>
      </div>
    );
  }

  return (
    <>
      {banner && (
        <div className="mt-6 rounded-xl border border-amber-400/40 bg-amber-400/10 p-4 text-sm text-amber-200">
          {banner}
        </div>
      )}
      <ul className="mt-6 overflow-hidden rounded-2xl border border-zinc-800">
        {items.map((it, idx) => (
          <li
            key={it.slug + it.kind}
            className={`flex items-start justify-between gap-4 px-5 py-4 ${
              idx % 2 ? "bg-zinc-900/40" : "bg-zinc-900/70"
            }`}
          >
            <div>
              <p className="text-sm font-medium text-zinc-100">{it.title}</p>
              <p className="text-xs text-zinc-500">{it.artist}</p>
              <p className="mt-1 text-[11px]">
                <span className="rounded-md border border-zinc-700 bg-zinc-800 px-1.5 py-0.5 font-mono text-zinc-300">
                  {it.kind === "vinyl"
                    ? "Físico · vinilo (incluye descarga)"
                    : "Digital · WAV/FLAC/AIFF"}
                </span>
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <span className="font-mono text-sm text-cyan-300">
                ${it.price.toFixed(2)}
              </span>
              <button
                onClick={() => remove(idx)}
                aria-label={`Quitar ${it.title}`}
                className="text-zinc-500 transition hover:text-rose-400"
              >
                ✕
              </button>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-6 space-y-2 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 text-sm">
        <div className="flex justify-between text-zinc-400">
          <span>Subtotal (propina opcional en el último paso)</span>
          <span className="font-mono">${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-zinc-400">
          <span>Impuestos (Stripe Tax)</span>
          <span className="font-mono">$0.00 — demo</span>
        </div>
        <div className="flex justify-between border-t border-zinc-800 pt-2 text-base font-semibold text-zinc-100">
          <span>Total</span>
          <span className="font-mono text-cyan-300">${subtotal.toFixed(2)}</span>
        </div>
        <p className="pt-2 text-xs leading-relaxed text-zinc-500">
          90% va directo al artista · payouts en 24–48h (Stripe Connect) · «Día
          del estudio» mensual 0% comisión.
        </p>
      </div>

      <button
        onClick={pay}
        disabled={busy}
        className="mt-6 w-full rounded-full bg-gradient-to-r from-cyan-400 to-fuchsia-500 py-3.5 text-sm font-bold text-zinc-950 transition hover:brightness-110 disabled:opacity-60"
      >
        {busy
          ? "Abriendo Stripe…"
          : `Pagar con Stripe — ${items.length} ${items.length === 1 ? "artículo" : "artículos"}`}
      </button>

      <Link
        href="/discover"
        className="mt-4 block text-center text-sm text-cyan-300/90 hover:underline"
      >
        ← seguir explorando
      </Link>
    </>
  );
}
