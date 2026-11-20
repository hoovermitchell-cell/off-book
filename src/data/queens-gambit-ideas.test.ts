import { describe, expect, it } from 'vitest';
import { buildTree } from './queens-gambit';
import { ALL_IDEAS, ideaFor } from './queens-gambit-ideas';

const tree = buildTree();
const ideas = [...tree].map(([key, prep]) => ({ key, prep, idea: ideaFor(`${key} 0 1`, prep) }));

describe("Queen's Gambit ideas", () => {
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
    expect(all).toMatch(/Qf3 hits the rook on a8/);
    expect(all).toMatch(/Lasker trap/);
  });

  it('copy has no em dashes', () => {
    for (const t of ALL_IDEAS) expect(t).not.toMatch(/—/);
  });
});
