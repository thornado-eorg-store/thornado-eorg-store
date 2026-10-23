import Link from "next/link";

const nav = [
  { href: "/", label: "Inicio" },
  { href: "/discover", label: "Catálogo" },
  { href: "/discover#hires", label: "Hi-Res" },
  { href: "/artist/thornado-eorg", label: "El Estudio" },
  { href: "/magazine", label: "Magazine" },
  { href: "/contacto", label: "Contacto" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-zinc-800/80 bg-zinc-950/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-baseline gap-2">
          <span className="neon-glow font-mono text-lg font-bold tracking-widest text-cyan-300">
            THORNADO EORG
          </span>
          <span className="hidden text-[11px] text-fuchsia-300/70 sm:inline">
            official store · música 100% IA · Suno Premier
          </span>
        </Link>
        <nav className="flex items-center gap-0.5 sm:gap-3">
          {nav.map((n) => (
            <Link
              key={n.label}
              href={n.href}
              className="rounded-md px-2 py-1 text-sm text-zinc-400 transition hover:text-cyan-200"
            >
              {n.label}
            </Link>
          ))}
          <Link
            href="/cart"
            className="ml-1 rounded-full border border-cyan-400/50 bg-cyan-400/10 px-3 py-1.5 text-sm font-medium text-cyan-200 transition hover:bg-cyan-400/20"
          >
            Carrito
          </Link>
        </nav>
      </div>
    </header>
  );
}
