import { Chess } from 'chess.js';
import { describe, expect, it } from 'vitest';
import { AUTO } from './italian-auto';
import { buildTree, LINES } from './italian';
import { posKey } from './prep';

const keyAfter = (line: string) => {
  const chess = new Chess();
  line.split(' ').forEach((san) => { chess.move(san); });
  return posKey(chess.fen());
};

describe('Italian tree', () => {
  it('every pinned line is legal and starts 1.e4', () => {
    for (const line of LINES) {
      expect(line.startsWith('e4 '), line).toBe(true);
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
      'e4 e5', // 2.Nf3
      'e4 e5 Nf3 Nc6', // 3.Bc4
      'e4 e5 Nf3 Nc6 Bc4 Bc5', // Giuoco Piano
      'e4 e5 Nf3 Nc6 Bc4 Nf6', // Two Knights
      'e4 e5 Nf3 Nc6 Bc4 Be7', // Hungarian
      'e4 e5 Nf3 Nc6 Bc4 Nd4', // Blackburne Shilling
      'e4 e5 Nf3 Nf6', // Petroff
      'e4 e5 Nf3 Nf6 Nxe5 Nxe4', // Petroff trap
      'e4 e5 Nf3 d6', // Philidor
      'e4 d5', // Scandinavian starter route
      'e4 d5 exd5 Qxd5', // Scandinavian, ...Qxd5
      'e4 d5 exd5 Nf6', // Scandinavian, ...Nf6
      'e4 e6 d4 d5', // French starter route
    ];
    for (const t of tries) expect(tree.has(keyAfter(t)), t).toBe(true);
  });

  it('transpositions share one prep move', () => {
    // The Giuoco Piano and Two Knights move orders reach one position, and so do the two ways into the Philidor.
    const tree = buildTree();
    const pairs = [
      ['e4 e5 Nf3 Nc6 Bc4 Nf6 d3 Bc5', 'e4 e5 Nf3 Nc6 Bc4 Bc5 d3 Nf6'],
      ['e4 e5 Nf3 d6 d4 exd4', 'e4 d6 d4 e5 Nf3 exd4'],
    ];
    for (const [a, b] of pairs) {
      expect(keyAfter(a)).toBe(keyAfter(b));
      expect(tree.get(keyAfter(a))).toBeDefined();
    }
  });
});
