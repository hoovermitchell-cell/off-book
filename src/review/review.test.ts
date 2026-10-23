import { Chess } from 'chess.js';
import { describe, expect, it } from 'vitest';
import { buildTree, posKey } from '../data/london';
import type { Judgement } from '../drill/drill';
import { analyze, BLUNDER, chooseLesson, fenAt, walkPrep, type PrepWalk } from './review';
import { boundaryText, fmtEval, lessonText, stepText } from './templates';

const tree = buildTree();
const game = (line: string) => line.split(' ');

/** An engine that answers from a script, in call order, and records what it was asked. */
function scripted(answers: Judgement[]) {
  const asked: string[] = [];
  return { asked, evaluate: async (fen: string) => { asked.push(fen); const a = answers.shift(); if (!a) throw new Error('unscripted evaluation'); return a; } };
}

/** First legal Black reply to `line` that the tree doesn't cover. */
function uncoveredReply(line: string): string {
  const c = new Chess();
  game(line).forEach((m) => c.move(m));
  const found = c.moves().find((san) => { const t = new Chess(c.fen()); t.move(san); return !tree.has(posKey(t.fen())); });
  if (!found) throw new Error('every reply is covered');
  return found;
}

describe('walkPrep', () => {
  it('a game that follows the textbook line stays in prep', () => {
    const sans = game('d4 d5 Bf4 Nf6 e3 e6 Nf3 c5 c3 Nc6 Nbd2 Bd6 Bg3 O-O Bd3');
    expect(walkPrep(sans, tree)).toEqual({ leftBy: null, lastPrepPly: 14, deviationPly: null, prep: null });
  });

  it('the student leaving prep: 3.Nc3 instead of 3.e3', () => {
    const sans = game('d4 d5 Bf4 Nf6 Nc3 e6');
    const w = walkPrep(sans, tree);
    expect(w).toMatchObject({ leftBy: 'student', lastPrepPly: 3, deviationPly: 4 });
    expect(w.prep?.san).toBe('e3');
  });

  it('the student leaving prep with the very first move', () => {
    const w = walkPrep(game('e4 e5'), tree);
    expect(w).toMatchObject({ leftBy: 'student', lastPrepPly: -1, deviationPly: 0 });
    expect(w.prep?.san).toBe('d4');
  });

  it('the opponent leaving book: a Black reply the tree does not cover', () => {
    const reply = uncoveredReply('d4 d5 Bf4');
    const w = walkPrep(game(`d4 d5 Bf4 ${reply} e3 e6`), tree);
    expect(w).toEqual({ leftBy: 'opponent', lastPrepPly: 2, deviationPly: 3, prep: null });
  });

  it('a transposition into prep still counts as prep', () => {
    // 1.d4 Nf6 2.Bf4 d5 3.e3 is in the tree, and so is the same position reached via 1...d5 2.Bf4 Nf6.
    expect(walkPrep(game('d4 d5 Bf4 Nf6 e3'), tree).leftBy).toBeNull();
    expect(walkPrep(game('d4 Nf6 Bf4 d5 e3'), tree).leftBy).toBeNull();
  });
});

