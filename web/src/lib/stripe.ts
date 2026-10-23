// ============================================================
// Stripe client perezoso. Checkout real solo si están las env vars;
// si no, la app responde con un fallback "demo" elegante.
// ============================================================
import Stripe from "stripe";

let _client: Stripe | null = null;

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  if (!_client) _client = new Stripe(key);
  return _client;
}
