'use client';

// ─── Game Over — Neon Esports Results Screen ─────────────────────────────────

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
      {/* Dark overlay with subtle red tint */}
      <div
        className="absolute inset-0 backdrop-blur-md"
        style={{
          background: 'radial-gradient(ellipse at 50% 30%, rgba(255,0,68,0.06) 0%, rgba(3,7,18,0.92) 70%)',
        }}
      />

      {/* Grid background */}
      <div className="arena-grid opacity-30" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center w-full max-w-xs">

        {/* Title */}
        <motion.h2
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 300 }}
          className="text-4xl font-black tracking-tight mb-1 text-glow-red"
          style={{ color: '#ff0044' }}
        >
          GAME OVER
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="text-xs text-slate-500 uppercase tracking-[0.15em] mb-4"
        >
          All lives lost
        </motion.p>

        {/* New high score badge */}
        {isNewHighScore && (
          <motion.div
            initial={{ scale: 0, rotate: -5 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.35, type: 'spring', stiffness: 300 }}
            className="
              px-4 py-1 mb-4 rounded-full text-xs font-black uppercase tracking-widest
              border border-neon-amber/40
            "
            style={{
              color: '#ffaa00',
              textShadow: '0 0 8px rgba(255,170,0,0.5)',
              background: 'rgba(255,170,0,0.08)',
              boxShadow: '0 0 20px rgba(255,170,0,0.15)',
            }}
          >
            ★ NEW HIGH SCORE ★
          </motion.div>
        )}

        {/* Score */}
        <motion.div
          initial={{ scale: 0.4, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="text-center mb-6"
        >
          <span
            className="text-6xl font-black tabular-nums text-glow-cyan"
            style={{ color: '#00f0ff' }}
          >
            {score.toLocaleString()}
          </span>
        </motion.div>

        {/* Stats grid */}
        <motion.div
          initial={{ y: 25, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.45 }}
          className="grid grid-cols-3 gap-3 mb-8 w-full"
        >
          {[
            { label: 'Time', value: `${minutes}:${seconds.toString().padStart(2, '0')}`, color: '#94a3b8' },
            { label: 'Speed', value: `+${speedTier * 5}%`, color: '#ffaa00' },
            { label: 'Best', value: highScore.toLocaleString(), color: '#00f0ff' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col items-center p-3 rounded-xl border border-white/5"
              style={{ background: 'rgba(255,255,255,0.02)' }}
            >
              <span className="text-[9px] text-slate-600 uppercase tracking-wider font-semibold">
                {stat.label}
              </span>
              <span
                className="text-base font-bold tabular-nums mt-0.5"
                style={{ color: stat.color }}
              >
                {stat.value}
              </span>
            </div>
          ))}
        </motion.div>

        {/* Buttons */}
        <motion.div
          initial={{ y: 25, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col gap-3 w-full"
        >
          <button
            id="restart-button"
            onClick={handleRestart}
            className="
              w-full py-3.5 rounded-2xl font-black text-base tracking-widest
              border border-neon-cyan/40 active:scale-95 transition-transform
            "
            style={{
              background: 'linear-gradient(135deg, rgba(0,240,255,0.15) 0%, rgba(0,100,255,0.15) 100%)',
              color: '#00f0ff',
              textShadow: '0 0 10px rgba(0,240,255,0.5)',
              boxShadow: '0 0 25px rgba(0,240,255,0.12)',
            }}
          >
            PLAY AGAIN
          </button>
          <button
            id="menu-button"
            onClick={handleMenu}
            className="
              w-full py-3 rounded-2xl font-semibold text-sm
              bg-white/[0.03] text-slate-500 border border-white/5
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
