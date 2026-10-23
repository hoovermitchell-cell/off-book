import { describe, expect, it, vi } from 'vitest';
import { isLondonAsWhite, parseGame, parsePgn, PgnError, splitPgn } from './pgn';
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
const lichessBody = `${LICHESS_LONDON}\n\n${LICHESS_KINGS_PAWN}\n`;

const res = (body: string | object, status = 200) =>
  new Response(typeof body === 'string' ? body : JSON.stringify(body), { status });

describe('PGN parsing', () => {
  it('reads tags and moves, ignoring clock comments', () => {
    const g = parseGame(LICHESS_LONDON, 'lichess', 'x');
    expect(g).toMatchObject({ white: 'student1', black: 'rival', result: '1-0', date: '2026-10-20', opening: 'London System', london: true, url: 'https://lichess.org/AbCd1234' });
    expect(g.sans).toHaveLength(15);
    expect(g.sans.slice(0, 4)).toEqual(['d4', 'd5', 'Bf4', 'Nf6']);
  });

  it('splits a multi-game paste and keeps each game', () => {
    expect(splitPgn(lichessBody)).toHaveLength(2);
    const { games, errors } = parsePgn(lichessBody, 'paste');
    expect(errors).toEqual([]);
    expect(games.map((g) => g.london)).toEqual([true, false]);
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

  it('flags the London as 1.d4 with an early Bf4', () => {
    const sans = (s: string) => parsePgn(s, 'paste').games[0].sans;
    expect(isLondonAsWhite(sans('1. d4 d5 2. Bf4 Nf6'))).toBe(true);
    expect(isLondonAsWhite(sans('1. d4 Nf6 2. Nf3 d5 3. Bf4 e6'))).toBe(true);
    expect(isLondonAsWhite(sans('1. d4 d5 2. c4 e6 3. Nc3 Nf6 4. Bg5 Be7'))).toBe(false);
    expect(isLondonAsWhite(sans('1. e4 e5 2. Nf3 Nc6 3. Bb5'))).toBe(false);
    expect(isLondonAsWhite(sans('1. d4 d5 2. c4 c6 3. Nf3 Nf6 4. Nc3 e6 5. a3 Bd6 6. Bf4'))).toBe(false); // too late
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
  it('requests White games from the public export API without credentials, and parses the PGN', async () => {
    const fetch = vi.fn(async () => res(lichessBody));
    const games = await fetchLichess('student1', { fetch });
    expect(games.map((g) => [g.black, g.london])).toEqual([['rival', true], ['other', false]]);
    const [url, init] = fetch.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toMatch(/^https:\/\/lichess\.org\/api\/games\/user\/student1\?max=50&color=white&opening=true&perfType=/);
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
      'https://api.chess.com/pub/player/student1/games/2026/09': { games: [entry(chessComPgn.replace('Bf4', 'Nf3'), 'student1'), entry(chessComPgn, 'STUDENT1')] },
      'https://api.chess.com/pub/player/student1/games/2026/08': { games: [entry(chessComPgn, 'student1')] },
    });
    const games = await fetchChessCom('Student1', { fetch });
    expect(games).toHaveLength(3); // Oct has none usable, Sep has two, Aug has one
    expect(games[0].london).toBe(true); // the later game in September comes first
    expect(games[1].london).toBe(false);
    expect(games[0]).toMatchObject({ source: 'chesscom', white: 'Student1', date: '2026-09-08', url: 'https://www.chess.com/game/live/123' });
    expect(fetch.mock.calls[0][0]).toBe('https://api.chess.com/pub/player/student1/games/archives');
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
    expect(loadRecent(store)?.games.map((g) => g.london)).toEqual([true, false]);
  });

  it('survives blocked, full and corrupt storage', () => {
    expect(saveRecent(recent, { setItem: () => { throw new Error('quota'); } })).toBe(false);
    expect(loadRecent({ getItem: () => { throw new Error('blocked'); } })).toBeNull();
    expect(loadRecent({ getItem: () => '{not json' })).toBeNull();
    expect(loadRecent({ getItem: () => JSON.stringify({ label: 'x', at: 1, games: [{ white: 1 }] }) })).toBeNull();
  });
});
