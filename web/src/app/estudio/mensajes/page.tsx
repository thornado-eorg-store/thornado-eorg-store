// ============================================================
// /estudio/mensajes — bandeja de entrada del formulario de
// contacto público (/contacto): marcar leído/no leído y borrar.
// ============================================================
import { loadMensajes, type MensajeContacto } from "@/lib/estudio/persistence";
import { MensajeActions } from "@/components/estudio/mensaje-actions";

export default async function PaginaMensajes() {
  const mensajes = await loadMensajes();
  const ordenados = [...mensajes].sort((a, b) => b.fecha.localeCompare(a.fecha));
  const sinLeer = ordenados.filter((m) => !m.leido).length;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Mensajes de contacto</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Lo que envía la gente desde la página «Contacto» de la tienda. Se conservan los últimos 200.
          </p>
        </div>
        {sinLeer > 0 && (
          <span className="rounded-full border border-cyan-400/40 bg-cyan-400/10 px-3 py-1 text-xs font-medium text-cyan-200">
            {sinLeer} sin leer
          </span>
        )}
      </div>

      {ordenados.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-10 text-center">
          <p className="text-sm text-zinc-400">
            Todavía no hay mensajes. Cuando alguien escriba desde{" "}
            <code className="font-mono text-cyan-300">/contacto</code>, aparecerá aquí.
          </p>
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {ordenados.map((m) => (
            <MensajeItem key={m.id} mensaje={m} />
          ))}
        </ul>
      )}
    </div>
  );
}

function MensajeItem({ mensaje: m }: { mensaje: MensajeContacto }) {
  return (
    <li
      className={`rounded-2xl border p-4 ${
        m.leido ? "border-zinc-800 bg-zinc-900/30 opacity-80" : "border-cyan-400/30 bg-zinc-900/50"
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-medium text-zinc-100">
            {m.nombre}
            {!m.leido && (
              <span className="ml-2 rounded bg-cyan-400/15 px-1.5 py-0.5 text-[10px] font-bold uppercase text-cyan-300">
                nuevo
              </span>
            )}
          </p>
          <p className="truncate font-mono text-[11px] text-zinc-500">
            {m.email} · {m.fecha.replace("T", " ").slice(0, 16)} UTC
          </p>
        </div>
        <MensajeActions id={m.id} nombre={m.nombre} leido={m.leido} />
      </div>
      <p className="mt-2 text-[11px] font-semibold uppercase tracking-wide text-fuchsia-300/80">
        {m.asunto}
      </p>
      <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-zinc-300">
        {m.texto}
      </p>
    </li>
  );
}
