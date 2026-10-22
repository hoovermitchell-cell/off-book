// Device-only progress (decision 3). Every read and write is guarded: storage can be blocked or full.
export const STORAGE_KEY = 'offbook.v1';
/** Correct first-try prep moves needed per level. */
export const REPS_PER_LEVEL = 10;

export interface Saved {
  /** Lifetime count of prep moves played correctly on the first try. */
  correct: number;
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
    if (!raw) return { correct: 0 };
    const parsed: unknown = JSON.parse(raw);
    const n = typeof parsed === 'object' && parsed !== null ? Number((parsed as Partial<Saved>).correct) : NaN;
    return { correct: Number.isFinite(n) && n >= 0 ? Math.floor(n) : 0 };
  } catch {
    return { correct: 0 };
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

/** Level (from 1) and progress through it (0 to REPS_PER_LEVEL - 1) for a rep count. */
export function levelOf(correct: number): { level: number; progress: number } {
  return { level: Math.floor(correct / REPS_PER_LEVEL) + 1, progress: correct % REPS_PER_LEVEL };
}
