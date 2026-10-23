# PENDIENTES — THORNADO EORG store

Registro vivo de tareas. Última actualización: 2026-10-23 (v0.4.3 desplegada).
👉 El inventario de **lo que YA funciona** está en `AVANCES.md` (leerlo antes
de empezar cualquier sesión en este repo). Para el agente, los skills del
proyecto están en `.opencode/skills/` (`estado-tienda`, `publicar-tienda`).

## ✅ Resuelto en v0.4 (los 6 reportes del artista)

1. **Carga de audio** → cada pista del editor tiene su input «🎧 Audio del
   preview»: se sube MP3/M4A/WAV/FLAC, se reproduce en la ficha pública con
   botón ▶/❚❚ y barra de progreso real.
2. **Fallo al guardar (te sacaba de la página)** → causa raíz: el límite del
   body de Server Actions era 1 MB y la portada lo rebasaba. Corregido
   (`bodySizeLimit: 24mb`), límites re-alineados (portada ≤ 3 MB, audio
   ≤ 10 MB/pista, total 20 MB por guardado) y acción de guardado blindada
   con try/catch + pantalla amable de error en el panel.
3. **Cambiar textos de la portada** → `/estudio/apariencia`: titular,
   subtítulo, botones, franja de valor, destacado y pie de página editables.
4. **Reubicar elementos de la portada** → orden de secciones (▲/▼) en
   `/estudio/apariencia`.
5. **Contacto** → página pública `/contacto` con formulario + bandeja
   `/estudio/mensajes` (marca leído/sin leer, borrar, contador en dashboard).
6. **Fondo más apropiado para música** → tres fondos elegibles en
   `/estudio/apariencia`: Aurora Neón (azul-noche con estrellas), Carbón
   Elegante y Vía Estelar. Ya no es negro plano.

## 🔴 Alta prioridad (confirmadas con el artista)

### 1. Activar base de datos real — ✅ ACTIVADA (2026-10, v0.4.2)
- ✅ Cuenta Neon creada por el artista. Proyecto creado y tablas aplicadas
  vía `prisma db push` (cadena verificada funcionando).
- ✅ Probado end-to-end en local con `DATABASE_URL` de Neon: el panel guarda
  en Postgres («persistido en Postgres»), persiste al recargar y la ficha
  pública refleja los cambios.
- ✅ Artista pegó `DATABASE_URL` en Vercel (Production) y la conexión se
  verificó en producción: `/api/health` → `db: connected`, banner de
  persistencia temporal desaparecido y guardado real con etiqueta
  «persistido en Postgres» (v0.4.3). Estado final: PERMANENTE.
- Sin BD: en Vercel las ediciones del panel guardan en carpeta temporal
  del serverless y **se pierden al reiniciar** (el dashboard lo avisa).
  Con BD: todo persiste (releases, apariencia y mensajes de contacto).
- Tras `db push`, los límites de audio por guardado podrían ampliarse con
  almacenamiento externo (ver §2).

### 2. Migrar preview audio → almacenamiento externo (fase 2)
- Hoy el preview se guarda como data URL dentro del estado (≤ 10 MB local;
  en Vercel limita la plataforma ~4.5 MB por request, capado a ~3 MB).
- Con almacenamiento (R2/S3/Bunny) se guarda el archivo y la ficha apunta
  a una URL: sin límites prácticos y descargas maestras con URL firmada.

### 3. Activar pagos reales en modo test (cuenta del artista)
- dashboard.stripe.com → API keys (`sk_test_…`) → `STRIPE_SECRET_KEY`
  en Vercel → redeploy.
- Añadir también `NEXT_PUBLIC_SITE_URL=https://thornado-eorg-store.vercel.app`
  para las URLs de retorno del checkout.

### 4. Contraseña definitiva del panel
- Provisional **`thornado-2026`** (funciona mientras `ESTUDIO_PASSWORD`
  esté sin definir). Fijar la definitiva en Vercel y destruir la provisional.

## 🟡 Fases futuras

- Webhooks de Stripe (`STRIPE_WEBHOOK_SECRET`) para confirmar pagos.
- Conectar el worker de ingest a diario (`workers/ingest.mjs`) y
  publicar masters QA en la BD.
- Escaneo de subcarpetas por release + release.json en el pipeline.
- Portadas/sesión de imágenes por lote (fase 2).
- Notificaciones de mensajes nuevos (correo diario con resumen).
- Magazine: notas completas (F2).
