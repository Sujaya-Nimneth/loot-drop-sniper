// ─── Local Storage Leaderboard ───────────────────────────────────────────────
// Tracks top 5 all-time scores. Persists across page reloads via localStorage.

export interface LeaderboardEntry {
  name: string;
  score: number;
  date: string;       // ISO 8601
  phone?: string;
  email?: string;
}

const STORAGE_KEY = 'loot-drop-sniper-leaderboard';
const MAX_ENTRIES = 5;

// ─── Read ────────────────────────────────────────────────────────────────────

export function loadLeaderboard(): LeaderboardEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as LeaderboardEntry[];
  } catch {
    return [];
  }
}

// ─── Write ───────────────────────────────────────────────────────────────────

function persistLeaderboard(entries: LeaderboardEntry[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // localStorage full or unavailable — fail silently
  }
}

/**
 * Add a new entry to the leaderboard. Returns the updated top-5 list.
 * Only stores if the score qualifies (better than the 5th place or fewer
 * than 5 entries exist).
 */
export function addToLeaderboard(entry: Omit<LeaderboardEntry, 'date'>): LeaderboardEntry[] {
  const entries = loadLeaderboard();

  const newEntry: LeaderboardEntry = {
    ...entry,
    date: new Date().toISOString(),
  };

  entries.push(newEntry);
  entries.sort((a, b) => b.score - a.score);
  const top = entries.slice(0, MAX_ENTRIES);
  persistLeaderboard(top);
  return top;
}

/**
 * Get the all-time high score from the leaderboard.
 * Returns 0 if the leaderboard is empty.
 */
export function getStoredHighScore(): number {
  const entries = loadLeaderboard();
  return entries.length > 0 ? entries[0].score : 0;
}

/**
 * Check if a score qualifies for the leaderboard.
 */
export function qualifiesForLeaderboard(score: number): boolean {
  const entries = loadLeaderboard();
  if (entries.length < MAX_ENTRIES) return score > 0;
  return score > entries[entries.length - 1].score;
}
