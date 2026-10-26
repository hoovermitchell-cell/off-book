import { Chess } from 'chess.js';
import { describe, expect, it } from 'vitest';
import { buildTree as italianTree } from './italian';
import { buildTree, LINES } from './scotch';
import { AUTO } from './scotch-auto';
import { posKey } from './prep';

const keyAfter = (line: string) => {
  const chess = new Chess();
  line.split(' ').forEach((san) => { chess.move(san); });
  return posKey(chess.fen());
};

describe('Scotch tree', () => {
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

  it('answers 3.d4 against 2...Nc6 and takes back with the knight, never the Scotch Gambit', () => {
    const tree = buildTree();
    expect(tree.get(keyAfter('e4 e5 Nf3 Nc6'))?.san).toBe('d4');
    expect(tree.get(keyAfter('e4 e5 Nf3 Nc6 d4 exd4'))?.san).toBe('Nxd4');
  });

  it('every pinned Black try has a prep move for White', () => {
    const tree = buildTree({ auto: false });
    const tries = [
      'e4 e5', // 2.Nf3
      'e4 e5 Nf3 Nc6', // 3.d4
      'e4 e5 Nf3 Nc6 d4 exd4', // 4.Nxd4
      'e4 e5 Nf3 Nc6 d4 exd4 Nxd4 Bc5', // Classical
      'e4 e5 Nf3 Nc6 d4 exd4 Nxd4 Nf6', // Mieses
      'e4 e5 Nf3 Nc6 d4 Nxd4', // 3...Nxd4
      'e4 e5 Nf3 Nc6 d4 Nf6', // 3...Nf6
      'e4 e5 Nf3 Nc6 d4 Nf6 dxe5 Nxe4', // Qd5
      'e4 e5 Nf3 Nf6', // Petroff
      'e4 e5 Nf3 Nf6 Nxe5 Nxe4', // Petroff trap
      'e4 e5 Nf3 d6', // Philidor
      'e4 d5', // Scandinavian starter route
      'e4 e6 d4 d5', // French starter route
    ];
    for (const t of tries) expect(tree.has(keyAfter(t)), t).toBe(true);
  });

  it('shares the Italian support routes: same positions, same moves', () => {
    // Reuse is the point (docs/review/scotch-qgd-lines.md): a position both openings reach has one prep move.
    const italian = italianTree();
    const scotch = buildTree();
    for (const t of ['e4 e5', 'e4 e5 Nf3 d6', 'e4 e5 Nf3 Nf6', 'e4 e5 Nf3 Nf6 Nxe5 Nxe4', 'e4 d5', 'e4 e6 d4 d5']) {
      expect(scotch.get(keyAfter(t))?.san, t).toBe(italian.get(keyAfter(t))?.san);
    }
    // And they part ways at 2...Nc6 only.
    expect(scotch.get(keyAfter('e4 e5 Nf3 Nc6'))?.san).not.toBe(italian.get(keyAfter('e4 e5 Nf3 Nc6'))?.san);
  });

  it('transpositions share one prep move', () => {
    // The two ways into the Philidor.
    const tree = buildTree();
    const pairs = [
      ['e4 e5 Nf3 d6 d4 exd4', 'e4 d6 d4 e5 Nf3 exd4'],
    ];
    for (const [a, b] of pairs) {
      expect(keyAfter(a)).toBe(keyAfter(b));
      expect(tree.get(keyAfter(a))).toBeDefined();
    }
  });
});
