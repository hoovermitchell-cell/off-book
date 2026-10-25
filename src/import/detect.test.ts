// Opening detection with several openings per side (decision 16, step 0). OPENINGS is swapped for the
// synthetic set, so the collisions are real: London / QG, Italian / Scotch, Slav / QGD.
import { describe, expect, it, vi } from 'vitest';

vi.mock('../data/openings', async () => {
  const { SYNTHETIC } = await import('../test-openings');
  return { OPENINGS: SYNTHETIC, DEFAULT_OPENING: SYNTHETIC[0] };
});

import { detectPrep, parsePgn } from './pgn';
import { loadRecent } from './recent';

const sans = (s: string) => s.split(' ');

describe('detectPrep with several openings on a side', () => {
  it('picks the opening whose prep the student kept longer', () => {
    expect(detectPrep(sans('d4 d5 Bf4 Nf6'), 'w')).toEqual({ prep: 'london', prepFrom: 'book' });
    expect(detectPrep(sans('d4 d5 c4 e6'), 'w')).toEqual({ prep: 'qg', prepFrom: 'book' });
    expect(detectPrep(sans('e4 e5 Nf3 Nc6 Bc4'), 'w')).toEqual({ prep: 'italian', prepFrom: 'book' });
    expect(detectPrep(sans('e4 e5 Nf3 Nc6 d4 exd4'), 'w')).toEqual({ prep: 'scotch', prepFrom: 'book' });
    expect(detectPrep(sans('d4 d5 c4 c6'), 'b')).toEqual({ prep: 'slav', prepFrom: 'book' });
    expect(detectPrep(sans('d4 d5 c4 e6'), 'b')).toEqual({ prep: 'qgd', prepFrom: 'book' });
  });

  it('marks a tie, and still names the first tied opening', () => {
    expect(detectPrep(sans('d4 d5'), 'w')).toEqual({ prep: null, prepFrom: 'book' }); // 1.d4 alone is too little for White
    expect(detectPrep(sans('e4 e5 Nf3 Nc6'), 'w')).toEqual({ prep: 'italian', prepFrom: 'tie' });
    expect(detectPrep(sans('d4 d5'), 'b')).toEqual({ prep: 'slav', prepFrom: 'tie' });
  });

  it('needs at least one move in prep', () => {
    expect(detectPrep(sans('c4 e5'), 'w')).toEqual({ prep: null, prepFrom: 'book' });
    expect(detectPrep(sans('e4 e5'), 'b')).toEqual({ prep: null, prepFrom: 'book' }); // White's 1.e4 is nobody's prep for Black here
  });

  it('a parsed game carries the opening and where it came from', () => {
    expect(parsePgn('1. e4 e5 2. Nf3 Nc6', 'paste').games[0]).toMatchObject({ side: 'w', prep: 'italian', prepFrom: 'tie' });
    // A White opening matches too, so the paste guesses White; the student can still say Black on the confirm step.
    expect(parsePgn('1. d4 d5 2. c4 c6', 'paste').games[0]).toMatchObject({ side: 'w', prep: 'qg', prepFrom: 'book' });
  });
});

describe('a student\'s correction survives reopening the recent list', () => {
  const game = (extra: object) => ({ source: 'paste', id: 'paste-0', white: 'a', black: 'b', result: '*', date: '', sans: sans('e4 e5 Nf3 Nc6 Bc4'), side: 'w', ...extra });
  const open = (g: object) => loadRecent({ getItem: () => JSON.stringify({ source: 'paste', label: 'pasted PGN', at: 1, games: [g] }) })?.games[0];

  it('keeps the pick over the book walk', () => {
    expect(open(game({ prep: 'scotch', prepFrom: 'student' }))).toMatchObject({ prep: 'scotch', prepFrom: 'student' });
  });

  it('recomputes anything the student did not pick', () => {
    expect(open(game({ prep: 'scotch', prepFrom: 'book' }))).toMatchObject({ prep: 'italian', prepFrom: 'book' });
    expect(open(game({ prep: 'scotch' }))).toMatchObject({ prep: 'italian', prepFrom: 'book' });
  });

  it('drops a pick that does not name an opening on the game\'s side', () => {
    expect(open(game({ prep: 'slav', prepFrom: 'student' }))).toMatchObject({ prep: 'italian', prepFrom: 'book' });
    expect(open(game({ prep: 'gone', prepFrom: 'student' }))).toMatchObject({ prep: 'italian', prepFrom: 'book' });
  });
});
