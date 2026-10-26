// Levelling (decisions 14, 14c, 14d), pure logic with no DOM or storage.
// Each prep position climbs a ladder of spaced reviews; staged lines unlock one after another;
// a clean real game marks a line Proven.
import { Chess } from 'chess.js';
import type { Opening, Stage } from './data/openings';
import { posKey } from './data/prep';
import { walkPrep } from './review/review';

const HOUR = 3_600_000;
const DAY = 24 * HOUR;
/** Wait before the next review, by level: a move at level k has passed k spaced reviews. */
export const RUNG_MS = [4 * HOUR, DAY, 3 * DAY, 7 * DAY];
/** Passed the 1-week review: the move is secure. Secure moves keep a weekly review. */
export const SECURE = RUNG_MS.length;
/** Passed the next-day review: enough to open the next staged line. */
export const UNLOCK = 2;

export interface Rung {
  level: number;
  /** Epoch ms when the next review is due. */
  due: number;
}
/** Position key to its rung. A position missing here has not been learned yet. */
export type Ladder = Record<string, Rung>;

const wait = (level: number) => RUNG_MS[Math.min(level, RUNG_MS.length - 1)];

/** A new prep move was shown and played (decision 13): level 0, first review in 4 hours. */
export const learn = (ladder: Ladder, key: string, now: number): Ladder =>
  ladder[key] ? ladder : { ...ladder, [key]: { level: 0, due: now + wait(0) } };

/** One answer at a learned position. Correct climbs a rung only when due; a miss drops one rung. */
export function review(ladder: Ladder, key: string, ok: boolean, now: number): { ladder: Ladder; from: number; to: number } {
  const r = ladder[key];
  if (!r) return { ladder, from: -1, to: -1 };
  if (ok && now < r.due) return { ladder, from: r.level, to: r.level };
  const to = ok ? Math.min(r.level + 1, SECURE) : Math.max(0, r.level - 1);
  // ponytail: a missed move comes back after the shortest wait whatever its level, so it is re-tested soon.
  const due = now + (ok ? wait(to) : wait(0));
  return { ladder: { ...ladder, [key]: { level: to, due } }, from: r.level, to };
}

/** The positions where the student moves along a staged line, in order. */
export function stageKeys(stage: Stage, side: 'w' | 'b'): string[] {
  const chess = new Chess();
  const keys: string[] = [];
  for (const san of stage.moves) {
    if (chess.turn() === side) keys.push(posKey(chess.fen()));
    chess.move(san);
  }
  return keys;
}

export type Status = 'locked' | 'learning' | 'cleared' | 'proven';

export interface StageView {
  stage: Stage;
  status: Status;
  /** Level per student move along the line; -1 for a move not learned yet. */
  levels: number[];
}

/** Every staged line of the opening with its status. Line n+1 opens once every move of line n is at UNLOCK. */
export function stageViews(opening: Opening, ladder: Ladder, proven: readonly string[]): StageView[] {
  let open = true;
  return opening.stages.map((stage) => {
    const levels = stageKeys(stage, opening.side).map((k) => ladder[k]?.level ?? -1);
    const status: Status = !open ? 'locked'
      : proven.includes(stage.id) ? 'proven'
      : levels.every((l) => l >= SECURE) ? 'cleared'
      : 'learning';
    if (open && !levels.every((l) => l >= UNLOCK)) open = false;
    return { stage, status, levels };
  });
}

/** The staged line to play this round: the first open line with a new or due move. null means
 *  nothing is waiting, so the round is free play against Maia. */
export function pickStage(opening: Opening, ladder: Ladder, proven: readonly string[], now: number): Stage | null {
  for (const v of stageViews(opening, ladder, proven)) {
    if (v.status === 'locked') break;
    if (stageKeys(v.stage, opening.side).some((k) => !ladder[k] || ladder[k].due <= now)) return v.stage;
  }
  return null;
}

/** Learned moves of the opening's open lines that are due now. */
export function dueNow(opening: Opening, ladder: Ladder, proven: readonly string[], now: number): number {
  const keys = new Set<string>();
  for (const v of stageViews(opening, ladder, proven)) {
    if (v.status === 'locked') break;
    for (const k of stageKeys(v.stage, opening.side)) if (ladder[k] && ladder[k].due <= now) keys.add(k);
  }
  return keys.size;
}

/** The staged line a real game proves, if any (decision 14c): the student played every prep move
 *  right until the opponent left book or the prep ran out, and the game covered at least half of the
 *  line's moves. Positions, not move order, so a transposition still counts. */
export function provenStage(sans: string[], opening: Opening): Stage | null {
  const walk = walkPrep(sans, opening);
  if (walk.leftBy === 'student') return null;
  const chess = new Chess();
  const played = new Set<string>();
  for (const [ply, san] of sans.slice(0, walk.lastPrepPly + 1).entries()) {
    if (ply % 2 === (opening.side === 'w' ? 0 : 1)) played.add(posKey(chess.fen()));
    chess.move(san);
  }
  let best: Stage | null = null;
  let most = 0;
  for (const stage of opening.stages) {
    const keys = stageKeys(stage, opening.side);
    const hit = keys.filter((k) => played.has(k)).length;
    // ponytail: "half the line" is a judgement call; raise it if openings that barely start count.
    if (hit * 2 >= keys.length && hit > most) { best = stage; most = hit; }
  }
  return best;
}
