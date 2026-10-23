import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { PlayerProvider, PlayerBar } from "@/components/player";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "THORNADO EORG — Tienda oficial · música 100% IA (Suno Premier)",
    template: "%s · THORNADO EORG",
  },
  description:
    "Tienda oficial de THORNADO EORG: compositor, arreglista y productor con música 100% generada con IA en Suno modo Premier. Masters lossless verificados espectralmente, Hi-Res 24-bit, DSD y vinilos.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans text-zinc-100">
        <PlayerProvider>
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <footer className="mt-16 border-t border-zinc-800/70 py-10 text-center text-xs text-zinc-500">
            <p className="font-mono tracking-wider text-cyan-300/60">
              THORNADO EORG
            </p>
            <p className="mt-2">
              Música 100% generada con IA — Suno, modo Premier · masterizada y
              verificada espectralmente · 90% de cada compra va directo al
              artista
            </p>
            <p className="mt-2">
              <a
                href="#"
                className="text-fuchsia-300/80 hover:underline"
              >
                «Día del estudio»: un día al mes, 0% de comisión
              </a>{" "}
              · demo F1 sin backend
            </p>
          </footer>
          <PlayerBar />
        </PlayerProvider>
      </body>
    </html>
  );
}
