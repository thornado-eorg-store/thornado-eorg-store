# 🎵 ESPECIFICACIÓN TÉCNICA — Tienda de Música Online de Alta Gama

> Documento base del proyecto. Inspirado en el análisis de Bandcamp, Beatport, Qobuz, HDtracks, Discogs, Juno, Boomkat y BeatStars (ver informe en la conversación, octubre 2026).

---

## 1. Visión del producto

**Nombre provisional:** *(definir)*

Una tienda de música online **de alta gama** que combina lo mejor de cada referente:

| Aporte de | Qué tomamos |
|---|---|
| Bandcamp | Modelo ético: ~82% al artista, comunidad, PWYW, merchandising, payouts rápidos |
| Beatport | Formatos profesionales WAV/AIFF/FLAC, mercado DJ, pipelines estandarizados |
| Qobuz / HDtracks | Hi-Res 24-bit/192kHz, DSD, curaduría editorial, colecciones premium |
| Discogs | Coleccionismo, marketplace físico, base de datos enriquecida |
| BeatStars | Licencias de beats multi-nivel con contratos autogenerados |

### Diferenciadores (nadie los tiene todos juntos)
1. **Verificación espectral real** de cada archivo al ingestar → badge "Lossless Verificado"
2. **Espectrograma visible** en la página del producto antes de comprar
3. **Comisión menor que Bandcamp** (ej. 10% digital / 7% físico) + payouts instantáneos
4. **Recomendaciones transparentes** (curaduría humana + IA explicable, sin "caja negra")
5. **Multi-licencias integradas** para producers con contratos autogenerados
6. **Físico + digital + merch unificado** en un solo checkout
7. **Día de la tienda** (estilo Bandcamp Fridays): 0% comisión mensual/cuatrimestral
8. **Suscripción con descargas ilimitadas** (opcional, fase alta)

---

## 2. Audiencias y roles

| Rol | Descripción | Funciones clave |
|---|---|---|
| **Fan / Comprador** | Compra música, vinilos, merch | Navegar, previsualizar, comprar, descargar, Biblioteca, wishlist, seguir artistas, reviews |
| **DJ Profesional** | Compra WAV/AIFF para clubes | Filtros por formato/BPM/key, verificación lossless, playlists, deeply-tagged catálogo |
| **Audiófilo** | Compra Hi-Res | Filtros por calidad (24/96, DSD, Atmos), espectrograma, notas de masterización |
| **Artista** | Vende su música | Panel de artista, upload con pipeline de calidad, estadísticas, payouts |
| **Sello (Label)** | Gestiona varios artistas | Gestión multi-artista, splits de ingresos, catálogo unificado |
| **Producer** | Vende beats con licencias | Multi-licencias, contratos, previews taggeados |
| **Admin / Staff** | Curaduría y operación | Panel admin, moderación, ingest QA, analítica, cs |

---

## 3. Requisitos funcionales

### 3.1 Catálogo y descubrimiento (MVP)
- Página de inicio con: Novedades, Pre-orders, Remasterizados, Selecciones editoriales, Colecciones Hi-Res, y un feed en vivo de compras («ventas en tiempo real», opcional)
- Navegación por Género → Subgénero (estructuras tipo Qobuz: Pop/Rock, Jazz, Clásica, Electrónica, Hip-Hop, World… + subgéneros DJ tipo Beatport: House, Techno, Drum & Bass…)
- Búsqueda instantánea: artista, álbum, track, sello, código de barras, ISRC
- Filtros: género, año, formato físico (vinilo/CD/cassette), calidad digital (MP3/FLAC/24-bit/DSD), precio, BPM, tonalidad (para DJs)
- Página de álbum: portada Hi-Res, tracklist con previews, créditos, bit depth/sample rate, badge de calidad, buyer's options (digital / vinilo / bundle)
- Página de artista (bio, releases, merch, mensajes), página de sello (multi-catálogo)
- Wishlist / colección del fan pública u oculta

### 3.2 Reproductor
- Preview streaming (MP3/AAC 128-256kbps firmado con URL temporal, nunca el lossless público)
- Prueba de HQ: espectrograma del track + ficha técnica (formato, bitrate, bit depth, sample rate)
- Cola de reproducción persistente entre páginas (SPA media player, estilo web)
- Radioale pick ('sorpréndeme') y playlists editoriales

