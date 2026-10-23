// The last imported games, kept on this device under their own key so they can be reopened
// offline (decision 3: nothing on a server). Guarded like storage.ts: storage can be blocked or full.
import { safeStorage } from '../storage';
import { detectPrep, guessSide, type GameSource, type ImportedGame } from './pgn';

export const RECENT_KEY = 'offbook.games.v1';

export interface RecentImport {
  source: GameSource;
  /** Username, or "pasted PGN". */
  label: string;
  /** Milliseconds since 1970. */
  at: number;
  games: ImportedGame[];
}

type Read = Pick<Storage, 'getItem'>;
type Write = Pick<Storage, 'setItem'>;

/** Saved games from before Black existed have no side or opening. Username imports were White's
 *  then; a pasted game gets the same guess as a fresh paste. The opening is always recomputed. */
function withPrep(g: ImportedGame): ImportedGame {
  const side = g.side === 'w' || g.side === 'b' ? g.side : g.source === 'paste' ? guessSide(g.sans) : 'w';
  return { ...g, side, prep: detectPrep(g.sans, side) };
}

export function loadRecent(store: Read | undefined = safeStorage()): RecentImport | null {
  try {
    const raw = store?.getItem(RECENT_KEY);
    const p = raw ? (JSON.parse(raw) as Partial<RecentImport> | null) : null;
    if (!p || typeof p.label !== 'string' || typeof p.at !== 'number' || !Array.isArray(p.games)) return null;
    const games = p.games.filter(
      (g): g is ImportedGame =>
        !!g && typeof g.white === 'string' && typeof g.black === 'string' && Array.isArray(g.sans) && g.sans.length > 0 && g.sans.every((s) => typeof s === 'string'),
    );
    return games.length ? { source: p.source ?? 'paste', label: p.label, at: p.at, games: games.map(withPrep) } : null;
  } catch {
    return null;
  }
}

export function saveRecent(r: RecentImport, store: Write | undefined = safeStorage()): boolean {
  try {
    if (!store) return false;
    store.setItem(RECENT_KEY, JSON.stringify(r));
    return true;
  } catch {
    return false;
  }
}
