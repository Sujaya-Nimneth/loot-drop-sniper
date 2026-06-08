// ─── Headless Zustand Game Store ─────────────────────────────────────────────
// Zero React imports. Fixed-step simulation with two entity types:
//   • Supply Crate (+10 pts on tap, -1 life if it hits the bottom)
//   • Lag Spike    (-15 pts on tap, harmless if it passes the bottom)
// Speed increases 5% every 30 seconds. Game starts with 3 lives.
// entityVersion bumped each tick to drive React re-renders for entity rendering.
// tapEffects queue consumed by the UI to trigger particles / screen-shake.

import { createStore } from 'zustand/vanilla';
import type {
  GameStore,
  GameState,
  SupplyCrateEntity,
  LagSpikeEntity,
  TapEffect,
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
    glitchIntensity: 0,
    entityVersion: 0,
    tapEffects: [],
  };
}

// ─── Store ───────────────────────────────────────────────────────────────────

export const gameStore = createStore<GameStore>()((set, get) => ({
  ...createInitialState(),

  // ═══════════════════════════════════════════════════════════════════════════
  // FIXED-STEP TICK  (called from rAF accumulator — outside React)
  // ═══════════════════════════════════════════════════════════════════════════

  fixedTick: () => {
    const state = get();
    if (state.phase !== 'playing') return;

    const dt = FIXED_TIMESTEP;
    const elapsedTime = state.elapsedTime + dt;

    // Speed ramp: +5% every 30 seconds
    const newTier = Math.floor(elapsedTime / SPEED_RAMP_INTERVAL);
    let speedMultiplier = state.speedMultiplier;
    if (newTier > state.speedTier) {
      speedMultiplier = 1.0 + newTier * SPEED_RAMP_FACTOR;
    }

    // Move entities
    let lives = state.lives;
    let glitchIntensity = 0;
    const entities = state.entities;

    for (const entity of entities.values()) {
      if (!entity.alive) continue;

      entity.y += entity.vy * speedMultiplier * dt;

      if (entity.kind === 'supply-crate') {
        (entity as SupplyCrateEntity).rotation += (entity as SupplyCrateEntity).rotationSpeed * dt;
      } else if (entity.kind === 'lag-spike') {
        const spike = entity as LagSpikeEntity;
        spike.pulsePhase += dt * 6;
        glitchIntensity = Math.max(glitchIntensity, spike.glitchIntensity * 0.3);
      }

      // Bottom-of-screen check
      if (entity.y > 1.05) {
        entity.alive = false;
        if (entity.kind === 'supply-crate') {
          lives = Math.max(0, lives - 1);
        }
      }
    }

    // Spawning
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

    // Cleanup dead
    get().cleanupDead();

    // Check game over
    if (lives <= 0) {
      set({
        lives: 0,
        elapsedTime,
        speedMultiplier,
        speedTier: newTier,
        spawnAccumulator,
        glitchIntensity,
        entityVersion: state.entityVersion + 1,
      });
      get().endGame();
      return;
    }

    // Commit (single set call — bumps entityVersion to drive React renders)
    set({
      elapsedTime,
      speedMultiplier,
      speedTier: newTier,
      spawnAccumulator,
      lives,
      glitchIntensity,
      entityVersion: state.entityVersion + 1,
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

  cleanupDead: () => {
    const entities = get().entities;
    for (const [id, entity] of entities) {
      if (!entity.alive) {
        entities.delete(id);
      }
    }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // LOW-FREQUENCY UI ACTIONS
  // ═══════════════════════════════════════════════════════════════════════════

  tap: (tapX: number, tapY: number) => {
    const state = get();
    if (state.phase !== 'playing') return;

    let hitEntity: SupplyCrateEntity | LagSpikeEntity | null = null;

    for (const entity of state.entities.values()) {
      if (!entity.alive) continue;

      const left = entity.x - TAP_HIT_PADDING;
      const right = entity.x + entity.width + TAP_HIT_PADDING;
      const top = entity.y - TAP_HIT_PADDING;
      const bottom = entity.y + entity.height + TAP_HIT_PADDING;

      if (tapX >= left && tapX <= right && tapY >= top && tapY <= bottom) {
        hitEntity = entity;
      }
    }

    if (!hitEntity) return;

    // Destroy the entity
    hitEntity.alive = false;

    // Build tap effect for visual feedback
    const effect: TapEffect = {
      id: uid(),
      entityKind: hitEntity.kind,
      points: hitEntity.pointValue,
      x: hitEntity.x + hitEntity.width / 2,
      y: hitEntity.y + hitEntity.height / 2,
    };

    // Update score instantly + push effect
    const newScore = Math.max(0, state.score + hitEntity.pointValue);

    set({
      score: newScore,
      tapEffects: [...state.tapEffects, effect],
    });
  },

  consumeTapEffects: () => {
    set({ tapEffects: [] });
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

// Debug: expose in dev
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).__gameStore = gameStore;
}
