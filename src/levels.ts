// Levelling (decisions 14, 14c, 14d), pure logic with no DOM or storage.
// Each prep position climbs a ladder of spaced reviews; staged lines unlock one after another;
// a clean real game marks a line Proven.
import { Chess } from 'chess.js';
import type { Opening, Stage } from './data/openings';
import { ladderKey } from './data/prep';
import type { ImportedGame } from './import/pgn';
import { walkPrep } from './review/review';

const uciOf = (m: { from: string; to: string; promotion?: string }) => m.from + m.to + (m.promotion ?? '');

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
/** Ladder key (position + prescribed move) to its rung. A key missing here has not been learned yet. */
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
    const fen = chess.fen();
    const m = chess.move(san);
    if (m.color === side) keys.push(ladderKey(fen, uciOf(m)));
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
 *  line's moves, including at least one the opening's other lines don't have (a shared prefix proves
 *  nothing). Positions, not move order, so a transposition still counts. */
export function provenStage(sans: string[], opening: Opening): Stage | null {
  const walk = walkPrep(sans, opening);
  if (walk.leftBy === 'student') return null;
  const chess = new Chess();
  const played = new Set<string>();
  for (const san of sans.slice(0, walk.lastPrepPly + 1)) {
    const fen = chess.fen();
    const m = chess.move(san);
    if (m.color === opening.side) played.add(ladderKey(fen, uciOf(m)));
  }
  const all = opening.stages.map((stage) => stageKeys(stage, opening.side));
  let best: Stage | null = null;
  let most = 0;
  for (const [i, stage] of opening.stages.entries()) {
    const keys = all[i];
    const hit = keys.filter((k) => played.has(k)).length;
    const own = keys.some((k) => played.has(k) && !all.some((other, j) => j !== i && other.includes(k)));
    // ponytail: "half the line" is a judgement call; raise it if openings that barely start count.
    if (own && hit * 2 >= keys.length && hit > most) { best = stage; most = hit; }
  }
  return best;
}

// ---- Battle record (decisions 5 and 14c): what real games did on each staged line ----------------

/** One reviewed real game that counts: the staged line it proved, and how it ended for the student. */
export interface GameRecord {
  stage: string;
  result: 'w' | 'd' | 'l';
}
/** Game key (see gameKey) to its entry. A game appears once however often it is reviewed. */
export type Games = Record<string, GameRecord>;
export interface Tally {
  w: number;
  d: number;
  l: number;
}

/** A stable id for one game, so reviewing it again replaces its entry instead of adding a second.
 *  A fetched game carries its web link. A paste or board entry only has a position in the list
 *  (paste-0), shared by every paste, so its key is built from what the game says about itself:
 *  date, players, result and every move. */
export const gameKey = (g: Pick<ImportedGame, 'url' | 'date' | 'white' | 'black' | 'result' | 'sans'>): string =>
  g.url ?? `game|${g.date}|${g.white}|${g.black}|${g.result}|${g.sans.join(' ')}`;

/** The entry a reviewed game earns, or null. It counts exactly when the review marks the line Proven
 *  (a real game, not a tie between openings, the student kept prep until it ended or the opponent
 *  left it) and the game is finished. The result is from the student's side. */
export function battleEntry(game: ImportedGame, opening: Opening): GameRecord | null {
  if (game.source === 'spar' || game.prepFrom === 'tie') return null;
  const white = game.result === '1-0', black = game.result === '0-1';
  if (!white && !black && game.result !== '1/2-1/2') return null;
  const stage = provenStage(game.sans, opening);
  if (!stage) return null;
  return { stage: stage.id, result: !white && !black ? 'd' : white === (game.side === 'w') ? 'w' : 'l' };
}

/** `games` with this game's entry set or replaced, or removed when it no longer counts. */
export function setGame(games: Games, key: string, entry: GameRecord | null): Games {
  const { [key]: _old, ...rest } = games;
  return entry ? { ...rest, [key]: entry } : rest;
}

/** Wins, draws and losses per staged line id. A line with no games has no entry. */
export function records(games: Games): Record<string, Tally> {
  const out: Record<string, Tally> = {};
  for (const { stage, result } of Object.values(games)) {
    out[stage] ??= { w: 0, d: 0, l: 0 };
    out[stage][result]++;
  }
  return out;
}

/** "2–0–1" (wins, draws, losses). */
export const recordText = (t: Tally) => `${t.w}–${t.d}–${t.l}`;

const count = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;
/** The spoken form of a record, for an accessible name. */
export const recordWords = (t: Tally) => `${count(t.w, 'win')}, ${count(t.d, 'draw')}, ${count(t.l, 'loss', 'losses')} in real games`;
