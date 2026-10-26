import { describe, expect, it } from 'vitest';
import { buildTree } from './caro-kann';
import { ADVANCED_IDEAS, ALL_IDEAS, ideaFor } from './caro-kann-ideas';

const tree = buildTree();
const ideas = [...tree].map(([key, prep]) => ({ key, prep, idea: ideaFor(`${key} 0 1`, prep) }));

describe('Caro-Kann ideas', () => {
  it('every idea text is reachable: some prep position shows it', () => {
    const shown = new Set(ideas.map((i) => i.idea));
    for (const text of ALL_IDEAS) expect(shown.has(text), text).toBe(true);
  });

  it('nearly every prep position gets an idea', () => {
    const missing = ideas.filter((i) => !i.idea).map((i) => i.prep.san);
    expect(missing.length / ideas.length).toBeLessThan(0.05);
  });

  it('has about 20 to 50 distinct texts, not counting the Advanced notes', () => {
    // Decision 13b's "about 25 per opening" is for the Intro and Intermediate lines; each Advanced line adds a few notes of its own.
    const n = new Set(ALL_IDEAS.filter((t) => !ADVANCED_IDEAS.includes(t))).size;
    expect(n).toBeGreaterThanOrEqual(20);
    expect(n).toBeLessThanOrEqual(50);
  });

  it('the Advanced notes say what is on the board: the knight trade and Qa5+, the queen attack, the bishop block, the d3 wedge', () => {
    const adv = ADVANCED_IDEAS.join('\n');
    expect(adv).toMatch(/Qa5\+ checks the king and attacks the pawn on e5/);
    expect(adv).toMatch(/Nf6 attacks the queen/);
    expect(adv).toMatch(/\.\.\.Bd7\?\? and \.\.\.Ke7\?\? both lose/);
    expect(adv).toMatch(/Qd4! The queen attacks the knight on e5/);
    expect(adv).toMatch(/d3! The pawn attacks the knight on e2/);
  });

  it('the traps are noted: Nd6 mate, the Fantasy rook, f7 after ...Bxf3, Qxf7 mate in setup A', () => {
    const all = ALL_IDEAS.join('\n');
    expect(all).toMatch(/Ngf6\?\? loses to Nd6/);
    expect(all).toMatch(/takes the rook on h1/);
    expect(all).toMatch(/both hit f7/);
    expect(all).toMatch(/Qxf7 is mate/);
    expect(all).toMatch(/Qxd4 wins the pawn/);
  });

  it('copy has no em dashes', () => {
    for (const t of ALL_IDEAS) expect(t).not.toMatch(/—/);
  });
});
