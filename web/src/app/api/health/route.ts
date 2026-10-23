// Healthcheck: estado de la app + qué capa de datos está activa.
import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { isStripeConfigured } from "@/lib/stripe";

export async function GET() {
  const db = getDb();
  let dbOk = false;
  if (db) {
    try {
      await db.$queryRaw`SELECT 1`;
      dbOk = true;
    } catch {
      dbOk = false;
    }
  }
  return NextResponse.json({
    ok: true,
    app: "THORNADO EORG store",
    dataLayer: db && dbOk ? "postgres" : "demo",
    db: db ? (dbOk ? "connected" : "unreachable") : "not-configured",
    stripe: isStripeConfigured() ? "configured" : "demo-mode",
    time: new Date().toISOString(),
  });
}
