import { Chess } from 'chess.js';
import { describe, expect, it, vi } from 'vitest';
import { buildTree, posKey, type PrepTree } from '../data/london';
import { buildTree as caroKannTree } from '../data/caro-kann';
import type { MaiaMove } from '../chess/maia';
import { createDrill, JUDGE_MS, MISTAKE, PLAYABLE, type DrillEvent } from './drill';

type Eval = { cp: number; best: string };

const START = posKey(new Chess().fen());
/** Tree that covers only the start position, so any Black reply leaves book. */
const tinyTree = (): PrepTree => new Map([[START, { san: 'd4', uci: 'd2d4' }]]);

/** Maia stand-in that plays the given SANs in order. */
function scriptedMaia(sans: string[]) {
  const queue = [...sans];
  return async (chess: Chess): Promise<MaiaMove[]> => {
    const want = queue.shift();
    const moves = chess.moves({ verbose: true }).map((m) => ({
      uci: m.from + m.to + (m.promotion ?? ''),
      san: m.san,
      logit: 0,
      p: m.san === want ? 0.9 : 0.1 / 19,
    }));
    return moves.sort((a, b) => b.p - a.p);
  };
}

/** Engine stand-in that answers from a queue, then falls back to a flat score. */
function queuedEngine(queue: Eval[] = []) {
  const q = [...queue];
  return { evaluate: vi.fn(async (_fen: string, _ms: number): Promise<Eval> => q.shift() ?? { cp: 0, best: 'a1a1' }) };
}

/** Everything already learned, so tests exercise the testing step unless they pass their own set. */
const allLearned = { has: () => true, add: () => {} };

function setup(opts: { tree?: PrepTree; maia?: string[]; engine?: Eval[]; learned?: Set<string>; side?: 'w' | 'b'; openingMoves?: string[] } = {}) {
  const engine = queuedEngine(opts.engine);
  const drill = createDrill({
    tree: opts.tree ?? tinyTree(),
    learned: opts.learned ?? allLearned,
    side: opts.side,
    openingMoves: opts.openingMoves,
    engine,
    maia: scriptedMaia(opts.maia ?? []),
    rand: () => 0,
    delay: async () => {},
  });
  const events: DrillEvent[] = [];
  drill.on((e) => events.push(e));
  drill.start(1000);
  const of = <T extends DrillEvent['type']>(t: T) => events.filter((e): e is Extract<DrillEvent, { type: T }> => e.type === t);
  return { drill, engine, events, of };
}

const mv = (from: string, to: string) => ({ from, to });

describe('drill: prep', () => {
  it('counts a rep for a correct first-try prep move, then Black replies', async () => {
    const { drill, of } = setup({ tree: buildTree(), maia: ['d5'] });
    expect(await drill.play(mv('d2', 'd4'))).toBe(true);
    const s = drill.getState();
    expect(s.reps).toBe(1);
    expect(s.prepMoves).toBe(1);
    expect(s.history).toEqual(['d4', 'd5']);
    expect(s.phase).toBe('student');
    expect(s.offBook).toBe(false);
    expect(of('prep-correct')[0]).toMatchObject({ san: 'd4', counted: true });
    expect(of('opponent-move')[0]).toMatchObject({ san: 'd5' });
  });

  it('a miss then a retry counts the prep move but no rep', async () => {
    const { drill, engine, of } = setup({
      tree: buildTree(),
      maia: ['d5'],
      engine: [
        { cp: 30, best: 'x' },
        { cp: -50, best: 'x' },
      ],
    });
    await drill.play(mv('e2', 'e4'));
    expect(of('prep-miss')[0]).toMatchObject({ played: 'e4', prep: 'd4', prepUci: 'd2d4', loss: 80, verdict: 'mistake' });
    expect(drill.getState().history).toEqual([]); // taken back
    expect(drill.getState().missed).toBe(true);
    expect(engine.evaluate).toHaveBeenCalledTimes(2);
    expect(engine.evaluate.mock.calls.every(([, ms]) => ms === JUDGE_MS)).toBe(true);

    await drill.play(mv('d2', 'd4'));
    const s = drill.getState();
    expect(s.reps).toBe(0);
    expect(s.prepMoves).toBe(1);
    expect(s.missed).toBe(false);
    expect(of('prep-correct')[0]).toMatchObject({ counted: false });
  });

  it('calls a small loss playable and a loss at the threshold a mistake', async () => {
    const a = setup({
      engine: [
        { cp: 30, best: 'x' },
        { cp: 30 - (PLAYABLE - 1), best: 'x' },
      ],
    });
    await a.drill.play(mv('e2', 'e4'));
    expect(a.of('prep-miss')[0].verdict).toBe('playable');
    const b = setup({
      engine: [
        { cp: 30, best: 'x' },
        { cp: 30 - PLAYABLE, best: 'x' },
      ],
    });
    await b.drill.play(mv('e2', 'e4'));
    expect(b.of('prep-miss')[0].verdict).toBe('mistake');
  });

  it('ignores illegal moves and moves outside the student turn', async () => {
    const { drill } = setup({ maia: ['d5'] });
    expect(await drill.play(mv('e2', 'e5'))).toBe(false);
    const pending = drill.play(mv('d2', 'd4'));
    expect(await drill.play(mv('e2', 'e4'))).toBe(false); // Black is thinking
    await pending;
  });
});

