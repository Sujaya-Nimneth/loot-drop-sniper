'use client';

// ─── Game Arena ──────────────────────────────────────────────────────────────
// The main game viewport. Renders entities as Framer Motion DOM elements.
// Tap detection → store.tap() → instant score update.
// Visual effects: particle burst on crate tap, screen-shake + red flash on lag spike.

import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { gameStore } from '@/engine/store';
import { useEntityVersion, useTapEffects } from '@/hooks/useGameStore';
import type { SupplyCrateEntity, LagSpikeEntity } from '@/engine/types';
import '@/engine/loop';

// ─── Local Effect Types ──────────────────────────────────────────────────────

interface Particle {
  id: string;
  x: number; // percent of arena
  y: number;
  dx: number; // target offset in px
  dy: number;
  color: string;
  size: number;
}

interface FloatingScore {
  id: string;
  x: number; // percent
  y: number;
  points: number;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function GameArena() {
  // Subscribe to entityVersion → re-render when entities move
  useEntityVersion();
  const tapEffects = useTapEffects();

  const [particles, setParticles] = useState<Particle[]>([]);
  const [floatingScores, setFloatingScores] = useState<FloatingScore[]>([]);
  const [isShaking, setIsShaking] = useState(false);
  const [isFlashing, setIsFlashing] = useState(false);
  const shakeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const flashTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Read entities on each render (driven by entityVersion)
  const entities = Array.from(gameStore.getState().entities.values()).filter(e => e.alive);

  // ── Process Tap Effects ──
  useEffect(() => {
    if (tapEffects.length === 0) return;

    for (const effect of tapEffects) {
      // Floating score text
      setFloatingScores(prev => [...prev, {
        id: effect.id,
        x: effect.x * 100,
        y: effect.y * 100,
        points: effect.points,
      }]);

      if (effect.entityKind === 'supply-crate') {
        // ── Particle burst ──
        const newParticles: Particle[] = [];
        const count = 14;
        for (let i = 0; i < count; i++) {
          const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.6;
          const distance = 35 + Math.random() * 75;
          newParticles.push({
            id: `p-${effect.id}-${i}`,
            x: effect.x * 100,
            y: effect.y * 100,
            dx: Math.cos(angle) * distance,
            dy: Math.sin(angle) * distance,
            color: ['#00f0ff', '#67e8f9', '#ffffff', '#00ff88', '#a5f3fc'][
              Math.floor(Math.random() * 5)
            ],
            size: 3 + Math.random() * 5,
          });
        }
        setParticles(prev => [...prev, ...newParticles]);
      } else {
        // ── Screen shake + red flash ──
        setIsShaking(true);
        setIsFlashing(true);

        if (shakeTimeoutRef.current) clearTimeout(shakeTimeoutRef.current);
        if (flashTimeoutRef.current) clearTimeout(flashTimeoutRef.current);

        shakeTimeoutRef.current = setTimeout(() => setIsShaking(false), 300);
        flashTimeoutRef.current = setTimeout(() => setIsFlashing(false), 300);
      }
    }

    gameStore.getState().consumeTapEffects();
  }, [tapEffects]);

  // Cleanup timeouts
  useEffect(() => {
    return () => {
      if (shakeTimeoutRef.current) clearTimeout(shakeTimeoutRef.current);
      if (flashTimeoutRef.current) clearTimeout(flashTimeoutRef.current);
    };
  }, []);

  // ── Remove completed particles ──
  const removeParticle = useCallback((id: string) => {
    setParticles(prev => prev.filter(p => p.id !== id));
  }, []);

  const removeFloatingScore = useCallback((id: string) => {
    setFloatingScores(prev => prev.filter(s => s.id !== id));
  }, []);

  // ── Tap handler ──
  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    gameStore.getState().tap(x, y);
  }, []);

  return (
    <motion.div
      key="game-arena"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className={`absolute inset-0 w-full h-full overflow-hidden touch-none select-none
        ${isShaking ? 'animate-screen-shake' : ''}`}
      onPointerDown={handlePointerDown}
    >
      {/* ── Background ── */}
      <div className="arena-grid" />
      <div className="arena-scanlines absolute inset-0 pointer-events-none" />

      {/* Ambient neon glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] bg-neon-cyan/[0.03] blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[400px] h-[150px] bg-neon-purple/[0.03] blur-[80px] rounded-full pointer-events-none" />

      {/* ── Entities Layer ── */}
      <AnimatePresence>
        {entities.map(entity => (
          <motion.div
            key={entity.id}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.6, opacity: 0 }}
            transition={{
              type: 'spring',
              stiffness: 500,
              damping: 25,
              opacity: { duration: 0.15 },
            }}
            className="absolute pointer-events-none z-10"
            style={{
              left: `${entity.x * 100}%`,
              top: `${entity.y * 100}%`,
              width: `${entity.width * 100}%`,
              height: `${entity.height * 100}%`,
            }}
          >
            {entity.kind === 'supply-crate' ? (
              <SupplyCrateVisual entity={entity as SupplyCrateEntity} />
            ) : (
              <LagSpikeVisual entity={entity as LagSpikeEntity} />
            )}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* ── Particles Layer ── */}
      <AnimatePresence>
        {particles.map(p => (
          <motion.div
            key={p.id}
            initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
            animate={{ x: p.dx, y: p.dy, scale: 0, opacity: 0 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            onAnimationComplete={() => removeParticle(p.id)}
            className="absolute rounded-full pointer-events-none z-20"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: p.size,
              height: p.size,
              backgroundColor: p.color,
              boxShadow: `0 0 ${p.size * 2}px ${p.color}, 0 0 ${p.size * 4}px ${p.color}40`,
            }}
          />
        ))}
      </AnimatePresence>

      {/* ── Floating Scores Layer ── */}
      <AnimatePresence>
        {floatingScores.map(fs => (
          <motion.div
            key={fs.id}
            initial={{ y: 0, opacity: 1, scale: 1.2 }}
            animate={{ y: -50, opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            onAnimationComplete={() => removeFloatingScore(fs.id)}
            className="absolute pointer-events-none z-30 font-black text-xl"
            style={{
              left: `${fs.x}%`,
              top: `${fs.y}%`,
              transform: 'translate(-50%, -50%)',
              color: fs.points > 0 ? '#00f0ff' : '#ff0044',
              textShadow: fs.points > 0
                ? '0 0 12px rgba(0,240,255,0.8), 0 0 24px rgba(0,240,255,0.4)'
                : '0 0 12px rgba(255,0,68,0.8), 0 0 24px rgba(255,0,68,0.4)',
            }}
          >
            {fs.points > 0 ? `+${fs.points}` : fs.points}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* ── Red Flash Overlay (lag spike tap) ── */}
      <AnimatePresence>
        {isFlashing && (
          <motion.div
            key="red-flash"
            initial={{ opacity: 0.45 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="absolute inset-0 pointer-events-none z-40"
            style={{
              background: 'radial-gradient(circle at 50% 50%, rgba(255,0,68,0.35) 0%, rgba(255,0,68,0.1) 60%, transparent 100%)',
            }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Supply Crate Visual ─────────────────────────────────────────────────────

function SupplyCrateVisual({ entity }: { entity: SupplyCrateEntity }) {
  return (
    <div
      className="w-full h-full relative animate-neon-cyan"
      style={{ transform: `rotate(${entity.rotation}deg)` }}
    >
      {/* Main box */}
      <div
        className="absolute inset-0 rounded-lg border-2 border-neon-cyan/70 overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(0,240,255,0.12) 0%, rgba(3,7,18,0.85) 100%)',
          boxShadow: '0 0 18px rgba(0,240,255,0.25), inset 0 0 12px rgba(0,240,255,0.06)',
        }}
      >
        {/* Cross symbol */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="absolute w-[3px] h-[55%] bg-neon-cyan/50 rounded-full" />
          <div className="absolute w-[55%] h-[3px] bg-neon-cyan/50 rounded-full" />
        </div>

        {/* Corner accent */}
        <div className="absolute top-1 left-1 w-2.5 h-2.5 border-t-2 border-l-2 border-neon-cyan/30 rounded-tl-sm" />
        <div className="absolute bottom-1 right-1 w-2.5 h-2.5 border-b-2 border-r-2 border-neon-cyan/30 rounded-br-sm" />

        {/* Highlight stripe */}
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-neon-cyan/40 to-transparent" />
      </div>
    </div>
  );
}

// ─── Lag Spike Visual ────────────────────────────────────────────────────────

function LagSpikeVisual({ entity }: { entity: LagSpikeEntity }) {
  const pulse = 1 + Math.sin(entity.pulsePhase) * 0.12;

  return (
    <div
      className="w-full h-full relative flex items-center justify-center animate-neon-red"
      style={{ transform: `scale(${pulse})` }}
    >
      {/* Spiky star SVG */}
      <svg viewBox="0 0 100 100" className="w-full h-full" style={{ filter: 'drop-shadow(0 0 10px rgba(255,0,68,0.5))' }}>
        <polygon
          points="50,5 61,35 95,35 68,55 79,88 50,68 21,88 32,55 5,35 39,35"
          fill="rgba(255,0,68,0.85)"
          stroke="rgba(255,68,102,0.6)"
          strokeWidth="2"
        />
        {/* Inner glow */}
        <circle cx="50" cy="50" r="14" fill="rgba(255,0,68,0.4)" />
        <circle cx="50" cy="50" r="6" fill="rgba(255,200,200,0.3)" />
      </svg>

      {/* Warning symbol */}
      <span
        className="absolute text-white/70 font-black text-[10px] tracking-tighter"
        style={{ textShadow: '0 0 4px rgba(255,0,68,0.8)' }}
      >
        ⚡
      </span>
    </div>
  );
}
