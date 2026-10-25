// PGN reading for game import (decision 1b). Pure: no DOM, no network.
// Own tokenizer instead of chess.js loadPgn so a bad move can be reported by move number.
import { Chess, type Move } from 'chess.js';
import { OPENINGS } from '../data/openings';
import { walkPrep } from '../review/review';

/** 'spar' is a sparring game against Maia, handed straight to the review. */
export type GameSource = 'lichess' | 'chesscom' | 'paste' | 'spar';

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
  /** The student's colour: the username's side, or the paste's best guess until the student says. */
  side: 'w' | 'b';
  /** The opening in OPENINGS that the student played on that side, or null. */
  prep: string | null;
  /** Who chose `prep`: the book walk, a tie it could not break (the first tied opening is named), or
   *  the student, whose pick is kept when the list is reopened. Absent on a sparring game. */
  prepFrom?: 'book' | 'tie' | 'student';
}

export class PgnError extends Error {
  constructor(message: string, readonly moveNumber?: number) {
    super(message);
    this.name = 'PgnError';
  }
}

const TAG = /^\s*\[(\w+)\s+"((?:[^"\\]|\\.)*)"\s*\]\s*$/;
const RESULT = /^(1-0|0-1|1\/2-1\/2|\*)$/;

/** The opening the student played, given the side they played: the game is walked through every opening
 *  on that side and each is scored by the student's moves that stayed in its prep. The highest score
 *  wins and needs at least one move (two for White); equal top scores are a tie, which still names the
 *  first tied opening so the review can open, but is marked so it can ask. */
export function detectPrep(sans: string[], side: 'w' | 'b'): { prep: string | null; prepFrom: 'book' | 'tie' } {
  // ponytail: White's first move alone (1.d4) is every d4 opening's, so White needs two moves in prep.
  // A per-opening "distinguishing move" would be exact; add it if two openings share more than move one.
  const min = side === 'w' ? 2 : 1;
  let best = 0;
  const top: string[] = [];
  for (const o of OPENINGS) {
    if (o.side !== side) continue;
    const plies = walkPrep(sans, o).lastPrepPly + 1; // plies still in prep, both sides
    const score = side === 'w' ? Math.ceil(plies / 2) : Math.floor(plies / 2);
    if (score > best) { best = score; top.length = 0; }
    if (score === best && score >= min) top.push(o.id);
  }
  return { prep: top[0] ?? null, prepFrom: top.length > 1 ? 'tie' : 'book' };
}

/** The side a pasted game was probably played from: Black when a Black opening matches and no White one does. */
export const guessSide = (sans: string[]): 'w' | 'b' => (detectPrep(sans, 'b').prep && !detectPrep(sans, 'w').prep ? 'b' : 'w');

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

/** `student` is the username the games were fetched for; the colour that name played is the student's.
 *  Without one (a paste) the side is guessed from the moves. */
export function parseGame(pgn: string, source: GameSource, fallbackId: string, student?: string): ImportedGame {
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
  const white = tags.White || 'White';
  const black = tags.Black || 'Black';
  const named = student?.toLowerCase();
  const side = named && white.toLowerCase() === named ? 'w' : named && black.toLowerCase() === named ? 'b' : guessSide(sans);
  return {
    id: url ?? fallbackId,
    source,
    white,
    black,
    result,
    date: /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : '',
    opening: tags.Opening,
    url,
    sans,
    side,
    ...detectPrep(sans, side),
  };
}

export interface ParsedPgn {
  games: ImportedGame[];
  /** Games that could not be read, with the first reason. */
  errors: PgnError[];
}

export function parsePgn(text: string, source: GameSource, idPrefix = source, student?: string): ParsedPgn {
  const out: ParsedPgn = { games: [], errors: [] };
  for (const [i, pgn] of splitPgn(text).entries()) {
    try {
      out.games.push(parseGame(pgn, source, `${idPrefix}-${i}`, student));
    } catch (err) {
      out.errors.push(err instanceof PgnError ? err : new PgnError(String(err)));
    }
  }
  return out;
}

/** One move of a board entry: a piece dragged or clicked (`from`, `to`) or typed text (SAN, or from-to like e2e4).
 *  Null when it is not legal. A pawn reaching the last rank queens, typed or not, unless the typed text names a piece.
 *  ponytail: promotion auto-queens; add a picker if a game ever needs one (a typed "e8=N" already works). */
export function boardMove(chess: Chess, move: string | { from: string; to: string }): Move | null {
  try {
    if (typeof move !== 'string') return chess.move({ ...move, promotion: 'q' });
    const m = new Chess(chess.fen()).move(move); // "e7e8" alone would come out as a knight, so read the squares and decide here
    return chess.move({ from: m.from, to: m.to, promotion: /[qrbn][+#]?$/i.test(move) ? m.promotion : 'q' });
  } catch {
    return null;
  }
}

/** A game entered on a board (decision 1b), read exactly as a pasted single game with no tag lines would be:
 *  the student's side is asked at the confirm step. `sans` are the moves already played legally on a board. */
export function boardGame(sans: string[], result: string, id: string): ImportedGame {
  const moves = sans.map((san, i) => (i % 2 ? san : `${i / 2 + 1}. ${san}`)).join(' ');
  return parseGame(`${moves} ${result}`, 'paste', id);
}
