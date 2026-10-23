// The openings the drill offers. A small array, not a plugin system: add an entry to add an opening.
import { buildTree as londonTree } from './london';
import { ideaFor as londonIdea } from './london-ideas';
import { buildTree as caroKannTree } from './caro-kann';
import { ideaFor as caroKannIdea } from './caro-kann-ideas';
import type { PrepMove, PrepTree } from './prep';

export interface Opening {
  id: 'london' | 'caro-kann';
  /** Shown in the picker, with the side. */
  name: string;
  /** The student's colour. */
  side: 'w' | 'b';
  /** Prep: position key to the student's move. */
  tree: PrepTree;
  /** The one-line idea shown with a new prep move. */
  ideaFor(fen: string, prep: PrepMove): string | null;
  /** SAN moves played by rule before the student's first turn; Maia takes over after them. */
  openingMoves: string[];
  /** The first line of the drill panel. */
  heading: string;
  /** The opponent line under it. */
  opponentLine(rating: number): string;
  /** A move in SAN and in from-to form, for the typed-move hints. */
  example: [string, string];
}

export const OPENINGS: Opening[] = [
  {
    id: 'london',
    name: 'London',
    side: 'w',
    tree: londonTree(),
    ideaFor: londonIdea,
    openingMoves: [],
    heading: 'Play your London as White.',
    opponentLine: (rating) => `Black answers like a ${rating}-rated player.`,
    example: ['Nf3', 'e2e4'],
  },
  {
    id: 'caro-kann',
    name: 'Caro-Kann',
    side: 'b',
    tree: caroKannTree(),
    ideaFor: caroKannIdea,
    // The tree covers only 1.e4 (decision 14b stages Black's replies; Maia takes over after move 1).
    openingMoves: ['e4'],
    heading: 'Play your Caro-Kann as Black.',
    opponentLine: (rating) => `White opens 1.e4, then answers like a ${rating}-rated player.`,
    example: ['Nf6', 'e7e5'],
  },
];

export const DEFAULT_OPENING = OPENINGS[0];
