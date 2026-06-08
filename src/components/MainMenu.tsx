'use client';

// ─── Main Menu ───────────────────────────────────────────────────────────────
// Animated start screen with title, start button, and high score display.

import { motion } from 'framer-motion';
import { gameStore } from '@/engine/store';
import { useGameStore } from '@/hooks/useGameStore';
import { useCallback } from 'react';

// Ensure loop module subscription is registered
import '@/engine/loop';

export default function MainMenu() {
  const highScore = useGameStore((s) => s.highScore);

  const handleStart = useCallback(() => {
    gameStore.getState().startGame();
  }, []);

  return (
    <motion.div
      key="main-menu"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4 }}
      id="main-menu"
      className="flex flex-col items-center justify-center h-full px-6 select-none"
    >
      {/* Background decorative grid */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(34,211,238,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,0.3) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
        {/* Radial glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-cyan-500/5 blur-[100px]" />
        <div className="absolute bottom-1/4 left-1/3 w-[300px] h-[300px] rounded-full bg-purple-500/5 blur-[80px]" />
      </div>

      {/* Title */}
      <motion.div
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.6, ease: 'easeOut' }}
        className="relative z-10 text-center mb-8"
      >
        <h1 className="text-5xl sm:text-6xl font-black tracking-tight">
          <span className="bg-gradient-to-br from-cyan-300 via-blue-400 to-purple-500 bg-clip-text text-transparent">
            LOOT DROP
          </span>
          <br />
          <span className="text-slate-200 text-3xl sm:text-4xl font-bold tracking-[0.2em]">
            SNIPER
          </span>
        </h1>
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="mt-3 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent"
        />
      </motion.div>

      {/* Tagline */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="relative z-10 text-sm text-slate-500 mb-10 tracking-wide text-center max-w-xs"
      >
        Shoot falling crates. Dodge lag spikes. Chase the combo.
      </motion.p>

      {/* Start button */}
      <motion.button
        id="start-button"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleStart}
        className="
          relative z-10 px-10 py-3.5 rounded-2xl
          bg-gradient-to-r from-cyan-500 to-blue-600
          text-white font-bold text-lg tracking-wide
          shadow-[0_0_30px_rgba(34,211,238,0.3)]
          active:shadow-[0_0_15px_rgba(34,211,238,0.5)]
          transition-shadow duration-200
        "
      >
        START GAME
      </motion.button>

      {/* High score */}
      {highScore > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="relative z-10 mt-6 text-center"
        >
          <span className="text-xs uppercase tracking-widest text-slate-600">
            Best Score
          </span>
          <p className="text-lg font-semibold text-amber-400 tabular-nums">
            {highScore.toLocaleString()}
          </p>
        </motion.div>
      )}

      {/* Controls hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.0 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 text-xs text-slate-600"
      >
        <span className="inline-block w-4 h-4 rounded border border-slate-700 text-center leading-4 text-[10px]">
          ⬇
        </span>
        <span>Tap to shoot</span>
      </motion.div>
    </motion.div>
  );
}
