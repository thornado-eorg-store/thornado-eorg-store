# PENDIENTES — THORNADO EORG store

Registro vivo de tareas. Última actualización: 2026-10-23 (v0.2 desplegada).

## 🔴 Alta prioridad (confirmadas con el artista)

### 1. Modo Edición — panel privado `/estudio`
> Pedido por el artista el 2026-10-23. NO visible al público.

- Ruta `/estudio` protegida con contraseña (env var `ESTUDIO_PASSWORD` en
  Vercel; cookie firmada). Sin sitemap / `noindex` / sin enlaces públicos.
- Formularios en español: crear/editar/ocultar releases, tracklist,
  **precios (digital y vinilo)**, textos editoriales, géneros y tags.
- **Subida de miniaturas/portadas** (fase 1: guardar en BD Postgres;
  fase 2: S3/R2 cuando ese servicio esté activo).
- Mantenimiento: ocultar releases, marcar masters VERIFIED tras QA,
  re-publicación instantánea (invalidar caché con `revalidateTag`).
- Decisión: opción A (panel propio), descartadas Prisma Studio (local,
  sin uploads) y CMS externo (costo/complejidad).

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
