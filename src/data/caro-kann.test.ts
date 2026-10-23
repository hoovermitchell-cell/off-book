import { Chess } from 'chess.js';
import { describe, expect, it } from 'vitest';
import { AUTO } from './caro-kann-auto';
import { buildTree, LINES } from './caro-kann';
import { posKey } from './prep';

const keyAfter = (line: string) => {
  const chess = new Chess();
  line.split(' ').forEach((san) => chess.move(san));
  return posKey(chess.fen());
};

describe('Caro-Kann tree', () => {
  it('every pinned line is legal and starts 1.e4 c6', () => {
    for (const line of LINES) {
      expect(line.startsWith('e4 c6'), line).toBe(true);
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
      'e4', // 1...c6
      'e4 c6 d4 d5 Nc3', // Classical
      'e4 c6 d4 d5 Nd2',
      'e4 c6 d4 d5 e5', // Advance
      'e4 c6 d4 d5 exd5 cxd5 c4', // Panov
      'e4 c6 d4 d5 exd5', // Exchange
      'e4 c6 d4 d5 f3', // Fantasy
      'e4 c6 Nc3 d5 Nf3', // Two Knights
      'e4 c6 d3',
      'e4 c6 c4',
      'e4 c6 Nf3',
    ];
    for (const t of tries) expect(tree.has(keyAfter(t)), t).toBe(true);
  });

  it('transpositions share one prep move', () => {
    // 2.Nc3 d5 3.d4 is the Classical; 2.c4 d5 3.exd5 cxd5 4.d4 is the Panov; 2.Nf3 d5 3.e5 Bf5 4.d4 is the Advance.
    const tree = buildTree();
    const pairs = [
      ['e4 c6 d4 d5 Nc3', 'e4 c6 Nc3 d5 d4'],
      ['e4 c6 d4 d5 exd5 cxd5 c4', 'e4 c6 c4 d5 exd5 cxd5 d4'],
      ['e4 c6 d4 d5 e5 Bf5 Nf3', 'e4 c6 Nf3 d5 e5 Bf5 d4'],
    ];
    for (const [a, b] of pairs) {
      expect(keyAfter(a)).toBe(keyAfter(b));
      expect(tree.get(keyAfter(a))).toBeDefined();
    }
  });
});
