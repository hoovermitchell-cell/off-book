import { Chess } from 'chess.js';
import { describe, expect, it, vi } from 'vitest';
import { boardGame, boardMove, detectPrep, guessSide, parseGame, parsePgn, PgnError, splitPgn } from './pgn';
import { loadRecent, RECENT_KEY, saveRecent, type RecentImport } from './recent';
import { fetchChessCom, fetchLichess, ImportError, validateUsername } from './sources';

// Shapes copied from real responses (Lichess export, Chess.com monthly archive), trimmed.
const LICHESS_LONDON = `[Event "Rated Blitz game"]
[Site "https://lichess.org/AbCd1234"]
[Date "2026.10.20"]
[White "student1"]
[Black "rival"]
[Result "1-0"]
[UTCDate "2026.10.20"]
[UTCTime "19:31:11"]
[Opening "London System"]
[Variant "Standard"]

1. d4 { [%clk 0:03:00] } 1... d5 { [%clk 0:03:00] } 2. Bf4 { [%clk 0:02:59] } 2... Nf6 3. e3 e6 4. Nf3 c5 5. c3 Nc6 6. Nbd2 Bd6 7. Bg3 O-O 8. Bd3 1-0
`;
const LICHESS_KINGS_PAWN = `[Event "Rated Rapid game"]
[Site "https://lichess.org/EfGh5678"]
[White "student1"]
[Black "other"]
[Result "0-1"]
[UTCDate "2026.10.19"]

1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 0-1
`;
// The student's Black game: the Caro-Kann against 1.e4.
const LICHESS_CARO_KANN = `[Event "Rated Blitz game"]
[Site "https://lichess.org/IjKl9012"]
[White "rival"]
[Black "Student1"]
[Result "0-1"]
[UTCDate "2026.10.18"]
[Opening "Caro-Kann Defense"]

1. e4 c6 2. d4 d5 3. Nc3 dxe4 4. Nxe4 Bf5 0-1
`;
const lichessBody = `${LICHESS_LONDON}\n\n${LICHESS_KINGS_PAWN}\n`;
const lichessBothBody = `${lichessBody}\n${LICHESS_CARO_KANN}`;

const res = (body: string | object, status = 200) =>
  new Response(typeof body === 'string' ? body : JSON.stringify(body), { status });

