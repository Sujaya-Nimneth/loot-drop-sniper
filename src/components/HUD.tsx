'use client';

// ─── HUD — Neon Esports Overlay ──────────────────────────────────────────────
// Sticky glassmorphic top bar with real-time Score, High Score, and Lives.

import { motion, AnimatePresence } from 'framer-motion';
import { useScoreInfo, useLivesInfo, useElapsedTime, useSpeedTier } from '@/hooks/useGameStore';
import { gameStore } from '@/engine/store';
import { useCallback } from 'react';

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function HUD() {
  const { score, highScore } = useScoreInfo();
  const { lives, maxLives } = useLivesInfo();
  const elapsed = useElapsedTime();
  const speedTier = useSpeedTier();

  const handlePause = useCallback(() => {
    gameStore.getState().pauseGame();
  }, []);

  return (
    <div
      id="hud-overlay"
      className="absolute inset-x-0 top-0 z-30 pointer-events-none select-none"
    >
      {/* ── Main HUD Bar ── */}
      <div className="hud-glass">
        <div className="flex items-center justify-between px-3 py-2.5">

          {/* Left: Lives */}
          <div className="flex items-center gap-1 min-w-[70px]">
            {Array.from({ length: maxLives }, (_, i) => (
              <AnimatePresence key={i} mode="wait">
                {i < lives ? (
                  <motion.div
                    key={`alive-${i}`}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 2, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                  >
                    <svg width="20" height="18" viewBox="0 0 22 20" className="drop-shadow-[0_0_6px_rgba(255,0,68,0.6)]">
                      <path
                        d="M11 18.5L9.55 17.19C4.4 12.52 1 9.43 1 5.69C1 2.6 3.42 0.18 6.5 0.18C8.24 0.18 9.91 0.99 11 2.24C12.09 0.99 13.76 0.18 15.5 0.18C18.58 0.18 21 2.6 21 5.69C21 9.43 17.6 12.52 12.45 17.19L11 18.5Z"
                        fill="#ff0044"
                      />
                      {/* Highlight */}
                      <ellipse cx="8" cy="6" rx="3" ry="2.5" fill="rgba(255,255,255,0.15)" />
                    </svg>
                  </motion.div>
                ) : (
                  <motion.div
                    key={`dead-${i}`}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                  >
                    <svg width="20" height="18" viewBox="0 0 22 20" className="opacity-20">
                      <path
                        d="M11 18.5L9.55 17.19C4.4 12.52 1 9.43 1 5.69C1 2.6 3.42 0.18 6.5 0.18C8.24 0.18 9.91 0.99 11 2.24C12.09 0.99 13.76 0.18 15.5 0.18C18.58 0.18 21 2.6 21 5.69C21 9.43 17.6 12.52 12.45 17.19L11 18.5Z"
                        fill="#334155"
                        stroke="#475569"
                        strokeWidth="0.5"
                      />
                    </svg>
                  </motion.div>
                )}
              </AnimatePresence>
            ))}
          </div>

          {/* Center: Score */}
          <div className="flex flex-col items-center flex-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-neon-cyan/60">
                Score
              </span>
            </div>
            <motion.span
              key={score}
              initial={{ scale: 1.4 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 20 }}
              className="text-2xl font-black tabular-nums text-glow-cyan"
              style={{ color: '#00f0ff' }}
            >
              {score.toLocaleString()}
            </motion.span>
          </div>

          {/* Right: High Score + Pause */}
          <div className="flex items-center gap-2 min-w-[70px] justify-end">
            <div className="flex flex-col items-end">
              <span className="text-[9px] font-semibold uppercase tracking-widest text-neon-amber/50">
                HI
              </span>
              <span
                className="text-sm font-bold tabular-nums text-glow-amber"
                style={{ color: '#ffaa00' }}
              >
                {highScore.toLocaleString()}
              </span>
            </div>

            <button
              id="pause-button"
              onClick={handlePause}
              className="
                pointer-events-auto w-8 h-8 flex items-center justify-center
                rounded-lg border border-white/10 bg-white/5
                active:scale-90 transition-transform ml-1
              "
              aria-label="Pause game"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <rect x="1.5" y="1" width="3" height="10" rx="0.8" fill="#64748b" />
                <rect x="7.5" y="1" width="3" height="10" rx="0.8" fill="#64748b" />
              </svg>
            </button>
          </div>
        </div>

        {/* Neon bottom edge */}
        <div className="h-[1px] bg-gradient-to-r from-transparent via-neon-cyan/30 to-transparent" />
      </div>

      {/* ── Sub-bar: Timer + Speed ── */}
      <div className="flex justify-center items-center gap-3 pt-1.5 px-4">
        <span className="text-[11px] font-mono font-semibold text-slate-500 tabular-nums">
          {formatTime(elapsed)}
        </span>
        {speedTier > 0 && (
          <motion.span
            key={speedTier}
            initial={{ scale: 1.3, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-neon-amber/10 border border-neon-amber/20"
            style={{ color: '#ffaa00' }}
          >
            ⚡ +{speedTier * 5}%
          </motion.span>
        )}
      </div>
    </div>
  );
}
