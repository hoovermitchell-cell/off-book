import { Chess } from 'chess.js';
import { describe, expect, it } from 'vitest';
import { learn, pickStage, dueNow, provenStage, stageKeys, stageViews, tierRuns, UNLOCK, type Ladder } from '../levels';
import { LINES as caroLines } from './caro-kann';
import { AUTO as caroAuto } from './caro-kann-auto';
import { LINES as londonLines } from './london';
import { AUTO as londonAuto } from './london-auto';
import { OPENINGS, type Opening, type Tier } from './openings';
import { buildPrepTree } from './prep';

// The Advanced tier for the London and the Caro-Kann (decision 16, docs/plans/2026-10-26-advanced-tier.md).
const WITH_ADVANCED = ['london', 'caro-kann'];
const SOURCES: Record<string, { lines: string[]; auto: typeof londonAuto }> = {
  london: { lines: londonLines, auto: londonAuto },
  'caro-kann': { lines: caroLines, auto: caroAuto },
};
const advancedOf = (o: Opening) => o.stages.filter((s) => s.tier === 'advanced');
const byId = (id: string) => OPENINGS.find((o) => o.id === id)!;

describe('Advanced tier: the lines', () => {
  it.each(WITH_ADVANCED)('%s: two to four Advanced lines, each with a theory note, after every Intermediate line', (id) => {
    const o = byId(id);
    const adv = advancedOf(o);
    expect(adv.length).toBeGreaterThanOrEqual(2);
    expect(adv.length).toBeLessThanOrEqual(4);
    for (const s of adv) {
      expect(s.note, s.id).toBeTruthy();
      expect(s.note, s.id).not.toMatch(/—/);
    }
    const order: Tier[] = ['intro', 'intermediate', 'advanced'];
    const ranks = o.stages.map((s) => order.indexOf(s.tier));
    expect(ranks, 'tiers appear in unlock order').toEqual([...ranks].sort((a, b) => a - b));
    expect(ranks.at(-1)).toBe(2);
  });

  it('the openings that have no deeper tier yet are unchanged', () => {
    for (const o of OPENINGS.filter((x) => !WITH_ADVANCED.includes(x.id))) expect(advancedOf(o), o.id).toEqual([]);
  });
});

describe('Advanced tier: the content rule (decision 16)', () => {
  // A deeper tier adds positions and stages with new IDs. It never changes the prep move at a position already in the tree,
  // and it never lengthens a line that is Cleared or Proven.
  it.each(WITH_ADVANCED)('%s: every Advanced line is a pinned line, and without them the rest of the tree is exactly as it was', (id) => {
    const o = byId(id);
    const { lines, auto } = SOURCES[id];
    const advancedMoves = new Set(advancedOf(o).map((s) => s.moves.join(' ')));
    for (const m of advancedMoves) expect(lines, m).toContain(m);
    const before = buildPrepTree(lines.filter((l) => !advancedMoves.has(l)), auto, o.side);
    expect(o.tree.size, 'the Advanced lines add positions').toBeGreaterThan(before.size);
    for (const [key, prep] of before) expect(o.tree.get(key)?.san, key).toBe(prep.san);
  });

  it('the Intro and Intermediate lines have the length they had before the Advanced tier', () => {
    const lengths: Record<string, Record<string, number>> = {
      london: { textbook: 15, 'nc6-bf5': 16, 'e6-bd6': 13, 'early-bf5': 11, 'nf6-bf5': 13, 'textbook-12': 23, kid: 17 },
      'caro-kann': { classical: 26, 'exchange-nf3': 16, bc4: 15, 'nc3-exd5': 13, advance: 12, 'classical-bd3': 13, d3: 12, 'classical-17': 34, 'two-knights': 16, fantasy: 16, panov: 24 },
    };
    for (const id of WITH_ADVANCED) {
      const o = byId(id);
      expect(o.stages.filter((s) => s.tier !== 'advanced').map((s) => [s.id, s.moves.length]), id).toEqual(Object.entries(lengths[id]));
    }
  });

  it.each(WITH_ADVANCED)('%s: a real game that follows an Advanced line proves that line', (id) => {
    const o = byId(id);
    for (const s of advancedOf(o)) expect(provenStage(s.moves, o)?.id, s.id).toBe(s.id);
  });

  it('a game down an older line still proves the older line, not an Advanced one', () => {
    for (const id of WITH_ADVANCED) {
      const o = byId(id);
      const older = o.stages.find((s) => s.tier === 'intro')!;
      expect(provenStage(older.moves, o)?.tier, older.id).not.toBe('advanced');
    }
  });
});

