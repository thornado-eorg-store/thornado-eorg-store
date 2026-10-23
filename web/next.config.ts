import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  experimental: {
    serverActions: {
      // Portadas (≤3 MB) y audios de preview (≤10 MB/pista en local);
      // en Vercel la plataforma limita el request a ~4.5 MB igualmente.
      bodySizeLimit: "24mb",
    },
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
