// PGN reading for game import (decision 1b). Pure: no DOM, no network.
// Own tokenizer instead of chess.js loadPgn so a bad move can be reported by move number.
import { Chess } from 'chess.js';

export type GameSource = 'lichess' | 'chesscom' | 'paste';

export interface ImportedGame {
  id: string;
  source: GameSource;
  white: string;
  black: string;
  /** "1-0", "0-1", "1/2-1/2" or "*". */
  result: string;
  /** "2026-10-20", or "" when the PGN has no date. */
  date: string;
  opening?: string;
  url?: string;
  /** Every move, both sides, as chess.js normalizes it. */
  sans: string[];
  /** The student, as White, played 1.d4 and an early Bf4. */
  london: boolean;
}

export class PgnError extends Error {
  constructor(message: string, readonly moveNumber?: number) {
    super(message);
    this.name = 'PgnError';
  }
}

const TAG = /^\s*\[(\w+)\s+"((?:[^"\\]|\\.)*)"\s*\]\s*$/;
const RESULT = /^(1-0|0-1|1\/2-1\/2|\*)$/;

/** ponytail: London means 1.d4 and Bf4 within White's first five moves. Not a full opening classifier. */
export function isLondonAsWhite(sans: string[]): boolean {
  if (sans[0] !== 'd4') return false;
  for (let i = 2; i < Math.min(sans.length, 10); i += 2) if (/^Bf4[+#]?$/.test(sans[i])) return true;
  return false;
}

/** "6. Nbd2" for White's ply (0-based), "5...Nc6" for Black's. */
export const plyLabel = (ply: number, san: string) => (ply % 2 ? `${(ply + 1) / 2}...${san}` : `${ply / 2 + 1}. ${san}`);

/** Splits a paste into games. A tag line that follows movetext starts the next game.
 *  ponytail: games without tag lines must be pasted one at a time. */
export function splitPgn(text: string): string[] {
  const games: string[] = [];
  let cur: string[] = [];
  let moves = false;
  for (const line of text.replace(/\r/g, '').split('\n')) {
    const tag = TAG.test(line);
    if (tag && moves) {
      games.push(cur.join('\n'));
      cur = [];
      moves = false;
    }
    if (!tag && line.trim()) moves = true;
    cur.push(line);
  }
  if (cur.some((l) => l.trim())) games.push(cur.join('\n'));
  return games;
}

export function parseGame(pgn: string, source: GameSource, fallbackId: string): ImportedGame {
  const tags: Record<string, string> = {};
  const body: string[] = [];
  for (const line of pgn.replace(/\r/g, '').split('\n')) {
    const m = TAG.exec(line);
    if (m) tags[m[1]] = m[2].replace(/\\(.)/g, '$1');
    else body.push(line);
  }
  if (tags.FEN || tags.SetUp === '1') throw new PgnError("This game starts from a set-up position, and Off Book only reviews games from the standard starting position.");
  if (tags.Variant && tags.Variant !== 'Standard') throw new PgnError(`${tags.Variant} is a chess variant. Off Book reviews standard chess.`);

  let text = body.join('\n').replace(/\{[^}]*\}/g, ' ').replace(/;[^\n]*/g, ' ');
  for (let prev = ''; prev !== text; ) { prev = text; text = text.replace(/\([^()]*\)/g, ' '); } // variations, innermost first
  const tokens = text.replace(/\$\d+/g, ' ').replace(/\d+\.+/g, ' ').split(/\s+/).filter(Boolean);

  const chess = new Chess();
  const sans: string[] = [];
  let result = tags.Result ?? '*';
  for (const [i, token] of tokens.entries()) {
    if (RESULT.test(token)) {
      if (i < tokens.length - 1) throw new PgnError('There are more moves after the result. Paste one game at a time, or keep each game\'s [Event] lines with it.');
      result = token;
      break;
    }
    try {
      sans.push(chess.move(token).san);
    } catch {
      const n = Math.floor(sans.length / 2) + 1;
      const side = sans.length % 2 ? 'Black' : 'White';
      throw new PgnError(`Move ${n} (${side}): "${token}" is not a legal move in that position. Check it against the scoresheet.`, n);
    }
  }
  if (!sans.length) throw new PgnError('No moves found. Paste the game in PGN, like 1. d4 d5 2. Bf4 Nf6.');

  const date = (tags.UTCDate ?? tags.Date ?? '').replace(/\./g, '-');
  const link = tags.Link ?? tags.Site ?? '';
  const url = /^https:\/\/(www\.)?(lichess\.org|chess\.com)\//.test(link) ? link : undefined; // only links shown as links
  return {
    id: url ?? fallbackId,
    source,
    white: tags.White || 'White',
    black: tags.Black || 'Black',
    result,
    date: /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : '',
    opening: tags.Opening,
    url,
    sans,
    london: isLondonAsWhite(sans),
  };
}

export interface ParsedPgn {
  games: ImportedGame[];
  /** Games that could not be read, with the first reason. */
  errors: PgnError[];
}

export function parsePgn(text: string, source: GameSource, idPrefix = source): ParsedPgn {
  const out: ParsedPgn = { games: [], errors: [] };
  for (const [i, pgn] of splitPgn(text).entries()) {
    try {
      out.games.push(parseGame(pgn, source, `${idPrefix}-${i}`));
    } catch (err) {
      out.errors.push(err instanceof PgnError ? err : new PgnError(String(err)));
    }
  }
  return out;
}
