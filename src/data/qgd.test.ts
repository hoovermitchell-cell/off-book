import { Chess } from 'chess.js';
import { describe, expect, it } from 'vitest';
import { buildTree, LINES } from './qgd';
import { AUTO } from './qgd-auto';
import { posKey } from './prep';
import { buildTree as slavTree } from './slav';

const keyAfter = (line: string) => {
  const chess = new Chess();
  line.split(' ').forEach((san) => { chess.move(san); });
  return posKey(chess.fen());
};

describe('QGD tree', () => {
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
      'd4 d5 c4', // 2...e6
      'd4 d5 c4 e6 Nc3', // 3...Nf6
      'd4 d5 c4 e6 Nc3 Nf6 Bg5', // Orthodox, 4...Nbd7
      'd4 d5 c4 e6 Nc3 Nf6 Bg5 Nbd7 cxd5', // Elephant trap
      'd4 d5 c4 e6 Nc3 Nf6 Bg5 Nbd7 cxd5 exd5 Nxd5', // ...Nxd5!
      'd4 d5 c4 e6 Nc3 Nf6 cxd5', // Exchange
      'd4 d5 Bf4', // London
      'd4 d5 e3', // Colle
      'd4 d5 e4', // Blackmar-Diemer
    ];
    for (const t of tries) expect(tree.has(keyAfter(t)), t).toBe(true);
  });

  it('plays ...e6 where the Slav plays ...c6, so the two never claim the same game', () => {
    const qgd = buildTree();
    const slav = slavTree();
    expect(qgd.get(keyAfter('d4 d5 c4'))?.san).toBe('e6');
    expect(slav.get(keyAfter('d4 d5 c4'))?.san).toBe('c6');
  });

  it('transpositions share one prep move', () => {
    // 2.Nf3 Nf6 3.c4 e6 4.Nc3 and 2.c4 e6 3.Nc3 Nf6 4.Nf3 are one position.
    const tree = buildTree();
    const pairs = [
      ['d4 d5 c4 e6 Nc3 Nf6 Nf3', 'd4 d5 Nf3 Nf6 c4 e6 Nc3'],
    ];
    for (const [a, b] of pairs) {
      expect(keyAfter(a)).toBe(keyAfter(b));
      expect(tree.get(keyAfter(a))).toBeDefined();
    }
  });
});
