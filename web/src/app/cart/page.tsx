import Link from "next/link";

export const metadata = {
  title: "Carrito (demo)",
};

const items = [
  {
    title: "Voltage Requiem (álbum, FLAC 24/192, WAV, AIFF)",
    artist: "Thornado Eorg",
    kind: "Digital · PWYW",
    price: 7.0,
    note: "Elige tu precio + $1.00 de propina",
  },
  {
    title: "Neon Basalt (vinilo edición limitada)",
    artist: "Thornado Eorg",
    kind: "Físico · 180g reciclado",
    price: 22.0,
    note: "Incluye descarga digital inmediata",
  },
  {
    title: "Suno Premier: Sessions 001 (DSD)",
    artist: "Thornado Eorg",
    kind: "Digital · Hi-Res",
    price: 9.0,
    note: "Entrega: FLAC 24/192 + DSD",
  },
];

const subtotal = items.reduce((a, b) => a + b.price, 0) + 1.0;

export default function CartPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <p className="mb-2 font-mono text-xs tracking-widest text-amber-300/80">
        CARRITO (DEMO)
      </p>
      <h1 className="text-3xl font-semibold tracking-tight">Tu carrito</h1>
      <p className="mt-2 text-sm text-zinc-400">
        Demo estática de la experiencia de checkout. La integración real de
        Stripe Payments + Tax llega en la F1.
      </p>

      <ul className="mt-8 overflow-hidden rounded-2xl border border-zinc-800">
        {items.map((it, i) => (
          <li
            key={it.title}
            className={`flex items-start justify-between gap-4 px-5 py-4 ${
              i % 2 ? "bg-zinc-900/40" : "bg-zinc-900/70"
            }`}
          >
            <div>
              <p className="text-sm font-medium text-zinc-100">{it.title}</p>
              <p className="text-xs text-zinc-500">{it.artist}</p>
              <p className="mt-1 text-[11px]">
                <span className="rounded-md border border-zinc-700 bg-zinc-800 px-1.5 py-0.5 font-mono text-zinc-300">
                  {it.kind}
                </span>
                <span className="ml-2 text-zinc-500">{it.note}</span>
              </p>
            </div>
            <span className="font-mono text-sm text-amber-300">
              ${it.price.toFixed(2)}
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-6 space-y-2 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 text-sm">
        <div className="flex justify-between text-zinc-400">
          <span>Subtotal (incluye propina $1.00)</span>
          <span className="font-mono">${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-zinc-400">
          <span>Impuestos (Stripe Tax en la integración real)</span>
          <span className="font-mono">$0.00 — demo</span>
        </div>
        <div className="flex justify-between border-t border-zinc-800 pt-2 text-base font-semibold text-zinc-100">
          <span>Total</span>
          <span className="font-mono text-amber-300">
            ${subtotal.toFixed(2)}
          </span>
        </div>
        <p className="pt-2 text-xs leading-relaxed text-zinc-500">
          Al finalizar, $XX.XX van al artista (90% de los productos digitales),
          y los payouts salen en 24–48h vía Stripe Connect. El último día de
          cada mes, el 100% llega al artista («Día de la tienda»).
        </p>
      </div>

      <button
        disabled
        className="mt-6 w-full cursor-not-allowed rounded-full bg-zinc-800 py-3 text-sm font-semibold text-zinc-500"
      >
        Proceder al pago (próximamente: Stripe Checkout)
      </button>

      <Link
        href="/discover"
        className="mt-4 block text-center text-sm text-amber-300/90 hover:underline"
      >
        ← seguir explorando
      </Link>
    </div>
  );
}
