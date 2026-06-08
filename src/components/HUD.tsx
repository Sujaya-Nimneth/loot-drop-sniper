'use client';

// ─── HUD (Heads-Up Display) ──────────────────────────────────────────────────
// Renders score, lives, timer, and speed tier. Subscribes to low-frequency
// derived slices only — never re-renders on entity position changes.

import { motion } from 'framer-motion';
import { useScoreInfo, useLivesInfo, useElapsedTime, useSpeedTier } from '@/hooks/useGameStore';
import { gameStore } from '@/engine/store';
import { useCallback } from 'react';

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function HUD() {
  const { score } = useScoreInfo();
  const { lives, maxLives } = useLivesInfo();
  const elapsed = useElapsedTime();
  const speedTier = useSpeedTier();

  const handlePause = useCallback(() => {
    gameStore.getState().pauseGame();
  }, []);

  return (
    <div
      id="hud-overlay"
      className="absolute inset-x-0 top-0 z-20 pointer-events-none select-none"
    >
      {/* Top bar */}
      <div className="flex items-start justify-between px-4 pt-3 pb-2">
        {/* Score */}
        <div className="flex flex-col items-start">
          <span className="text-xs font-medium uppercase tracking-widest text-cyan-400/70">
            Score
          </span>
          <motion.span
            key={score}
            initial={{ scale: 1.3, color: '#fbbf24' }}
            animate={{ scale: 1, color: '#e2e8f0' }}
            transition={{ duration: 0.3 }}
            className="text-2xl font-bold tabular-nums text-slate-200"
          >
            {score.toLocaleString()}
          </motion.span>
        </div>

        {/* Timer + Speed tier */}
        <div className="flex flex-col items-center">
          <span className="text-xs font-medium uppercase tracking-widest text-slate-500">
            {formatTime(elapsed)}
          </span>
          {speedTier > 0 && (
            <span className="text-[10px] font-semibold text-amber-400/80 mt-0.5">
              +{speedTier * 5}% SPD
            </span>
          )}
        </div>

        {/* Pause button */}
        <button
          id="pause-button"
          onClick={handlePause}
          className="pointer-events-auto w-9 h-9 flex items-center justify-center rounded-lg bg-white/5 backdrop-blur-sm border border-white/10 active:scale-90 transition-transform"
          aria-label="Pause game"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <rect x="2" y="1" width="3.5" height="12" rx="1" fill="#94a3b8" />
            <rect x="8.5" y="1" width="3.5" height="12" rx="1" fill="#94a3b8" />
          </svg>
        </button>
      </div>

      {/* Lives — heart icons at bottom-left */}
      <div className="absolute bottom-4 left-4 flex items-center gap-1.5">
        {Array.from({ length: maxLives }, (_, i) => (
          <motion.div
            key={i}
            animate={{
              opacity: i < lives ? 1 : 0.2,
              scale: i < lives ? 1 : 0.7,
            }}
            transition={{ duration: 0.2, type: 'spring', stiffness: 300 }}
          >
            <svg
              width="22"
              height="20"
              viewBox="0 0 22 20"
              fill="none"
              className={i < lives
                ? 'drop-shadow-[0_0_6px_rgba(239,68,68,0.5)]'
                : ''
              }
            >
              <path
                d="M11 18.5L9.55 17.19C4.4 12.52 1 9.43 1 5.69C1 2.6 3.42 0.18 6.5 0.18C8.24 0.18 9.91 0.99 11 2.24C12.09 0.99 13.76 0.18 15.5 0.18C18.58 0.18 21 2.6 21 5.69C21 9.43 17.6 12.52 12.45 17.19L11 18.5Z"
                fill={i < lives ? '#ef4444' : '#334155'}
              />
            </svg>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
