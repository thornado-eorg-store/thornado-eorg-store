// ============================================================
// Sesión del Modo Edición: cookie firmada (HMAC-SHA256) ligada
// a la contraseña del entorno, sin base de datos de sesiones.
// - ESTUDIO_PASSWORD en la env → contraseña real.
// - Sin env → contraseña demo temporal (el panel avisa).
// Acceso posterior 12 h · cookie httpOnly + sameSite lax.
// ============================================================
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const COOKIE_NAME = "te_estudio";
const SESSION_TTL_MS = 12 * 60 * 60 * 1000;
const DEFAULT_PASSWORD = "thornado-2026";

export function isUsingDefaultPassword(): boolean {
  return !process.env.ESTUDIO_PASSWORD;
}

function passwordInUse(): string {
  return process.env.ESTUDIO_PASSWORD || DEFAULT_PASSWORD;
}

/** Comparación en tiempo constante (hash primero, igualación anti-fingerprinting). */
export function checkPassword(candidate: string): boolean {
  const expected = createHash("sha256").update(passwordInUse()).digest();
  const provided = createHash("sha256").update(candidate).digest();
  return timingSafeEqual(expected, provided);
}

function sign(token: string): string {
  return createHmac("sha256", passwordInUse()).update(token).digest("base64url");
}

export function createSessionToken(): string {
  const expiresAt = Date.now() + SESSION_TTL_MS;
  return `${expiresAt}.${sign(String(expiresAt))}`;
}

export function verifySessionToken(token: string | undefined): boolean {
  if (!token) return false;
  const [expPart, sig] = token.split(".");
  const exp = Number(expPart);
  if (!exp || Number.isNaN(exp) || exp < Date.now()) return false;
  const expected = sign(expPart);
  const ab = Buffer.from(expected);
  const bb = Buffer.from(sig ?? "");
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

export async function isSessionValid(): Promise<boolean> {
  const jar = await cookies();
  return verifySessionToken(jar.get(COOKIE_NAME)?.value);
}

export async function saveSessionCookie(): Promise<void> {
  const jar = await cookies();
  jar.set(COOKIE_NAME, createSessionToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_TTL_MS / 1000,
    path: "/",
  });
}

export async function clearSessionCookie(): Promise<void> {
  const jar = await cookies();
  jar.delete(COOKIE_NAME);
}
