// ============================================================
// Aviso de persistencia: si el panel está guardando en carpeta
// temporal (Vercel sin DATABASE_URL), se lo debe saber quien
// edita — ahí se explica el «guardé y no apareció nada».
// ============================================================
import { driverActual } from "@/lib/estudio/persistence";

export function PersistenceWarning() {
  if (driverActual() === "postgres") return null;
  // En desarrollo y en la previsualización local sí hay persistencia
  // (archivo del proyecto); lo temporal solo existe en producción sin BD.
  // el problema de lo temporal solo existe en producción sin base de datos.
  if (process.env.VERCEL !== "1") return null;
  return (
    <div className="rounded-2xl border border-rose-400/40 bg-rose-400/10 p-4 text-sm leading-relaxed text-rose-100">
      <p className="font-bold">⚠ Este sitio guarda de forma TEMPORAL</p>
      <p className="mt-1">
        No hay base de datos conectada todavía, así que lo que guardes aquí
        (audios, portadas, textos) vive poco tiempo en producción y{" "}
        <strong>al recargar vuelve a estar vacío</strong>, y no se refleja en
        la página pública. En tu computadora (modo local) sí persiste todo.
      </p>
      <p className="mt-2 font-semibold text-rose-200">
        Solución definitiva (≈ 5 minutos, una sola vez): ver PENDIENTES.md →
        «Activar base de datos real» (Neon + DATABASE_URL).
      </p>
    </div>
  );
}
