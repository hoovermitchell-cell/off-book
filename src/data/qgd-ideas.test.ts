import { Chess, type PieceSymbol } from 'chess.js';
import { describe, expect, it } from 'vitest';
import { buildTree } from './qgd';
import { ALL_IDEAS, ideaFor } from './qgd-ideas';

const tree = buildTree();
const ideas = [...tree].map(([key, prep]) => ({ key, prep, idea: ideaFor(`${key} 0 1`, prep) }));

const play = (line: string): Chess => {
  const c = new Chess();
  for (const san of line.split(' ')) c.move(san);
  return c;
};
const WORTH: Record<PieceSymbol, number> = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };
/** Black's material minus White's. */
const balance = (c: Chess) => c.board().flat().reduce((sum, p) => sum + (p ? (p.color === 'b' ? 1 : -1) * WORTH[p.type] : 0), 0);
const ELEPHANT = 'd4 d5 c4 e6 Nc3 Nf6 Bg5 Nbd7 cxd5 exd5 Nxd5 Nxd5 Bxd8 Bb4+ Qd2 Bxd2+ Kxd2 Kxd8';

describe('QGD ideas', () => {
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
    expect(all).toMatch(/Elephant trap/);
    expect(all).toMatch(/Queen's Gambit Declined/);
    expect(all).toMatch(/Exchange/);
    expect(all).toMatch(/pawn up/);
  });

  it('the Elephant trap is true: the only block is Qd2, and Black ends a knight for a pawn up', () => {
    const check = play('d4 d5 c4 e6 Nc3 Nf6 Bg5 Nbd7 cxd5 exd5 Nxd5 Nxd5 Bxd8 Bb4+');
    expect(check.inCheck()).toBe(true);
    expect(check.moves()).toEqual(['Qd2']);
    const end = play(ELEPHANT);
    expect(balance(end)).toBe(2);
    // Everything captured in the line: White takes two pawns, a queen and a bishop; Black takes a pawn, a knight, a queen and a bishop.
    const taken = (color: 'w' | 'b') => end.history({ verbose: true }).filter((m) => m.color === color && m.captured).map((m) => m.captured).sort().join('');
    expect(taken('w')).toBe('bppq');
    expect(taken('b')).toBe('bnpq');
  });

  it('the Orthodox notes are true: Nbd7 guards f6, Nd5 hits c3, and ...e5 opens the c8 bishop', () => {
    expect(play('d4 d5 c4 e6 Nc3 Nf6 Bg5 Nbd7').attackers('f6', 'b')).toContain('d7');
    expect(play('d4 d5 c4 e6 Nc3 Nf6 Bg5 Nbd7 e3 Be7 Nf3 O-O Rc1 c6 Bd3 dxc4 Bxc4 Nd5').attackers('c3', 'b')).toContain('d5');
    const c = play('d4 d5 c4 e6 Nc3 Nf6 Bg5 Nbd7 e3 Be7 Nf3 O-O Rc1 c6 Bd3 dxc4 Bxc4 Nd5 Bxe7 Qxe7 O-O Nxc3 Rxc3 e5 dxe5 Nxe5');
    expect(c.attackers('h3', 'b')).toContain('c8');
  });

  it('the Orthodox line gains a move: White\'s bishop goes to d3 and then has to take on c4', () => {
    const c = play('d4 d5 c4 e6 Nc3 Nf6 Bg5 Nbd7 e3 Be7 Nf3 O-O Rc1 c6 Bd3 dxc4');
    expect(c.moves({ verbose: true }).some((m) => m.san === 'Bxc4' && m.from === 'd3')).toBe(true);
  });

  it('the Blackmar-Diemer note is true: Black is a pawn up after Nxf3', () => {
    expect(balance(play('d4 d5 e4 dxe4 Nc3 Nf6 f3 exf3 Nxf3'))).toBe(1);
  });

  it('the London note is true: ...Bd6 faces the bishop on f4', () => {
    const c = play('d4 d5 Bf4 Nf6 e3 e6 Nf3 Bd6');
    expect(c.attackers('f4', 'b')).toContain('d6');
    expect(c.attackers('d6', 'w')).toContain('f4');
  });

  it('copy has no em dashes', () => {
    for (const t of ALL_IDEAS) expect(t).not.toMatch(/—/);
  });
});
