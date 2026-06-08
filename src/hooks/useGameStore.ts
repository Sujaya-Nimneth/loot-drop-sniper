// ─── React Hooks for Zustand Game Store ──────────────────────────────────────

import { useStore } from 'zustand';
import { useShallow } from 'zustand/react/shallow';
import { gameStore } from '@/engine/store';
import type { GameStore, GamePhase, TapEffect } from '@/engine/types';

/** Subscribe to an arbitrary slice of the game store */
export function useGameStore<T>(selector: (state: GameStore) => T): T {
  return useStore(gameStore, selector);
}

/** Subscribe with shallow comparison (for object/array slices) */
export function useGameStoreShallow<T>(selector: (state: GameStore) => T): T {
  return useStore(gameStore, useShallow(selector));
}

// ─── Pre-built selectors ─────────────────────────────────────────────────────

export function useGamePhase(): GamePhase {
  return useStore(gameStore, (s) => s.phase);
}

export function useScoreInfo() {
  return useStore(
    gameStore,
    useShallow((s) => ({
      score: s.score,
      highScore: s.highScore,
    })),
  );
}

export function useLivesInfo() {
  return useStore(
    gameStore,
    useShallow((s) => ({
      lives: s.lives,
      maxLives: s.maxLives,
    })),
  );
}

export function useGlitchIntensity(): number {
  return useStore(gameStore, (s) => s.glitchIntensity);
}

export function useSpeedMultiplier(): number {
  return useStore(gameStore, (s) => s.speedMultiplier);
}

export function useElapsedTime(): number {
  return useStore(gameStore, (s) => s.elapsedTime);
}

export function useSpeedTier(): number {
  return useStore(gameStore, (s) => s.speedTier);
}

/** Entity version — subscribe to trigger re-renders when entities change */
export function useEntityVersion(): number {
  return useStore(gameStore, (s) => s.entityVersion);
}

/** Pending tap effects — triggers re-render when new effects arrive */
export function useTapEffects(): TapEffect[] {
  return useStore(gameStore, (s) => s.tapEffects);
}

/** Direct store access (no React subscription) */
export function getGameState() {
  return gameStore.getState();
}
