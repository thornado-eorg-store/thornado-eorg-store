import type { Metadata } from "next";
import Link from "next/link";
import { CartView } from "@/components/cart";

export const metadata: Metadata = {
  title: "Carrito",
  description:
    "Tu carrito en la tienda de THORNADO EORG — checkout con Stripe, precios resueltos en el servidor.",
};

export default function CartPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <p className="mb-2 font-mono text-xs tracking-widest text-cyan-300/80">
        CARRITO
      </p>
      <h1 className="text-3xl font-semibold tracking-tight">Tu carrito</h1>
      <p className="mt-2 max-w-2xl text-sm text-zinc-400">
        Los precios se resuelven en el servidor (nunca en el navegador). El pago
        usa Stripe Checkout real cuando <code className="font-mono text-cyan-300">STRIPE_SECRET_KEY</code>{" "}
        está configurada; si no, el flujo corre en modo demo sin cobros.
      </p>

      <CartView />

      <p className="mt-8 text-center text-xs text-zinc-500">
        ¿Primera vez aquí?{" "}
        <Link
          href="/release/voltage-requiem"
          className="text-cyan-300/90 hover:underline"
        >
          Mira el release insignia →
        </Link>
      </p>
    </div>
  );
}
