import { Chess } from 'chess.js';
import { describe, expect, it } from 'vitest';
import { OPENINGS } from '../data/openings';
import { posKey } from '../data/prep';
import type { Judgement } from '../drill/drill';
import { analyze, BLUNDER, chooseLesson, fenAt, walkPrep, type PrepWalk } from './review';
import { boundaryText, fmtEval, lessonText, stepText } from './templates';

const [london, caroKann] = OPENINGS;
const { tree } = london;
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
    expect(walkPrep(sans, london)).toEqual({ side: 'w', leftBy: null, lastPrepPly: 14, deviationPly: null, prep: null });
  });

  it('the student leaving prep: 3.Nc3 instead of 3.e3', () => {
    const sans = game('d4 d5 Bf4 Nf6 Nc3 e6');
    const w = walkPrep(sans, london);
    expect(w).toMatchObject({ leftBy: 'student', lastPrepPly: 3, deviationPly: 4 });
    expect(w.prep?.san).toBe('e3');
  });

  it('the student leaving prep with the very first move', () => {
    const w = walkPrep(game('e4 e5'), london);
    expect(w).toMatchObject({ leftBy: 'student', lastPrepPly: -1, deviationPly: 0 });
    expect(w.prep?.san).toBe('d4');
  });

  it('the opponent leaving book: a Black reply the tree does not cover', () => {
    const reply = uncoveredReply('d4 d5 Bf4');
    const w = walkPrep(game(`d4 d5 Bf4 ${reply} e3 e6`), london);
    expect(w).toEqual({ side: 'w', leftBy: 'opponent', lastPrepPly: 2, deviationPly: 3, prep: null });
  });

  it('a transposition into prep still counts as prep', () => {
    // 1.d4 Nf6 2.Bf4 d5 3.e3 is in the tree, and so is the same position reached via 1...d5 2.Bf4 Nf6.
    expect(walkPrep(game('d4 d5 Bf4 Nf6 e3'), london).leftBy).toBeNull();
    expect(walkPrep(game('d4 Nf6 Bf4 d5 e3'), london).leftBy).toBeNull();
  });
});

