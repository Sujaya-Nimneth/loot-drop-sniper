// ─── Game Constants ──────────────────────────────────────────────────────────
// All tunable physics and gameplay parameters in one place.

// ─── Fixed-Step Simulation ───────────────────────────────────────────────────

/** Fixed timestep in seconds (1/60 ≈ 16.67ms) — one simulation step */
export const FIXED_TIMESTEP = 1 / 60;

/** Maximum accumulated time before we clamp (prevents spiral of death on tab-switch) */
export const MAX_ACCUMULATOR = FIXED_TIMESTEP * 5; // ≈5 frames

// ─── Lives ───────────────────────────────────────────────────────────────────

/** Starting lives */
export const INITIAL_LIVES = 3;

// ─── Scoring ─────────────────────────────────────────────────────────────────

/** Points awarded for tapping a Supply Crate */
export const SUPPLY_CRATE_POINTS = 10 as const;

/** Points deducted for tapping a Lag Spike (stored as negative) */
export const LAG_SPIKE_POINTS = -15 as const;

// ─── Entity Sizes (normalized 0..1) ─────────────────────────────────────────

export const SUPPLY_CRATE_WIDTH = 0.10;
export const SUPPLY_CRATE_HEIGHT = 0.07;

export const LAG_SPIKE_WIDTH = 0.08;
export const LAG_SPIKE_HEIGHT = 0.06;

// ─── Falling Speed ──────────────────────────────────────────────────────────

/** Baseline fall speed (normalized units per second) */
export const BASE_FALL_SPEED = 0.13;

/** Speed increases by this factor (5%) every SPEED_RAMP_INTERVAL seconds */
export const SPEED_RAMP_FACTOR = 0.05;

/** Seconds between each speed increase */
export const SPEED_RAMP_INTERVAL = 30;

// ─── Spawning ────────────────────────────────────────────────────────────────

/** Base interval between entity spawns (seconds) */
export const SPAWN_INTERVAL = 1.4;

/** Minimum spawn interval floor (seconds) */
export const MIN_SPAWN_INTERVAL = 0.5;

/** Spawn interval decreases by this amount per speed tier */
export const SPAWN_INTERVAL_DECAY = 0.08;

/** Probability that a spawned entity is a Lag Spike (vs Supply Crate) */
export const LAG_SPIKE_SPAWN_CHANCE = 0.28;

/** Horizontal padding — entities spawn within [padding, 1-padding] */
export const SPAWN_X_PADDING = 0.08;

// ─── Tap Detection ──────────────────────────────────────────────────────────

/**
 * Extra radius around entity hit-box for tap detection (normalized).
 * Makes tapping on mobile feel more forgiving.
 */
export const TAP_HIT_PADDING = 0.02;

// ─── Visual Constants ────────────────────────────────────────────────────────

export const SUPPLY_CRATE_COLOR = {
  primary: '#22d3ee',   // cyan-400
  glow: '#67e8f9',      // cyan-300
  face: '#0e7490',      // cyan-700
} as const;

export const LAG_SPIKE_COLOR = {
  primary: '#ef4444',   // red-500
  glow: '#f87171',      // red-400
  core: '#991b1b',      // red-800
} as const;