describe('PGN parsing', () => {
  it('reads tags and moves, ignoring clock comments', () => {
    const g = parseGame(LICHESS_LONDON, 'lichess', 'x');
    expect(g).toMatchObject({ white: 'student1', black: 'rival', result: '1-0', date: '2026-10-20', opening: 'London System', side: 'w', prep: 'london', url: 'https://lichess.org/AbCd1234' });
    expect(g.sans).toHaveLength(15);
    expect(g.sans.slice(0, 4)).toEqual(['d4', 'd5', 'Bf4', 'Nf6']);
  });

  it('splits a multi-game paste and keeps each game', () => {
    expect(splitPgn(lichessBody)).toHaveLength(2);
    const { games, errors } = parsePgn(lichessBody, 'paste');
    expect(errors).toEqual([]);
    expect(games.map((g) => g.prep)).toEqual(['london', null]);
  });

  it('accepts bare movetext, comments, variations and annotation glyphs', () => {
    const { games } = parsePgn('1.d4 d5 2.Bf4!? ( 2.c4 c6 ) Nf6 {a comment; with (parens)} 3.e3 *', 'paste');
    expect(games[0].sans).toEqual(['d4', 'd5', 'Bf4', 'Nf6', 'e3']);
    expect(games[0].white).toBe('White');
  });

  it('names the move number where an illegal move was typed', () => {
    const err = (() => { try { parseGame('1. d4 d5 2. Bf4 Nf6 3. e3 e6 4. Nf3 c5 5. Qh5 Nc6', 'paste', 'x'); } catch (e) { return e as PgnError; } })();
    expect(err).toBeInstanceOf(PgnError);
    expect(err?.moveNumber).toBe(5);
    expect(err?.message).toMatch(/Move 5 \(White\): "Qh5" is not a legal move/);
  });

  it('reports a Black move by number too', () => {
    expect(() => parseGame('1. e4 e5 2. Nf3 Nf3', 'paste', 'x')).toThrow(/Move 2 \(Black\): "Nf3"/);
  });

  it('rejects text with no moves, set-up positions and variants, in plain words', () => {
    expect(() => parseGame('hello there', 'paste', 'x')).toThrow(/"hello"/);
    expect(() => parseGame('[Event "x"]\n\n*', 'paste', 'x')).toThrow(/No moves found/);
    expect(() => parseGame('[FEN "8/8/8/8/8/8/8/K6k w - - 0 1"]\n[SetUp "1"]\n\n1. Ka2 *', 'paste', 'x')).toThrow(/set-up position/);
    expect(() => parseGame('[Variant "Crazyhouse"]\n\n1. e4 e5 *', 'paste', 'x')).toThrow(/Crazyhouse/);
  });

  it('keeps the games that parse and reports the ones that do not', () => {
    const { games, errors } = parsePgn(`${LICHESS_LONDON}\n[Event "bad"]\n\n1. e4 e4 *\n`, 'paste');
    expect(games).toHaveLength(1);
    expect(errors).toHaveLength(1);
    expect(errors[0].moveNumber).toBe(1);
  });

  it('finds the London by walking the game through its prep', () => {
    const sans = (s: string) => parsePgn(s, 'paste').games[0].sans;
    expect(detectPrep(sans('1. d4 d5 2. Bf4 Nf6'), 'w')).toEqual({ prep: 'london', prepFrom: 'book' });
    expect(detectPrep(sans('1. d4 Nf6 2. Nf3 d5 3. Bf4 e6'), 'w').prep).toBeNull(); // 2.Nf3 left prep after one move, and 1.d4 alone is too little
    expect(detectPrep(sans('1. e4 e5 2. Nf3 Nc6 3. Bb5'), 'w').prep).toBeNull();
    expect(detectPrep(sans('1. c4 e5 2. Nc3'), 'w').prep).toBeNull();
  });
});

describe('opening and side', () => {
  const sans = (s: string) => parsePgn(s, 'paste').games[0].sans;

  it('detects the Caro-Kann as 1.e4 c6 for Black only', () => {
    const caro = sans('1. e4 c6 2. d4 d5');
    expect(guessSide(caro)).toBe('b');
    expect(detectPrep(caro, 'b')).toEqual({ prep: 'caro-kann', prepFrom: 'book' });
    expect(detectPrep(caro, 'w').prep).toBeNull(); // White playing 1.e4 against ...c6 is not the student's prep
    expect(detectPrep(sans('1. e4 e5 2. Nf3'), 'b').prep).toBeNull();
    expect(detectPrep(sans('1. d4 c6'), 'b').prep).toBeNull();
  });

  it('detects the London for White only', () => {
    const london = sans('1. d4 d5 2. Bf4 Nf6');
    expect(guessSide(london)).toBe('w');
    expect(detectPrep(london, 'w').prep).toBe('london');
    expect(detectPrep(london, 'b').prep).toBeNull();
  });

  it('a paste has no username: the side is guessed, and White when nothing is recognised', () => {
    expect(parsePgn('1. e4 c6 2. d4 d5', 'paste').games[0]).toMatchObject({ side: 'b', prep: 'caro-kann' });
    expect(parsePgn('1. d4 d5 2. Bf4 Nf6', 'paste').games[0]).toMatchObject({ side: 'w', prep: 'london' });
    expect(parsePgn('1. e4 e5 2. Nf3 Nc6', 'paste').games[0]).toMatchObject({ side: 'w', prep: null });
  });

  it('a username fixes the side as the colour that name played, whatever the moves', () => {
    const pgn = (white: string, black: string, moves: string) => `[White "${white}"]\n[Black "${black}"]\n\n${moves} *`;
    // The student as White plays 1.e4 and meets ...c6: still White, and no prep to show.
    expect(parseGame(pgn('Student1', 'rival', '1. e4 c6 2. d4 d5'), 'lichess', 'x', 'student1')).toMatchObject({ side: 'w', prep: null });
    expect(parseGame(pgn('rival', 'student1', '1. e4 c6 2. d4 d5'), 'lichess', 'x', 'STUDENT1')).toMatchObject({ side: 'b', prep: 'caro-kann' });
    expect(parseGame(pgn('rival', 'Student1', '1. d4 d5 2. Bf4 Nf6'), 'chesscom', 'x', 'student1')).toMatchObject({ side: 'b', prep: null });
    expect(parseGame(pgn('Student1', 'rival', '1. d4 d5 2. Bf4 Nf6'), 'chesscom', 'x', 'student1')).toMatchObject({ side: 'w', prep: 'london' });
  });
});

