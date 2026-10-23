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

/** The one place raw stored or uploaded data becomes a `Saved`: junk fields fall back to empty. */
function sanitize(parsed: unknown): Saved {
  const p = parsed as Partial<Saved> | null;
  const n = Number(p?.correct);
  const learned = Array.isArray(p?.learned) ? p.learned.filter((k): k is string => typeof k === 'string') : [];
  return { correct: Number.isFinite(n) && n >= 0 ? Math.floor(n) : 0, learned };
}

export function loadSaved(store: Pick<Storage, 'getItem'> | undefined = safeStorage()): Saved {
  try {
    const raw = store?.getItem(STORAGE_KEY);
    return raw ? sanitize(JSON.parse(raw)) : { correct: 0, learned: [] };
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

// ---- Backup file (decision 3) ------------------------------------------------------------------
export const BACKUP_APP = 'off-book';
export const BACKUP_VERSION = 1;

export interface Backup {
  app: typeof BACKUP_APP;
  version: number;
  exportedAt: string;
  data: Saved;
}

export function exportBackup(data: Saved, now: Date = new Date()): Backup {
  return { app: BACKUP_APP, version: BACKUP_VERSION, exportedAt: now.toISOString(), data };
}

/** Checks an uploaded file's text. `reason` is plain words for the student. */
export function parseBackup(text: string): { ok: true; saved: Saved } | { ok: false; reason: string } {
  const no = (reason: string) => ({ ok: false as const, reason });
  let file: Partial<Backup> | null;
  try {
    file = JSON.parse(text);
  } catch {
    return no("That file isn't a readable backup. Pick a file made with Back up progress.");
  }
  if (!file || typeof file !== 'object' || file.app !== BACKUP_APP) return no("That file isn't an Off Book backup.");
  if (file.version !== BACKUP_VERSION) return no('That backup comes from a different version of Off Book, so it cannot be restored here.');
  const d = file.data as Partial<Saved> | null;
  if (!d || typeof d !== 'object') return no("That backup has no progress in it, so it wasn't restored.");
  if (typeof d.correct !== 'number' || !Number.isFinite(d.correct) || d.correct < 0) return no("That backup's move count isn't a valid number, so it wasn't restored.");
  if (!Array.isArray(d.learned) || !d.learned.every((k) => typeof k === 'string')) return no("That backup's list of learned moves is damaged, so it wasn't restored.");
  return { ok: true, saved: sanitize(d) };
}
