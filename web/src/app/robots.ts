import type { MetadataRoute } from "next";

// El panel /estudio es de acceso privado: fuera de buscadores.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        disallow: ["/estudio"],
      },
    ],
  };
}
