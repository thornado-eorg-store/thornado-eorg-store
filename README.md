# Tienda de Música Online — Proyecto

> Alta gama: Bandcamp (modelo ético) + Beatport (DJ/pro) + Qobuz (Hi-Res) + Discogs (coleccionismo) + BeatStars (licencias), unificados con verificación espectral de calidad.

## Estructura

```
tienda-musica/
├── ESPECIFICACION.md      ← documento base (requisitos, arquitectura, roadmap)
├── docker-compose.yml     ← Postgres + MinIO (S3 local) para desarrollo
├── .env.example           ← variables de entorno
├── db/
│   └── schema.prisma      ← modelo de datos v1 (PostgreSQL)
└── web/                   ← app Next.js (App Router, TypeScript, Tailwind)
```

## Arranque rápido (desarrollo)

```bash
# 1) Infraestructura local
docker compose up -d

# 2) App web
cd web
cp ../.env.example .env
npm install
npm run dev   # http://localhost:3000
```

## Decisiones técnicas

- **Next.js App Router + TypeScript + Tailwind** — SEO (SSR/ISR) es crítico en e-commerce
- **PostgreSQL + Prisma** — modelo en `db/schema.prisma`
- **S3/R2 (MinIO en local)** — masters lossless privados (URLs firmadas con expiración), previews y portadas públicos vía CDN
- **Stripe** — pagos, Connect para payouts a artistas, Tax para impuestos
- **Pipeline de ingest con QA espectral** —workers separados con ffmpeg; detectan "fake lossless" y generan derivados del master (MP3 320 / FLAC 16 / FLAC 24 / WAV / AIFF / previews)

## Despliegue (GitHub + Vercel — plan gratuito)

```bash
# 1) commits locales ya hechos en este repo
# 2) push a GitHub (remoto: thornado-eorg-store)
git push -u origin main

# 3) en vercel.com → Add New Project → Import repo de GitHub
#    Root Directory: web   ·   Framework: Next.js (detectado)
#    → Deploy  →  URL https://<repo>.vercel.app
```

El flujo de agencia: cada `git push` crea una **preview URL** distinta;
la rama `main` publica producción. Previews para decidir cambios antes
de publicar.

**Producción activa:** https://thornado-eorg-store.vercel.app

## Activación de funcionalidades (sin código, solo cuentas)

La app está diseñada para degradarse con elegancia: funciona 100% en
modo demo sin configurar nada, y activa cada capacidad cuando aparece
su variable de entorno (o revisa `/api/health` para ver el estado).

| Variable (en Vercel → Settings → Environment Variables) | Qué activa | Cómo obtenerla |
|---|---|---|
| `DATABASE_URL` | Catálogo real desde Postgres (Prisma). Sin ella, catálogo demo estático. | Neon (neon.tech, gratis): crear proyecto Postgres → copiar connection string → `npx prisma db push` |
| `STRIPE_SECRET_KEY` | Checkout real con Stripe (empezar con `sk_test_…`). Sin ella, pagos simulados. | dashboard.stripe.com → Developers → API keys (modo test) |
| `NEXT_PUBLIC_SITE_URL` | URLs de retorno correctas al Stripe Checkout y portadas en Stripe. | `https://thornado-eorg-store.vercel.app` |

## Roadmap

- **F0 ✓** estructura base, demo completa desplegada en Vercel
- **F1 (en curso) ✓**: capa de datos con fallback (Prisma ↔ demo), API
  (`/api/health`, `/api/catalog`, `/api/checkout`), carrito real con
  localStorage + checkout Stripe, `/magazine`, worker de ingest
  (`workers/ingest.mjs`)
- **F1 pendiente**: activar DATABASE_URL y STRIPE_SECRET_KEY (cuentas del
  usuario), entregas por URL firmada (S3/R2)
- **F2 comunidad** → **F3 pro/alta gama**. Ver `ESPECIFICACION.md` §7.