describe('analyze', () => {
  it('checks nothing when the game stayed in prep', async () => {
    const sans = game('d4 d5 Bf4 Nf6 e3');
    const engine = scripted([]);
    expect(await analyze(sans, walkPrep(sans, london), engine)).toEqual([]);
    expect(engine.asked).toHaveLength(0);
  });

  it('flags a student deviation that cost, with the prep move as the yardstick', async () => {
    const sans = game('d4 d5 Bf4 Nf6 Nc3 e6');
    const walk = walkPrep(sans, london);
    // before 3.Nc3: best is e3 at +0.20; after Nc3 -1.50; had they played e3: +0.20
    const engine = scripted([{ cp: 20, best: 'e2e3', depth: 14, nodes: 9000 }, { cp: -150, best: 'e7e6' }, { cp: 20, best: 'e7e6' }]);
    const checks = await analyze(sans, walk, engine);
    expect(checks).toHaveLength(1);
    expect(checks[0]).toMatchObject({ ply: 4, san: 'Nc3', best: 'e3', loss: 170, glyph: '?', prepAfter: 20, depth: 14, nodes: 9000 });

    const lesson = chooseLesson(sans, walk, checks, london.ideaFor);
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
    const walk = walkPrep(sans, london);
    const checks = await analyze(sans, walk, scripted([{ cp: 20, best: 'e2e3' }, { cp: 0, best: 'b8c6' }, { cp: 20, best: 'b8c6' }]));
    expect(checks[0].glyph).toBeNull();
    const t = lessonText(chooseLesson(sans, walk, checks, london.ideaFor));
    expect(t.g).toBeUndefined();
    expect(t.body).toMatch(/playable/);
    expect(t.num).toBe('e3 +0.2, Nc3 0.0');
  });

  it('when the opponent left book, flags the first real mistake after it', async () => {
    const reply = uncoveredReply('d4 d5 Bf4');
    const sans = game(`d4 d5 Bf4 ${reply} e3 e6 Nf3 Nf6`);
    const walk = walkPrep(sans, london);
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
    expect(chooseLesson(sans, walk, checks, london.ideaFor).kind).toBe('clean');
    // The same game with a different best move at ply 6 is a mistake.
    const engine2 = scripted([{ cp: 30, best: 'e2e3' }, { cp: 30, best: 'e7e6' }, { cp: 30, best: 'b1c3' }, { cp: -220, best: 'g8f6' }]);
    const checks2 = await analyze(sans, walk, engine2);
    const lesson2 = chooseLesson(sans, walk, checks2, london.ideaFor);
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
    const walk = walkPrep(sans, london);
    const checks = await analyze(sans, walk, scripted([{ cp: 40, best: 'b1c3' }, { cp: -(100000 - 2), best: 'd8h4' }]));
    expect(checks[0].glyph).toBe('??');
    expect(checks[0].loss).toBeGreaterThanOrEqual(BLUNDER);
    const t = lessonText(chooseLesson(sans, walk, checks, london.ideaFor));
    expect(t.g).toBe('??');
    expect(t.num).toBe('+0.4 before, mated in 2 after');
    expect(t.body).toMatch(/more than 10\.0 lower/);
    expect(fmtEval(100000 - 3)).toBe('mate in 3');
  });

  it('a clean game after the opponent left book is a clean lesson', async () => {
    const reply = uncoveredReply('d4 d5 Bf4');
    const sans = game(`d4 d5 Bf4 ${reply} e3`);
    const walk = walkPrep(sans, london);
    const checks = await analyze(sans, walk, scripted([{ cp: 40, best: 'e2e3' }, { cp: 35, best: 'a7a6' }]));
    const lesson = chooseLesson(sans, walk, checks, london.ideaFor);
    expect(lesson).toEqual({ kind: 'clean', reason: 'no-mistake', checked: 1 });
    expect(lessonText(lesson).num).toBe('1 checked, 0 mistakes');
  });

  it('checks only the student moves in a game that ends in mate against them', async () => {
    // Fool's mate: the student (White) deviates at once and is mated, so only White's moves are checked.
    const sans = game('f3 e5 g4 Qh4#');
    const walk = walkPrep(sans, london);
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
    const walk = walkPrep(sans, london);
    const ok = { cp: 0, best: 'a2a3' };
    const engine = scripted([ok, ok, ok, ok]);
    expect(await analyze(sans, walk, engine, { maxMoves: 2 })).toHaveLength(2);
  });

  it('can be cancelled between searches', async () => {
    const reply = uncoveredReply('d4 d5 Bf4');
    const sans = game(`d4 d5 Bf4 ${reply} e3 e6 Nf3`);
    const walk = walkPrep(sans, london);
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
    const walk = walkPrep(sans, london);
    const lesson = chooseLesson(sans, walk, [], london.ideaFor);
    expect(lesson).toEqual({ kind: 'clean', reason: 'in-prep', checked: 0 });
    expect(boundaryText(walk, sans, london).head).toBe('You stayed in prep all game.');
  });

  it('a deviation shows the prep move even before Stockfish has answered', () => {
    const sans = game('d4 d5 Bf4 Nf6 Nc3');
    const walk = walkPrep(sans, london);
    const t = lessonText(chooseLesson(sans, walk, [], london.ideaFor));
    expect(t.body).toMatch(/move to learn is e3/);
    expect(boundaryText(walk, sans, london)).toMatchObject({ head: 'You left prep on move 3.', num: 'Last prep move: 2...Nf6' });
  });

  it('the headline names the last prep move and who left', () => {
    const reply = uncoveredReply('d4 d5 Bf4');
    const sans = game(`d4 d5 Bf4 ${reply} e3`);
    const b = boundaryText(walkPrep(sans, london), sans, london);
    expect(b.head).toBe('Your opponent left book on move 2.');
    expect(b.num).toBe('Last prep move: 2. Bf4');
  });

  it('stepText marks prep, the deviation, and flagged moves', () => {
    const sans = game('d4 d5 Bf4 Nf6 Nc3');
    const walk = walkPrep(sans, london);
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
      walkPrep(game('d4 d5 Bf4 Nf6 e3'), london),
      walkPrep(game('d4 d5 Bf4 Nf6 Nc3'), london),
      walkPrep(game(`d4 d5 Bf4 ${uncoveredReply('d4 d5 Bf4')} e3`), london),
    ];
    const sans = [game('d4 d5 Bf4 Nf6 e3'), game('d4 d5 Bf4 Nf6 Nc3'), game(`d4 d5 Bf4 ${uncoveredReply('d4 d5 Bf4')} e3`)];
    const texts = walks.flatMap((w, i) => {
      const lesson = chooseLesson(sans[i], w, [], london.ideaFor);
      return [boundaryText(w, sans[i], london), lessonText(lesson)];
    });
    for (const t of texts) for (const s of [t.head, t.body ?? '', t.num]) expect(s).not.toMatch(/[—!]/);
  });
});