describe('usernames', () => {
  it('accepts normal names and rejects anything that could change the URL', () => {
    expect(validateUsername('  Mr_Chess-99 ')).toBe('Mr_Chess-99');
    for (const bad of ['', 'a', 'x'.repeat(31), 'two words', 'a/b', '../etc', 'name?x=1', 'name#frag', 'héllo']) {
      expect(() => validateUsername(bad), bad).toThrow(ImportError);
    }
  });
});

describe('Lichess import', () => {
  it('requests both colours from the public export API without credentials, and parses the PGN', async () => {
    const fetch = vi.fn(async () => res(lichessBothBody));
    const games = await fetchLichess('student1', { fetch });
    expect(games.map((g) => [g.side, g.prep])).toEqual([['w', 'london'], ['w', null], ['b', 'caro-kann']]);
    const [url, init] = fetch.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toMatch(/^https:\/\/lichess\.org\/api\/games\/user\/student1\?max=50&opening=true&perfType=ultraBullet,bullet,blitz,rapid,classical,correspondence$/);
    expect(url).not.toMatch(/color=/);
    expect(init.headers).toEqual({ Accept: 'application/x-chess-pgn' });
    expect(JSON.stringify(init)).not.toMatch(/Authorization|Bearer/i);
  });

  it('percent-encodes the name and refuses a bad one before any request', async () => {
    const fetch = vi.fn(async () => res(''));
    await expect(fetchLichess('a/b', { fetch })).rejects.toMatchObject({ kind: 'bad-name' });
    expect(fetch).not.toHaveBeenCalled();
  });

  it('an empty response is zero games, not an error', async () => {
    expect(await fetchLichess('quietplayer', { fetch: async () => res('') })).toEqual([]);
  });

  it.each([
    [404, 'not-found', /no player named "ghost"/],
    [429, 'rate-limited', /too many requests/],
    [500, 'server', /error 500/],
  ])('HTTP %i becomes %s in plain words', async (status, kind, message) => {
    await expect(fetchLichess('ghost', { fetch: async () => res('x', status) })).rejects.toMatchObject({ kind, message: expect.stringMatching(message) });
  });

  it('a network failure says so', async () => {
    await expect(fetchLichess('student1', { fetch: async () => { throw new TypeError('Failed to fetch'); } })).rejects.toMatchObject({ kind: 'network', message: expect.stringMatching(/Couldn't reach Lichess/) });
  });
});

describe('Chess.com import', () => {
  const entry = (pgn: string, white: string, rules = 'chess') => ({ pgn, rules, white: { username: white }, black: { username: 'rival' } });
  const chessComPgn = `[Event "Live Chess"]
[Site "Chess.com"]
[Date "2026.09.08"]
[White "Student1"]
[Black "rival"]
[Result "1-0"]
[Link "https://www.chess.com/game/live/123"]

1. d4 {[%clk 0:04:53.5]} 1... d5 {[%clk 0:04:53.5]} 2. Bf4 {[%clk 0:04:50.1]} 2... Nf6 1-0`;
  const archives = { archives: ['https://api.chess.com/pub/player/student1/games/2026/08', 'https://api.chess.com/pub/player/student1/games/2026/09', 'https://api.chess.com/pub/player/student1/games/2026/10'] };

  function mock(months: Record<string, object>) {
    return vi.fn(async (url: string) => {
      if (url.endsWith('/games/archives')) return res(archives);
      const body = months[url];
      return body ? res(body) : res('', 404);
    });
  }

  it('reads the archive list, then the latest months, keeping standard White games newest first', async () => {
    const fetch = mock({
      'https://api.chess.com/pub/player/student1/games/2026/10': { games: [entry(chessComPgn, 'someone-else'), entry(chessComPgn, 'student1', 'chess960')] },
      'https://api.chess.com/pub/player/student1/games/2026/09': { games: [entry(chessComPgn.replace('1. d4', '1. c4').replace('2. Bf4', '2. Nc3'), 'student1'), entry(chessComPgn, 'STUDENT1')] },
      'https://api.chess.com/pub/player/student1/games/2026/08': { games: [entry(chessComPgn, 'student1')] },
    });
    const games = await fetchChessCom('Student1', { fetch });
    expect(games).toHaveLength(3); // Oct has none usable, Sep has two, Aug has one
    expect(games[0].prep).toBe('london'); // the later game in September comes first
    expect(games[1].prep).toBeNull();
    expect(games[0]).toMatchObject({ source: 'chesscom', white: 'Student1', date: '2026-09-08', url: 'https://www.chess.com/game/live/123' });
    expect(fetch.mock.calls[0][0]).toBe('https://api.chess.com/pub/player/student1/games/archives');
  });

  it('keeps games from either colour, and records which one the user played', async () => {
    const asBlack = chessComPgn.replace('[White "Student1"]', '[White "rival"]').replace('[Black "rival"]', '[Black "Student1"]').replace('1. d4', '1. e4').replace('1... d5', '1... c6').replace(/2\. Bf4 .*$/, '2. d4 d5 0-1');
    const fetch = mock({
      'https://api.chess.com/pub/player/student1/games/2026/10': { games: [{ pgn: asBlack, rules: 'chess', white: { username: 'rival' }, black: { username: 'Student1' } }, entry(chessComPgn, 'student1'), entry(chessComPgn, 'rival')] },
    });
    const games = await fetchChessCom('student1', { fetch });
    // The third entry has the user on neither side, so it is left out. (The mock's black player is always "rival".)
    expect(games.map((g) => [g.side, g.prep])).toEqual([['w', 'london'], ['b', 'caro-kann']]);
  });

  it('does not follow archive links that point anywhere else', async () => {
    const fetch = vi.fn(async (url: string) => (url.endsWith('/archives') ? res({ archives: ['https://evil.example/pub/player/x/games/2026/10', 'http://api.chess.com/pub/player/x/games/2026/10'] }) : res('', 500)));
    expect(await fetchChessCom('student1', { fetch })).toEqual([]);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('skips a game that will not parse', async () => {
    const fetch = mock({ 'https://api.chess.com/pub/player/student1/games/2026/10': { games: [entry('1. e4 e4', 'student1'), entry(chessComPgn, 'student1')] } });
    expect(await fetchChessCom('student1', { fetch })).toHaveLength(1);
  });

  it.each([
    [404, 'not-found', /Chess\.com has no player named "ghost"/],
    [429, 'rate-limited', /too many requests/],
  ])('HTTP %i becomes %s in plain words', async (status, kind, message) => {
    await expect(fetchChessCom('ghost', { fetch: async () => res('x', status) })).rejects.toMatchObject({ kind, message: expect.stringMatching(message) });
  });

  it('a user with no archives has no games', async () => {
    expect(await fetchChessCom('newbie', { fetch: async () => res({ archives: [] }) })).toEqual([]);
  });
});

describe('recent games store', () => {
  const recent: RecentImport = { source: 'lichess', label: 'student1', at: 1_700_000_000_000, games: parsePgn(lichessBody, 'lichess').games };

  it('round-trips through a store under its own key', () => {
    const data = new Map<string, string>();
    const store = { getItem: (k: string) => data.get(k) ?? null, setItem: (k: string, v: string) => void data.set(k, v) };
    expect(saveRecent(recent, store)).toBe(true);
    expect([...data.keys()]).toEqual([RECENT_KEY]);
    expect(loadRecent(store)?.games.map((g) => g.prep)).toEqual(['london', null]);
  });

  it('reads data saved before Black existed, and works out the side and opening again', () => {
    const old = (g: object) => JSON.stringify({ source: 'lichess', label: 'student1', at: 1, games: [g] });
    const base = { source: 'lichess', white: 'student1', black: 'rival', result: '1-0', date: '', id: 'a' };
    // Saved with the old "london" flag: a username game was always White's.
    const london = loadRecent({ getItem: () => old({ ...base, sans: ['d4', 'd5', 'Bf4'], london: true }) });
    expect(london?.games[0]).toMatchObject({ side: 'w', prep: 'london' });
    // White playing 1.e4 against the opponent's ...c6 is not a Caro-Kann for the student.
    const white = loadRecent({ getItem: () => old({ ...base, sans: ['e4', 'c6', 'd4'], london: false }) });
    expect(white?.games[0]).toMatchObject({ side: 'w', prep: null });
    // An old pasted game gets the same guess a fresh paste does.
    const pasted = loadRecent({ getItem: () => JSON.stringify({ source: 'paste', label: 'pasted PGN', at: 1, games: [{ ...base, source: 'paste', sans: ['e4', 'c6', 'd4'], london: false }] }) });
    expect(pasted?.games[0]).toMatchObject({ side: 'b', prep: 'caro-kann' });
  });

  it('keeps a saved side and recomputes the opening from it', () => {
    const r = loadRecent({ getItem: () => JSON.stringify({ source: 'lichess', label: 'x', at: 1, games: [{ source: 'lichess', id: 'a', white: 'rival', black: 'x', result: '*', date: '', sans: ['e4', 'c6'], side: 'b', prep: null }] }) });
    expect(r?.games[0]).toMatchObject({ side: 'b', prep: 'caro-kann' });
  });

  it('survives blocked, full and corrupt storage', () => {
    expect(saveRecent(recent, { setItem: () => { throw new Error('quota'); } })).toBe(false);
    expect(loadRecent({ getItem: () => { throw new Error('blocked'); } })).toBeNull();
    expect(loadRecent({ getItem: () => '{not json' })).toBeNull();
    expect(loadRecent({ getItem: () => JSON.stringify({ label: 'x', at: 1, games: [{ white: 1 }] }) })).toBeNull();
  });
});

describe('board entry', () => {
  /** Plays `moves` (typed text) on a fresh board. */
  const entered = (moves: string[]) => {
    const chess = new Chess();
    for (const m of moves) expect(boardMove(chess, m)).not.toBeNull();
    return chess;
  };

  it('builds the game a pasted PGN of the same moves would', () => {
    const chess = new Chess();
    expect(boardMove(chess, { from: 'd2', to: 'd4' })?.san).toBe('d4');
    for (const m of ['d5', 'Bf4', 'Nf6', 'e3', 'e6', 'Bd3']) expect(boardMove(chess, m)).not.toBeNull();
    const g = boardGame(chess.history(), '*', 'board-1');
    const pasted = parseGame('1.d4 d5 2.Bf4 Nf6 3.e3 e6 4.Bd3', 'paste', 'board-1');
    expect(g).toEqual(pasted);
    expect(g).toMatchObject({ source: 'paste', white: 'White', black: 'Black', date: '', result: '*', side: 'w', prep: 'london', prepFrom: 'book' });
  });

  it('carries the result through', () => {
    const sans = entered(['d4', 'd5']).history();
    expect(['1-0', '0-1', '1/2-1/2', '*'].map((r) => boardGame(sans, r, 'x').result)).toEqual(['1-0', '0-1', '1/2-1/2', '*']);
  });

  it('refuses an illegal move and leaves the game as it was', () => {
    const chess = entered(['d4']);
    expect(boardMove(chess, 'Nf3')).toBeNull(); // Black is to move
    expect(boardMove(chess, { from: 'a7', to: 'a3' })).toBeNull();
    expect(chess.history()).toEqual(['d4']);
  });

  it('queens a promotion, however it is entered, unless the text names a piece', () => {
    const fen = '8/4P3/8/8/8/8/k6K/8 w - - 0 1';
    const play = (m: Parameters<typeof boardMove>[1]) => boardMove(new Chess(fen), m)?.san;
    expect([play({ from: 'e7', to: 'e8' }), play('e7e8'), play('e8=Q')]).toEqual(['e8=Q', 'e8=Q', 'e8=Q']);
    expect(play('e8=N')).toBe('e8=N');
    const chess = new Chess(fen);
    boardMove(chess, { from: 'e7', to: 'e8' });
    expect(chess.get('e8')).toMatchObject({ type: 'q', color: 'w' });
  });
});