/** A ladder with every move of the lines before `index` at UNLOCK, due far in the future. */
const learnedBefore = (o: Opening, index: number, level = UNLOCK): Ladder =>
  Object.fromEntries(o.stages.slice(0, index).flatMap((s) => stageKeys(s, o.side)).map((k) => [k, { level, due: 1e15 }]));

describe('Advanced tier: unlocking (decision 14c, no extra gate)', () => {
  it.each(WITH_ADVANCED)('%s: the first Advanced line opens once the last Intermediate line is at the next-day rung, and not before', (id) => {
    const o = byId(id);
    const firstAdvanced = o.stages.findIndex((s) => s.tier === 'advanced');
    const last = o.stages[firstAdvanced - 1];
    expect(last.tier).toBe('intermediate');
    expect(stageViews(o, learnedBefore(o, firstAdvanced), [])[firstAdvanced].status).toBe('learning');
    // One move short on the last Intermediate line keeps every Advanced line locked.
    const short = learnedBefore(o, firstAdvanced);
    const own = stageKeys(last, o.side).filter((k) => !stageKeys(o.stages[firstAdvanced], o.side).includes(k) && o.stages.slice(0, firstAdvanced - 1).every((s) => !stageKeys(s, o.side).includes(k)));
    short[own.at(-1)!] = { level: UNLOCK - 1, due: 1e15 };
    const views = stageViews(o, short, []);
    for (const v of views.slice(firstAdvanced)) expect(v.status, v.stage.id).toBe('locked');
  });

  it.each(WITH_ADVANCED)('%s: each Advanced line opens after the one before it, in the listed order', (id) => {
    const o = byId(id);
    const firstAdvanced = o.stages.findIndex((s) => s.tier === 'advanced');
    for (let i = firstAdvanced + 1; i < o.stages.length; i++) {
      const v = stageViews(o, learnedBefore(o, i - 1), []);
      expect(v[i].status, `${o.stages[i].id} before ${o.stages[i - 1].id} is learned`).toBe('locked');
      expect(stageViews(o, learnedBefore(o, i), [])[i].status, o.stages[i].id).toBe('learning');
    }
  });

  it.each(WITH_ADVANCED)('%s: every Advanced line has moves of its own, so learning one starts it', (id) => {
    const o = byId(id);
    for (const [i, s] of o.stages.entries()) {
      if (s.tier !== 'advanced') continue;
      const earlier = new Set(o.stages.slice(0, i).flatMap((x) => stageKeys(x, o.side)));
      expect(stageKeys(s, o.side).filter((k) => !earlier.has(k)).length, s.id).toBeGreaterThanOrEqual(2);
    }
  });
});

describe('Advanced tier: the rail groups the lines by tier', () => {
  const runsAt = (o: Opening, learned: number) => tierRuns(stageViews(o, learnedBefore(o, learned), []));

  it.each(WITH_ADVANCED)('%s: Intro, Intermediate, Advanced in that order, with the later tiers folded until they open', (id) => {
    const o = byId(id);
    const intermediate = o.stages.findIndex((s) => s.tier === 'intermediate');
    const advanced = o.stages.findIndex((s) => s.tier === 'advanced');

    const fresh = runsAt(o, 0);
    expect(fresh.runs.map((r) => [r.tier, r.folded])).toEqual([['intro', false], ['intermediate', true], ['advanced', true]]);
    expect(fresh.headed, 'no headings while only Intro is open').toBe(false);

    const middle = runsAt(o, intermediate);
    expect(middle.runs.map((r) => [r.tier, r.folded])).toEqual([['intro', false], ['intermediate', false], ['advanced', true]]);
    expect(middle.headed, 'headings once Intermediate opens').toBe(true);

    const late = runsAt(o, advanced);
    expect(late.runs.map((r) => [r.tier, r.folded])).toEqual([['intro', false], ['intermediate', false], ['advanced', false]]);
    expect(late.headed).toBe(true);
    expect(late.runs.reduce((n, r) => n + r.views.length, 0)).toBe(o.stages.length);
  });

  it('an opening with only Intro lines never gets a heading or a fold', () => {
    const o = byId('queens-gambit');
    const { runs, headed } = tierRuns(stageViews(o, {}, []));
    expect(runs).toHaveLength(1);
    expect(headed).toBe(false);
  });
});

