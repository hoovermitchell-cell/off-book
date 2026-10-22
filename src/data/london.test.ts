import { Chess } from 'chess.js';
import { describe, expect, it } from 'vitest';
import { AUTO } from './london-auto';
import { buildTree, LINES, posKey } from './london';

describe('London tree', () => {
  it('every pinned line is legal', () => {
    for (const line of LINES) {
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

  it('every entry is a legal White move whose uci matches its san', () => {
    for (const [key, prep] of buildTree()) {
      const chess = new Chess(`${key} 0 1`);
      expect(chess.turn(), key).toBe('w');
      const m = chess.move(prep.san);
      expect(m.from + m.to + (m.promotion ?? ''), key).toBe(prep.uci);
    }
  });

  it('posKey drops the move counters', () => {
    expect(posKey(new Chess().fen())).toBe('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq -');
  });

  it('AUTO keys are White-to-move positions', () => {
    for (const key of Object.keys(AUTO)) expect(key.split(' ')[1]).toBe('w');
  });
});
