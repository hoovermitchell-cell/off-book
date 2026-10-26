import { Chess } from 'chess.js';
import { describe, expect, it } from 'vitest';
import { OPENINGS } from './data/openings';
import { posKey } from './data/prep';
import { dueNow, learn, pickStage, provenStage, review, RUNG_MS, SECURE, stageKeys, stageViews, UNLOCK, type Ladder } from './levels';

const [london, caro] = OPENINGS;
const H = 3_600_000;

describe('staged lines', () => {
  it.each(OPENINGS)("every student move along $name's stages is the tree's prep move", (o) => {
    for (const s of o.stages) {
      const chess = new Chess();
      for (const san of s.moves) {
        const key = posKey(chess.fen());
        const m = chess.move(san); // throws on an illegal move
        if (m.color === o.side) expect(o.tree.get(key)?.san, `${s.id} at ${san}`).toBe(m.san);
      }
    }
  });
});

describe('ladder', () => {
  const k = 'pos';
  it('climbs only when due, drops one rung on a miss and comes back in 4 hours', () => {
    let l: Ladder = learn({}, k, 0);
    expect(l[k]).toEqual({ level: 0, due: RUNG_MS[0] });
    expect(review(l, k, true, 1).to).toBe(0); // not due yet
    l = review(l, k, true, RUNG_MS[0]).ladder;
    expect(l[k]).toEqual({ level: 1, due: RUNG_MS[0] + RUNG_MS[1] });
    const miss = review(l, k, false, 5);
    expect(miss).toMatchObject({ from: 1, to: 0 });
    expect(miss.ladder[k].due).toBe(5 + 4 * H);
    expect(review({}, k, true, 0).to).toBe(-1); // not learned: no change
  });

  it('tops out at SECURE and keeps a weekly review', () => {
    const l: Ladder = { [k]: { level: SECURE, due: 0 } };
    expect(review(l, k, true, 0).ladder[k]).toEqual({ level: SECURE, due: RUNG_MS[3] });
  });
});

describe('stages', () => {
  const all = (keys: string[], level: number, due = 1e15): Ladder => Object.fromEntries(keys.map((x) => [x, { level, due }]));
  const first = stageKeys(london.stages[0], 'w');

  it('only the first line is open at the start, and it is picked', () => {
    expect(stageViews(london, {}, []).map((v) => v.status)).toEqual(['learning', 'locked', 'locked', 'locked', 'locked']);
    expect(pickStage(london, {}, [], 0)?.id).toBe('textbook');
  });

  it('the next line opens once every move of the line before is at UNLOCK', () => {
    const v = stageViews(london, all(first, UNLOCK), []);
    expect(v[1].status).toBe('learning');
    expect(pickStage(london, all(first, UNLOCK), [], 0)?.id).toBe('nc6-bf5');
    expect(stageViews(london, all(first, UNLOCK - 1), [])[1].status).toBe('locked');
  });

  it('cleared at SECURE, proven when recorded, and free play when nothing is new or due', () => {
    const everything = all(london.stages.flatMap((s) => stageKeys(s, 'w')), SECURE);
    expect(stageViews(london, everything, ['textbook']).map((v) => v.status)).toEqual(['proven', 'cleared', 'cleared', 'cleared', 'cleared']);
    expect(pickStage(london, everything, [], 0)).toBeNull();
    expect(dueNow(london, all(first, 1, 0), [], 1)).toBe(first.length);
  });

  it('a clean real game proves the line it followed; leaving prep yourself does not', () => {
    const textbook = london.stages[0].moves;
    expect(provenStage([...textbook, 'Nb4'], london)?.id).toBe('textbook');
    expect(provenStage(['d4', 'd5', 'Bf4', 'Nf6', 'Nf3'], london)).toBeNull(); // 3.Nf3 is not the prep 3.e3
    expect(provenStage(['d4', 'g6', 'Bf4'], london)).toBeNull(); // too little of any line
    expect(provenStage([...caro.stages[4].moves, 'c3'], caro)?.id).toBe('advance');
  });
});
