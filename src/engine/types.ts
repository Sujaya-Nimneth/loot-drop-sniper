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

export interface SupplyCrateEntity extends EntityBase {
  kind: 'supply-crate';
  pointValue: 10;
  rotation: number;
  rotationSpeed: number;
}

// ─── Lag Spike ───────────────────────────────────────────────────────────────

export interface LagSpikeEntity extends EntityBase {
  kind: 'lag-spike';
  pointValue: -15;
  glitchIntensity: number;
  pulsePhase: number;
}

/** Union of all entity types */
export type Entity = SupplyCrateEntity | LagSpikeEntity;

// ─── Tap Effect (consumed by UI for visual feedback) ─────────────────────────

export interface TapEffect {
  id: string;
  entityKind: EntityKind;
  points: number;
  /** Entity center X (normalized 0..1) */
  x: number;
  /** Entity center Y (normalized 0..1) */
  y: number;
}

// ─── Game State ──────────────────────────────────────────────────────────────

export interface GameState {
  phase: GamePhase;
  score: number;
  highScore: number;
  lives: number;
  maxLives: number;
  entities: Map<EntityId, Entity>;
  elapsedTime: number;
  speedMultiplier: number;
  spawnAccumulator: number;
  speedTier: number;
  glitchIntensity: number;
  /** Bumped each fixedTick — drives React re-renders for entity rendering */
  entityVersion: number;
  /** Pending visual effects from taps — consumed by the UI layer */
  tapEffects: TapEffect[];
}

// ─── Store Actions ───────────────────────────────────────────────────────────

export interface TickActions {
  fixedTick: () => void;
  spawnEntity: () => void;
  cleanupDead: () => void;
}

export interface UIActions {
  startGame: () => void;
  pauseGame: () => void;
  resumeGame: () => void;
  endGame: () => void;
  resetGame: () => void;
  tap: (x: number, y: number) => void;
  /** Clear processed tap effects */
  consumeTapEffects: () => void;
}

export type GameStore = GameState & TickActions & UIActions;
