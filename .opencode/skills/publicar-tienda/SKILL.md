---
name: Publicar Tienda
description: Flujo completo para publicar una nueva versión de la tienda de Thornado Eorg en producción (build, verificación local, push a GitHub, verificación en Vercel y reporte al artista con URL).
---

# Publicar cambios de la tienda (build → local → push → producción)

Regla del artista: **dar siempre la URL** en el reporte (https://thornado-eorg-store.vercel.app). UI en español, sin mojibake.

## 1 · Preparar el build local (puerto 3100)

```powershell
# matar servidor previo (el motor de Prisma Windows bloquea prisma generate si corre)
Get-NetTCPConnection -LocalPort 3100 -State Listen -ErrorAction SilentlyContinue |
  ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }
npm run build   # en web/ (prisma generate && next build)
```
- «Date.now() prerender» en logs de `/estudio/*`: ruido inofensivo (páginas 200).
- Relanzar: `npm start -- -p 3100` (background), verificar `curl.exe localhost:3100/estudio` → 200.

## 2 · Verificación end-to-end (navegador)

1. Login en `/estudio` (contraseña provisional `thornado-2026` mientras `ESTUDIO_PASSWORD` no exista). Técnica: native setter en `input[type="password"]` + click en «Entrar al estudio».
2. Probar el flujo modificado: guardar release/portada/audio → mensaje «✓ Cambios publicados (persistido en Postgres|archivo local)».
3. Recargar el editor: los datos/archivos persisten.
4. Ficha pública `/release/<slug>`: refleja cambios a la 2.ª visita (revalidación stale-while-revalidate).
5. Escaneo mojibake con script `.cjs` (NUNCA inline PowerShell).
6. Datos de prueba: crear en releases OCULTOS y al final borrar la fila de prueba de `EstudioState` en Neon (no tocar contenido real del artista).

## 3 · Commit + push (despliegue automático)

```powershell
& "C:\Program Files\Git\bin\git.exe" add -A
& "C:\Program Files\Git\bin\git.exe" commit -m "vX.Y.Z: descripción"
& "C:\Program Files\Git\bin\git.exe" push origin main
```
(esperar ~90-105 s al despliegue de Vercel; git escribe a stderr: el «RemoteException» de PowerShell no es un error real si aparece el rango `old..new main -> main`).

## 4 · Verificación en producción

- `/` y `/estudio` → 200; `/api/health` → `"db":"connected"` y `"dataLayer":"postgres"`.
- Login en producción + banner rojo de persistencia TEMPORAL **ausente** (si aparece, `DATABASE_URL` no está aplicada → pedir Redeploy).
- Capturar el label del guardado («persistido en Postgres») con un guardado real si el cambio lo amerita.

## 5 · Reporte al artista

- URL siempre + qué cambió en lenguaje humano + pasos exactos de lo que requiere SU acción (Vercel/Neon/Stripe) + límites aplicables.
