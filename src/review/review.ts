// Prep-boundary review (v1 scope item 5), pure logic with no DOM.
// The student is White. Walk the game against the London prep tree to find where prep ended and
// who left first, ask Stockfish what leaving cost, and pick one lesson. Wording lives in templates.ts.
import { Chess } from 'chess.js';
import { posKey, type PrepMove, type PrepTree } from '../data/london';
import { ideaFor } from '../data/london-ideas';
import { JUDGE_MS, MISTAKE, type Judgement } from '../drill/drill';

/** A drop this big gets `??` instead of `?`. Same split the drill screen uses for display. */
export const BLUNDER = 300;
/** White moves checked from the deviation onward. */
export const MAX_CHECKED = 10;

export interface PrepWalk {
  /** Who left prep first. null: the game ended while still in prep. */
  leftBy: 'student' | 'opponent' | null;
  /** Ply (0-based, both sides) of the last move still in prep. -1 when the first move already left it. */
  lastPrepPly: number;
  /** Ply of the first move out of prep: the student's own move, or Black's reply the tree doesn't cover. */
  deviationPly: number | null;
  /** The prep move the student should have played, when the student left. */
  prep: PrepMove | null;
}

const uciOf = (m: { from: string; to: string; promotion?: string }) => m.from + m.to + (m.promotion ?? '');

/** Walks the game against the tree. A White move is in prep when it is the tree's move at that
 *  position; a Black reply is in book when the position after it is still in the tree. */
export function walkPrep(sans: string[], tree: PrepTree): PrepWalk {
  const chess = new Chess();
  for (const [ply, san] of sans.entries()) {
    const white = ply % 2 === 0;
    const prep = white ? tree.get(posKey(chess.fen())) : undefined;
    const m = chess.move(san);
    if (white) {
      if (prep && prep.uci !== uciOf(m)) return { leftBy: 'student', lastPrepPly: ply - 1, deviationPly: ply, prep };
    } else if (!tree.has(posKey(chess.fen()))) {
      return { leftBy: 'opponent', lastPrepPly: ply - 1, deviationPly: ply, prep: null };
    }
  }
  return { leftBy: null, lastPrepPly: sans.length - 1, deviationPly: null, prep: null };
}

/** FEN after `plies` moves of the game. */
export function fenAt(sans: string[], plies: number): string {
  const chess = new Chess();
  sans.slice(0, plies).forEach((s) => chess.move(s));
  return chess.fen();
}

export interface MoveCheck {
  ply: number;
  san: string;
  /** Stockfish's score before the move (its best line) and after the move played. Centipawns, White's view. */
  before: number;
  after: number;
  best: string;
  bestUci: string;
  /** before - after. */
  loss: number;
  /** Set when the drop reaches MISTAKE and the move wasn't Stockfish's own choice. */
  glyph: '?' | '??' | null;
  /** The deviation move only: the score had the student played their prep move. */
  prepAfter?: number;
  depth?: number;
  nodes?: number;
}

export interface AnalyzeOptions {
  maxMoves?: number;
  ms?: number;
  /** Aborting rejects with the signal's reason. onProgress has already been called for finished moves. */
  signal?: AbortSignal;
  onProgress?: (done: number, total: number, check: MoveCheck | null) => void;
}

/** Score of a position the game could not continue from: checkmate by White, or a draw. */
const terminal = (chess: Chess): Judgement | null => (chess.isCheckmate() ? { cp: 100000, best: '' } : chess.isGameOver() ? { cp: 0, best: '' } : null);

/** Stockfish check of White's moves from the deviation onward, up to `maxMoves` of them.
 *  Nothing to check when the game stayed in prep. */
export async function analyze(
  sans: string[],
  walk: PrepWalk,
  engine: { evaluate(fen: string, ms: number): Promise<Judgement> },
  { maxMoves = MAX_CHECKED, ms = JUDGE_MS, signal, onProgress }: AnalyzeOptions = {},
): Promise<MoveCheck[]> {
  if (walk.deviationPly === null) return [];
  const first = walk.leftBy === 'student' ? walk.deviationPly : walk.deviationPly + 1;
  const plies: number[] = [];
  for (let p = first; p < sans.length && plies.length < maxMoves; p += 2) plies.push(p);

  const chess = new Chess();
  let at = 0;
  const checks: MoveCheck[] = [];
  onProgress?.(0, plies.length, null);
  for (const ply of plies) {
    while (at < ply) chess.move(sans[at++]);
    const beforeFen = chess.fen();
    const played = chess.move(sans[at++]);
    signal?.throwIfAborted();
    const a = await engine.evaluate(beforeFen, ms);
    signal?.throwIfAborted();
    const b = terminal(chess) ?? (await engine.evaluate(chess.fen(), ms));

    let prepAfter: number | undefined;
    if (walk.leftBy === 'student' && ply === walk.deviationPly && walk.prep) {
      signal?.throwIfAborted();
      const alt = new Chess(beforeFen);
      alt.move(walk.prep.san);
      prepAfter = (terminal(alt) ?? (await engine.evaluate(alt.fen(), ms))).cp;
    }

    const loss = a.cp - b.cp;
    const flagged = loss >= MISTAKE && a.best !== uciOf(played);
    let best = a.best;
    try {
      best = new Chess(beforeFen).move({ from: a.best.slice(0, 2), to: a.best.slice(2, 4), promotion: a.best[4] }).san;
    } catch {
      // Keep Stockfish's own notation if it can't be turned into SAN.
    }
    const check: MoveCheck = {
      ply, san: played.san, before: a.cp, after: b.cp, best, bestUci: a.best, loss,
      glyph: flagged ? (loss >= BLUNDER ? '??' : '?') : null, prepAfter, depth: a.depth, nodes: a.nodes,
    };
    checks.push(check);
    onProgress?.(checks.length, plies.length, check);
  }
  return checks;
}

export type Lesson =
  /** The student left prep: here is the move to learn, and what Stockfish made of the difference. */
  | { kind: 'deviation'; ply: number; played: string; prep: PrepMove; idea: string | null; check: MoveCheck | null }
  /** The opponent left first, and the student's first real mistake after that. */
  | { kind: 'mistake'; check: MoveCheck }
  | { kind: 'clean'; reason: 'in-prep' | 'no-mistake'; checked: number };

/** One lesson to revisit. `checks` may be empty (not run yet): a deviation still has its prep move. */
export function chooseLesson(sans: string[], walk: PrepWalk, checks: MoveCheck[]): Lesson {
  if (walk.leftBy === 'student' && walk.prep && walk.deviationPly !== null) {
    const idea = ideaFor(fenAt(sans, walk.deviationPly), walk.prep);
    return { kind: 'deviation', ply: walk.deviationPly, played: sans[walk.deviationPly], prep: walk.prep, idea, check: checks.find((c) => c.ply === walk.deviationPly) ?? null };
  }
  const mistake = checks.find((c) => c.glyph);
  if (mistake) return { kind: 'mistake', check: mistake };
  return { kind: 'clean', reason: walk.leftBy ? 'no-mistake' : 'in-prep', checked: checks.length };
}
