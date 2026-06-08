'use client';

// ─── Game Over Screen ────────────────────────────────────────────────────────
// Shows final score, stats, and restart button with staggered animations.

import { motion } from 'framer-motion';
import { gameStore } from '@/engine/store';
import { useGameStoreShallow } from '@/hooks/useGameStore';
import { useCallback } from 'react';

export default function GameOver() {
  const { score, highScore, elapsedTime, speedTier } = useGameStoreShallow((s) => ({
    score: s.score,
    highScore: s.highScore,
    elapsedTime: s.elapsedTime,
    speedTier: s.speedTier,
  }));

  const isNewHighScore = score >= highScore && score > 0;

  const handleRestart = useCallback(() => {
    gameStore.getState().startGame();
  }, []);

  const handleMenu = useCallback(() => {
    gameStore.getState().resetGame();
  }, []);

  const minutes = Math.floor(elapsedTime / 60);
  const seconds = Math.floor(elapsedTime % 60);

  return (
    <motion.div
      key="game-over"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      id="game-over-screen"
      className="flex flex-col items-center justify-center h-full px-6 select-none"
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Title */}
        <motion.h2
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-3xl font-black text-slate-200 tracking-tight mb-1"
        >
          GAME OVER
        </motion.h2>

        {/* Lives lost message */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-sm text-red-400/80 mb-3"
        >
          All lives lost
        </motion.p>

        {/* New high score badge */}
        {isNewHighScore && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 300 }}
            className="
              inline-block px-3 py-0.5 mb-4 rounded-full text-xs font-bold
              bg-amber-500/20 text-amber-300 border border-amber-500/30
              shadow-[0_0_16px_rgba(245,158,11,0.2)]
            "
          >
            ★ NEW HIGH SCORE ★
          </motion.span>
        )}

        {/* Score */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="text-center mb-6"
        >
          <span className="text-6xl font-black tabular-nums bg-gradient-to-b from-white to-slate-400 bg-clip-text text-transparent">
            {score.toLocaleString()}
          </span>
        </motion.div>

        {/* Stats grid */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-3 gap-4 mb-8 w-full max-w-xs"
        >
          <div className="flex flex-col items-center p-3 rounded-xl bg-white/5 border border-white/5">
            <span className="text-xs text-slate-500 uppercase tracking-wider">Time</span>
            <span className="text-lg font-bold text-slate-300 tabular-nums">
              {minutes}:{seconds.toString().padStart(2, '0')}
            </span>
          </div>
          <div className="flex flex-col items-center p-3 rounded-xl bg-white/5 border border-white/5">
            <span className="text-xs text-slate-500 uppercase tracking-wider">Speed</span>
            <span className="text-lg font-bold text-amber-400 tabular-nums">
              +{speedTier * 5}%
            </span>
          </div>
          <div className="flex flex-col items-center p-3 rounded-xl bg-white/5 border border-white/5">
            <span className="text-xs text-slate-500 uppercase tracking-wider">Best</span>
            <span className="text-lg font-bold text-cyan-400 tabular-nums">
              {highScore.toLocaleString()}
            </span>
          </div>
        </motion.div>

        {/* Buttons */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col gap-3 w-full max-w-xs"
        >
          <button
            id="restart-button"
            onClick={handleRestart}
            className="
              w-full py-3 rounded-2xl font-bold text-lg
              bg-gradient-to-r from-cyan-500 to-blue-600 text-white
              shadow-[0_0_24px_rgba(34,211,238,0.25)]
              active:scale-95 transition-transform
            "
          >
            PLAY AGAIN
          </button>
          <button
            id="menu-button"
            onClick={handleMenu}
            className="
              w-full py-3 rounded-2xl font-semibold
              bg-white/5 text-slate-400 border border-white/10
              active:scale-95 transition-transform
            "
          >
            Main Menu
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
}
