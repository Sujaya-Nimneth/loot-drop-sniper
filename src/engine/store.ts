// ─── Headless Zustand Game Store ─────────────────────────────────────────────
// Zero React imports. Fixed-step simulation with two entity types:
//   • Supply Crate (+10 pts on tap, -1 life if it hits the bottom)
//   • Lag Spike    (-15 pts on tap, harmless if it passes the bottom)
// Speed increases 5% every 30 seconds. Game starts with 3 lives.

import { createStore } from 'zustand/vanilla';
import type {
  GameStore,
  GameState,
  SupplyCrateEntity,
  LagSpikeEntity,
} from './types';
import {
  FIXED_TIMESTEP,
  INITIAL_LIVES,
  SUPPLY_CRATE_POINTS,
  LAG_SPIKE_POINTS,
  SUPPLY_CRATE_WIDTH,
  SUPPLY_CRATE_HEIGHT,
  LAG_SPIKE_WIDTH,
  LAG_SPIKE_HEIGHT,
  BASE_FALL_SPEED,
  SPEED_RAMP_FACTOR,
  SPEED_RAMP_INTERVAL,
  SPAWN_INTERVAL,
  MIN_SPAWN_INTERVAL,
  SPAWN_INTERVAL_DECAY,
  LAG_SPIKE_SPAWN_CHANCE,
  SPAWN_X_PADDING,
  TAP_HIT_PADDING,
} from './constants';
import { uid, randomRange, clamp } from '@/lib/utils';

// ─── Initial State Factory ───────────────────────────────────────────────────

function createInitialState(): GameState {
  return {
    phase: 'menu',
    score: 0,
    highScore: 0,
    lives: INITIAL_LIVES,
    maxLives: INITIAL_LIVES,
    entities: new Map(),
    elapsedTime: 0,
    speedMultiplier: 1.0,
    spawnAccumulator: 0,
    speedTier: 0,
    lastTappedId: null,
    lastTapPoints: 0,
    glitchIntensity: 0,
  };
}

// ─── Store ───────────────────────────────────────────────────────────────────

