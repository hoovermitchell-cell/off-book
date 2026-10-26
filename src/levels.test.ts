import { Chess } from 'chess.js';
import { describe, expect, it } from 'vitest';
import { OPENINGS } from './data/openings';
import { posKey } from './data/prep';
import { battleEntry, dueNow, gameKey, learn, pickStage, provenStage, recordText, records, recordWords, review, RUNG_MS, SECURE, setGame, stageKeys, stageViews, UNLOCK, type Games, type Ladder } from './levels';
import type { ImportedGame } from './import/pgn';

const [london, caro] = OPENINGS;
const H = 3_600_000;

describe('staged lines', () => {
  it.each(OPENINGS)("every student move along $name's stages is the tree's prep move", (o) => {
    for (const s of o.stages) {
      const chess = new Chess();
      for (const san of s.moves) {
        const key = posKey(chess.fen());
        const m = chess.move(san); // throws on an illegal move
        if (m.color === o.side) expect(o.tree.get(key)?.san, `${s.id} at ${san}`).toBe(m.san);
      }
    }
  });
});

describe('ladder', () => {
  const k = 'pos';
  it('climbs only when due, drops one rung on a miss and comes back in 4 hours', () => {
    let l: Ladder = learn({}, k, 0);
    expect(l[k]).toEqual({ level: 0, due: RUNG_MS[0] });
    expect(review(l, k, true, 1).to).toBe(0); // not due yet
    l = review(l, k, true, RUNG_MS[0]).ladder;
    expect(l[k]).toEqual({ level: 1, due: RUNG_MS[0] + RUNG_MS[1] });
    const miss = review(l, k, false, 5);
    expect(miss).toMatchObject({ from: 1, to: 0 });
    expect(miss.ladder[k].due).toBe(5 + 4 * H);
    expect(review({}, k, true, 0).to).toBe(-1); // not learned: no change
  });

  it('tops out at SECURE and keeps a weekly review', () => {
    const l: Ladder = { [k]: { level: SECURE, due: 0 } };
    expect(review(l, k, true, 0).ladder[k]).toEqual({ level: SECURE, due: RUNG_MS[3] });
  });
});

describe('stages', () => {
  const all = (keys: string[], level: number, due = 1e15): Ladder => Object.fromEntries(keys.map((x) => [x, { level, due }]));
  const first = stageKeys(london.stages[0], 'w');

  it('only the first line is open at the start, and it is picked', () => {
    expect(stageViews(london, {}, []).map((v) => v.status)).toEqual(['learning', 'locked', 'locked', 'locked', 'locked']);
    expect(pickStage(london, {}, [], 0)?.id).toBe('textbook');
  });

  it('the next line opens once every move of the line before is at UNLOCK', () => {
    const v = stageViews(london, all(first, UNLOCK), []);
    expect(v[1].status).toBe('learning');
    expect(pickStage(london, all(first, UNLOCK), [], 0)?.id).toBe('nc6-bf5');
    expect(stageViews(london, all(first, UNLOCK - 1), [])[1].status).toBe('locked');
  });

  it('cleared at SECURE, proven when recorded, and free play when nothing is new or due', () => {
    const everything = all(london.stages.flatMap((s) => stageKeys(s, 'w')), SECURE);
    expect(stageViews(london, everything, ['textbook']).map((v) => v.status)).toEqual(['proven', 'cleared', 'cleared', 'cleared', 'cleared']);
    expect(pickStage(london, everything, [], 0)).toBeNull();
    expect(dueNow(london, all(first, 1, 0), [], 1)).toBe(first.length);
  });

  it('a clean real game proves the line it followed; leaving prep yourself does not', () => {
    const textbook = london.stages[0].moves;
    expect(provenStage([...textbook, 'Nb4'], london)?.id).toBe('textbook');
    expect(provenStage(['d4', 'd5', 'Bf4', 'Nf6', 'Nf3'], london)).toBeNull(); // 3.Nf3 is not the prep 3.e3
    expect(provenStage(['d4', 'g6', 'Bf4'], london)).toBeNull(); // too little of any line
    expect(provenStage([...caro.stages[4].moves, 'c3'], caro)?.id).toBe('advance');
  });
});

