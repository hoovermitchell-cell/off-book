// Device-only progress (decision 3). Every read and write is guarded: storage can be blocked or full.
export const STORAGE_KEY = 'offbook.v1';
/** Correct first-try prep moves needed per level. */
export const REPS_PER_LEVEL = 10;

export interface Saved {
  /** Lifetime count of prep moves played correctly on the first try. */
  correct: number;
  /** Prep positions (posKey) the student has been shown and played (decision 13). */
  learned: string[];
}

function safeStorage(): Storage | undefined {
  try {
    return globalThis.localStorage;
  } catch {
    return undefined;
  }
}

export function loadSaved(store: Pick<Storage, 'getItem'> | undefined = safeStorage()): Saved {
  try {
    const raw = store?.getItem(STORAGE_KEY);
    if (!raw) return { correct: 0, learned: [] };
    const parsed = JSON.parse(raw) as Partial<Saved> | null;
    const n = Number(parsed?.correct);
    const learned = Array.isArray(parsed?.learned) ? parsed.learned.filter((k): k is string => typeof k === 'string') : [];
    return { correct: Number.isFinite(n) && n >= 0 ? Math.floor(n) : 0, learned };
  } catch {
    return { correct: 0, learned: [] };
  }
}

export function save(data: Saved, store: Pick<Storage, 'setItem'> | undefined = safeStorage()): boolean {
  try {
    if (!store) return false;
    store.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch {
    return false;
  }
}

/** Applies `fn` to the latest saved progress, not a stale copy, so two open tabs don't erase each
 *  other's gains. `ok` is false when the browser won't store anything (private window, blocked). */
export function updateSaved(
  fn: (latest: Saved) => Saved,
  store: Pick<Storage, 'getItem' | 'setItem'> | undefined = safeStorage(),
): { saved: Saved; ok: boolean } {
  const saved = fn(loadSaved(store));
  return { saved, ok: save(saved, store) };
}

/** Level (from 1) and progress through it (0 to REPS_PER_LEVEL - 1) for a rep count. */
export function levelOf(correct: number): { level: number; progress: number } {
  return { level: Math.floor(correct / REPS_PER_LEVEL) + 1, progress: correct % REPS_PER_LEVEL };
}
