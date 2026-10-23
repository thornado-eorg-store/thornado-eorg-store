// Cliente Prisma perezoso: null si no hay DATABASE_URL configurada
// (la app sigue funcionando 100% en modo demo sin base de datos).
import { PrismaClient } from "@prisma/client";

let _client: PrismaClient | null = null;

export function getDb(): PrismaClient | null {
  if (!process.env.DATABASE_URL) return null;
  if (!_client) _client = new PrismaClient();
  return _client;
}
