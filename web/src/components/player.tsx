// ============================================================
// Reproductor del sitio — contexto cliente.
// Si la pista tiene un audio subido desde /estudio (previewUrl),
// se reproduce el audio real con barra de progreso. Si aún no lo
// tiene, se mantiene el modo demo (barras EQ animadas).
// ============================================================

"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import type { MouseEvent, ReactNode } from "react";

export interface NowPlaying {
  id: string;
  trackTitle: string;
  artist: string;
  release: string;
  spec: string;
  palette: [string, string];
  /** Data URL del preview subido desde /estudio. Sin ella: modo demo. */
  audioUrl?: string;
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
  const onClick = (e: MouseEvent) => {
    e.preventDefault();
    toggle(item);
  };
  return (
    <button
      onClick={onClick}
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

function fmt(sec: number): string {
  const s = Math.max(0, Math.floor(sec));
  return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;
}

/** Barra inferior persistente mientras suena un preview. */
export function PlayerBar() {
  const { current } = usePlayer();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [progress, setProgress] = useState(0); // 0..1 (audio real)
  const [playing, setPlaying] = useState(false);
  const real = Boolean(current?.audioUrl);

  useEffect(() => {
    if (!real || !current) return;
    setProgress(0);
    const el = audioRef.current;
    if (el) {
      el.currentTime = 0;
      el.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current?.id]);

  if (!current) return null;

  const playPause = () => {
    const el = audioRef.current;
    if (!el) return;
    if (el.paused) el.play().then(() => setPlaying(true)).catch(() => {});
    else {
      el.pause();
      setPlaying(false);
    }
  };

  return (
    <div className="sticky bottom-0 z-40 border-t border-zinc-800 bg-zinc-950/95 backdrop-blur">
      {real && (
        <audio
          ref={audioRef}
          src={current.audioUrl}
          preload="none"
          onTimeUpdate={(e) => {
            const el = e.currentTarget;
            if (el.duration > 0) setProgress(el.currentTime / el.duration);
          }}
          onEnded={() => setPlaying(false)}
          onPause={() => setPlaying(false)}
          onPlay={() => setPlaying(true)}
        />
      )}
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
            {real ? (
              <button
                onClick={playPause}
                aria-label={playing ? "Pausar" : "Reproducir"}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-amber-400/60 bg-amber-400/10 text-xs text-amber-300 transition hover:bg-amber-400/25"
              >
                {playing ? "❚❚" : "▶"}
              </button>
            ) : (
              <span aria-hidden className="flex items-end gap-[3px]">
                {[0, 1, 2, 3].map((i) => (
                  <span
                    key={i}
                    className="eq-bar h-3 w-[3px] origin-bottom rounded-full bg-amber-400"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </span>
            )}
            <p className="truncate text-sm font-medium text-zinc-100">
              {current.trackTitle}
            </p>
          </div>
          <p className="truncate text-xs text-zinc-400">
            {current.artist} — {current.release} · {current.spec}
          </p>
          {real ? (
            <div className="mt-1.5 flex items-center gap-2">
              <div className="h-1 flex-1 overflow-hidden rounded-full bg-zinc-800">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-amber-400 transition-[width] duration-300"
                  style={{ width: `${Math.round(progress * 100)}%` }}
                />
              </div>
              <span className="font-mono text-[10px] text-zinc-500">
                PREVIEW REAL
              </span>
            </div>
          ) : (
            <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-zinc-800">
              <div className="bg-amber-400/80 progress-loop h-full w-1/3 rounded-full" />
            </div>
          )}
        </div>
        <span className="hidden shrink-0 rounded-full border border-zinc-700 px-2.5 py-1 text-[11px] font-medium text-zinc-300 sm:inline-block">
          {real
            ? "PREVIEW · audio real — el lossless se entrega tras la compra"
            : "PREVIEW · AAC 128 — el lossless se entrega tras la compra"}
        </span>
      </div>
    </div>
  );
}
