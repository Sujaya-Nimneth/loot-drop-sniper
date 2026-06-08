// ─── Shared Utility Functions ────────────────────────────────────────────────

/** Clamp a value between min and max */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/** Linear interpolation between a and b by factor t (0..1) */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/** Random float in [min, max) */
export function randomRange(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

/** Random integer in [min, max] inclusive */
export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** Generate a short unique ID (for entity IDs — not cryptographic) */
let idCounter = 0;
export function uid(): string {
  return `e${Date.now().toString(36)}-${(idCounter++).toString(36)}`;
}

/** Weighted random selection from a record of { key: weight } */
export function weightedRandom<T extends string>(weights: Record<T, number>): T {
  const entries = Object.entries(weights) as [T, number][];
  const total = entries.reduce((sum, [, w]) => sum + (w as number), 0);
  let roll = Math.random() * total;
  for (const [key, weight] of entries) {
    roll -= weight as number;
    if (roll <= 0) return key;
  }
  return entries[entries.length - 1][0];
}

/** AABB collision test between two rectangles (all values normalized 0..1) */
export function aabbCollision(
  ax: number, ay: number, aw: number, ah: number,
  bx: number, by: number, bw: number, bh: number,
): boolean {
  return (
    ax < bx + bw &&
    ax + aw > bx &&
    ay < by + bh &&
    ay + ah > by
  );
}
