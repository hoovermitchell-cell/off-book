import { Chess } from 'chess.js';
import { describe, expect, it } from 'vitest';
import { buildTree as italianTree } from './italian';
import { ideaFor as italianIdea } from './italian-ideas';
import { buildTree } from './scotch';
import { ALL_IDEAS, ideaFor } from './scotch-ideas';

const tree = buildTree();
const italian = italianTree();
const ideas = [...tree].map(([key, prep]) => ({ key, prep, idea: ideaFor(`${key} 0 1`, prep) }));

const play = (line: string): Chess => {
  const c = new Chess();
  for (const san of line.split(' ')) c.move(san);
  return c;
};
const cFilePawns = (c: Chess) => c.board().flat().filter((p) => p?.type === 'p' && p.color === 'b' && p.square[0] === 'c').length;

describe('Scotch ideas', () => {
  it('every idea text written for the Scotch is reachable: some prep position shows it', () => {
    const shown = new Set(ideas.map((i) => i.idea));
    for (const text of ALL_IDEAS) expect(shown.has(text), text).toBe(true);
  });

  it('nearly every prep position gets an idea', () => {
    const missing = ideas.filter((i) => !i.idea).map((i) => i.prep.san);
    expect(missing.length / ideas.length, missing.join(' ')).toBeLessThan(0.05);
  });

  it('a position the Italian shares, with the same move, shows the Italian\'s text', () => {
    let shared = 0;
    for (const { key, prep, idea } of ideas) {
      if (italian.get(key)?.san !== prep.san) continue;
      shared++;
      expect(idea, key).toBe(italianIdea(`${key} 0 1`, prep));
    }
    expect(shared).toBeGreaterThan(300);
  });

  it('has about 20 to 50 distinct texts of its own', () => {
    const n = new Set(ALL_IDEAS).size;
    expect(n).toBeGreaterThanOrEqual(20);
    expect(n).toBeLessThanOrEqual(50);
  });

  it('the key moments are noted', () => {
    const all = ALL_IDEAS.join('\n');
    expect(all).toMatch(/This is the Scotch/);
    expect(all).toMatch(/Scotch Gambit/);
    expect(all).toMatch(/Qd5 attacks the knight on e4 and the pawn on f7/);
  });

  it('the 3.d4 notes are true: Bc4 is the gambit, and the knight takes back on d4', () => {
    const c = play('e4 e5 Nf3 Nc6 d4 exd4');
    expect(c.moves()).toEqual(expect.arrayContaining(['Nxd4', 'Bc4']));
    expect(play('e4 e5 Nf3 Nc6 d4 exd4 Nxd4').get('d4')).toMatchObject({ type: 'n', color: 'w' });
  });

  it('the Classical notes are true: ...Bc5 hits d4, Be3 guards it, three Black pieces aim at it, Bc4 aims at f7', () => {
    const bc5 = play('e4 e5 Nf3 Nc6 d4 exd4 Nxd4 Bc5');
    expect(bc5.attackers('d4', 'b')).toContain('c5');
    expect(play('e4 e5 Nf3 Nc6 d4 exd4 Nxd4 Bc5 Be3').attackers('d4', 'w')).toContain('e3');
    const qf6 = play('e4 e5 Nf3 Nc6 d4 exd4 Nxd4 Bc5 Be3 Qf6');
    expect(qf6.attackers('d4', 'b').sort()).toEqual(['c5', 'c6', 'f6']);
    expect(play('e4 e5 Nf3 Nc6 d4 exd4 Nxd4 Bc5 Be3 Qf6 c3').attackers('d4', 'w')).toEqual(expect.arrayContaining(['c3', 'e3', 'd1']));
    const bc4 = play('e4 e5 Nf3 Nc6 d4 exd4 Nxd4 Bc5 Be3 Qf6 c3 Nge7 Bc4');
    expect(bc4.attackers('f7', 'w')).toContain('c4');
    expect(new Chess(bc4.fen().replace(' b ', ' w ')).moves()).toContain('O-O');
  });

  it('the Mieses notes are true: Black ends with two c-pawns, e5 hits f6, Qe2 guards e5, c4 hits d5', () => {
    const c = play('e4 e5 Nf3 Nc6 d4 exd4 Nxd4 Nf6 Nxc6 bxc6');
    expect(cFilePawns(c)).toBe(2);
    expect(play('e4 e5 Nf3 Nc6 d4 exd4 Nxd4 Nf6 Nxc6 bxc6 e5').attackers('f6', 'w')).toContain('e5');
    const qe7 = play('e4 e5 Nf3 Nc6 d4 exd4 Nxd4 Nf6 Nxc6 bxc6 e5 Qe7');
    expect(qe7.attackers('e5', 'b')).toContain('e7');
    expect(play('e4 e5 Nf3 Nc6 d4 exd4 Nxd4 Nf6 Nxc6 bxc6 e5 Qe7 Qe2').attackers('e5', 'w')).toContain('e2');
    const nd5 = play('e4 e5 Nf3 Nc6 d4 exd4 Nxd4 Nf6 Nxc6 bxc6 e5 Qe7 Qe2 Nd5 c4');
    expect(nd5.attackers('d5', 'w')).toContain('c4');
  });

  it('the 3...Nxd4 notes are true: the queen takes on d4 and nothing of Black\'s attacks it yet', () => {
    const c = play('e4 e5 Nf3 Nc6 d4 Nxd4 Nxd4 exd4 Qxd4');
    expect(c.get('d4')).toMatchObject({ type: 'q', color: 'w' });
    expect(c.attackers('d4', 'b')).toEqual([]);
  });

  it('the 3...Nf6 notes are true: dxe5 attacks the knight, and Qd5 hits e4 and f7', () => {
    expect(play('e4 e5 Nf3 Nc6 d4 Nf6 dxe5').attackers('f6', 'w')).toContain('e5');
    const c = play('e4 e5 Nf3 Nc6 d4 Nf6 dxe5 Nxe4 Qd5');
    expect(c.attackers('e4', 'w')).toContain('d5');
    expect(c.attackers('f7', 'w')).toContain('d5');
  });

  it('copy has no em dashes', () => {
    for (const t of ALL_IDEAS) expect(t).not.toMatch(/—/);
  });
});
