import { Chess } from 'chess.js';
import { describe, expect, it } from 'vitest';
import { buildTree } from './italian';
import { ALL_IDEAS, ideaFor } from './italian-ideas';

const tree = buildTree();
const ideas = [...tree].map(([key, prep]) => ({ key, prep, idea: ideaFor(`${key} 0 1`, prep) }));

const play = (line: string): Chess => {
  const c = new Chess();
  for (const san of line.split(' ')) c.move(san);
  return c;
};

describe('Italian ideas', () => {
  it('every idea text is reachable: some prep position shows it', () => {
    const shown = new Set(ideas.map((i) => i.idea));
    for (const text of ALL_IDEAS) expect(shown.has(text), text).toBe(true);
  });

  it('nearly every prep position gets an idea', () => {
    const missing = ideas.filter((i) => !i.idea).map((i) => i.prep.san);
    expect(missing.length / ideas.length, missing.join(' ')).toBeLessThan(0.05);
  });

  it('has about 20 to 50 distinct texts', () => {
    const n = new Set(ALL_IDEAS).size;
    expect(n).toBeGreaterThanOrEqual(20);
    expect(n).toBeLessThanOrEqual(50);
  });

  it('the key moments are noted', () => {
    const all = ALL_IDEAS.join('\n');
    expect(all).toMatch(/Blackburne Shilling/);
    expect(all).toMatch(/Nc6\+ is check from your queen/);
    expect(all).toMatch(/Bb3 steps back before \.\.\.b5/);
    expect(all).toMatch(/Advance/);
  });

  it('the Blackburne Shilling note is true: after Nxe5, ...Qg5 hits e5 and g2', () => {
    const c = play('e4 e5 Nf3 Nc6 Bc4 Nd4 Nxe5 Qg5');
    expect(c.attackers('e5', 'b')).toContain('g5');
    expect(c.attackers('g2', 'b')).toContain('g5');
  });

  it('the Petroff note is true: after ...Nf6??, Nc6+ is a check by the queen and hits d8', () => {
    const c = play('e4 e5 Nf3 Nf6 Nxe5 Nxe4 Qe2 Nf6 Nc6+');
    expect(c.inCheck()).toBe(true);
    expect(c.attackers('d8', 'w')).toContain('c6');
    for (const reply of c.moves({ verbose: true })) {
      const d = new Chess(c.fen());
      d.move(reply.san);
      expect(d.moves({ verbose: true }).some((m) => m.to === 'd8' || m.captured === 'q'), reply.san).toBe(true);
    }
  });

  it('copy has no em dashes', () => {
    for (const t of ALL_IDEAS) expect(t).not.toMatch(/—/);
  });
});
