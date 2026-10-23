---
name: Estado Tienda
description: Estado real, avances y lecciones del proyecto de la tienda de Thornado Eorg (repo tienda-musica). Cárgalo antes de modificar cualquier código de la tienda para no repetir bugs ya resueltos ni romper lo que funciona.
---

# Estado y avances de la tienda de Thornado Eorg

Regla del artista: **cada corrección o avance se reporta con la URL siempre** (https://thornado-eorg-store.vercel.app). UI 100 % en español, sin typos ni mojibake.

## Ver primero

- `AVANCES.md` en la raíz del repo: inventario completo de lo que funciona (v0.1 → v0.4.3), activaciones y lecciones aprendidas.
- `PENDIENTES.md`: lo que falta (Stripe, ESTUDIO_PASSWORD, storage de audio, worker de ingest).
- `web/AGENTS.md` (generado por Next): esta NO es la Next.js que cabe en la memoria de entrenamiento; leer `node_modules/next/dist/docs/` antes de tocar código.

## Arquitectura actual (v0.4.3)

- Next 16.4.2 App Router, TS, Tailwind 4, `cacheComponents: true`. Repo `tienda-musica/`, app en `web/`. Deploy: push a `main` → Vercel automático.
- Importante: rutas públicas con revalidación por tag (`revalidateTag("catalog","max")` = stale-while-revalidate: 1.ª visita tras guardar puede ver lo viejo; 2.ª muestra lo nuevo). Rutas de `/estudio/*` bloqueantes (`export const instant = false`). El log de build «Date.now() prerender» es ruido inofensivo.
- Persistencia: Neon Postgres vía Prisma cuando existe `DATABASE_URL` (✅ activa en producción); en local sin BD cae a archivo `web/.estudio/state.json` (ignorado por git). Driver archivo-temporal solo ocurre en Vercel sin BD (ya no es el caso).
- Datos del estudio en la tabla `EstudioState`: `releases Json` + `site Json?` + `messages Json?` (una fila; patch merge).

## Flujos que funcionan y NO se deben romper

1. **Panel `/estudio`**: login por contraseña (sesión firmada 12 h, cookie HMAC), dashboard con métricas, releases, tracklist por uid estable (`audio_${uid}`), portada, apariencia (`/estudio/apariencia`), mensajes de contacto.
2. **Guardado anti-borrado (v0.4.3, crítico)**: `release-form.tsx` toma snapshot del FormData antes del envío y lo restaura cuando la action responde con error — React 19 LIMPIA los inputs no controlados al terminar cada server action (aunque devuelva errores). Sin esto, un solo error de validación borraba todo («se borra y queda en cero»). No quitar `formActionGuardada` ni el efecto restaurador.
3. **`noValidate` en el `<form>`** de `release-form.tsx`: sin él, el navegador cancela el POST por campos `required` vacíos SIN mostrar ningún mensaje (silencioso) — el artista cree que «no guarda». El servidor ya devuelve `fieldErrors` claros en español.
4. **Escucha instantánea**: `audioListen` con URLs objeto; `<audio>` en cada fila (datos locales antes de guardar, data URL tras guardar).
5. **Límites de upload** (server action `bodySizeLimit: "24mb"`): portada ≤ 3 MB; audio ≤ 3 MB/pista y total ~3,2 MB con `VERCEL=1`; local 10 MB/pista y 20 MB total. El audio se guarda como data URL dentro de `EstudioState` (fase 2: storage externo R2/S3).
6. **Contacto**: `/contacto` → `sendContactMessageAction` (throttle 20 s) → bandeja `/estudio/mensajes` con marcar leído/no leído y contador.
7. **Seguridad**: `/estudio` noindex + robots.txt Disallow; contraseña provisional `thornado-2026` activa mientras `ESTUDIO_PASSWORD` no esté definida (pendiente fijar la definitiva y rotar esta).

## Entorno y verificación antes de cada entrega

- Build: `npm run build` en `web/` (ejecuta `prisma generate && next build`). Detener primero el servidor del puerto 3100 (`Get-NetTCPConnection -LocalPort 3100 … Stop-Process`) porque el motor de Prisma Windows bloquea el generate (EPERM).
- Servidor local: `npm start -- -p 3100` (con `$env:DATABASE_URL` para probar Neon).
- Escaneo mojibake con script en archivo `.cjs` (NUNCA inline en PowerShell: corrompe unicode).
- E2E con navegador: login (native setter en el password + click «Entrar al estudio») → subir portada+audio (canvas→File→DataTransfer) → guardar → recargar → ficha pública. Con la BD limpia, probar en releases **ocultos** (checkbox «visible» desmarcado) y al final borrar la fila de prueba de `EstudioState` (sin tocar contenido real del artista).

## Credenciales / cuentas

- Vercel y GitHub: NO hay credenciales en esta máquina (deploy solo via git push). Neon: la cadena vive como `DATABASE_URL` en Vercel (NUNCA commitearla ni imprimirla aparte de lo que ya quedó en el historial).
- Stripe: pendiente (`STRIPE_SECRET_KEY`); carrito en modo demo.
