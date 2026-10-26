import { Chess } from 'chess.js';
import { describe, expect, it } from 'vitest';
import { buildTree } from './french';
import { ALL_IDEAS, ideaFor } from './french-ideas';

const tree = buildTree();
const ideas = [...tree].map(([key, prep]) => ({ key, prep, idea: ideaFor(`${key} 0 1`, prep) }));

const play = (line: string): Chess => {
  const c = new Chess();
  for (const san of line.split(' ')) c.move(san);
  return c;
};

describe('French ideas', () => {
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
    expect(all).toMatch(/Rubinstein French/);
    expect(all).toMatch(/Nxd4\? Nxd4 Qxd4 loses to Bb5\+/);
    expect(all).toMatch(/King's Indian Attack/);
    expect(all).toMatch(/attacks the bishop on c4/);
  });

  it('the Advance trap note is true: ...Nxd4 Nxd4 Qxd4 Bb5+ leaves the queen en prise on the d-file', () => {
    const c = play('e4 e6 d4 d5 e5 c5 c3 Nc6 Nf3 Qb6 Bd3 cxd4 cxd4 Nxd4 Nxd4 Qxd4 Bb5+');
    expect(c.inCheck()).toBe(true);
    expect(c.attackers('d4', 'w')).toContain('d1');
    // Every legal reply leaves the black queen on d4, and White's queen takes it.
    for (const reply of c.moves({ verbose: true })) {
      expect(reply.piece, reply.san).not.toBe('q');
      const d = new Chess(c.fen());
      d.move(reply.san);
      expect(d.moves().some((m) => m.startsWith('Qxd4')), reply.san).toBe(true);
    }
  });

  it('the Rubinstein notes are true: White retakes on e4 with a knight, and Black retakes on f6 with a knight', () => {
    expect(play('e4 e6 d4 d5 Nc3 dxe4').moves()).toContain('Nxe4');
    expect(play('e4 e6 d4 d5 Nd2 dxe4').moves()).toContain('Nxe4');
    expect(play('e4 e6 d4 d5 Nc3 dxe4 Nxe4 Nd7 Nf3 Ngf6 Nxf6+').moves()).toEqual(expect.arrayContaining(['Nxf6', 'gxf6']));
  });

  it('copy has no em dashes', () => {
    for (const t of ALL_IDEAS) expect(t).not.toMatch(/—/);
  });
});
