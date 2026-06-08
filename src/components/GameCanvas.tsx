'use client';

// ─── GameCanvas ──────────────────────────────────────────────────────────────
// Main game viewport. Renders entities via its own rAF draw loop (outside React).
// Tap detection: onPointerDown → normalized coords → store.tap(x, y).

import { useEffect, useRef, useCallback } from 'react';
import { gameStore } from '@/engine/store';
import { useGlitchIntensity } from '@/hooks/useGameStore';
import { SUPPLY_CRATE_COLOR, LAG_SPIKE_COLOR } from '@/engine/constants';
import type { SupplyCrateEntity, LagSpikeEntity } from '@/engine/types';

// Ensure loop module is imported so the subscription auto-starts
import '@/engine/loop';

export default function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const renderRafRef = useRef<number | null>(null);
  const glitchIntensity = useGlitchIntensity();

  // ── Canvas render loop (separate from simulation tick) ──
  const renderFrame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const w = canvas.width / dpr;
    const h = canvas.height / dpr;

    ctx.clearRect(0, 0, w, h);

    const { entities } = gameStore.getState();

    for (const entity of entities.values()) {
      if (!entity.alive) continue;

      const px = entity.x * w;
      const py = entity.y * h;
      const pw = entity.width * w;
      const ph = entity.height * h;

      switch (entity.kind) {
        case 'supply-crate': {
          const crate = entity as SupplyCrateEntity;

          ctx.save();
          ctx.translate(px + pw / 2, py + ph / 2);
          ctx.rotate((crate.rotation * Math.PI) / 180);

          // Glow
          ctx.shadowColor = SUPPLY_CRATE_COLOR.glow;
          ctx.shadowBlur = 14;

          // Main box
          ctx.fillStyle = SUPPLY_CRATE_COLOR.primary;
          const r = Math.min(pw, ph) * 0.15;
          ctx.beginPath();
          ctx.roundRect(-pw / 2, -ph / 2, pw, ph, r);
          ctx.fill();

          // Cross / plus symbol
          ctx.shadowBlur = 0;
          ctx.fillStyle = SUPPLY_CRATE_COLOR.face;
          const crossW = pw * 0.12;
          const crossH = ph * 0.5;
          ctx.fillRect(-crossW / 2, -crossH / 2, crossW, crossH);
          ctx.fillRect(-crossH / 2, -crossW / 2, crossH, crossW);

          // Inner highlight
          ctx.fillStyle = 'rgba(255,255,255,0.15)';
          ctx.fillRect(-pw / 2 + 3, -ph / 2 + 3, pw * 0.4, ph * 0.35);

          ctx.restore();
          break;
        }

        case 'lag-spike': {
          const spike = entity as LagSpikeEntity;
          const pulse = 1 + Math.sin(spike.pulsePhase) * 0.12;

          ctx.save();
          ctx.translate(px + pw / 2, py + ph / 2);
          ctx.scale(pulse, pulse);

          ctx.globalAlpha = 0.7 + spike.glitchIntensity * 0.3;
          ctx.shadowColor = LAG_SPIKE_COLOR.glow;
          ctx.shadowBlur = 18;
          ctx.fillStyle = LAG_SPIKE_COLOR.primary;

          // Jagged lightning-bolt shape
          const hw = pw / 2;
          const hh = ph / 2;
          ctx.beginPath();
          ctx.moveTo(0, -hh);
          ctx.lineTo(hw * 0.4, -hh * 0.3);
          ctx.lineTo(hw, -hh * 0.4);
          ctx.lineTo(hw * 0.3, hh * 0.1);
          ctx.lineTo(hw * 0.7, hh * 0.3);
          ctx.lineTo(0, hh);
          ctx.lineTo(-hw * 0.3, hh * 0.2);
          ctx.lineTo(-hw * 0.8, hh * 0.4);
          ctx.lineTo(-hw * 0.2, -hh * 0.15);
          ctx.lineTo(-hw * 0.6, -hh * 0.35);
          ctx.closePath();
          ctx.fill();

          // Core
          ctx.globalAlpha = 0.5;
          ctx.fillStyle = LAG_SPIKE_COLOR.core;
          ctx.beginPath();
          ctx.arc(0, 0, Math.min(hw, hh) * 0.3, 0, Math.PI * 2);
          ctx.fill();

          ctx.restore();
          break;
        }
      }
    }

    renderRafRef.current = requestAnimationFrame(renderFrame);
  }, []);

  // ── Resize handler ──
  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;

      const ctx = canvas.getContext('2d');
      if (ctx) ctx.scale(dpr, dpr);
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  // ── Start/stop render loop ──
  useEffect(() => {
    renderRafRef.current = requestAnimationFrame(renderFrame);
    return () => {
      if (renderRafRef.current !== null) {
        cancelAnimationFrame(renderRafRef.current);
      }
    };
  }, [renderFrame]);

  // ── Tap handler — normalized coords → store.tap() ──
  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    // Instant tap detection — score updates synchronously
    gameStore.getState().tap(x, y);
  }, []);

  return (
    <div
      ref={containerRef}
      id="game-canvas-container"
      className="absolute inset-0 w-full h-full"
    >
      <canvas
        ref={canvasRef}
        id="game-canvas"
        className="absolute inset-0 touch-none"
        onPointerDown={handlePointerDown}
        style={{
          filter: glitchIntensity > 0
            ? `hue-rotate(${glitchIntensity * 60}deg) saturate(${1 + glitchIntensity * 0.5})`
            : undefined,
        }}
      />
    </div>
  );
}