describe('Black: the Caro-Kann', () => {
  const ck = (line: string) => walkPrep(game(line), caroKann);
  const whiteLeaves = 'h3'; // a 2nd move for White that the tree doesn't cover
  it('the test line really is outside the tree', () => expect(caroKann.tree.has(posKey(fenAt(game('e4 c6 h3'), 3)))).toBe(false));

  it('a game that follows the textbook line stays in prep', () => {
    expect(ck('e4 c6 d4 d5 Nc3 dxe4 Nxe4 Bf5')).toEqual({ side: 'b', leftBy: null, lastPrepPly: 7, deviationPly: null, prep: null });
  });

  it('the student (Black) leaving prep: 1...e5 instead of 1...c6', () => {
    const w = ck('e4 e5');
    expect(w).toMatchObject({ side: 'b', leftBy: 'student', lastPrepPly: 0, deviationPly: 1 });
    expect(w.prep?.san).toBe('c6');
  });

  it('the student leaving prep later, with a Black move', () => {
    const w = ck('e4 c6 d4 d5 Nc3 dxe4 Nxe4 Nf6');
    expect(w).toMatchObject({ leftBy: 'student', lastPrepPly: 6, deviationPly: 7 });
    expect(w.prep?.san).toBe('Bf5');
  });

  it('White leaving book first: a first move the tree does not cover', () => {
    expect(ck('d4 d5')).toEqual({ side: 'b', leftBy: 'opponent', lastPrepPly: -1, deviationPly: 0, prep: null });
  });

  it('White leaving book on move 2', () => {
    expect(ck(`e4 c6 ${whiteLeaves} d5`)).toEqual({ side: 'b', leftBy: 'opponent', lastPrepPly: 1, deviationPly: 2, prep: null });
  });

  it('stays in prep: nothing to analyse, nothing to revisit', async () => {
    const sans = game('e4 c6 d4 d5 Nc3 dxe4 Nxe4 Bf5');
    const walk = walkPrep(sans, caroKann);
    const engine = scripted([]);
    expect(await analyze(sans, walk, engine)).toEqual([]);
    expect(engine.asked).toHaveLength(0);
    expect(chooseLesson(sans, walk, [], caroKann.ideaFor)).toEqual({ kind: 'clean', reason: 'in-prep', checked: 0 });
    const b = boundaryText(walk, sans, caroKann);
    expect(b.head).toBe('You stayed in prep all game.');
    expect(b.body).toBe('Every one of your moves matched your Caro-Kann prep until the game ended after move 4.');
  });

  it("flags a Black deviation that cost, scoring from Black's side", async () => {
    const sans = game('e4 e5 Nf3 Nc6');
    const walk = walkPrep(sans, caroKann);
    // Engine scores are White's view. Before 1...e5 White is +0.3 (Black's best is c6); after 1...e5 +1.9; had Black played c6, +0.3.
    const engine = scripted([{ cp: 30, best: 'c7c6', depth: 12, nodes: 5000 }, { cp: 190, best: 'g1f3' }, { cp: 30, best: 'd2d4' }, { cp: 190, best: 'g1f3' }, { cp: 190, best: 'b8c6' }]);
    const checks = await analyze(sans, walk, engine);
    // The student's view: -0.3 before, -1.9 after, so 1.6 lost.
    expect(checks[0]).toMatchObject({ ply: 1, san: 'e5', best: 'c6', before: -30, after: -190, loss: 160, glyph: '?', prepAfter: -30 });
    const lesson = chooseLesson(sans, walk, checks, caroKann.ideaFor);
    expect(lesson).toMatchObject({ kind: 'deviation', ply: 1, played: 'e5' });
    const t = lessonText(lesson);
    expect(t).toMatchObject({ g: '?', cls: 'mistake', head: '1...e5. Your prep move was 1...c6.', num: 'c6 -0.3, e5 -1.9' });
    expect(t.body).toMatch(/1\.6 lower than c6/);
    expect(boundaryText(walk, sans, caroKann)).toMatchObject({ head: 'You left prep on move 1.', body: 'You played 1...e5. Your prep move was 1...c6.', num: 'Last prep move: 1. e4' });
  });

  it('a Black mistake after White left book is flagged when the White-side score goes UP', async () => {
    const sans = game(`e4 c6 ${whiteLeaves} e5`);
    const walk = walkPrep(sans, caroKann);
    expect(walk).toMatchObject({ leftBy: 'opponent', deviationPly: 2 });
    // Black's 2...e5: White's score goes from +0.3 to +2.5. That is a 2.2 loss for Black, not a gain.
    const checks = await analyze(sans, walk, scripted([{ cp: 30, best: 'd7d5' }, { cp: 250, best: 'e4e5' }]));
    expect(checks).toHaveLength(1);
    expect(checks[0]).toMatchObject({ ply: 3, san: 'e5', best: 'd5', before: -30, after: -250, loss: 220, glyph: '?' });
    const lesson = chooseLesson(sans, walk, checks, caroKann.ideaFor);
    expect(lesson.kind).toBe('mistake');
    const t = lessonText(lesson);
    expect(t.head).toBe('2...e5. Mistake. 2...d5 was better.');
    expect(t.num).toBe('-0.3 before, -2.5 after');
    expect(t.body).toMatch(/2\.2 lower than d5/);
  });

  it('a Black move after which the White-side score goes down is no mistake', async () => {
    const sans = game(`e4 c6 ${whiteLeaves} d5`);
    const walk = walkPrep(sans, caroKann);
    const checks = await analyze(sans, walk, scripted([{ cp: 30, best: 'd7d5' }, { cp: -10, best: 'e4e5' }]));
    expect(checks[0]).toMatchObject({ before: -30, after: 10, loss: -40, glyph: null });
    expect(chooseLesson(sans, walk, checks, caroKann.ideaFor)).toEqual({ kind: 'clean', reason: 'no-mistake', checked: 1 });
  });

  it('calls a drop of 3.0 or more a blunder, and White mating reads as mated for Black', async () => {
    const sans = game(`e4 c6 ${whiteLeaves} e5`);
    const walk = walkPrep(sans, caroKann);
    const checks = await analyze(sans, walk, scripted([{ cp: 40, best: 'd7d5' }, { cp: 100000 - 2, best: 'e4e5' }]));
    expect(checks[0].glyph).toBe('??');
    const t = lessonText(chooseLesson(sans, walk, checks, caroKann.ideaFor));
    expect(t.g).toBe('??');
    expect(t.num).toBe('-0.4 before, mated in 2 after');
    expect(t.body).toMatch(/more than 10\.0 lower/);
  });

  it('checkmate by Black scores as the student winning, with no search of the mated position', async () => {
    // Fool's mate: White's 1.f3 is off book; Black's two moves are checked and the second mates.
    const sans = game('f3 e5 g4 Qh4#');
    const walk = walkPrep(sans, caroKann);
    expect(walk).toMatchObject({ leftBy: 'opponent', deviationPly: 0 });
    const engine = scripted([
      { cp: 0, best: 'e7e5' }, { cp: 10, best: 'd2d4' }, // 1...e5 (before, after)
      { cp: 200, best: 'd8h4' }, // 2...Qh4#: only the position before is searched
    ]);
    const checks = await analyze(sans, walk, engine);
    expect(checks.map((c) => c.san)).toEqual(['e5', 'Qh4#']);
    expect(checks[1]).toMatchObject({ before: -200, after: 100000, loss: -100200, glyph: null });
    expect(engine.asked).toHaveLength(3);
    expect(chooseLesson(sans, walk, checks, caroKann.ideaFor).kind).toBe('clean');
  });

  it("maxMoves counts the student's moves", async () => {
    const sans = game(`e4 c6 ${whiteLeaves} d5 e5 Bf5 Nf3 e6`);
    const walk = walkPrep(sans, caroKann);
    const ok = { cp: 0, best: 'a7a6' };
    const checks = await analyze(sans, walk, scripted([ok, ok, ok, ok]), { maxMoves: 2 });
    expect(checks.map((c) => c.ply)).toEqual([3, 5]);
  });

  it('stepText and the headline work when the opponent is White', () => {
    const sans = game(`e4 c6 ${whiteLeaves} d5`);
    const walk = walkPrep(sans, caroKann);
    expect(boundaryText(walk, sans, caroKann)).toMatchObject({ head: 'Your opponent left book on move 2.', num: 'Last prep move: 1...c6' });
    expect(boundaryText(walk, sans, caroKann).body).toMatch(/^They played 2\. /);
    expect(stepText(2, whiteLeaves, walk, undefined)?.head).toMatch(/Your opponent leaves book here\.$/);
    expect(stepText(1, 'c6', walk, undefined)).toEqual({ head: '1...c6. In prep.', num: '' });
  });

  it('copy has no em dashes and no exclamation marks', () => {
    for (const line of ['e4 c6 d4 d5 Nc3 dxe4 Nxe4 Bf5', 'e4 e5', `e4 c6 ${whiteLeaves} d5`]) {
      const sans = game(line);
      const walk = walkPrep(sans, caroKann);
      for (const t of [boundaryText(walk, sans, caroKann), lessonText(chooseLesson(sans, walk, [], caroKann.ideaFor))]) for (const s of [t.head, t.body ?? '', t.num]) expect(s).not.toMatch(/[—!]/);
    }
  });
});
