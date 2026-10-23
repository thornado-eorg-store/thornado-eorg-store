// ============================================================
// Dashboard del Modo Edición: stats, estado de persistencia
// y tabla de releases con acciones rápidas.
// ============================================================
import Link from "next/link";
import { allReleasesAdmin, getSiteConfigAdmin } from "@/lib/store";
import { isUsingDefaultPassword } from "@/lib/estudio/session";
import { driverActual, loadMensajes } from "@/lib/estudio/persistence";
import { usd } from "@/lib/catalog";
import { VisibilityToggle } from "@/components/estudio/visibility-toggle";

export default async function StudioDashboard() {
  const [releases, config, mensajes] = await Promise.all([
    allReleasesAdmin(),
    getSiteConfigAdmin(),
    loadMensajes(),
  ]);
  const sinLeer = mensajes.filter((m) => !m.leido).length;
  const defaultPassword = isUsingDefaultPassword();
  const driver = driverActual();

  const visibles = releases.filter((r) => !r.hidden);
  const totalTracks = releases.reduce((a, r) => a + r.tracks.length, 0);
  const verified = releases.reduce(
    (a, r) => a + r.tracks.filter((t) => t.status === "VERIFIED_LOSSLESS").length,
    0
  );
  const vinylsStock = releases.reduce((a, r) => a + (r.hasVinyl ? r.vinylStock ?? 0 : 0), 0);

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Panel de mantenimiento</h1>
      <p className="mt-1 text-sm text-zinc-500">
        Modo edición: todo lo que guardes aquí se refleja en la tienda pública
        en segundos.
      </p>

      {/* Avisos */}
      {defaultPassword && (
        <div className="mt-5 rounded-xl border border-amber-400/40 bg-amber-400/10 p-4 text-sm text-amber-200">
          ⚠ Estás usando la <strong>contraseña provisional</strong>. Antes de
          publicar la tienda, fija la definitiva con la variable{" "}
          <code className="font-mono">ESTUDIO_PASSWORD</code> en Vercel.
        </div>
      )}
      {driver !== "postgres" && (
        <div className="mt-3 rounded-xl border border-cyan-400/30 bg-cyan-400/5 p-4 text-sm text-cyan-100/90">
          💾 Persistencia actual: <strong>{driver === "archivo-local" ? "archivo local (desarrollo)" : "archivo temporal"}</strong>
          {driver === "archivo-temporal" && (
            <> — en serverless las ediciones se pierden al reiniciar. Activa{" "}
              <code className="font-mono">DATABASE_URL</code> (Neon) para persistir en Postgres.</>
          )}
          {driver === "archivo-local" && (
            <> — activa <code className="font-mono">DATABASE_URL</code> para que las ediciones vivan en Postgres en producción.</>
          )}
        </div>
      )}

      {/* Stats */}
      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-5">
        <StatCard value={String(releases.length)} label="releases totales" sub={`${visibles.length} visibles / ${releases.length - visibles.length} ocultos`} />
        <StatCard value={String(totalTracks)} label="pistas" sub="en todo el catálogo" />
        <StatCard
          value={totalTracks ? `${Math.round((verified / totalTracks) * 100)}%` : "—"}
          label="QA lossless"
          sub={`${verified}/${totalTracks} verificadas`}
        />
        <StatCard value={String(vinylsStock)} label="vinilos en stock" sub="suma de todas las ediciones" />
        <StatCard value={driver === "postgres" ? "Postgres" : "Archivo"} label="persistencia" sub={driver === "postgres" ? "activa y duradera" : "activa DATABASE_URL"} />
      </div>

      {/* Accesos rápidos */}
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <Link
          href="/estudio/apariencia"
          className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 transition hover:border-cyan-400/50"
        >
          <p className="text-sm font-semibold text-zinc-100">🎨 Apariencia y contenido</p>
          <p className="mt-1 text-xs text-zinc-500">
            Textos de la portada, orden de secciones y fondo — fondo actual: <strong className="text-cyan-300">{config.theme}</strong>.
          </p>
        </Link>
        <Link
          href="/estudio/mensajes"
          className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 transition hover:border-cyan-400/50"
        >
          <p className="text-sm font-semibold text-zinc-100">
            ✉ Mensajes de contacto
            {sinLeer > 0 && (
              <span className="ml-2 rounded bg-cyan-400/15 px-1.5 py-0.5 font-mono text-[10px] font-bold text-cyan-300">
                {sinLeer} nuevo{sinLeer === 1 ? "" : "s"}
              </span>
            )}
          </p>
          <p className="mt-1 text-xs text-zinc-500">
            {mensajes.length} mensaje{mensajes.length === 1 ? "" : "s"} recibido{mensajes.length === 1 ? "" : "s"} del formulario de contacto.
          </p>
        </Link>
      </div>

      {/* Acciones superiores */}
      <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">
          Catálogo ({releases.length})
        </h2>
        <Link
          href="/estudio/nuevo"
          className="rounded-full bg-gradient-to-r from-cyan-400 to-fuchsia-500 px-5 py-2 text-sm font-bold text-zinc-950 transition hover:brightness-110"
        >
          + Publicar nuevo release
        </Link>
      </div>

      {/* Tabla */}
      <div className="mt-3 overflow-x-auto rounded-2xl border border-zinc-800">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-zinc-800 bg-zinc-900/70 text-[11px] uppercase tracking-wide text-zinc-500">
            <tr>
              <th className="px-4 py-3">Release</th>
              <th className="px-4 py-3">Tipo / año</th>
              <th className="px-4 py-3">Precio digital</th>
              <th className="px-4 py-3">Vinilo</th>
              <th className="px-4 py-3">AA</th>
              <th className="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {releases.map((r, i) => (
              <tr
                key={r.slug}
                className={`border-b border-zinc-900 last:border-0 ${i % 2 ? "bg-zinc-900/30" : "bg-zinc-900/50"} ${r.hidden ? "opacity-70" : ""}`}
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span
                      aria-hidden
                      className="h-9 w-9 shrink-0 rounded-md border border-zinc-700"
                      style={{
                        backgroundImage: r.coverImage
                          ? `url(${r.coverImage})`
                          : `url(/covers/${r.slug}.svg), linear-gradient(135deg, ${r.palette[0]}, ${r.palette[1]})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }}
                    />
                    <div className="min-w-0">
                      <p className="truncate font-medium text-zinc-100">
                        {r.title}
                        {r.hidden && (
                          <span className="ml-2 rounded bg-rose-950/60 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-rose-300">
                            oculto
                          </span>
                        )}
                      </p>
                      <p className="font-mono text-[11px] text-zinc-500">{r.slug}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-zinc-400">
                  {r.type} · {r.year}
                </td>
                <td className="px-4 py-3 font-mono text-cyan-300">
                  {r.pricingMode === "PWYW" ? `desde ${usd(r.minPrice)}` : usd(r.minPrice)}
                </td>
                <td className="px-4 py-3 text-zinc-400">
                  {r.hasVinyl
                    ? `${usd(r.vinylPrice ?? 0)} · ${r.vinylStock === 0 ? "AGOTADO" : `${r.vinylStock} pzs`}`
                    : "—"}
                </td>
                <td className="px-4 py-3 font-mono text-xs text-zinc-400">
                  {r.tracks.filter((t) => t.status === "VERIFIED_LOSSLESS").length}/
                  {r.tracks.length}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <VisibilityToggle slug={r.slug} hidden={Boolean(r.hidden)} title={r.title} />
                    <Link
                      href={`/estudio/release/${r.slug}`}
                      className="rounded-full border border-cyan-400/40 px-3 py-1 text-xs text-cyan-200 transition hover:bg-cyan-400/10"
                    >
                      Editar
                    </Link>
                    <a
                      href={`/release/${r.slug}`}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-full border border-zinc-700 px-3 py-1 text-xs text-zinc-400 transition hover:border-zinc-500 hover:text-zinc-200"
                    >
                      Ver ↗
                    </a>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-xs text-zinc-600">
        AA = pistas con QA lossless verificado / total · «Ver ↗» abre la ficha
        pública en otra pestaña · los cambios del formulario publican de
        inmediato vía revalidación de caché.
      </p>
    </div>
  );
}

function StatCard({ value, label, sub }: { value: string; label: string; sub: string }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
      <p className="text-xl font-semibold text-cyan-300">{value}</p>
      <p className="mt-0.5 text-xs font-medium text-zinc-300">{label}</p>
      <p className="mt-0.5 text-[11px] text-zinc-600">{sub}</p>
    </div>
  );
}
