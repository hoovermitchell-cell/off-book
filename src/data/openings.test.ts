import { Chess } from 'chess.js';
import { describe, expect, it } from 'vitest';
import { OPENINGS } from './openings';
import { posKey } from './prep';

describe('openings', () => {
  it('has unique ids, and London first because it is the default', () => {
    expect(new Set(OPENINGS.map((o) => o.id)).size).toBe(OPENINGS.length);
    expect(OPENINGS[0].id).toBe('london');
  });

  it.each(OPENINGS)('$id: the forced moves are legal and leave the student on move, inside prep', (o) => {
    const chess = new Chess();
    for (const san of o.openingMoves) expect(() => chess.move(san), san).not.toThrow();
    expect(chess.turn()).toBe(o.side);
    const prep = o.tree.get(posKey(chess.fen()));
    expect(prep, 'prep at the first student position').toBeDefined();
    expect(o.ideaFor(chess.fen(), prep!), 'idea for the first move').toBeTruthy();
  });

  it.each(OPENINGS)('$id: every prep move is the student\'s colour', (o) => {
    for (const key of o.tree.keys()) expect(key.split(' ')[1]).toBe(o.side);
  });

  it.each(OPENINGS)('$id: the typed-move example is legal at the first student position', (o) => {
    const chess = new Chess();
    o.openingMoves.forEach((san) => { chess.move(san); });
    expect(() => chess.move(o.example[0])).not.toThrow();
    expect(o.heading).toContain(o.side === 'w' ? 'White' : 'Black');
  });
});