describe('Advanced tier: Pause new lines still holds', () => {
  it.each(WITH_ADVANCED)('%s: paused, no Advanced line begins; unpaused, the first one does', (id) => {
    const o = byId(id);
    const firstAdvanced = o.stages.findIndex((s) => s.tier === 'advanced');
    const ladder = learnedBefore(o, firstAdvanced);
    expect(pickStage(o, ladder, [], 5)?.id).toBe(o.stages[firstAdvanced].id);
    expect(pickStage(o, ladder, [], 5, true)).toBeNull();
  });

  it.each(WITH_ADVANCED)('%s: paused, a started Advanced line carries on, and its moves count as due', (id) => {
    const o = byId(id);
    const firstAdvanced = o.stages.findIndex((s) => s.tier === 'advanced');
    const earlier = new Set(o.stages.slice(0, firstAdvanced).flatMap((s) => stageKeys(s, o.side)));
    const mine = stageKeys(o.stages[firstAdvanced], o.side).find((k) => !earlier.has(k))!;
    const ladder = learn(learnedBefore(o, firstAdvanced), mine, 0); // one move of its own learned: due at 4 hours
    const later = 5 * 3_600_000;
    expect(pickStage(o, ladder, [], later, true)?.id).toBe(o.stages[firstAdvanced].id);
    expect(dueNow(o, ladder, [], later, true)).toBeGreaterThanOrEqual(1);
    // Nothing is due yet, but the started line still has moves to learn, so it is the one picked; the other Advanced lines stay unstarted.
    expect(pickStage(o, ladder, [], 1, true)?.id).toBe(o.stages[firstAdvanced].id);
    const done = { ...learnedBefore(o, firstAdvanced + 1), [mine]: { level: UNLOCK, due: 1e15 } };
    expect(pickStage(o, done, [], later, true)).toBeNull();
    expect(pickStage(o, done, [], later)?.id).toBe(o.stages[firstAdvanced + 1].id);
  });
});

