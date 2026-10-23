// ============================================================
// Reproductor de previews (demo F1) — contexto cliente
// En producción: streaming AAC desde previews, firmado y expirable.
// ============================================================

"use client";

import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

export interface NowPlaying {
  id: string;
  trackTitle: string;
  artist: string;
  release: string;
  spec: string;
  palette: [string, string];
}

interface PlayerState {
  current: NowPlaying | null;
  toggle: (t: NowPlaying) => void;
}

const PlayerContext = createContext<PlayerState>({
  current: null,
  toggle: () => {},
});

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [current, setCurrent] = useState<NowPlaying | null>(null);
  const toggle = (t: NowPlaying) =>
    setCurrent((running) => (running && running.id === t.id ? null : t));
  return (
    <PlayerContext.Provider value={{ current, toggle }}>
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer(): PlayerState {
  return useContext(PlayerContext);
}

/** Botón de preview: se coloca junto a cada track del tracklist. */
export function PreviewButton({ item }: { item: NowPlaying }) {
  const { current, toggle } = usePlayer();
  const active = current?.id === item.id;
  return (
    <button
      onClick={() => toggle(item)}
      aria-label={active ? "Detener preview" : `Reproducir preview de ${item.trackTitle}`}
      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-sm transition ${
        active
          ? "border-amber-400 bg-amber-400 text-zinc-950"
          : "border-zinc-700 bg-zinc-800/80 text-amber-300 hover:border-amber-400/60 hover:bg-zinc-700"
      }`}
    >
      {active ? "❚❚" : "▶"}
    </button>
  );
}

/** Barra inferior persistente mientras suena un preview. */
export function PlayerBar() {
  const { current } = usePlayer();
  if (!current) return null;
  return (
    <div className="sticky bottom-0 z-40 border-t border-zinc-800 bg-zinc-950/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
        {/* mini cover */}
        <div
          className="h-11 w-11 shrink-0 rounded-lg border border-zinc-700/60"
          style={{
            background: `linear-gradient(135deg, ${current.palette[0]}, ${current.palette[1]})`,
          }}
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span aria-hidden className="flex items-end gap-[3px]">
              {[0, 1, 2, 3].map((i) => (
                <span
                  key={i}
                  className="eq-bar h-3 w-[3px] origin-bottom rounded-full bg-amber-400"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </span>
            <p className="truncate text-sm font-medium text-zinc-100">
              {current.trackTitle}
            </p>
          </div>
          <p className="truncate text-xs text-zinc-400">
            {current.artist} — {current.release} · {current.spec}
          </p>
          <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-zinc-800">
            <div className="bg-amber-400/80 progress-loop h-full w-1/3 rounded-full" />
          </div>
        </div>
        <span className="hidden shrink-0 rounded-full border border-zinc-700 px-2.5 py-1 text-[11px] font-medium text-zinc-300 sm:inline-block">
          PREVIEW · AAC 128 — el lossless se entrega tras la compra
        </span>
      </div>
    </div>
  );
}