describe('battle record', () => {
  const textbook = [...london.stages[0].moves, 'Nb4']; // prep to the end, then Black leaves book
  const game = (over: Partial<ImportedGame> = {}): ImportedGame => ({
    id: 'paste-0', source: 'paste', white: 'Me', black: 'Them', result: '1-0', date: '2026-10-20', sans: textbook, side: 'w', prep: 'london', prepFrom: 'book', ...over,
  });

  describe('which games count', () => {
    it('a finished game that proves a line counts, from the student side', () => {
      expect(battleEntry(game(), london)).toEqual({ stage: 'textbook', result: 'w' });
      expect(battleEntry(game({ result: '0-1' }), london)).toEqual({ stage: 'textbook', result: 'l' });
      expect(battleEntry(game({ result: '1/2-1/2' }), london)).toEqual({ stage: 'textbook', result: 'd' });
    });

    it('as Black, 0-1 is a win and 1-0 a loss', () => {
      const asBlack = game({ side: 'b', sans: [...caro.stages[4].moves, 'c3'], prep: 'caro-kann' });
      expect(battleEntry({ ...asBlack, result: '0-1' }, caro)).toEqual({ stage: 'advance', result: 'w' });
      expect(battleEntry({ ...asBlack, result: '1-0' }, caro)).toEqual({ stage: 'advance', result: 'l' });
    });

    it('an unfinished game proves a line but adds nothing to the record', () => {
      expect(provenStage(textbook, london)?.id).toBe('textbook');
      expect(battleEntry(game({ result: '*' }), london)).toBeNull();
    });

    it('a sparring game, a tie between openings and a game that proves nothing do not count', () => {
      expect(battleEntry(game({ source: 'spar' }), london)).toBeNull();
      expect(battleEntry(game({ prepFrom: 'tie' }), london)).toBeNull();
      expect(battleEntry(game({ sans: ['d4', 'd5', 'Bf4', 'Nf6', 'Nf3'] }), london)).toBeNull(); // the student left prep
      expect(battleEntry(game({ sans: ['d4', 'g6', 'Bf4'] }), london)).toBeNull(); // too little of any line
    });

    it('the student picking the opening counts as the book walk does', () => {
      expect(battleEntry(game({ prepFrom: 'student' }), london)?.stage).toBe('textbook');
    });
  });

  describe('game keys', () => {
    it('a fetched game is keyed by its link', () => {
      expect(gameKey(game({ url: 'https://lichess.org/abc' }))).toBe('https://lichess.org/abc');
    });

    it('pastes share list ids (paste-0), so the key reads the game itself', () => {
      expect(gameKey(game())).toBe(gameKey(game({ id: 'paste-3' }))); // the same game pasted again is the same key
      expect(gameKey(game())).not.toBe(gameKey(game({ sans: [...textbook, 'Qd3'] })));
      expect(gameKey(game())).not.toBe(gameKey(game({ date: '2026-10-21' })));
      expect(gameKey(game())).not.toBe(gameKey(game({ black: 'Someone else' })));
      expect(gameKey(game())).not.toBe(gameKey(game({ result: '0-1' })));
    });
  });

  describe('set, replace, drop', () => {
    const win = { stage: 'textbook', result: 'w' as const };
    it('sets, replaces and removes one key, leaving the rest alone', () => {
      let g: Games = { other: { stage: 'advance', result: 'l' } };
      g = setGame(g, 'k', win);
      expect(g).toEqual({ other: { stage: 'advance', result: 'l' }, k: win });
      g = setGame(g, 'k', win); // reviewed again: still one entry
      expect(Object.keys(g)).toEqual(['other', 'k']);
      g = setGame(g, 'k', { stage: 'nc6-bf5', result: 'd' }); // reviewed as another line: replaced
      expect(g.k).toEqual({ stage: 'nc6-bf5', result: 'd' });
      g = setGame(g, 'k', null); // no longer proves a line: dropped
      expect(g).toEqual({ other: { stage: 'advance', result: 'l' } });
    });

    it('does not change the games it was given', () => {
      const g: Games = { k: win };
      setGame(g, 'k', null);
      expect(g).toEqual({ k: win });
    });
  });

  describe('records()', () => {
    it('counts wins, draws and losses per line', () => {
      const g: Games = {
        a: { stage: 'textbook', result: 'w' }, b: { stage: 'textbook', result: 'w' }, c: { stage: 'textbook', result: 'l' },
        d: { stage: 'advance', result: 'd' },
      };
      expect(records(g)).toEqual({ textbook: { w: 2, d: 0, l: 1 }, advance: { w: 0, d: 1, l: 0 } });
    });

    it('has no entry for a line without games, and none at all for no games', () => {
      expect(records({})).toEqual({});
      expect(records({ a: { stage: 'textbook', result: 'w' } }).advance).toBeUndefined();
    });

    it('reads as 2–0–1 and says so for a screen reader', () => {
      expect(recordText({ w: 2, d: 0, l: 1 })).toBe('2–0–1');
      expect(recordWords({ w: 2, d: 0, l: 1 })).toBe('2 wins, 0 draws, 1 loss in real games');
      expect(recordWords({ w: 1, d: 1, l: 2 })).toBe('1 win, 1 draw, 2 losses in real games');
    });
  });
});
