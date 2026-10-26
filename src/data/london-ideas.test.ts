import { Chess } from 'chess.js';
import { describe, expect, it } from 'vitest';
import { buildTree } from './london';
import { ADVANCED_IDEAS, ALL_IDEAS, ideaFor } from './london-ideas';

const tree = buildTree();
const ideas = [...tree].map(([key, prep]) => ({ key, prep, idea: ideaFor(`${key} 0 1`, prep) }));

describe('London ideas', () => {
  it('every trap and key moment is a real prep position', () => {
    // Each MOMENTS entry must land on a tree position, or its note can never show.
    const shown = new Set(ideas.map((i) => i.idea));
    for (const text of ALL_IDEAS.slice(0, 10)) expect(shown.has(text), text).toBe(true);
  });

  it('every Advanced note is shown on a real prep position', () => {
    const shown = new Set(ideas.map((i) => i.idea));
    for (const text of ADVANCED_IDEAS) expect(shown.has(text), text).toBe(true);
  });

  it('the Advanced notes cover the ...g5 check, the h7 diagonal, the f3 kick and the h-pawn recapture', () => {
    const adv = ADVANCED_IDEAS.join('\n');
    expect(adv).toMatch(/Bxg5\? fxg5 costs you a bishop for a pawn/);
    expect(adv).toMatch(/aimed at h7/);
    expect(adv).toMatch(/f3! The pawn and the bishop both attack the knight/);
    expect(adv).toMatch(/Take back with the h-pawn/);
  });

  it('nearly every prep position gets an idea', () => {
    const missing = ideas.filter((i) => !i.idea).map((i) => i.prep.san);
    expect(missing.length / ideas.length).toBeLessThan(0.05);
  });

  it('Bg3 against ...Bd6 explains the trade, and Bd3 against ...Bf5 offers one', () => {
    const bg3 = ideas.find((i) => i.prep.san === 'Bg3' && new Chess(`${i.key} 0 1`).get('d6')?.type === 'b');
    expect(bg3?.idea).toMatch(/bishop trade/);
    expect(ideas.find((i) => i.key.startsWith('rn1qkb1r/ppp1pppp/5n2/3p1b2/3P1B2/4P3'))?.idea).toMatch(/Bd3 offers to trade/);
  });

  it('copy has no em dashes', () => {
    for (const t of ALL_IDEAS) expect(t).not.toMatch(/—/);
  });
});
