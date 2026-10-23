// ============================================================
// Configuración editable del sitio (desde /estudio/apariencia):
// textos de la portada, orden/visibilidad de secciones y fondo.
// Cliente y servidor (sin node APIs).
// ============================================================

export interface SiteTexts {
  kicker: string; // línea pequeña sobre el titular
  titleA: string; // palabra blanca del titular
  titleB: string; // palabra con degradado del titular
  subtitle: string;
  ctaPrimario: string;
  ctaSecundario: string;
  destacadoKicker: string;
  destacadoTitle: string;
  destacadoBody: string;
  destacadoCta: string;
  valor: { title: string; text: string }[]; // tres tarjetas (iconos fijos)
  footerTagline: string;
}

export const SECTION_KEYS = ["destacado", "novedades", "hires", "ventas", "catalogo"] as const;
export type SectionKey = (typeof SECTION_KEYS)[number];

export const SECTION_LABELS: Record<SectionKey, string> = {
  destacado: "Destacado del estudio",
  novedades: "Novedades",
  hires: "Colección Hi-Res",
  ventas: "Ventas en vivo",
  catalogo: "Catálogo completo",
};

export interface SiteConfig {
  texts: SiteTexts;
  /** Orden de las secciones de la portada (las ocultas se saltan). */
  sections: SectionKey[];
  /** Fondo visual global. */
  theme: BgTheme;
}

export type BgTheme = "aurora" | "carbono" | "estelar";

export const BG_THEMES: { id: BgTheme; label: string; desc: string }[] = [
  { id: "aurora", label: "Aurora Neón", desc: "Cian y violeta con brillos suaves — la firma de la marca" },
  { id: "carbono", label: "Carbón Elegante", desc: "Grafito neutro, sobrio, deja protagonismo a las portadas" },
  { id: "estelar", label: "Vía Estelar", desc: "Azul-nocturno con estrellas y neblina de estudio" },
];

export const DEFAULT_SITE_CONFIG: SiteConfig = {
  texts: {
    kicker: "COMPOSITOR · ARREGLISTA · PRODUCTOR",
    titleA: "THORNADO",
    titleB: "EORG",
    subtitle:
      "Música 100% generada con IA (Suno, modo Premier), terminada a mano: estructura, arreglo, masterización Hi-Res y verificación espectral. Aquí compras el master real — WAV, FLAC 24-bit, DSD y vinilo.",
    ctaPrimario: "Entrar al catálogo",
    ctaSecundario: "Escuchar el Requiem →",
    destacadoKicker: "DEL ESTUDIO · ÚLTIMO ÁLBUM",
    destacadoTitle: "Voltage Requiem",
    destacadoBody:
      "Réquiem + sintetizadores, crecido en Suno Premier y terminado bajo decisión humana: cinco movimientos a 24-bit/192 kHz, con edición limitada en vinilo. Escucha la obertura abajo en la barra del reproductor.",
    destacadoCta: "Ver ficha completa",
    valor: [
      {
        title: "100% IA · Suno Premier",
        text: "Toda la música se genera en Suno modo Premier y pasa por arreglo, masterización y QA humanos.",
      },
      {
        title: "Lossless verificado",
        text: "Análisis espectral de cada master antes de liberar: nada de MP3 disfrazado de WAV.",
      },
      {
        title: "Hi-Res hasta DSD",
        text: "FLAC 24/192, DSD y fichas técnicas visibles en cada pista. Vinilo con descarga instantánea.",
      },
    ],
    footerTagline:
      "Música 100% generada con IA — Suno, modo Premier · masterizada y verificada espectralmente · 90% de cada compra va directo al artista",
  },
  sections: [...SECTION_KEYS],
  theme: "aurora",
};

/** Valida/repara una configuración recibida del overlay. */
export function normalizeSiteConfig(input: unknown): SiteConfig {
  const o = (input ?? {}) as Partial<SiteConfig>;
  const texts = { ...DEFAULT_SITE_CONFIG.texts, ...(typeof o.texts === "object" ? o.texts : {}) };
  if (Array.isArray(o.texts?.valor) && o.texts.valor.length === 3) {
    texts.valor = o.texts.valor.map((v, i) => ({
      title: String(v?.title ?? DEFAULT_SITE_CONFIG.texts.valor[i].title).slice(0, 60),
      text: String(v?.text ?? DEFAULT_SITE_CONFIG.texts.valor[i].text).slice(0, 300),
    }));
  }
  const order = Array.isArray(o.sections)
    ? o.sections.filter((s): s is SectionKey => SECTION_KEYS.includes(s as SectionKey))
    : [];
  const sorted = order.length > 0 ? [...order] : [...SECTION_KEYS];
  for (const s of SECTION_KEYS) if (!sorted.includes(s)) sorted.push(s);
  const theme: BgTheme = BG_THEMES.some((t) => t.id === o.theme) ? (o.theme as BgTheme) : "aurora";
  return { texts, sections: sorted, theme };
}