describe('analyze', () => {
  it('checks nothing when the game stayed in prep', async () => {
    const sans = game('d4 d5 Bf4 Nf6 e3');
    const engine = scripted([]);
    expect(await analyze(sans, walkPrep(sans, tree), engine)).toEqual([]);
    expect(engine.asked).toHaveLength(0);
  });

  it('flags a student deviation that cost, with the prep move as the yardstick', async () => {
    const sans = game('d4 d5 Bf4 Nf6 Nc3 e6');
    const walk = walkPrep(sans, tree);
    // before 3.Nc3: best is e3 at +0.20; after Nc3 -1.50; had they played e3: +0.20
    const engine = scripted([{ cp: 20, best: 'e2e3', depth: 14, nodes: 9000 }, { cp: -150, best: 'e7e6' }, { cp: 20, best: 'e7e6' }]);
    const checks = await analyze(sans, walk, engine);
    expect(checks).toHaveLength(1);
    expect(checks[0]).toMatchObject({ ply: 4, san: 'Nc3', best: 'e3', loss: 170, glyph: '?', prepAfter: 20, depth: 14, nodes: 9000 });

    const lesson = chooseLesson(sans, walk, checks);
    expect(lesson).toMatchObject({ kind: 'deviation', ply: 4, played: 'Nc3' });
    if (lesson.kind !== 'deviation') throw new Error();
    expect(lesson.prep.san).toBe('e3');
    expect(lesson.idea).toMatch(/e3 backs up d4/);
    const t = lessonText(lesson);
    expect(t).toMatchObject({ g: '?', cls: 'mistake' });
    expect(t.head).toBe('3. Nc3. Your prep move was 3. e3.');
    expect(t.num).toBe('e3 +0.2, Nc3 -1.5');
    expect(t.body).toMatch(/1\.7 lower than e3/);
  });

  it('a deviation that was playable says so and shows the gap', async () => {
    const sans = game('d4 d5 Bf4 Nf6 Nc3');
    const walk = walkPrep(sans, tree);
    const checks = await analyze(sans, walk, scripted([{ cp: 20, best: 'e2e3' }, { cp: 0, best: 'b8c6' }, { cp: 20, best: 'b8c6' }]));
    expect(checks[0].glyph).toBeNull();
    const t = lessonText(chooseLesson(sans, walk, checks));
    expect(t.g).toBeUndefined();
    expect(t.body).toMatch(/playable/);
    expect(t.num).toBe('e3 +0.2, Nc3 0.0');
  });

  it('when the opponent left book, flags the first real mistake after it', async () => {
    const reply = uncoveredReply('d4 d5 Bf4');
    const sans = game(`d4 d5 Bf4 ${reply} e3 e6 Nf3 Nf6`);
    const walk = walkPrep(sans, tree);
    expect(walk.leftBy).toBe('opponent');
    // Two White moves follow Black's reply: e3 (fine), then Nf3 (drops 2.5 points). Each takes a before and an after.
    const engine = scripted([
      { cp: 30, best: 'e2e3' }, { cp: 30, best: 'e7e6' },
      { cp: 30, best: 'g1f3' }, { cp: -220, best: 'g8f6' },
    ]);
    const progress: [number, number][] = [];
    const checks = await analyze(sans, walk, engine, { onProgress: (d, t) => progress.push([d, t]) });
    // Nf3 is Stockfish's own best move here, so the drop is not blamed on it.
    expect(checks.map((c) => [c.ply, c.glyph])).toEqual([[4, null], [6, null]]);
    expect(progress).toEqual([[0, 2], [1, 2], [2, 2]]);
    expect(chooseLesson(sans, walk, checks).kind).toBe('clean');
    // The same game with a different best move at ply 6 is a mistake.
    const engine2 = scripted([{ cp: 30, best: 'e2e3' }, { cp: 30, best: 'e7e6' }, { cp: 30, best: 'b1c3' }, { cp: -220, best: 'g8f6' }]);
    const checks2 = await analyze(sans, walk, engine2);
    const lesson2 = chooseLesson(sans, walk, checks2);
    expect(lesson2.kind).toBe('mistake');
    const t = lessonText(lesson2);
    expect(t).toMatchObject({ g: '?', cls: 'mistake' });
    expect(t.head).toBe('4. Nf3. Mistake. 4. Nc3 was better.');
    expect(t.num).toBe('+0.3 before, -2.2 after');
    expect(t.body).toMatch(/2\.5 lower than Nc3/);
  });

  it('calls a drop of 3.0 or more a blunder, and mate scores read as mate', async () => {
    const reply = uncoveredReply('d4 d5 Bf4');
    const sans = game(`d4 d5 Bf4 ${reply} e3`);
    const walk = walkPrep(sans, tree);
    const checks = await analyze(sans, walk, scripted([{ cp: 40, best: 'b1c3' }, { cp: -(100000 - 2), best: 'd8h4' }]));
    expect(checks[0].glyph).toBe('??');
    expect(checks[0].loss).toBeGreaterThanOrEqual(BLUNDER);
    const t = lessonText(chooseLesson(sans, walk, checks));
    expect(t.g).toBe('??');
    expect(t.num).toBe('+0.4 before, mated in 2 after');
    expect(t.body).toMatch(/more than 10\.0 lower/);
    expect(fmtEval(100000 - 3)).toBe('mate in 3');
  });

  it('a clean game after the opponent left book is a clean lesson', async () => {
    const reply = uncoveredReply('d4 d5 Bf4');
    const sans = game(`d4 d5 Bf4 ${reply} e3`);
    const walk = walkPrep(sans, tree);
    const checks = await analyze(sans, walk, scripted([{ cp: 40, best: 'e2e3' }, { cp: 35, best: 'a7a6' }]));
    const lesson = chooseLesson(sans, walk, checks);
    expect(lesson).toEqual({ kind: 'clean', reason: 'no-mistake', checked: 1 });
    expect(lessonText(lesson).num).toBe('1 checked, 0 mistakes');
  });

  it('checks only the student moves in a game that ends in mate against them', async () => {
    // Fool's mate: the student (White) deviates at once and is mated, so only White's moves are checked.
    const sans = game('f3 e5 g4 Qh4#');
    const walk = walkPrep(sans, tree);
    const engine = scripted([
      { cp: 0, best: 'd2d4' }, { cp: 10, best: 'e7e5' }, { cp: 30, best: 'e7e5' }, // 1.f3 (before, after, prep d4)
      { cp: -20, best: 'd2d4' }, { cp: -9999, best: 'd8h4' }, // 2.g4 (before, after)
    ]);
    const checks = await analyze(sans, walk, engine);
    expect(checks.map((c) => c.san)).toEqual(['f3', 'g4']);
    expect(engine.asked).toHaveLength(5);
  });

  it('stops at maxMoves', async () => {
    const reply = uncoveredReply('d4 d5 Bf4');
    const sans = game(`d4 d5 Bf4 ${reply} e3 e6 Nf3 Nf6 c3 c5`);
    const walk = walkPrep(sans, tree);
    const ok = { cp: 0, best: 'a2a3' };
    const engine = scripted([ok, ok, ok, ok]);
    expect(await analyze(sans, walk, engine, { maxMoves: 2 })).toHaveLength(2);
  });

  it('can be cancelled between searches', async () => {
    const reply = uncoveredReply('d4 d5 Bf4');
    const sans = game(`d4 d5 Bf4 ${reply} e3 e6 Nf3`);
    const walk = walkPrep(sans, tree);
    const ctl = new AbortController();
    const engine = scripted([{ cp: 0, best: 'a2a3' }, { cp: 0, best: 'a2a3' }, { cp: 0, best: 'a2a3' }, { cp: 0, best: 'a2a3' }]);
    const seen: number[] = [];
    const run = analyze(sans, walk, engine, { signal: ctl.signal, onProgress: (d) => { seen.push(d); if (d === 1) ctl.abort(); } });
    await expect(run).rejects.toThrow();
    expect(seen).toEqual([0, 1]);
    expect(engine.asked).toHaveLength(2); // nothing was asked after the abort
  });
});