export const gameStore = createStore<GameStore>()((set, get) => ({
  ...createInitialState(),

  // ═══════════════════════════════════════════════════════════════════════════
  // FIXED-STEP TICK  (called from rAF accumulator — outside React)
  // Each call advances the simulation by exactly FIXED_TIMESTEP seconds.
  // ═══════════════════════════════════════════════════════════════════════════

  fixedTick: () => {
    const state = get();
    if (state.phase !== 'playing') return;

    const dt = FIXED_TIMESTEP;

    // ── Advance clock ──
    const elapsedTime = state.elapsedTime + dt;

    // ── Speed ramp: +5% every 30 seconds ──
    const newTier = Math.floor(elapsedTime / SPEED_RAMP_INTERVAL);
    let speedMultiplier = state.speedMultiplier;
    if (newTier > state.speedTier) {
      speedMultiplier = 1.0 + newTier * SPEED_RAMP_FACTOR;
    }

    // ── Move entities ──
    let lives = state.lives;
    let glitchIntensity = 0;
    const entities = state.entities;

    for (const entity of entities.values()) {
      if (!entity.alive) continue;

      // Apply velocity with current speed multiplier
      entity.y += entity.vy * speedMultiplier * dt;

      // Entity-specific updates
      if (entity.kind === 'supply-crate') {
        const crate = entity as SupplyCrateEntity;
        crate.rotation += crate.rotationSpeed * dt;
      } else if (entity.kind === 'lag-spike') {
        const spike = entity as LagSpikeEntity;
        spike.pulsePhase += dt * 6; // oscillate ~1Hz
        glitchIntensity = Math.max(glitchIntensity, spike.glitchIntensity * 0.3);
      }

      // ── Bottom-of-screen check ──
      if (entity.y > 1.05) {
        entity.alive = false;

        if (entity.kind === 'supply-crate') {
          // Missed supply crate → lose 1 life
          lives = Math.max(0, lives - 1);
        }
        // Lag spikes that fall off-screen → no penalty (dodged successfully)
      }
    }

    // ── Spawning ──
    const currentSpawnInterval = clamp(
      SPAWN_INTERVAL - state.speedTier * SPAWN_INTERVAL_DECAY,
      MIN_SPAWN_INTERVAL,
      SPAWN_INTERVAL,
    );
    let spawnAccumulator = state.spawnAccumulator + dt;
    if (spawnAccumulator >= currentSpawnInterval) {
      spawnAccumulator -= currentSpawnInterval;
      get().spawnEntity();
    }

    // ── Cleanup dead ──
    get().cleanupDead();

    // ── Check game over ──
    if (lives <= 0) {
      set({
        lives: 0,
        elapsedTime,
        speedMultiplier,
        speedTier: newTier,
        spawnAccumulator,
        glitchIntensity,
        lastTappedId: null,
      });
      get().endGame();
      return;
    }

    // ── Commit (single set call) ──
    set({
      elapsedTime,
      speedMultiplier,
      speedTier: newTier,
      spawnAccumulator,
      lives,
      glitchIntensity,
      lastTappedId: null, // clear tap flash after one tick
    });
  },

  // ─── Entity Spawning ───────────────────────────────────────────────────────

  spawnEntity: () => {
    const state = get();
    const isLagSpike = Math.random() < LAG_SPIKE_SPAWN_CHANCE;

    if (isLagSpike) {
      const spike: LagSpikeEntity = {
        id: uid(),
        kind: 'lag-spike',
        x: randomRange(SPAWN_X_PADDING, 1 - SPAWN_X_PADDING - LAG_SPIKE_WIDTH),
        y: -LAG_SPIKE_HEIGHT,
        width: LAG_SPIKE_WIDTH,
        height: LAG_SPIKE_HEIGHT,
        vy: BASE_FALL_SPEED * randomRange(0.9, 1.2),
        pointValue: LAG_SPIKE_POINTS,
        glitchIntensity: randomRange(0.3, 0.8),
        pulsePhase: Math.random() * Math.PI * 2,
        alive: true,
      };
      state.entities.set(spike.id, spike);
    } else {
      const crate: SupplyCrateEntity = {
        id: uid(),
        kind: 'supply-crate',
        x: randomRange(SPAWN_X_PADDING, 1 - SPAWN_X_PADDING - SUPPLY_CRATE_WIDTH),
        y: -SUPPLY_CRATE_HEIGHT,
        width: SUPPLY_CRATE_WIDTH,
        height: SUPPLY_CRATE_HEIGHT,
        vy: BASE_FALL_SPEED * randomRange(0.85, 1.15),
        pointValue: SUPPLY_CRATE_POINTS,
        rotation: 0,
        rotationSpeed: randomRange(-90, 90),
        alive: true,
      };
      state.entities.set(crate.id, crate);
    }
  },

  // ─── Cleanup ───────────────────────────────────────────────────────────────

  cleanupDead: () => {
    const entities = get().entities;
    for (const [id, entity] of entities) {
      if (!entity.alive) {
        entities.delete(id);
      }
    }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // LOW-FREQUENCY UI ACTIONS (called from React event handlers)
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Tap at normalized (x, y). Hit-tests all alive entities.
   * - If a Supply Crate is hit: +10 points, entity destroyed.
   * - If a Lag Spike is hit: -15 points, entity destroyed.
   * - If nothing hit: no effect.
   * Score is updated synchronously (instant feedback).
   */
  tap: (tapX: number, tapY: number) => {
    const state = get();
    if (state.phase !== 'playing') return;

    // Find the first entity whose padded hit-box contains the tap point.
    // Iterate in reverse-spawn order so newer (top-most visually) entities
    // are checked first — prevents tapping "through" overlapping entities.
    let hitEntity: SupplyCrateEntity | LagSpikeEntity | null = null;

    for (const entity of state.entities.values()) {
      if (!entity.alive) continue;

      const left = entity.x - TAP_HIT_PADDING;
      const right = entity.x + entity.width + TAP_HIT_PADDING;
      const top = entity.y - TAP_HIT_PADDING;
      const bottom = entity.y + entity.height + TAP_HIT_PADDING;

      if (tapX >= left && tapX <= right && tapY >= top && tapY <= bottom) {
        hitEntity = entity;
        // Don't break — keep iterating to find the latest-spawned (last in Map)
      }
    }

    if (!hitEntity) return;

    // Destroy the entity
    hitEntity.alive = false;

    // Update score instantly
    const newScore = Math.max(0, state.score + hitEntity.pointValue);

    set({
      score: newScore,
      lastTappedId: hitEntity.id,
      lastTapPoints: hitEntity.pointValue,
    });
  },

  // ─── Phase Management ──────────────────────────────────────────────────────

  startGame: () => {
    const prevHighScore = get().highScore;
    set({
      ...createInitialState(),
      phase: 'playing',
      highScore: prevHighScore,
    });
  },

  pauseGame: () => {
    if (get().phase === 'playing') {
      set({ phase: 'paused' });
    }
  },

  resumeGame: () => {
    if (get().phase === 'paused') {
      set({ phase: 'playing' });
    }
  },

  endGame: () => {
    const state = get();
    set({
      phase: 'over',
      highScore: Math.max(state.highScore, state.score),
    });
  },

  resetGame: () => {
    const prevHighScore = get().highScore;
    set({
      ...createInitialState(),
      highScore: prevHighScore,
    });
  },
}));

// ─── Debug: expose store in dev ──────────────────────────────────────────────
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).__gameStore = gameStore;
}
