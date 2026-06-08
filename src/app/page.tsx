'use client';

// ─── Root Page — Game Shell ──────────────────────────────────────────────────
// Orchestrates game phases with AnimatePresence. Neon esports dark-mode shell.

import dynamic from 'next/dynamic';
import { AnimatePresence, motion } from 'framer-motion';
import { useGamePhase } from '@/hooks/useGameStore';
import { gameStore } from '@/engine/store';
import { useCallback } from 'react';

// Dynamic imports — SSR disabled for game components
const MainMenu = dynamic(() => import('@/components/MainMenu'), { ssr: false });
const GameArena = dynamic(() => import('@/components/GameArena'), { ssr: false });
const HUD = dynamic(() => import('@/components/HUD'), { ssr: false });
const GameOver = dynamic(() => import('@/components/GameOver'), { ssr: false });

export default function Home() {
  const phase = useGamePhase();

  return (
    <main
      id="game-root"
      className="relative w-screen h-dvh overflow-hidden"
      style={{ background: '#030712' }}
    >
      {/* Persistent dark background with subtle gradient */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 0%, #0a0f1e 0%, #030712 60%)',
        }}
      />

      {/* Phase-driven content */}
      <AnimatePresence mode="wait">
        {phase === 'menu' && <MainMenu key="menu" />}
        {(phase === 'playing' || phase === 'paused') && <GameArena key="game" />}
        {phase === 'over' && <GameOver key="over" />}
      </AnimatePresence>

      {/* HUD overlay — on top during gameplay */}
      <AnimatePresence>
        {(phase === 'playing' || phase === 'paused') && (
          <motion.div
            key="hud"
            initial={{ y: -60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -60, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            <HUD />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pause overlay */}
      <AnimatePresence>
        {phase === 'paused' && <PauseOverlay />}
      </AnimatePresence>
    </main>
  );
}

// ─── Pause Overlay ───────────────────────────────────────────────────────────

function PauseOverlay() {
  const handleResume = useCallback(() => {
    gameStore.getState().resumeGame();
  }, []);

  const handleQuit = useCallback(() => {
    gameStore.getState().endGame();
  }, []);

  return (
    <motion.div
      key="pause-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      id="pause-overlay"
      className="absolute inset-0 z-40 flex flex-col items-center justify-center backdrop-blur-lg"
      style={{ background: 'rgba(3,7,18,0.8)' }}
    >
      {/* Grid */}
      <div className="arena-grid opacity-20" />

      <div className="relative z-10 flex flex-col items-center">
        <h2
          className="text-4xl font-black tracking-tight mb-8 text-glow-cyan"
          style={{ color: '#00f0ff' }}
        >
          PAUSED
        </h2>
        <div className="flex flex-col gap-3 w-full max-w-[220px]">
          <button
            id="resume-button"
            onClick={handleResume}
            className="
              w-full py-3 rounded-2xl font-bold tracking-widest
              border border-neon-cyan/40 active:scale-95 transition-transform
            "
            style={{
              background: 'linear-gradient(135deg, rgba(0,240,255,0.15) 0%, rgba(0,100,255,0.15) 100%)',
              color: '#00f0ff',
              textShadow: '0 0 10px rgba(0,240,255,0.5)',
              boxShadow: '0 0 25px rgba(0,240,255,0.12)',
            }}
          >
            RESUME
          </button>
          <button
            id="quit-button"
            onClick={handleQuit}
            className="
              w-full py-3 rounded-2xl font-semibold
              bg-white/[0.03] text-slate-500 border border-white/5
              active:scale-95 transition-transform
            "
          >
            Quit
          </button>
        </div>
      </div>
    </motion.div>
  );
}
