// The talk's prepared progress (decision 14c: "later stages can be shown by restoring a prepared backup").
// This test builds demo/off-book-demo.json and demo/game.pgn from the real staged lines and fails if the
// committed copies drift. Regenerate with: WRITE_DEMO=1 npm test -- demo
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { OPENINGS } from './data/openings';
import { parsePgn } from './import/pgn';
import { type Ladder, provenStage, SECURE, stageKeys, stageViews, dueNow } from './levels';
import { walkPrep } from './review/review';
import { BACKUP_APP, BACKUP_VERSION, parseBackup, type Saved } from './storage';

const [london, caro] = OPENINGS;
// ponytail: fixed dues, so the file works on any talk date. 0 is always due; FAR never is before the talk.
const FAR = Date.UTC(2100, 0, 1);
const stage = (o: typeof london, id: string) => o.stages.find((s) => s.id === id)!;

/** Levels along a line, in order (-1 leaves the move unlearned); `due` lists the indexes due now. */
function climb(ladder: Ladder, keys: string[], levels: number[], due: number[] = []) {
  keys.forEach((k, i) => {
    if (levels[i] >= 0 && !ladder[k]) ladder[k] = { level: levels[i], due: due.includes(i) ? 0 : FAR };
  });
}

function demoSaved(): Saved {
  const ladder: Ladder = {};
  // Proven and Cleared lines first, so a position they share with a Learning line stays secure.
  for (const id of ['textbook', 'nc6-bf5']) climb(ladder, stageKeys(stage(london, id), 'w'), stageKeys(stage(london, id), 'w').map(() => SECURE));
  climb(ladder, stageKeys(stage(london, 'e6-bd6'), 'w'), [3, 3, 2, 2, 1, 0, -1], [1, 2, 3, 4]);
  climb(ladder, stageKeys(stage(caro, 'classical'), 'b'), [3, 2, 2, 2, 1, 1, 1, 0, 0, -1, -1, -1, -1], [1, 4, 7]);
  return { ladder, proven: ['textbook'] };
}

// The game to paste at the talk: the ...Nc6 and ...Bf5 line until Black leaves book with 5...h6.
const GAME = `[Event "Club night"]
[White "Student"]
[Black "Opponent"]
[Result "1/2-1/2"]

1. d4 d5 2. Bf4 Nc6 3. e3 Nf6 4. Nf3 Bf5 5. Nbd2 h6 6. c3 e6 7. Be2 Bd6 8. Bxd6 Qxd6 9. O-O O-O 1/2-1/2
`;

const backup = `${JSON.stringify({ app: BACKUP_APP, version: BACKUP_VERSION, exportedAt: '2026-10-26T00:00:00.000Z', data: demoSaved() }, null, 2)}\n`;
const files: [string, string][] = [['demo/off-book-demo.json', backup], ['demo/game.pgn', GAME]];

describe('talk demo', () => {
  it('restores with the statuses the talk shows', () => {
    const r = parseBackup(backup);
    if (!r.ok) throw new Error(r.reason);
    const status = (o: typeof london) => stageViews(o, r.saved.ladder, r.saved.proven).map((v) => v.status);
    expect(status(london)).toEqual(['proven', 'cleared', 'learning', 'locked', 'locked']);
    expect(status(caro)[0]).toBe('learning');
    expect(dueNow(london, r.saved.ladder, r.saved.proven, Date.now())).toBeGreaterThan(1);
    expect(dueNow(caro, r.saved.ladder, r.saved.proven, Date.now())).toBeGreaterThan(0);
  });

  it('the pasted game reads as the London and proves the cleared line', () => {
    const game = parsePgn(GAME, 'paste').games[0];
    expect(game).toMatchObject({ side: 'w', prep: 'london' });
    expect(walkPrep(game.sans, london).leftBy).toBe('opponent');
    expect(provenStage(game.sans, london)?.id).toBe('nc6-bf5');
  });

  it.each(files)('%s is up to date', (path, text) => {
    if (process.env.WRITE_DEMO) writeFileSync(path, text);
    expect(existsSync(path) && readFileSync(path, 'utf8').replace(/\r\n/g, '\n')).toBe(text);
  });
});
