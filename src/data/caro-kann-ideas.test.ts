import { describe, expect, it } from 'vitest';
import { buildTree } from './caro-kann';
import { ALL_IDEAS, ideaFor } from './caro-kann-ideas';

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

  it('has about 20 to 50 distinct texts', () => {
    const n = new Set(ALL_IDEAS).size;
    expect(n).toBeGreaterThanOrEqual(20);
    expect(n).toBeLessThanOrEqual(50);
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
