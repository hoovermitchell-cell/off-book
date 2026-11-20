import { Chess } from 'chess.js';
import { describe, expect, it } from 'vitest';
import { AUTO } from './slav-auto';
import { buildTree, LINES } from './slav';
import { posKey } from './prep';

const keyAfter = (line: string) => {
  const chess = new Chess();
  line.split(' ').forEach((san) => { chess.move(san); });
  return posKey(chess.fen());
};

describe('Slav tree', () => {
  it('every pinned line is legal and starts 1.d4 d5', () => {
    for (const line of LINES) {
      expect(line.startsWith('d4 d5'), line).toBe(true);
      const chess = new Chess();
      for (const san of line.split(' ')) expect(() => chess.move(san), `${san} in "${line}"`).not.toThrow();
    }
  });

  it('has no conflicting prep moves (buildTree throws on conflict)', () => {
    expect(() => buildTree({ auto: false })).not.toThrow();
    expect(() => buildTree()).not.toThrow();
  });

  it('pinned moves win over AUTO', () => {
    const all = buildTree();
    for (const [key, v] of buildTree({ auto: false })) expect(all.get(key)).toEqual(v);
  });

  it('has at least 200 prep positions', () => {
    expect(buildTree().size).toBeGreaterThanOrEqual(200);
  });

  it('every entry is a legal Black move whose uci matches its san', () => {
    for (const [key, prep] of buildTree()) {
      const chess = new Chess(`${key} 0 1`);
      expect(chess.turn(), key).toBe('b');
      const m = chess.move(prep.san);
      expect(m.from + m.to + (m.promotion ?? ''), key).toBe(prep.uci);
    }
  });

  it('AUTO keys are Black-to-move positions', () => {
    for (const key of Object.keys(AUTO)) expect(key.split(' ')[1]).toBe('b');
  });

  it('every pinned White try has a prep move for Black', () => {
    const tree = buildTree({ auto: false });
    const tries = [
      'd4', // 1...d5
      'd4 d5 c4', // Slav
      'd4 d5 c4 c6 Nf3', // 3...Nf6
      'd4 d5 c4 c6 Nf3 Nf6 Nc3', // main line
      'd4 d5 c4 c6 Nf3 Nf6 e3', // Slow Slav
      'd4 d5 c4 c6 Nf3 Nf6 e3 Bf5 cxd5 cxd5 Qb3', // Qb3 hits b7
      'd4 d5 c4 c6 cxd5', // Exchange
      'd4 d5 Bf4', // London
      'd4 d5 e3', // Colle
      'd4 d5 e4', // Blackmar-Diemer
    ];
    for (const t of tries) expect(tree.has(keyAfter(t)), t).toBe(true);
  });

  it('transpositions share one prep move', () => {
    // 2.Nf3 c6 3.c4 and 2.c4 c6 3.Nf3 reach the same position; so do 1.d4 d5 2.Bf4 Nf6 and 1.d4 Nf6 2.Bf4 d5.
    const tree = buildTree();
    const pairs = [
      ['d4 d5 c4 c6 Nf3', 'd4 d5 Nf3 c6 c4'],
      ['d4 d5 Bf4 Nf6 e3', 'd4 Nf6 Bf4 d5 e3'],
    ];
    for (const [a, b] of pairs) {
      expect(keyAfter(a)).toBe(keyAfter(b));
      expect(tree.get(keyAfter(a))).toBeDefined();
    }
  });
});
