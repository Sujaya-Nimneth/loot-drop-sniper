// ─── React Hooks for Zustand Game Store ──────────────────────────────────────
// Thin wrappers with shallow equality to prevent unnecessary re-renders.

import { useStore } from 'zustand';
import { useShallow } from 'zustand/react/shallow';
import { gameStore } from '@/engine/store';
import type { GameStore, GamePhase } from '@/engine/types';

// ─── Generic selector hook ───────────────────────────────────────────────────

/** Subscribe to an arbitrary slice of the game store */
export function useGameStore<T>(selector: (state: GameStore) => T): T {
  return useStore(gameStore, selector);
}

/** Subscribe with shallow comparison (for object/array slices) */
export function useGameStoreShallow<T>(selector: (state: GameStore) => T): T {
  return useStore(gameStore, useShallow(selector));
}

// ─── Pre-built selectors ─────────────────────────────────────────────────────

/** Current game phase — triggers re-render only on phase change */
export function useGamePhase(): GamePhase {
  return useStore(gameStore, (s) => s.phase);
}

/** Score info */
export function useScoreInfo() {
  return useStore(
    gameStore,
    useShallow((s) => ({
      score: s.score,
      highScore: s.highScore,
    })),
  );
}

/** Lives */
export function useLivesInfo() {
  return useStore(
    gameStore,
    useShallow((s) => ({
      lives: s.lives,
      maxLives: s.maxLives,
    })),
  );
}

/** Glitch intensity (for visual effects layer) */
export function useGlitchIntensity(): number {
  return useStore(gameStore, (s) => s.glitchIntensity);
}

/** Speed multiplier (for HUD display) */
export function useSpeedMultiplier(): number {
  return useStore(gameStore, (s) => s.speedMultiplier);
}

/** Elapsed game time */
export function useElapsedTime(): number {
  return useStore(gameStore, (s) => s.elapsedTime);
}

/** Speed tier (for difficulty indicator) */
export function useSpeedTier(): number {
  return useStore(gameStore, (s) => s.speedTier);
}

// ─── Direct store access (for non-React code or event handlers) ──────────────

export function getGameState() {
  return gameStore.getState();
}