describe('drill: state at emit time', () => {
  it('a listener sees the student to move (with legal moves) when the opponent has moved', async () => {
    const { drill, events } = setup({ tree: buildTree(), maia: ['d5'] });
    const seen: { phase: string; dests: number }[] = [];
    drill.on((e) => { if (e.type === 'opponent-move' || e.type === 'prep-correct') seen.push({ phase: drill.getState().phase, dests: drill.dests().size }); });
    await drill.play(mv('d2', 'd4'));
    expect(events.map((e) => e.type)).toContain('opponent-move');
    expect(seen).toEqual([{ phase: 'opponent', dests: 0 }, { phase: 'student', dests: expect.any(Number) }]);
    expect(seen[1].dests).toBeGreaterThan(0);
  });
});

describe('drill: learning step (decision 13)', () => {
  it('shows a new position, accepts only the shown move, and counts no rep', async () => {
    const learned = new Set<string>();
    const { drill, of } = setup({ tree: buildTree(), maia: ['d5'], learned });
    expect(drill.getState().teach?.san).toBe('d4');
    expect([...drill.dests()]).toEqual([['d2', ['d4']]]);
    expect(await drill.play(mv('e2', 'e4'))).toBe(false);
    expect(drill.getState().history).toEqual([]);
    await drill.play(mv('d2', 'd4'));
    expect(of('prep-correct')[0]).toMatchObject({ learnedNow: true, counted: false });
    expect(drill.getState().reps).toBe(0);
    expect(learned.has(START)).toBe(true);
  });

  it('a learned position is tested: hidden, and a first-try correct move earns a rep', async () => {
    const learned = new Set<string>([START]);
    const { drill, of } = setup({ tree: buildTree(), maia: ['d5'], learned });
    expect(drill.getState().teach).toBeNull();
    await drill.play(mv('d2', 'd4'));
    expect(of('prep-correct')[0]).toMatchObject({ learnedNow: false, counted: true });
    expect(drill.getState().reps).toBe(1);
  });
});

describe('drill: show my prep', () => {
  it('reveals the prep move and the next correct move earns no rep', async () => {
    const { drill } = setup({ tree: buildTree(), maia: ['d5'] });
    expect(drill.revealPrep()?.san).toBe('d4');
    await drill.play(mv('d2', 'd4'));
    expect(drill.getState().prepMoves).toBe(1);
    expect(drill.getState().reps).toBe(0);
  });
});

