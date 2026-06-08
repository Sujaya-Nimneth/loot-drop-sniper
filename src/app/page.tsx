'use client';

// ─── Root Page — Game Shell ──────────────────────────────────────────────────
// Orchestrates the game phases: menu → playing → over
// Uses AnimatePresence for smooth transitions between phases.

import dynamic from 'next/dynamic';
import { AnimatePresence } from 'framer-motion';
import { useGamePhase } from '@/hooks/useGameStore';

// Dynamic imports to code-split game components (they're heavy with canvas/animation)
const MainMenu = dynamic(() => import('@/components/MainMenu'), { ssr: false });
const GameCanvas = dynamic(() => import('@/components/GameCanvas'), { ssr: false });
const HUD = dynamic(() => import('@/components/HUD'), { ssr: false });
const GameOver = dynamic(() => import('@/components/GameOver'), { ssr: false });

export default function Home() {
  const phase = useGamePhase();

  return (
    <main
      id="game-root"
      className="relative w-screen h-dvh overflow-hidden bg-slate-950"
    >
      {/* Subtle background gradient that's always visible */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at 50% 0%, rgba(15,23,42,1) 0%, rgba(2,6,23,1) 70%)',
        }}
      />

      {/* Phase-driven content with animated transitions */}
      <AnimatePresence mode="wait">
        {phase === 'menu' && <MainMenu key="menu" />}
        {(phase === 'playing' || phase === 'paused') && (
          <GameCanvas key="game" />
        )}
        {phase === 'over' && <GameOver key="over" />}
      </AnimatePresence>

      {/* HUD overlay — rendered on top during gameplay */}
      {(phase === 'playing' || phase === 'paused') && <HUD />}

      {/* Pause overlay */}
      <AnimatePresence>
        {phase === 'paused' && <PauseOverlay />}
      </AnimatePresence>
    </main>
  );
}

// ─── Pause Overlay (inline — small enough to not need its own file) ──────────

import { motion } from 'framer-motion';
import { gameStore } from '@/engine/store';
import { useCallback } from 'react';

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
      className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-slate-950/70 backdrop-blur-md"
    >
      <h2 className="text-3xl font-black text-slate-200 mb-8 tracking-tight">
        PAUSED
      </h2>
      <div className="flex flex-col gap-3 w-full max-w-[200px]">
        <button
          id="resume-button"
          onClick={handleResume}
          className="
            w-full py-3 rounded-2xl font-bold
            bg-gradient-to-r from-cyan-500 to-blue-600 text-white
            shadow-[0_0_24px_rgba(34,211,238,0.25)]
            active:scale-95 transition-transform
          "
        >
          RESUME
        </button>
        <button
          id="quit-button"
          onClick={handleQuit}
          className="
            w-full py-3 rounded-2xl font-semibold
            bg-white/5 text-slate-400 border border-white/10
            active:scale-95 transition-transform
          "
        >
          Quit
        </button>
      </div>
    </motion.div>
  );
}
