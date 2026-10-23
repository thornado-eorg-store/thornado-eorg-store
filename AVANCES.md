# 🏆 AVANCES · THORNADO EORG official store

> Registro vivo de todo lo que YA FUNCIONA.
> Última actualización: **v0.4.3** (23 oct 2026). Versión pública:
> **https://thornado-eorg-store.vercel.app**

---

## 1 · Lo esencial que ya está servido

| Qué | Dónde | Estado |
|---|---|---|
| Tienda pública (catálogo de 6 releases) | `/` · `/discover` | ✅ v0.1 |
| Fichas por release con tracklist, precios y QA | `/release/<slug>` | ✅ v0.1 |
| Página del artista | `/artist/thornado-eorg` | ✅ v0.1 |
| Carrito + checkout en modo demo | `/cart` → `/cart/success` | ✅ v0.1 |
| Sección Hi-Res (masters verificados) | `/hi-res` (sección del catálogo) | ✅ v0.1 |
| Magazine (contenido editorial) | `/magazine` | ✅ v0.1 |
| Formulario de contacto | `/contacto` | ✅ v0.4 |
| Panel privado invisible al público | `/estudio` (robots.txt lo bloquea) | ✅ v0.4 |
| Salud del sistema | `/api/health` (muestra si la BD está conectada) | ✅ v0.4 |

## 2 · Panel de edición (todo lo que guarda y publica)

- **Login por contraseña** con sesión firmada (12 h) + bloqueo de 1 min tras 5 intentos fallidos. ✅
- **Dashboard** con métricas: releases totales/visibles, pistas, QA %, stock de vinilos, mensajes sin leer y badge de persistencia (**«Postgres — activa y duradera»** desde v0.4.2). ✅
- **Publicar nuevo release**: título, slug automático, tipo (Álbum/EP/Sencillo), año, géneros, texto editorial, etiquetas, precio fijo o PWYW, formatos de descarga, edición en vinilo (precio/stock), visibilidad pública u oculta, paleta de color. ✅
- **Editar release existente** desde el dashboard. ✅
- **Tracklist editable**: añadir/quitar pistas, título, duración, BPM, tonalidad, calidad master (bit/rate), estado de verificación. ✅
- **Audio por pista con escucha instantánea ▶** (botón de prueba que suena antes de guardar; el audio guardado también se puede escuchar desde el editor). Se envía como data URL dentro del estado del estudio. ✅
- **Portada subida con vista previa** (PNG/JPG/WEBP/SVG ≤ 3 MB) con opción de quitar. ✅
- **Apariencia del sitio** (`/estudio/apariencia`): titular y subtitular de portada, textos de la franja de valor, destacado, pie de página, **orden de secciones** (▲/▼) y **tres fondos**: Aurora Neón, Carbón Elegante, Vía Estelar. ✅
- **Bandeja de mensajes** (`/estudio/mensajes`): leer, marcar leído/sin leer, borrar; contador en el dashboard y anti-spam de 20 s en el formulario. ✅

## 3 · Persistencia real (lo que resolvió el «no guarda nada»)

- ✅ **v0.4.2 — Neon conectado a producción.** Tablas creadas, `DATABASE_URL` activa; guardados con etiqueta **«persistido en Postgres»**; la ficha pública refleja cambios tras la revalidación (2.ª visita).
- ✅ **v0.4.3 — Formulario a prueba de borrado.** React 19 reinicia el formulario al terminar cada envío, así que un solo error de validación borraba título, textos y archivos. Ahora, si algo falla, **no se pierde nada** y los mensajes de error se ven en pantalla (también en la web pública).
- ✅ Los errores de guardado muestran la causa exacta: pista sin título/duración válida, editorial vacío, portada > 3 MB, audio no válido o demasiado grande, slug duplicado/quedado y sesión expirada.
- ✅ Límites verificados: portada ≤ 3 MB; audio ≤ 3 MB por pista y ~3,2 MB total **en producción** (Vercel); en tu computadora ingresan ≤ 10 MB por pista y ≤ 20 MB por guardado.

## 4 · Infraestructura que funciona

- **Despliegue automático**: push a `main` en GitHub → Vercel despliega solo. (Repositorio: `thornado-eorg-store/thornado-eorg-store`.)
- **Base de datos**: Neon Postgres (gratis) con Prisma; tablas aplicadas con `prisma db push`.
- **Servidor local** en puerto **3100** (`npm start -- -p 3100` dentro de `web/`) — persiste en archivo `web/.estudio/state.json` o en Neon si `DATABASE_URL` está definida.
- **Build**: `npm run build` (prima `prisma generate && next build`). Ruido de log «Date.now() prerender» es inofensivo: páginas 200.
- **Cache Components**: rutas del panel bloqueantes (`instant = false`); catálogo público con revalidación por tag (`revalidateTag("catalog","max")`).

## 5 · Activaciones y su estado

| Variable / servicio | Estado | Nota |
|---|---|---|
| `DATABASE_URL` (Neon) | ✅ **ACTIVA** | El artista la pegó en Vercel; Tablas creadas |
| `ESTUDIO_PASSWORD` definitiva | ⏳ Pendiente | Vale la provisional `thornado-2026` |
| `STRIPE_SECRET_KEY` (pagos reales) | ⏳ Pendiente | Carrito funciona en modo demo |
| `NEXT_PUBLIC_SITE_URL` | ⏳ Con Stripe | `https://thornado-eorg-store.vercel.app` |
| `STRIPE_WEBHOOK_SECRET` | ⏳ Fase futura | Confirmación de pagos |

## 6 · Fases futuras registradas (no hechas aún)

1. Storage externo para audios (R2/S3/Bunny): sin límites de 3 MB ni data URLs.
2. Pagos reales Stripe + webhooks.
3. Worker de ingest diario (`workers/ingest.mjs`) + subcarpetas por release.
4. Portadas por lote (fase 2) · notificaciones por correo de mensajes nuevos · Magazine completo (F2).

## 7 · Lecciones aprendidas (importante para no repetir historia)

1. **Sin `DATABASE_URL`, Vercel borra lo guardado** (carpeta temporal por instancia serverless). Hoy solucionado con Neon.
2. **React 19 resetea el formulario tras cada action** — los datos del artista deben restaurarse tras un error (v0.4.3).
3. `noValidate` en el form para que los errores del servidor se muestren (antes el navegador cancelaba en silencio).
4. El guardado limita por tarjeta: portada ≤ 3 MB, audio ≤ caps por entorno; errores muestran causa exacta.
5. La 1.ª visita tras guardar puede mostrar contenido anterior (revalidación): la 2.ª visita lo ve nuevo.
6. Emplear verificación end-to-end con navegador tras cada versión (login → guardar → recargar → ficha pública).
