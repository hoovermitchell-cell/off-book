// Collision fixtures (decision 16, step 0): openings that share a position share credit only while they
// also share the move. Synthetic openings, so no real opening data moves.
import { Chess } from 'chess.js';
import { describe, expect, it } from 'vitest';
import { createDrill } from './drill/drill';
import { ladderKey } from './data/prep';
import { learn, provenStage, stageKeys, stageViews, type Ladder } from './levels';
import { ITALIAN, LONDON, QG, QGD, SCOTCH, SLAV } from './test-openings';

const fen = (...sans: string[]) => {
  const c = new Chess();
  for (const san of sans) c.move(san);
  return c.fen();
};
const keysOf = (o: typeof LONDON, i = 0) => stageKeys(o.stages[i], o.side);
const common = (a: string[], b: string[]) => a.filter((k) => b.includes(k));
/** Everything in `keys` learned at level 0. */
const learned = (keys: string[]): Ladder => keys.reduce<Ladder>((l, k) => learn(l, k, 0), {});

describe.each([
  ['London / QG', LONDON, QG, 1],
  ['Italian / Scotch', ITALIAN, SCOTCH, 2],
  ['Slav / QGD', SLAV, QGD, 1],
])('%s: a shared position and move share credit, a conflicting move does not', (_name, a, b, shared) => {
  it('shares exactly the moves both prescribe at the same position', () => {
    expect(common(keysOf(a), keysOf(b))).toHaveLength(shared);
  });

  it('learning one opening credits the other only for the shared moves', () => {
    const ladder = learned(keysOf(a));
    const seen = stageViews(b, ladder, [])[0].levels;
    expect(seen.filter((l) => l >= 0)).toHaveLength(shared);
    expect(seen.slice(0, shared).every((l) => l === 0)).toBe(true); // the shared prefix
    expect(seen[shared]).toBe(-1); // the first conflicting move is not credited
  });
});

describe('ladder keys', () => {
  it('carry the prescribed move: same position, different move, different key', () => {
    const at = fen('d4', 'd5');
    expect(ladderKey(at, 'c1f4')).not.toBe(ladderKey(at, 'c2c4'));
    expect(ladderKey(at, 'c2c4').split(' ')).toHaveLength(5);
  });

  it('a drill on one opening finds the other opening\'s shared move already learned, and teaches the rest', async () => {
    const ladder = learned(keysOf(LONDON));
    const drill = createDrill({
      tree: QG.tree,
      learned: { has: (k) => k in ladder, add: () => {} },
      engine: { evaluate: async () => ({ cp: 0, best: 'a1a1' }) },
      maia: async (c) => c.moves({ verbose: true }).map((m) => ({ uci: m.from + m.to, san: m.san, logit: 0, p: m.san === 'd5' ? 1 : 0 })).sort((x, y) => y.p - x.p),
      rand: () => 0,
      delay: async () => {},
    });
    drill.start();
    expect(drill.getState().teach).toBeNull(); // 1.d4 is London's move too
    await drill.play({ from: 'd2', to: 'd4' });
    expect(drill.getState().history).toEqual(['d4', 'd5']);
    expect(drill.getState().teach?.san).toBe('c4'); // London's 2.Bf4 does not teach 2.c4
  });
});

describe('proven needs the line\'s own moves', () => {
  it('a shared prefix proves nothing', () => {
    expect(provenStage('d4 d5 Bf4 Nf6 e3'.split(' '), LONDON)).toBeNull();
  });

  it('a move only that line has proves it', () => {
    expect(provenStage('d4 d5 Bf4 Nf6 e3 e6 Nf3'.split(' '), LONDON)?.id).toBe('london-main');
    expect(provenStage('d4 d5 Bf4 Nf6 e3 c5 c3'.split(' '), LONDON)?.id).toBe('london-c5');
  });

  it('a game that leaves prep itself proves nothing, however much it shared', () => {
    expect(provenStage('d4 d5 Bf4 Nf6 Nc3'.split(' '), LONDON)).toBeNull();
  });
});