// The theory notes and idea texts make claims about exact positions. These play the claims out.
describe('Advanced tier: what the notes say is true', () => {
  const play = (line: string) => {
    const c = new Chess();
    for (const m of line.split(' ')) c.move(m);
    return c;
  };
  const material = (c: Chess) => {
    const v: Record<string, number> = { p: 1, n: 3, b: 3, r: 5, q: 9 };
    let w = 0;
    let b = 0;
    for (const row of c.board()) for (const p of row) if (p && p.type !== 'k') { if (p.color === 'w') w += v[p.type]; else b += v[p.type]; }
    return w - b;
  };

  it('London ...g5: Qh5+ is check with one reply, Kd7, and the king can no longer castle; Bxg5? fxg5 costs a bishop for a pawn', () => {
    const c = play('d4 d5 Bf4 f6 e3 g5 Qh5+');
    expect(c.inCheck()).toBe(true);
    expect(c.moves()).toEqual(['Kd7']);
    c.move('Kd7');
    expect(c.getCastlingRights('b')).toEqual({ k: false, q: false });
    const m = play('d4 d5 Bf4 f6 e3 g5 Bxg5').move('fxg5');
    expect(m.captured).toBe('b');
  });

  it('London ...g5: the g5 pawn attacks the bishop on f4, and Bg3 and h4 are legal', () => {
    const c = play('d4 d5 Bf4 f6 e3 g5 Qh5+ Kd7');
    expect(c.attackers('f4', 'b')).toContain('g5');
    expect(() => play('d4 d5 Bf4 f6 e3 g5 Qh5+ Kd7 Bg3 Qe8 Qf3 c6 h4 gxh4 Rxh4')).not.toThrow();
  });

  it('London ...Bb4+: after dxe5 the knight on f6 is attacked, the bishop and queen aim at h7, and Kxh7 is not possible', () => {
    const c = play('d4 d5 Bf4 Nc6 e3 Nf6 Nf3 e6 Bd3 Bb4+ c3 Ba5 Nbd2 O-O Qc2 Re8 Ne5 Nxe5 dxe5');
    expect(c.attackers('f6', 'w')).toContain('e5');
    c.move('Nd7'); // the knight leaves, and Bxh7+ is check; the queen guards the bishop
    const m = c.move('Bxh7+');
    expect(m.captured).toBe('p');
    expect(c.moves()).not.toContain('Kxh7');
  });

  it('London ...Ne4: f3 attacks the knight twice and it is guarded twice; the line ends a pawn up', () => {
    const c = play('d4 d5 Bf4 Nf6 e3 Ne4 Bd3 Bf5 f3');
    expect(c.attackers('e4', 'w').sort()).toEqual(['d3', 'f3']);
    expect(c.attackers('e4', 'b').sort()).toEqual(['d5', 'f5']);
    expect(material(play('d4 d5 Bf4 Nf6 e3 Ne4 Bd3 Bf5 f3 Nd6 Bxd6 Bxd3 Bxe7 Qxe7 Qxd3'))).toBe(1);
  });

  it('London ...Bxg3: hxg3 keeps the f2 pawn guarding e3, fxg3 does not, and the h-file opens for the rook', () => {
    const h = play('d4 d5 Bf4 Nf6 e3 e6 Nf3 Bd6 Bg3 Bxg3 hxg3');
    const f = play('d4 d5 Bf4 Nf6 e3 e6 Nf3 Bd6 Bg3 Bxg3 fxg3');
    expect(h.attackers('e3', 'w')).toContain('f2');
    expect(f.attackers('e3', 'w')).not.toContain('f2');
    const end = play('d4 d5 Bf4 Nf6 e3 e6 Nf3 Bd6 Bg3 Bxg3 hxg3 O-O Nc3 Nc6 Ne5 Nxe5 dxe5 Ne4 Nxe4 dxe4');
    expect(end.moves()).toContain('Rh4');
    expect(end.get('e4')).toMatchObject({ type: 'p', color: 'b' }); // the pawn on e4 is the target
  });

  it('Caro-Kann 3.Nf3: the knight does not guard e4; after Nxe5 dxe5, Qa5+ is check and attacks e5', () => {
    expect(play('e4 c6 d4 d5 Nf3 dxe4').attackers('e4', 'w')).toEqual([]);
    const c = play('e4 c6 d4 d5 Nf3 dxe4 Ne5 Nd7 Bc4 Nxe5 dxe5');
    expect(c.attackers('f7', 'w')).toEqual(['c4']); // the knight is gone: one attacker left
    c.move('Qa5+');
    expect(c.inCheck()).toBe(true);
    expect(c.attackers('e5', 'b')).toContain('a5');
    const before = play('e4 c6 d4 d5 Nf3 dxe4 Ne5 Nd7 Bc4');
    expect(before.attackers('f7', 'w').sort()).toEqual(['c4', 'e5']);
    expect(play('e4 c6 d4 d5 Nf3 dxe4 Ne5 Nd7').attackers('e5', 'b')).toContain('d7');
  });

  it('Caro-Kann 2.Qh5: ...Nf6 attacks the queen; ...d5 and ...cxd5 each attack the bishop; ...bxc6 is a capture', () => {
    expect(play('e4 c6 Qh5 Nf6').attackers('h5', 'b')).toContain('f6');
    expect(play('e4 c6 Qh5 Nf6 Qf3 e5 Bc4 d5').attackers('c4', 'b')).toContain('d5');
    expect(play('e4 c6 Qh5 Nf6 Qf3 e5 Bc4 d5 exd5 cxd5').attackers('c4', 'b')).toContain('d5');
    expect(play('e4 c6 Qh5 Nf6 Qf3 e5 Bc4 d5 exd5 cxd5 Bb5+ Nc6 Bxc6+').move('bxc6').captured).toBe('b');
  });

  it('Caro-Kann 3.Ne5: only the knight attacks f7 after ...e6, nothing guards the knight, and ...g6 stops Qxf7+', () => {
    expect(play('e4 c6 Nf3 d5 Ne5 dxe4').attackers('e4', 'w')).toEqual([]);
    const c = play('e4 c6 Nf3 d5 Ne5 dxe4 Bc4 e6');
    expect(c.attackers('f7', 'w')).toEqual(['e5']);
    const q = play('e4 c6 Nf3 d5 Ne5 dxe4 Bc4 e6 O-O Qd4');
    expect(q.attackers('e5', 'b')).toContain('d4');
    expect(q.attackers('e5', 'w')).toEqual([]);
    expect(q.attackers('c4', 'b')).toContain('d4');
    expect(q.attackers('b2', 'b')).toContain('d4');
    const h = play('e4 c6 Nf3 d5 Ne5 dxe4 Bc4 e6 O-O Qd4 Qh5');
    expect(h.attackers('f7', 'w').sort()).toEqual(['e5', 'h5']); // Qxf7+ is the threat, and the king cannot take: the knight guards f7
    h.move('g6');
    expect(h.attackers('h5', 'b')).toContain('g6');
    expect(h.attackers('f7', 'w')).toEqual(['e5']);
  });

  it('Caro-Kann 3.f3: ...d3 attacks the knight on e2 and White has nothing that attacks the pawn', () => {
    const c = play('e4 c6 Nc3 d5 f3 d4 Nce2 e5 c3 d3');
    expect(c.attackers('e2', 'b')).toContain('d3');
    expect(c.attackers('d3', 'w')).toEqual([]);
    expect(play('e4 c6 Nc3 d5 f3 d4 Nce2').get('f1')?.type).toBe('b'); // the knight shuts in the bishop on f1
  });
});