describe('drill: off book', () => {
  it('goes off book when Black leaves the tree', async () => {
    const { drill, of } = setup({ maia: ['d5'] });
    await drill.play(mv('d2', 'd4'));
    expect(drill.getState().offBook).toBe(true);
    expect(of('off-book')).toHaveLength(1);
    expect(drill.prepHint()).toBeUndefined();
  });

  async function offBookMove(engine: Eval[]) {
    const t = setup({ maia: ['d5', 'e6'], engine });
    await t.drill.play(mv('d2', 'd4')); // prep move; Black replies d5 and leaves the tiny tree
    await t.drill.play(mv('c1', 'f4')); // off book: judged before and after
    return t;
  }

  it('flags a mistake at a loss of exactly MISTAKE when the move is not Stockfish best', async () => {
    const { drill, of } = await offBookMove([
      { cp: 50, best: 'e2e3' },
      { cp: 50 - MISTAKE, best: 'x' },
    ]);
    expect(of('offbook-mistake')).toEqual([{ type: 'offbook-mistake', played: 'Bf4', better: 'e3', betterUci: 'e2e3', loss: MISTAKE }]);
    expect(drill.getState().mistakes).toBe(1);
    expect(drill.getState().phase).toBe('student'); // play continues
    expect(drill.getState().history).toHaveLength(4);
  });

  it('does not flag a loss just under MISTAKE', async () => {
    const { drill, of } = await offBookMove([
      { cp: 50, best: 'e2e3' },
      { cp: 50 - MISTAKE + 1, best: 'x' },
    ]);
    expect(of('offbook-mistake')).toHaveLength(0);
    expect(drill.getState().mistakes).toBe(0);
  });

  it('does not flag a big drop when the student played the engine best move', async () => {
    const { of } = await offBookMove([
      { cp: 300, best: 'c1f4' },
      { cp: 0, best: 'x' },
    ]);
    expect(of('offbook-mistake')).toHaveLength(0);
  });
});

describe('drill: races and failures', () => {
  it('resigning while a wrong prep move is judged takes it back before game over', async () => {
    let release!: () => void;
    const gate = new Promise<void>((r) => (release = r));
    const engine = { evaluate: async () => { await gate; return { cp: 0, best: 'a1a1' }; } };
    const drill = createDrill({ tree: tinyTree(), learned: allLearned, engine, maia: scriptedMaia([]), delay: async () => {} });
    const seen: string[][] = [];
    drill.on((e) => { if (e.type === 'game-over') seen.push(drill.getState().history); });
    drill.start();
    const pending = drill.play(mv('e2', 'e4')); // not the prep move d4
    drill.resign();
    release();
    await pending;
    expect(seen).toEqual([[]]);
    expect(drill.getState().history).toEqual([]);
  });

  it('an engine failure ends the round with engine-error instead of locking the board', async () => {
    const drill = createDrill({
      tree: buildTree(), learned: allLearned, engine: queuedEngine(),
      maia: async () => { throw new Error('model failed'); }, delay: async () => {},
    });
    const events: DrillEvent[] = [];
    drill.on((e) => events.push(e));
    drill.start();
    expect(await drill.play(mv('d2', 'd4'))).toBe(true);
    expect(events.at(-1)).toMatchObject({ type: 'engine-error' });
    expect(drill.getState().phase).toBe('over');
    drill.start();
    expect(drill.getState().phase).toBe('student');
  });

  it("labels Black's reply with the rating Maia was asked for, not one changed mid-search", async () => {
    let release!: () => void;
    const gate = new Promise<void>((r) => (release = r));
    const maia = scriptedMaia(['d5']);
    const drill = createDrill({ tree: buildTree(), learned: allLearned, engine: queuedEngine(), maia: async (c) => { await gate; return maia(c); }, delay: async () => {} });
    const ratings: number[] = [];
    drill.on((e) => { if (e.type === 'opponent-move') ratings.push(e.rating); });
    drill.start(1000);
    const pending = drill.play(mv('d2', 'd4'));
    drill.setRating(1800);
    release();
    await pending;
    expect(ratings).toEqual([1000]);
  });
});

