// ============================================================
// /contacto — página pública de contacto. Los mensajes aterrizan
// en /estudio/mensajes (bandeja del panel, invisible al público).
// ============================================================
import type { Metadata } from "next";
import { ContactForm } from "@/components/site/contact-form";

export const metadata: Metadata = {
  title: "Contacto",
  description:
    "Escribe a THORNADO EORG: licencias, pedidos de vinilo, colaboraciones y soporte de descargas.",
};

export default function PaginaContacto() {
  return (
    <div className="mx-auto max-w-6xl px-4 pb-24">
      <section className="relative overflow-hidden py-14 text-center">
        <div aria-hidden className="hero-grid absolute inset-0 -mx-24 -my-16 opacity-60" />
        <div className="relative">
          <p className="mb-2 font-mono text-xs tracking-[0.35em] text-cyan-300/90">
            CONTACTO DIRECTO
          </p>
          <h1 className="neon-glow text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Escribe al{" "}
            <span className="bg-gradient-to-r from-cyan-300 via-sky-400 to-fuchsia-400 bg-clip-text text-transparent">
              estudio
            </span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-zinc-400">
            Licencias para cine, anuncios y videojuegos · pedidos de vinilo ·
            colaboraciones · soporte con tus descargas. Todo entra directo al
            panel privado del estudio.
          </p>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <ContactForm />

        <aside className="space-y-4">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 backdrop-blur-sm">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">
              Respuestas rápidas
            </h2>
            <ul className="mt-3 space-y-3 text-xs leading-relaxed text-zinc-400">
              <li>
                <strong className="text-zinc-200">¿Cuándo llega mi descarga?</strong>{" "}
                Tras la compra, la descarga aparece inmediatamente en tu pantalla y el enlace queda activo.
              </li>
              <li>
                <strong className="text-zinc-200">¿Las pistas son IA?</strong>{" "}
                Sí, toda la música se genera en Suno modo Premier y luego se termina a mano en el estudio. Se aclara en cada ficha.
              </li>
              <li>
                <strong className="text-zinc-200">¿Licencia comercial?</strong>{" "}
                Escríbenos con el uso previsto (vídeo, juego, exposición) y te enviamos el documento correspondiente.
              </li>
            </ul>
          </div>
          <div className="rounded-2xl border border-cyan-400/25 bg-cyan-400/5 p-5 text-xs leading-relaxed text-cyan-100/80">
            🔒 Sin spam ni formularios de terceros: tu mensaje vive únicamente
            dentro del panel del estudio.
          </div>
        </aside>
      </div>
    </div>
  );
}
