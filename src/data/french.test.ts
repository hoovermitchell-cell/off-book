import { Chess } from 'chess.js';
import { describe, expect, it } from 'vitest';
import { AUTO } from './french-auto';
import { buildTree, LINES } from './french';
import { posKey } from './prep';

const keyAfter = (line: string) => {
  const chess = new Chess();
  line.split(' ').forEach((san) => { chess.move(san); });
  return posKey(chess.fen());
};

describe('French tree', () => {
  it('every pinned line is legal and starts 1.e4 e6', () => {
    for (const line of LINES) {
      expect(line.startsWith('e4 e6'), line).toBe(true);
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

  it('has at least 250 prep positions', () => {
    expect(buildTree().size).toBeGreaterThanOrEqual(250);
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
      'e4', // 1...e6
      'e4 e6 d4', // 2...d5
      'e4 e6 d4 d5 Nc3', // Rubinstein
      'e4 e6 d4 d5 Nd2', // Tarrasch move order, answered the same way
      'e4 e6 d4 d5 e5', // Advance
      'e4 e6 d4 d5 e5 c5 c3 Nc6 Nf3', // Advance, 5.Nf3
      'e4 e6 d4 d5 e5 c5 c3 Nc6 Nf3 Qb6 Bd3 cxd4 cxd4', // Advance, after the exchange on d4
      'e4 e6 d4 d5 exd5', // Exchange
      'e4 e6 d3', // King's Indian Attack
    ];
    for (const t of tries) expect(tree.has(keyAfter(t)), t).toBe(true);
  });

  it('transpositions share one prep move', () => {
    // The Advance and the King's Indian Attack each have a second move order.
    const tree = buildTree();
    const pairs = [
      ['e4 e6 d4 d5 e5 c5 c3 Nc6 Nf3', 'e4 e6 Nf3 d5 e5 c5 d4 Nc6 c3'],
      ['e4 e6 d3 d5 Nd2 Nf6 Ngf3', 'e4 e6 Nf3 d5 d3 Nf6 Nbd2'],
    ];
    for (const [a, b] of pairs) {
      expect(keyAfter(a)).toBe(keyAfter(b));
      expect(tree.get(keyAfter(a))).toBeDefined();
    }
  });
});