### 3.3 Compra y checkout (MVP)
- Cart con items físicos y digitales mezclados
- **Vinilo con download instantáneo** (código de descarga incluido desde la compra)
- Regalos: envío de un release como regalo con mensaje
- Name-Your-Price (PWYW) con precio mínimo configurable y propina opcional
- Impuestos por jurisdicción (EU VAT / US sales tax vía proveedor de tax)
- Factura PDF por email + en Biblioteca

### 3.4 Entrega digital (MVP)
- Download on-demand: el lossless se genera/envía en ZIP firmado con expiración
- Re-descargas ilimitadas desde Biblioteca
- Formatos a elección del mismo master (el master fuente se sube una vez; los derivados se generan: MP3 320, FLAC, WAV, AIFF)
- **Pipeline anti-fake-lossless**: análisis espectral al ingestar (ver §5), badge visible

### 3.5 Artistas y sellos (MVP)
- Registro y upload Drag&Drop + metadatos (ISRC, créditos, letras, tags)
- Pricing por release (precio fijo, PWYW, pre-order con fecha)
- (Fase 2) Merchandising: camisetas, pósters y otros artículos con inventario y envíos
- Dashboard: ventas, origen de tráfico, top tracks, demografía (privacidad consciente)
- Payouts: Stripe Connect (transferencias directas a la cuenta del artista) → **instantáneo o 24/48h**

### 3.6 Beats y licencias (Fase 2-3)
- Multi-licencias por track: Basic / Premium / Unlimited / Exclusive / Custom
- Contrato de licencia en PDF autogenerado post-compra con datos del comprador
- Previews con tag de audio VOICE WATERMARK ('producido por X')
- Subasta de compra exclusiva (retira el beat del mercado)

### 3.7 Comunidad y editorial (Fase 2)
- Reviews de fans, colecciones compartidas, mensajes artista↔fan
- Blog/magazine (Bandcamp Daily / Qobuz Magazine style)
- Sistema de collecciones "Idea Discography" / sellos de calidad propios ("Qobuzissime"-like)
- "Día de la tienda" 0% comisión con bandeja de anuncio

### 3.8 Panel Admin (MVP)
- Moderación de uploads + cola de revisión espectral
- Config de comisiones, impuestos, países
- CS: reembolsos, re-emisión de descargas
- Analítica global (GMV, take rate, churn de artistas)

---

## 4. Modelo de datos (v1)

```
User(id, email, password_hash|oauth, role: fan|artist|label|admin, country, created_at)
ArtistProfile(id, user_id?, name, slug, bio, avatar, banner, links[])
LabelProfile(id, name, slug, bio)
Release(id, artist_id, label_id?, type: album|ep|single|compilation, title, slug,
        release_date, cover_art_id, master_quality{bit_depth, sample_rate, verified},
        pricing_mode: fixed|pwyw, min_price, preorder_date, status: draft|pending|live)
Track(id, release_id, n, title, isrc, bpm, key, duration, master_file_id,
      verified: bool, spectrum_url, credits)
Product(id, release_id?, kind: digital|vinyl|cd|cassette|merch, format: mp3,flac,wav,aiff,dsd,
        price, currency, stock, shipping_profile_id)
License(id, track_id, tier: basic|premium|unlimited|exclusive|custom, price,
        terms: text, contract_template_id)
Purchase(id, buyer_id, items[], subtotal, tax, total, currency, payment_ref, status, created_at)
PurchaseItem(purchase_id, product_id, license_tier?, delivered: bool, download_url_expires)
DownloadToken(purchase_item_id, format, url, expires_at, downloads_used)
Payout(artist_id, amount, currency, status, stripe_transfer_id, scheduled_at, paid_at)
Follow(fan_id, artist_id) · Review(fan_id, release_id, stars, text, created_at)
Wishlist(fan_id, release_id) · Collection(fan_id, name, releases[], visibility)
```

---

## 5. Arquitectura sugerida (high-end, cloud-native)

