import { Chess } from 'chess.js';
import { describe, expect, it } from 'vitest';
import { AUTO } from './queens-gambit-auto';
import { buildTree, LINES } from './queens-gambit';
import { posKey } from './prep';

const keyAfter = (line: string) => {
  const chess = new Chess();
  line.split(' ').forEach((san) => { chess.move(san); });
  return posKey(chess.fen());
};

describe("Queen's Gambit tree", () => {
  it('every pinned line is legal and starts 1.d4 d5 2.c4', () => {
    for (const line of LINES) {
      expect(line.startsWith('d4 d5 c4'), line).toBe(true);
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

  it('has at least 400 prep positions', () => {
    expect(buildTree().size).toBeGreaterThanOrEqual(400);
  });

  it('every entry is a legal White move whose uci matches its san', () => {
    for (const [key, prep] of buildTree()) {
      const chess = new Chess(`${key} 0 1`);
      expect(chess.turn(), key).toBe('w');
      const m = chess.move(prep.san);
      expect(m.from + m.to + (m.promotion ?? ''), key).toBe(prep.uci);
    }
  });

  it('AUTO keys are White-to-move positions', () => {
    for (const key of Object.keys(AUTO)) expect(key.split(' ')[1]).toBe('w');
  });

  it('every pinned Black try has a prep move for White', () => {
    const tree = buildTree({ auto: false });
    const tries = [
      'd4 d5', // 2.c4
      'd4 d5 c4 e6', // QGD
      'd4 d5 c4 dxc4', // QGA
      'd4 d5 c4 c6', // Slav
      'd4 d5 c4 e5', // Albin
      'd4 d5 c4 Nc6', // Chigorin
      'd4 d5 c4 c6 Nf3 Nf6 Nc3 dxc4', // Slav main line
      'd4 d5 c4 c6 Nf3 Nf6 Nc3 e6', // Semi-Slav
      'd4 d5 c4 dxc4 e3 b5', // QGA with ...b5
    ];
    for (const t of tries) expect(tree.has(keyAfter(t)), t).toBe(true);
  });

  it('transpositions share one prep move', () => {
    // The Slav and the Semi-Slav reach the same position with the knights or the pawn first.
    const tree = buildTree();
    const pairs = [
      ['d4 d5 c4 c6 Nf3 Nf6', 'd4 d5 c4 Nf6 Nf3 c6'],
      ['d4 d5 c4 e6 Nc3 Nf6', 'd4 d5 c4 Nf6 Nc3 e6'],
    ];
    for (const [a, b] of pairs) {
      expect(keyAfter(a)).toBe(keyAfter(b));
      expect(tree.get(keyAfter(a))).toBeDefined();
    }
  });
});
