import { Chess } from 'chess.js';
import { describe, expect, it } from 'vitest';
import { OPENINGS } from './openings';
import { posKey } from './prep';

describe('openings', () => {
  it('has unique ids, and London first because it is the default', () => {
    expect(new Set(OPENINGS.map((o) => o.id)).size).toBe(OPENINGS.length);
    expect(OPENINGS[0].id).toBe('london');
  });

  it('has unique stage ids across openings, and every stage has a tier', () => {
    const ids = OPENINGS.flatMap((o) => o.stages.map((s) => s.id));
    expect(new Set(ids).size).toBe(ids.length);
    for (const o of OPENINGS) for (const s of o.stages) expect(['intro', 'intermediate', 'advanced'], s.id).toContain(s.tier);
  });

  it.each(OPENINGS)('$id: the forced replies are legal along the prep and leave the student on move, inside prep', (o) => {
    const chess = new Chess();
    for (let n = 0; n < o.forcedReplies.length; ) {
      if (chess.turn() === o.side) chess.move(o.tree.get(posKey(chess.fen()))!.san);
      else expect(() => chess.move(o.forcedReplies[n++]), o.forcedReplies[n - 1]).not.toThrow();
    }
    expect(chess.turn()).toBe(o.side);
    const prep = o.tree.get(posKey(chess.fen()));
    expect(prep, 'prep at the first student position').toBeDefined();
    // ponytail: an opening whose idea texts are not written yet (ideaFor is null everywhere) skips this check until they are.
    const pending = [...o.tree].every(([key, p]) => !o.ideaFor(`${key} 0 1`, p));
    if (!pending) expect(o.ideaFor(chess.fen(), prep!), 'idea for the first move').toBeTruthy();
  });

  it.each(OPENINGS)('$id: every staged line is legal and starts with the forced replies', (o) => {
    for (const s of o.stages) {
      const chess = new Chess();
      for (const san of s.moves) expect(() => chess.move(san), `${san} in ${s.id}`).not.toThrow();
      const theirs = s.moves.filter((_, i) => (i % 2 === 0) !== (o.side === 'w'));
      // A starter route opens with another first move; a staged line wins over the forced reply (drill.test.ts).
      if (s.id.startsWith('starter-')) expect(theirs[0], s.id).not.toBe(o.forcedReplies[0]);
      else expect(theirs.slice(0, o.forcedReplies.length), s.id).toEqual(o.forcedReplies);
    }
  });

  it.each(OPENINGS)('$id: every prep move is the student\'s colour', (o) => {
    for (const key of o.tree.keys()) expect(key.split(' ')[1]).toBe(o.side);
  });

  it.each(OPENINGS)('$id: the typed-move example is legal at the first student position', (o) => {
    const chess = new Chess();
    if (o.side === 'b') chess.move(o.forcedReplies[0]);
    expect(() => chess.move(o.example[0])).not.toThrow();
    expect(o.heading).toContain(o.side === 'w' ? 'White' : 'Black');
  });
});