describe('lessons and copy', () => {
  it('a whole game in prep has nothing to revisit', () => {
    const sans = game('d4 d5 Bf4 Nf6 e3');
    const walk = walkPrep(sans, tree);
    const lesson = chooseLesson(sans, walk, []);
    expect(lesson).toEqual({ kind: 'clean', reason: 'in-prep', checked: 0 });
    expect(boundaryText(walk, sans).head).toBe('You stayed in prep all game.');
  });

  it('a deviation shows the prep move even before Stockfish has answered', () => {
    const sans = game('d4 d5 Bf4 Nf6 Nc3');
    const walk = walkPrep(sans, tree);
    const t = lessonText(chooseLesson(sans, walk, []));
    expect(t.body).toMatch(/move to learn is e3/);
    expect(boundaryText(walk, sans)).toMatchObject({ head: 'You left prep on move 3.', num: 'Last prep move: 2...Nf6' });
  });

  it('the headline names the last prep move and who left', () => {
    const reply = uncoveredReply('d4 d5 Bf4');
    const sans = game(`d4 d5 Bf4 ${reply} e3`);
    const b = boundaryText(walkPrep(sans, tree), sans);
    expect(b.head).toBe('Your opponent left book on move 2.');
    expect(b.num).toBe('Last prep move: 2. Bf4');
  });

  it('stepText marks prep, the deviation, and flagged moves', () => {
    const sans = game('d4 d5 Bf4 Nf6 Nc3');
    const walk = walkPrep(sans, tree);
    expect(stepText(0, 'd4', walk, undefined)).toEqual({ head: '1. d4. In prep.', num: '' });
    expect(stepText(4, 'Nc3', walk, undefined)?.head).toBe('3. Nc3. Not your prep. 3. e3 was.');
    expect(stepText(5, 'e6', walk, undefined)).toBeNull();
  });

  it('fenAt replays the game', () => {
    expect(fenAt(game('e4 e5'), 0)).toBe(new Chess().fen());
    expect(fenAt(game('e4 e5'), 1)).toMatch(/^rnbqkbnr\/pppppppp\/8\/8\/4P3\/8\/PPPP1PPP\/RNBQKBNR b/);
  });

  it('copy has no em dashes and no exclamation marks', () => {
    const walks: PrepWalk[] = [
      walkPrep(game('d4 d5 Bf4 Nf6 e3'), tree),
      walkPrep(game('d4 d5 Bf4 Nf6 Nc3'), tree),
      walkPrep(game(`d4 d5 Bf4 ${uncoveredReply('d4 d5 Bf4')} e3`), tree),
    ];
    const sans = [game('d4 d5 Bf4 Nf6 e3'), game('d4 d5 Bf4 Nf6 Nc3'), game(`d4 d5 Bf4 ${uncoveredReply('d4 d5 Bf4')} e3`)];
    const texts = walks.flatMap((w, i) => {
      const lesson = chooseLesson(sans[i], w, []);
      return [boundaryText(w, sans[i]), lessonText(lesson)];
    });
    for (const t of texts) for (const s of [t.head, t.body ?? '', t.num]) expect(s).not.toMatch(/[—!]/);
  });
});
