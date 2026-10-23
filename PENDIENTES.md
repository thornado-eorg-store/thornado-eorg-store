# PENDIENTES — THORNADO EORG store

Registro vivo de tareas. Última actualización: 2026-10-23 (v0.2 desplegada).

## 🔴 Alta prioridad (confirmadas con el artista)

### 1. Modo Edición — panel privado `/estudio`
> ✅ **Construido y desplegado (v0.3).** Falta afinar:

- Acceso con contraseña: funcional. Provisional **`thornado-2026`** —
  fijar la definitiva con `ESTUDIO_PASSWORD` en Vercel.
- Formularios: crear/editar releases, precios (digital/vinilo), textos,
  géneros/tags, paletas, tracklist editable y subida de portadas (la
  imagen viaja como data URL en el estado del estudio).
- Visibilidad: mostrar/ocultar releases desde el dashboard ("Ver ↗"
  abre la ficha pública).
- Estado de persistencia visible en el dashboard: Postgres (cuando
  DATABASE_URL esté activa) o archivo local/temporal.
- **Pendiente**: activar DATABASE_URL para que las ediciones persistan
  en producción (hoy: local ✓ · en Vercel sin BD queda temporal) y
  gestión de imágenes por lote / imágenes de tracks (fase 2).

### 2. Activar base de datos real (cuenta del artista)
- Crear proyecto gratis en neon.tech → copiar connection string →
  pegarla como `DATABASE_URL` en Vercel → redeploy → `npx prisma db push`.
- El catálogo actual es demo estático; la capa de datos ya está lista
  para alternar a Postgres automáticamente.

### 3. Activar pagos reales en modo test (cuenta del artista)
- dashboard.stripe.com → API keys (`sk_test_…`) → `STRIPE_SECRET_KEY`
  en Vercel → redeploy.
- Añadir también `NEXT_PUBLIC_SITE_URL=https://thornado-eorg-store.vercel.app`
  para las URLs de retorno del checkout.

## 🟡 Siguientes fases (roadmap F1→F2)

- Entregar compras por URL firmada (S3/R2 + emails) — requiere cuenta
  de storage del artista.
- Webhooks de Stripe (`STRIPE_WEBHOOK_SECRET`) para confirmar pagos.
- Conectar el worker de ingest a diario (`workers/ingest.mjs`) y
  publicar masters QA en la BD.
- Escaneo de subcarpetas por release + release.json en el pipeline.
- Mensaje directo al artista (F2) y notas completas del magazine (F2).
