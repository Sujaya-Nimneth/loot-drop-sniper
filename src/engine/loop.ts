// ─── Fixed-Step requestAnimationFrame Game Loop ──────────────────────────────
// Uses a time accumulator to ensure the simulation advances in fixed increments
// of FIXED_TIMESTEP, regardless of actual frame rate. This produces
// deterministic physics independent of display refresh rate.
//
// Runs entirely outside React. Auto-starts/stops on phase transitions.

import { gameStore } from './store';
import { FIXED_TIMESTEP, MAX_ACCUMULATOR } from './constants';

let rafId: number | null = null;
let lastTimestamp: number | null = null;
let accumulator = 0;

/**
 * Core frame callback.
 *
 * Each rAF frame:
 *  1. Compute wall-clock delta since last frame
 *  2. Add delta to accumulator
 *  3. Drain accumulator in fixed FIXED_TIMESTEP increments → fixedTick()
 *  4. Schedule next frame
 */
function frame(timestamp: number): void {
  if (lastTimestamp === null) {
    lastTimestamp = timestamp;
  }

  const rawDt = (timestamp - lastTimestamp) / 1000; // ms → seconds
  lastTimestamp = timestamp;

  // Clamp accumulator to prevent spiral of death (e.g., after tab switch)
  accumulator = Math.min(accumulator + rawDt, MAX_ACCUMULATOR);

  const state = gameStore.getState();

  // Drain the accumulator in fixed steps
  if (state.phase === 'playing') {
    while (accumulator >= FIXED_TIMESTEP) {
      state.fixedTick();
      accumulator -= FIXED_TIMESTEP;

      // Check if game ended during tick (lives hit 0)
      if (gameStore.getState().phase !== 'playing') break;
    }
  }

  // Keep looping while playing or paused
  const currentPhase = gameStore.getState().phase;
  if (currentPhase === 'playing' || currentPhase === 'paused') {
    rafId = requestAnimationFrame(frame);
  } else {
    rafId = null;
    lastTimestamp = null;
    accumulator = 0;
  }
}

/** Start the game loop — idempotent */
export function startLoop(): void {
  if (rafId !== null) return;
  lastTimestamp = null;
  accumulator = 0;
  rafId = requestAnimationFrame(frame);
}

/** Stop the game loop immediately */
export function stopLoop(): void {
  if (rafId !== null) {
    cancelAnimationFrame(rafId);
    rafId = null;
    lastTimestamp = null;
    accumulator = 0;
  }
}

/** Is the loop currently active? */
export function isLoopRunning(): boolean {
  return rafId !== null;
}

// ─── Auto-start/stop based on phase changes ─────────────────────────────────

gameStore.subscribe((state, prevState) => {
  if (state.phase === prevState.phase) return;

  switch (state.phase) {
    case 'playing':
      startLoop();
      break;
    case 'over':
    case 'menu':
      stopLoop();
      break;
    // 'paused' keeps rAF alive but fixedTick() is skipped
  }
});
