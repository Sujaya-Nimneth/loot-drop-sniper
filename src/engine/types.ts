// ─── Entity & Game State Types ───────────────────────────────────────────────
// Framework-agnostic — zero React imports in /engine.
// Two falling entity types: Supply Crate (+10 pts) and Lag Spike (-15 pts).

/** Unique identifier for every spawned entity */
export type EntityId = string;

/** Discriminated union tag — exactly two falling entity types */
export type EntityKind = 'supply-crate' | 'lag-spike';

/** Phase state-machine for the entire game session */
export type GamePhase = 'menu' | 'playing' | 'paused' | 'over';

// ─── Base Entity ─────────────────────────────────────────────────────────────

export interface EntityBase {
  id: EntityId;
  kind: EntityKind;
  x: number;       // normalized 0..1 across viewport width
  y: number;       // normalized 0..1 across viewport height (0 = top)
  width: number;   // normalized hit-box size
  height: number;  // normalized hit-box size
  vy: number;      // vertical velocity (positive = downward, normalized units/s)
  alive: boolean;
}

// ─── Supply Crate ────────────────────────────────────────────────────────────
// Tapping a Supply Crate awards +10 points.
// If it reaches the bottom of the screen un-tapped, the player loses 1 life.

export interface SupplyCrateEntity extends EntityBase {
  kind: 'supply-crate';
  /** Points awarded when tapped */
  pointValue: 10;
  /** Visual rotation angle in degrees (cosmetic) */
  rotation: number;
  rotationSpeed: number;
}

// ─── Lag Spike ───────────────────────────────────────────────────────────────
// Tapping a Lag Spike penalises -15 points.
// If it reaches the bottom un-tapped, nothing happens (it's a trap entity).

export interface LagSpikeEntity extends EntityBase {
  kind: 'lag-spike';
  /** Points deducted when tapped (negative) */
  pointValue: -15;
  /** Glitch intensity for visual effects (0..1) */
  glitchIntensity: number;
  /** Pulsation phase — drives a sine-wave size oscillation (cosmetic) */
  pulsePhase: number;
}

/** Union of all entity types */
export type Entity = SupplyCrateEntity | LagSpikeEntity;

// ─── Game State ──────────────────────────────────────────────────────────────

export interface GameState {
  phase: GamePhase;
  score: number;
  highScore: number;
  lives: number;
  maxLives: number;
  entities: Map<EntityId, Entity>;
  /** Total game time in seconds */
  elapsedTime: number;
  /** Current fall speed multiplier (increases 5% every 30s) */
  speedMultiplier: number;
  /** Accumulator for spawn timing */
  spawnAccumulator: number;
  /** Number of completed 30-second speed-ramp intervals */
  speedTier: number;
  /** Flash feedback: entity ID that was just tapped (cleared next tick) */
  lastTappedId: EntityId | null;
  /** Flash feedback: points from last tap (for floating score popup) */
  lastTapPoints: number;
  /** Screen-shake / glitch intensity driven by active lag spikes */
  glitchIntensity: number;
}

// ─── Store Actions ───────────────────────────────────────────────────────────

export interface TickActions {
  /** Advance simulation by one fixed timestep */
  fixedTick: () => void;
  /** Spawn a new entity (called by fixedTick based on accumulator) */
  spawnEntity: () => void;
  /** Remove dead entities from the map */
  cleanupDead: () => void;
}

export interface UIActions {
  startGame: () => void;
  pauseGame: () => void;
  resumeGame: () => void;
  endGame: () => void;
  resetGame: () => void;
  /** Tap at normalized (x, y) — hit-tests all alive entities, updates score instantly */
  tap: (x: number, y: number) => void;
}

export type GameStore = GameState & TickActions & UIActions;
