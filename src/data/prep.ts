// Shared types and tree builder for the opening trees (London, Caro-Kann).
import { Chess } from 'chess.js';

/** The prep move the student should play at a position. */
export interface PrepMove {
  san: string;
  uci: string;
  /** Hand-pinned in LINES (absent on AUTO entries). */
  pinned?: boolean;
  /** Generation metadata, AUTO entries only. */
  loss?: number;
  how?: 'system' | 'stockfish';
  p?: number;
  line?: string;
}

/** Position key (first four FEN fields) to the student's prep move. */
export type PrepTree = Map<string, PrepMove>;

export const posKey = (fen: string): string => fen.split(' ').slice(0, 4).join(' ');

/** Pinned LINES win over AUTO. `side` is the student's colour; the other side's moves are not stored. */
export function buildPrepTree(lines: string[], auto: Record<string, PrepMove>, side: 'w' | 'b'): PrepTree {
  const tree: PrepTree = new Map();
  for (const line of lines) {
    const chess = new Chess();
    for (const san of line.split(' ')) {
      const key = posKey(chess.fen());
      const m = chess.move(san); // throws on an illegal move
      if (m.color !== side) continue;
      const prev = tree.get(key);
      if (prev && prev.san !== m.san) throw new Error(`conflict at ${key}: ${prev.san} vs ${m.san}`);
      tree.set(key, { san: m.san, uci: m.from + m.to + (m.promotion ?? ''), pinned: true });
    }
  }
  for (const [key, v] of Object.entries(auto)) if (!tree.has(key)) tree.set(key, v);
  return tree;
}