describe('drill: game end', () => {
  it('resign ends the game with result resigned', async () => {
    const { drill, of } = setup({ maia: ['d5'] });
    await drill.play(mv('d2', 'd4'));
    drill.resign();
    expect(drill.getState()).toMatchObject({ phase: 'over', result: 'resigned' });
    expect(of('game-over')).toEqual([{ type: 'game-over', result: 'resigned', reason: 'resign', prepMoves: 1, reps: 1, mistakes: 0 }]);
    expect(await drill.play(mv('c1', 'f4'))).toBe(false);
    drill.resign(); // a second call is a no-op
    expect(of('game-over')).toHaveLength(1);
  });

  it('a checkmate against the student ends the game as lost', async () => {
    const tree: PrepTree = new Map([[START, { san: 'f3', uci: 'f2f3' }]]);
    const { drill, of } = setup({ tree, maia: ['e5', 'Qh4#'] });
    await drill.play(mv('f2', 'f3'));
    await drill.play(mv('g2', 'g4'));
    expect(drill.getState()).toMatchObject({ phase: 'over', result: 'lost' });
    expect(of('game-over')[0]).toMatchObject({ result: 'lost', reason: 'checkmate' });
  });

  it('a checkmate by the student ends the game as won and is never flagged as a mistake', async () => {
    const tree: PrepTree = new Map([[START, { san: 'e4', uci: 'e2e4' }]]);
    const { drill, of } = setup({ tree, maia: ['e5', 'Nc6', 'Nf6'] });
    await drill.play(mv('e2', 'e4'));
    await drill.play(mv('f1', 'c4'));
    await drill.play(mv('d1', 'h5'));
    await drill.play(mv('h5', 'f7'));
    expect(drill.getState()).toMatchObject({ phase: 'over', result: 'won' });
    expect(of('game-over')[0]).toMatchObject({ result: 'won', reason: 'checkmate' });
    expect(of('offbook-mistake')).toHaveLength(0);
  });

  it('start() begins a fresh round after the game is over', async () => {
    const { drill } = setup({ maia: ['d5'] });
    await drill.play(mv('d2', 'd4'));
    drill.resign();
    drill.start();
    expect(drill.getState()).toMatchObject({ phase: 'student', history: [], prepMoves: 0, reps: 0, result: null, offBook: false });
  });
});

