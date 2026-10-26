// Device-only progress (decision 3). Every read and write is guarded: storage can be blocked or full.
import { OPENINGS } from './data/openings';
import { ladderKey } from './data/prep';
import type { Games, Ladder } from './levels';

export const STORAGE_KEY = 'offbook.v1';

export interface Saved {
  /** Prep position (posKey) to its rung on the review ladder (decision 14c). Missing means not learned. */
  ladder: Ladder;
  /** Staged lines (Stage.id) a clean real game has proven. */
  proven: string[];
  /** Reviewed real games that count toward a line's battle record, by game key (decisions 5 and 14c). */
  games: Games;
}

const empty = (): Saved => ({ ladder: {}, proven: [], games: {} });

export function safeStorage(): Storage | undefined {
  try {
    return globalThis.localStorage;
  } catch {
    return undefined;
  }
}

/** The drill's last-picked opening, kept apart from `Saved` so the progress and backup formats don't change. */
export const OPENING_KEY = 'offbook.opening';

export function loadOpening(store: Pick<Storage, 'getItem'> | undefined = safeStorage()): string | null {
  try {
    return store?.getItem(OPENING_KEY) ?? null;
  } catch {
    return null;
  }
}

export function saveOpening(id: string, store: Pick<Storage, 'setItem'> | undefined = safeStorage()): boolean {
  try {
    if (!store) return false;
    store.setItem(OPENING_KEY, id);
    return true;
  } catch {
    return false;
  }
}

/** Before ladder keys carried the prescribed move (backup version 3), a key was a bare posKey of four
 *  fields. Only the London and the Caro-Kann existed then, so their trees say which move each meant.
 *  A legacy key in neither tree is dropped. Keys of any other shape pass through, so this is idempotent. */
function migrate(ladder: Ladder): Ladder {
  const legacy = OPENINGS.filter((o) => o.id === 'london' || o.id === 'caro-kann');
  const out: Ladder = {};
  for (const [k, r] of Object.entries(ladder)) {
    let key = k;
    if (k.split(' ').length === 4) {
      const prep = legacy.map((o) => o.tree.get(k)).find(Boolean);
      if (!prep) continue;
      key = ladderKey(k, prep.uci);
    }
    // ponytail: a legacy and a current key meeting at one key keeps the higher level; nothing sums them.
    if (!out[key] || out[key].level < r.level) out[key] = r;
  }
  return out;
}

/** The one place raw stored or uploaded data becomes a `Saved`: junk fields fall back to empty.
 *  The first format ({ correct, learned }) carries over: learned moves start the ladder, due now.
 *  Legacy four-field ladder keys are migrated (see migrate). */
function sanitize(parsed: unknown): Saved {
  const p = parsed as { ladder?: unknown; proven?: unknown; learned?: unknown; games?: unknown } | null;
  const ladder: Ladder = {};
  if (p?.ladder && typeof p.ladder === 'object') {
    for (const [k, r] of Object.entries(p.ladder as Record<string, { level?: unknown; due?: unknown }>)) {
      const level = Number(r?.level), due = Number(r?.due);
      if (Number.isInteger(level) && level >= 0 && Number.isFinite(due)) ladder[k] = { level, due };
    }
  } else if (Array.isArray(p?.learned)) {
    for (const k of p.learned) if (typeof k === 'string') ladder[k] = { level: 0, due: 0 };
  }
  const proven = Array.isArray(p?.proven) ? p.proven.filter((k): k is string => typeof k === 'string') : [];
  // Older saves and backups have no games: they restore with empty records.
  const games: Games = {};
  if (p?.games && typeof p.games === 'object' && !Array.isArray(p.games)) {
    for (const [k, g] of Object.entries(p.games as Record<string, { stage?: unknown; result?: unknown } | null>)) {
      if (typeof g?.stage === 'string' && (g.result === 'w' || g.result === 'd' || g.result === 'l')) games[k] = { stage: g.stage, result: g.result };
    }
  }
  return { ladder: migrate(ladder), proven, games };
}

export function loadSaved(store: Pick<Storage, 'getItem'> | undefined = safeStorage()): Saved {
  try {
    const raw = store?.getItem(STORAGE_KEY);
    return raw ? sanitize(JSON.parse(raw)) : empty();
  } catch {
    return empty();
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

// ---- Backup file (decision 3) ------------------------------------------------------------------
export const BACKUP_APP = 'off-book';
export const BACKUP_VERSION = 3;

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
  // Version 1 files ({ correct, learned }) and version 2 files (bare-position ladder keys) still restore; sanitize carries them over.
  if (file.version !== BACKUP_VERSION && file.version !== 2 && file.version !== 1) return no('That backup comes from a different version of Off Book, so it cannot be restored here.');
  const d = file.data as { ladder?: unknown; learned?: unknown } | null;
  if (!d || typeof d !== 'object') return no("That backup has no progress in it, so it wasn't restored.");
  const moves = file.version === 1 ? Array.isArray(d.learned) && d.learned.every((k) => typeof k === 'string') : !!d.ladder && typeof d.ladder === 'object';
  if (!moves) return no("That backup's list of learned moves is damaged, so it wasn't restored.");
  return { ok: true, saved: sanitize(d) };
}
