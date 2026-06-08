'use client';

// ─── Main Menu — Neon Esports Start Screen ───────────────────────────────────

import { motion } from 'framer-motion';
import { gameStore } from '@/engine/store';
import { useGameStore } from '@/hooks/useGameStore';
import { useCallback } from 'react';
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
      {/* ── Background Effects ── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Animated grid */}
        <div className="arena-grid opacity-60" />

        {/* Neon glow orbs */}
        <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[500px] h-[400px] rounded-full bg-neon-cyan/[0.04] blur-[120px]" />
        <div className="absolute bottom-[15%] left-[20%] w-[300px] h-[300px] rounded-full bg-neon-purple/[0.05] blur-[100px]" />
        <div className="absolute top-[60%] right-[10%] w-[250px] h-[250px] rounded-full bg-neon-magenta/[0.03] blur-[80px]" />

        {/* Scanlines */}
        <div className="arena-scanlines absolute inset-0" />
      </div>

      {/* ── Crosshair Decoration ── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5, rotate: -90 }}
        animate={{ opacity: 0.08, scale: 1, rotate: 0 }}
        transition={{ delay: 0.2, duration: 0.8 }}
        className="absolute top-[18%] left-1/2 -translate-x-1/2 w-[200px] h-[200px] pointer-events-none"
      >
        <svg viewBox="0 0 100 100" className="w-full h-full" stroke="#00f0ff" strokeWidth="0.5" fill="none">
          <circle cx="50" cy="50" r="40" />
          <circle cx="50" cy="50" r="20" />
          <line x1="50" y1="5" x2="50" y2="25" />
          <line x1="50" y1="75" x2="50" y2="95" />
          <line x1="5" y1="50" x2="25" y2="50" />
          <line x1="75" y1="50" x2="95" y2="50" />
        </svg>
      </motion.div>

      {/* ── Title ── */}
      <motion.div
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.15, duration: 0.7, ease: 'easeOut' }}
        className="relative z-10 text-center mb-6"
      >
        <h1 className="text-5xl sm:text-6xl font-black tracking-tight leading-none">
          <span
            className="block bg-clip-text text-transparent"
            style={{
              backgroundImage: 'linear-gradient(135deg, #00f0ff 0%, #00aaff 50%, #aa44ff 100%)',
              filter: 'drop-shadow(0 0 20px rgba(0,240,255,0.3))',
            }}
          >
            LOOT DROP
          </span>
          <span
            className="block text-3xl sm:text-4xl font-bold tracking-[0.25em] mt-1"
            style={{
              color: '#f1f5f9',
              textShadow: '0 0 20px rgba(0,240,255,0.2)',
            }}
          >
            SNIPER
          </span>
        </h1>

        {/* Neon divider */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="mt-4 h-[2px] w-48 mx-auto"
          style={{
            background: 'linear-gradient(90deg, transparent, #00f0ff, transparent)',
            boxShadow: '0 0 12px rgba(0,240,255,0.5)',
          }}
        />
      </motion.div>

      {/* ── Tagline ── */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="relative z-10 text-sm text-slate-500 mb-10 tracking-wide text-center max-w-[280px] leading-relaxed"
      >
        Tap <span className="text-neon-cyan/80">supply crates</span> for points.{' '}
        Avoid <span className="text-neon-red/80">lag spikes</span>. Survive.
      </motion.p>

      {/* ── Start Button ── */}
      <motion.button
        id="start-button"
        initial={{ y: 25, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.7, duration: 0.5 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.93 }}
        onClick={handleStart}
        className="
          relative z-10 px-12 py-4 rounded-2xl
          font-black text-lg tracking-widest
          border border-neon-cyan/40
          active:border-neon-cyan/60
          transition-all duration-200
        "
        style={{
          background: 'linear-gradient(135deg, rgba(0,240,255,0.15) 0%, rgba(0,100,255,0.15) 100%)',
          color: '#00f0ff',
          textShadow: '0 0 10px rgba(0,240,255,0.5)',
          boxShadow: '0 0 30px rgba(0,240,255,0.15), inset 0 0 20px rgba(0,240,255,0.05)',
        }}
      >
        START GAME
      </motion.button>

      {/* ── High Score ── */}
      {highScore > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="relative z-10 mt-6 text-center"
        >
          <span className="text-[10px] uppercase tracking-[0.2em] text-slate-600 font-semibold">
            High Score
          </span>
          <p
            className="text-xl font-black tabular-nums text-glow-amber mt-0.5"
            style={{ color: '#ffaa00' }}
          >
            {highScore.toLocaleString()}
          </p>
        </motion.div>
      )}

      {/* ── Controls Hint ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 text-xs text-slate-600"
      >
        <span className="inline-flex items-center justify-center w-5 h-5 rounded border border-slate-700/50 text-[10px]">
          👆
        </span>
        <span className="tracking-wider">Tap to snipe</span>
      </motion.div>
    </motion.div>
  );
}