```
┌──────────┐   ┌────────────────────────────┐
│ Web SPA  │──▶│ Next.js (React) fullstack  │  App Router + SSR/ISR para SEO
│ + Mobile │   └──────────┬─────────────────┘
└──────────┘              │
                  ┌───────▼────────┐    ┌─────────────────┐
                  │ API (type-safe)│───▶│ PostgreSQL      │ (Supabase o Neon)
                  │ tRPC o REST    │    └─────────────────┘
                  └───────┬────────┘    ┌─────────────────┐
                          │             │ Redis (queues,  │
                  ┌───────▼────────┐───▶│ realtime feed)  │
                  │ Workers        │    └─────────────────┘
                  │ (Node/Go/Py)   │
                  └───────┬────────┘
        transcoding/ingest│          ┌──────────────────────────┐
                  ┌───────▼────────┐─▶│ S3/R2 + CDN (Archivo     │
                  │ ffmpeg + ffmpeg│  │ lossless privado,        │
                  │ espectral QA   │  │ previews público)        │
                  └────────────────┘  └──────────────────────────┘
        Pagos: Stripe (payments + Connect payouts + tax)
        Email: Resend/Postmark · Analítica: Plausible/PostHog
        Observabilidad: Sentry + Grafana
```

### Stack recomendado
- **Frontend:** Next.js + TypeScript + Tailwind + shadcn/ui; Web Audio API para visualizador de espectro
- **Backend:** Next.js API o NestJS; workers separados para ingest/transcode
- **Ingest pipeline (el diferenciador):**
  1. Upload multipart directo a S3/R2 (master WAV/AIFF/FLAC)
  2. Hash + validación de cabecera (verificar que no es un MP3 renombrado)
  3. `ffmpeg + ar.tools / spek-like` análisis espectral → detectar corte de frecuencia (~15-16 kHz = fake)
  4. Generación de derivados por track: MP3 320, FLAC 16/24, WAV, AIFF, previews AAC 128 con fade y tag opcional
  5. Marca `verified: true/false` + imagen del espectrograma para la ficha
- **Streaming previews:** URLs firmadas cortas + banda de audio distinta por segmento anti-scraping básico
- **Seguridad:** 2FA para artistas, rate limiting, WORM para masters, backups multi-región

---

## 6. Pricing / modelo de negocio

| Concepto | Valor propuesto | Referente |
|---|---|---|
| Comisión digital | **10%** (baja a 8% >$5k/año) | Bandcamp 15%/10% |
| Comisión físico | 7% (sin impuestos ni envío) | Bandcamp 10% |
| Payout | ≤ 24-48h; instantáneo opcional + fee | Bandcamp, Stripe Inst. |
| Comisión beats | 8% | BeatStars ~30% del plan Pro |
| Suscripción fan (fase alta) | ej. $9.99/mes: streaming + 10 descargas FLAC/mes | Qobuz/Beatport stream tiers |
| Gift cards | sí, MVP | todas |

---

## 7. Roadmap

| Fase | Alcance | Duración estimada |
|---|---|---|
| **F0 — Descubrimiento** | Nombre, marca, wireframes, decisión de stack | 1-2 semanas |
| **F1 — MVP** | Catálogo, búsqueda, reproductor, checkout Stripe, entregas digitales, panel artista, admin, pipeline QA espectral | 8-12 semanas |
| **F2 — Comunidad** | Físico+merch, reviews, follows, editorial, payouts Connect, gift cards, PWYW avanzado | 4-6 semanas |
| **F3 — Pro / Alta gama** | Beats+licencias, DJ tools (BPM/KEY), suscripción, radio, colecciones premium, internacionalización, apps nativas | 6-8 semanas |

### Riesgos y mitigaciones
- **Derechos de autor:** solo monetizar con catálogo del propio artista/sello (signup + verificación de titularidad + DMCA workflow) — como Bandcamp. *No* agregar majors al inicio.
- **Fake lossless:** pipeline §5 obligatorio + badge visible.
- **Impuestos:** usar Stripe Tax o Avalara desde el día 1.
- **Fraude:** 3DS, velocity checks, review de primeros payouts.

---

## 8. Definición de éxitos (KPIs)
- GMV mensual, % de payout alcanzado <24h, % de releases "verified lossless" (>99%)
- Conversión preview→compra, registros artista/mes, NPS de fans y artistas
- Tasa de re-descargas / soporte por 1.000 compras

---

*Próximos pasos sugeridos: elegir nombre y marca → wireframes de las 5 pantallas clave (Home, Álbum, Artista, Checkout, Panel Artista) → setup del repo y scaffolding Next.js → MVP.*
