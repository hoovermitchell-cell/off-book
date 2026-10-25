import { Chess } from 'chess.js';
import { describe, expect, it } from 'vitest';
import { encode, maiaMoves, moveIndex, sample, type MaiaRunner } from './maia';

describe('maia vocabulary', () => {
  // Spot checks against upstream get_all_possible_moves().
  it('indexes plain moves', () => {
    expect(moveIndex('a1a1', false)).toBe(0);
    expect(moveIndex('e2e4', false)).toBe(12 * 64 + 28);
  });
  it('mirrors for Black', () => {
    expect(moveIndex('e7e5', true)).toBe(12 * 64 + 28);
  });
  it('indexes promotions after the 4096 plain moves', () => {
    expect(moveIndex('a7a8q', false)).toBe(4096);
    expect(moveIndex('h2h1n', true)).toBe(4096 + 255);
  });
});

describe('maia encode', () => {
  it('puts the mover on channels 0-5', () => {
    const t = encode(new Chess());
    expect(t[0 * 12 + 3]).toBe(1); // white rook on a1, mover
    expect(t[60 * 12 + 11]).toBe(1); // black king on e8, opponent
  });
  it('mirrors the board when Black is to move', () => {
    const c = new Chess();
    c.move('d4');
    const t = encode(c);
    expect(t[0 * 12 + 3]).toBe(1); // black rook a8 shows up on a1 as the mover
    expect(t[3 * 12 + 4]).toBe(1); // black queen d8 -> d1, mover queen
    expect(t[(3 + 8 * 4) * 12 + 6]).toBe(1); // white pawn d4 mirrors to d5, opponent pawn
  });
});

// A runner that likes one UCI move a lot and gives everything else deterministic noise.
function fakeRunner(likedUci: string, black = false): MaiaRunner {
  return async () => {
    const logits = new Float32Array(4352);
    for (let i = 0; i < logits.length; i++) logits[i] = ((i * 7919) % 13) / 13;
    logits[moveIndex(likedUci, black)] = 10;
    return logits;
  };
}

describe('maiaMoves', () => {
  it('returns every legal move, probabilities sum to 1, sorted high to low', async () => {
    const moves = await maiaMoves(fakeRunner('e2e4'), new Chess(), 1100, 1100);
    expect(moves).toHaveLength(20);
    expect(moves.reduce((s, m) => s + m.p, 0)).toBeCloseTo(1, 6);
    expect(moves[0].san).toBe('e4');
    for (let i = 1; i < moves.length; i++) expect(moves[i - 1].p).toBeGreaterThanOrEqual(moves[i].p);
  });
  it('handles Black to move', async () => {
    const chess = new Chess();
    chess.move('d4');
    const moves = await maiaMoves(fakeRunner('d7d5', true), chess, 1000, 1000);
    expect(moves[0].san).toBe('d5');
    expect(moves.reduce((s, m) => s + m.p, 0)).toBeCloseTo(1, 6);
  });
  it('passes the ratings to the runner', async () => {
    const seen: number[] = [];
    await maiaMoves(async (_t, a, b) => { seen.push(a, b); return new Float32Array(4352); }, new Chess(), 900, 1300);
    expect(seen).toEqual([900, 1300]);
  });
});

describe('sample', () => {
  const moves = [
    { uci: 'a', san: 'a', logit: 0, p: 0.5 },
    { uci: 'b', san: 'b', logit: 0, p: 0.3 },
    { uci: 'c', san: 'c', logit: 0, p: 0.2 },
  ];
  it('walks the cumulative distribution', () => {
    expect(sample(moves, () => 0).san).toBe('a');
    expect(sample(moves, () => 0.6).san).toBe('b');
    expect(sample(moves, () => 0.95).san).toBe('c');
  });
});