// The student plays Black: the opponent (White) moves first, and every sign flips because engine
// scores are centipawns from White's point of view.
describe('drill: Black student', () => {
  const keyAfter = (...sans: string[]) => {
    const c = new Chess();
    sans.forEach((san) => c.move(san));
    return posKey(c.fen());
  };
  const afterE4 = keyAfter('e4');
  /** Tree that covers only the position after 1.e4, so any White reply leaves book. */
  const tinyBlack = (san = 'c6', uci = 'c7c6'): PrepTree => new Map([[afterE4, { san, uci }]]);
  const black = (o: Parameters<typeof setup>[0] = {}) => setup({ side: 'b', openingMoves: ['e4'], ...o });

  it('the opponent moves first: the config plays 1.e4 and the student is on move', () => {
    const { drill, events } = black({ tree: caroKannTree() });
    const s = drill.getState();
    expect(s.history).toEqual(['e4']);
    expect(s.phase).toBe('student');
    expect(s.offBook).toBe(false);
    expect(events[0]).toMatchObject({ type: 'start', state: { history: ['e4'], phase: 'student' } });
    expect(drill.dests().get('c7')).toContain('c6');
  });

  it('with no opening move, Maia plays White first', async () => {
    const { drill, of } = setup({ side: 'b', maia: ['d4'], tree: tinyTree() });
    expect(drill.getState().phase).toBe('opponent');
    expect(drill.dests().size).toBe(0);
    await vi.waitFor(() => expect(drill.getState().phase).toBe('student'));
    expect(drill.getState().history).toEqual(['d4']);
    expect(of('opponent-move')[0]).toMatchObject({ san: 'd4' });
    expect(of('off-book')).toHaveLength(1); // the tiny tree has no answer to 1.d4
  });

  it('learns a new prep move with only that move legal, then tests it for a rep', async () => {
    const learned = new Set<string>();
    const { drill, of } = black({ tree: caroKannTree(), maia: ['d4'], learned });
    expect(drill.getState().teach?.san).toBe('c6');
    expect([...drill.dests()]).toEqual([['c7', ['c6']]]);
    expect(await drill.play(mv('e7', 'e5'))).toBe(false);
    await drill.play(mv('c7', 'c6'));
    expect(of('prep-correct')[0]).toMatchObject({ san: 'c6', learnedNow: true, counted: false });
    expect(learned.has(afterE4)).toBe(true);
    expect(drill.getState().history).toEqual(['e4', 'c6', 'd4']);
    expect(drill.getState().teach?.san).toBe('d5'); // the next position is new too

    const t = black({ tree: caroKannTree(), maia: ['d4'], learned: new Set([afterE4]) });
    expect(t.drill.getState().teach).toBeNull();
    await t.drill.play(mv('c7', 'c6'));
    expect(t.of('prep-correct')[0]).toMatchObject({ learnedNow: false, counted: true });
    expect(t.drill.getState().reps).toBe(1);
  });

  it('a prep miss whose White-point-of-view score goes UP counts as a loss', async () => {
    const { drill, of } = black({
      tree: caroKannTree(),
      engine: [
        { cp: 30, best: 'x' }, // after the prep move ...c6
        { cp: 30 + 100, best: 'x' }, // after ...h6 White's score is higher: worse for Black
      ],
    });
    await drill.play(mv('h7', 'h6'));
    expect(of('prep-miss')[0]).toMatchObject({ played: 'h6', prep: 'c6', prepUci: 'c7c6', loss: 100, verdict: 'mistake' });
    expect(drill.getState().history).toEqual(['e4']); // taken back
    expect(drill.getState().missed).toBe(true);
  });

  it('a prep miss whose White-point-of-view score goes down is playable with a negative loss', async () => {
    const { drill, of } = black({
      tree: caroKannTree(),
      engine: [
        { cp: 30, best: 'x' },
        { cp: 10, best: 'x' },
      ],
    });
    await drill.play(mv('e7', 'e6'));
    expect(of('prep-miss')[0]).toMatchObject({ loss: -20, verdict: 'playable' });
  });

  describe('off book', () => {
    async function offBookBlack(engine: Eval[]) {
      const t = black({ tree: tinyBlack(), maia: ['d4'], engine });
      await t.drill.play(mv('c7', 'c6')); // prep; White replies d4 and leaves the tiny tree
      await t.drill.play(mv('h7', 'h6')); // off book: judged before and after
      return t;
    }

    it("flags a mistake when White's score rises by MISTAKE", async () => {
      const { drill, of } = await offBookBlack([
        { cp: 20, best: 'd7d5' },
        { cp: 20 + MISTAKE, best: 'x' },
      ]);
      expect(of('offbook-mistake')).toEqual([{ type: 'offbook-mistake', played: 'h6', better: 'd5', betterUci: 'd7d5', loss: MISTAKE }]);
      expect(drill.getState().mistakes).toBe(1);
      expect(drill.getState().phase).toBe('student');
    });

    it("does not flag a move that lowered White's score, or a loss just under MISTAKE", async () => {
      const helped = await offBookBlack([
        { cp: 20, best: 'd7d5' },
        { cp: 20 - 300, best: 'x' },
      ]);
      expect(helped.of('offbook-mistake')).toHaveLength(0);
      const close = await offBookBlack([
        { cp: 20, best: 'd7d5' },
        { cp: 20 + MISTAKE - 1, best: 'x' },
      ]);
      expect(close.of('offbook-mistake')).toHaveLength(0);
    });

    it("does not flag a big drop when the student played the engine's best move", async () => {
      const { of } = await offBookBlack([
        { cp: 20, best: 'h7h6' },
        { cp: 20 + 300, best: 'x' },
      ]);
      expect(of('offbook-mistake')).toHaveLength(0);
    });
  });

  it('a checkmate by the student ends the game as won and is never flagged as a mistake', async () => {
    // Fool's mate: 1.f3 e5 2.g4 Qh4#
    const tree: PrepTree = new Map([[keyAfter('f3'), { san: 'e5', uci: 'e7e5' }]]);
    const { drill, of } = setup({ side: 'b', openingMoves: ['f3'], tree, maia: ['g4'] });
    await drill.play(mv('e7', 'e5'));
    await drill.play(mv('d8', 'h4'));
    expect(drill.getState()).toMatchObject({ phase: 'over', result: 'won' });
    expect(of('game-over')[0]).toMatchObject({ result: 'won', reason: 'checkmate' });
    expect(of('offbook-mistake')).toHaveLength(0);
  });

  it('a checkmate against the student ends the game as lost', async () => {
    // Scholar's mate: 1.e4 e5 2.Qh5 Nc6 3.Bc4 Nf6?? 4.Qxf7#
    const { drill, of } = black({ tree: tinyBlack('e5', 'e7e5'), maia: ['Qh5', 'Bc4', 'Qxf7#'] });
    await drill.play(mv('e7', 'e5'));
    await drill.play(mv('b8', 'c6'));
    await drill.play(mv('g8', 'f6'));
    expect(drill.getState()).toMatchObject({ phase: 'over', result: 'lost' });
    expect(of('game-over')[0]).toMatchObject({ result: 'lost', reason: 'checkmate' });
  });
});
