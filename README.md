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

## Roadmap

F0 ✓ (estructura base) → F1 MVP (catálogo, checkout, entregas, pipeline QA) → F2 comunidad → F3 pro/alta gama. Ver `ESPECIFICACION.md` §7.
