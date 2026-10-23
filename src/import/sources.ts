// Anonymous game import straight from the browser (decisions 1b and 3). No token, no server of ours.
// Lichess:   GET https://lichess.org/api/games/user/{name}  (PGN, CORS open to any origin)
// Chess.com: GET https://api.chess.com/pub/player/{name}/games/archives, then the latest month(s)
import { parseGame, parsePgn, type ImportedGame } from './pgn';

export type ImportErrorKind = 'bad-name' | 'not-found' | 'rate-limited' | 'network' | 'server';

export class ImportError extends Error {
  constructor(readonly kind: ImportErrorKind, message: string) {
    super(message);
    this.name = 'ImportError';
  }
}

type Fetch = (url: string, init?: RequestInit) => Promise<Response>;
interface Options {
  fetch?: Fetch;
  signal?: AbortSignal;
}

/** Both sites use letters, digits, underscore and hyphen. Checked before the name goes into a URL. */
const USERNAME = /^[A-Za-z0-9][A-Za-z0-9_-]{1,29}$/;

export function validateUsername(raw: string): string {
  const name = raw.trim();
  if (!USERNAME.test(name)) {
    throw new ImportError('bad-name', `"${name.slice(0, 40)}" isn't a username. Usernames use letters, numbers, underscores and hyphens, 2 to 30 characters.`);
  }
  return name;
}

async function get(site: string, url: string, name: string, { fetch: f = globalThis.fetch.bind(globalThis), signal }: Options, accept: string): Promise<Response> {
  let res: Response;
  try {
    res = await f(url, { headers: { Accept: accept }, signal: signal ?? AbortSignal.timeout(20_000) });
  } catch {
    throw new ImportError('network', `Couldn't reach ${site}. Check the internet connection and try again. A school network can block it.`);
  }
  if (res.ok) return res;
  if (res.status === 404) throw new ImportError('not-found', `${site} has no player named "${name}". Check the spelling.`);
  if (res.status === 429) throw new ImportError('rate-limited', `${site} says there have been too many requests. Wait a minute and try again.`);
  throw new ImportError('server', `${site} had a problem (error ${res.status}). Try again in a minute.`);
}

const LICHESS_MAX = 50;

/** The student's recent standard games as either colour, newest first. */
export async function fetchLichess(raw: string, opts: Options = {}): Promise<ImportedGame[]> {
  const name = validateUsername(raw);
  // perfType leaves out variants and Chess960. Both colours come back: the London is White's repertoire, the Caro-Kann Black's.
  const url = `https://lichess.org/api/games/user/${encodeURIComponent(name)}?max=${LICHESS_MAX}&opening=true&perfType=ultraBullet,bullet,blitz,rapid,classical,correspondence`;
  const res = await get('Lichess', url, name, opts, 'application/x-chess-pgn');
  return parsePgn(await res.text(), 'lichess', 'lichess', name).games;
}

interface ChessComGame {
  pgn?: string;
  rules?: string;
  white?: { username?: string };
  black?: { username?: string };
}

const ARCHIVE = /^https:\/\/api\.chess\.com\/pub\/player\/[A-Za-z0-9_-]+\/games\/\d{4}\/\d{2}$/;
const CHESSCOM_MONTHS = 3;
const CHESSCOM_ENOUGH = 20;

/** The student's recent standard games as either colour, newest first. Reads the latest month, and earlier ones until there are enough. */
export async function fetchChessCom(raw: string, opts: Options = {}): Promise<ImportedGame[]> {
  const name = validateUsername(raw);
  const base = `https://api.chess.com/pub/player/${encodeURIComponent(name.toLowerCase())}`;
  const archives = ((await (await get('Chess.com', `${base}/games/archives`, name, opts, 'application/json')).json()) as { archives?: unknown }).archives;
  // Only follow archive links that point back at the same API, whatever the response says.
  const months = (Array.isArray(archives) ? archives : []).filter((u): u is string => typeof u === 'string' && ARCHIVE.test(u)).slice(-CHESSCOM_MONTHS).reverse();
  const out: ImportedGame[] = [];
  for (const month of months) {
    let data: { games?: ChessComGame[] };
    try {
      data = (await (await get('Chess.com', month, name, opts, 'application/json')).json()) as { games?: ChessComGame[] };
    } catch (err) {
      if (out.length) break; // an older month failing shouldn't throw away the games already read
      throw err;
    }
    for (const g of [...(data.games ?? [])].reverse()) {
      const players = [g.white?.username, g.black?.username].map((u) => u?.toLowerCase());
      if (g.rules !== 'chess' || !players.includes(name.toLowerCase()) || !g.pgn) continue;
      try {
        out.push(parseGame(g.pgn, 'chesscom', `${month}-${out.length}`, name));
      } catch {
        // ponytail: a game that won't parse is skipped, not reported.
      }
    }
    if (out.length >= CHESSCOM_ENOUGH) break;
  }
  return out;
}
