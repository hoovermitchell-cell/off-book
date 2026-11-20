// The openings the drill offers. A small array, not a plugin system: add an entry to add an opening.
import { buildTree as londonTree } from './london';
import { ideaFor as londonIdea } from './london-ideas';
import { buildTree as caroKannTree } from './caro-kann';
import { ideaFor as caroKannIdea } from './caro-kann-ideas';
import type { PrepMove, PrepTree } from './prep';

/** How deep a staged line goes (decision 16). Every line so far is an intro. */
export type Tier = 'intro' | 'intermediate' | 'advanced';

/** A staged line (decision 14b): the opponent plays these fixed moves, then Maia takes over. */
export interface Stage {
  id: string;
  name: string;
  tier: Tier;
  /** SAN, both sides, from the start position. */
  moves: string[];
  /** A theory note for the line (decision 16). Nothing in the UI reads it yet. */
  note?: string;
}

const stage = (id: string, name: string, moves: string): Stage => ({ id, name, tier: 'intro', moves: moves.split(' ') });

export interface Opening {
  id: string;
  /** Shown in the picker, with the side. */
  name: string;
  /** The student's colour. */
  side: 'w' | 'b';
  /** Prep: position key to the student's move. */
  tree: PrepTree;
  /** The one-line idea shown with a new prep move. */
  ideaFor(fen: string, prep: PrepMove): string | null;
  /** The opponent's first moves in SAN, played by rule at its turns while the student is in book;
   *  Maia takes over after them, and a staged line wins over them. [] for an opening with no forced reply. */
  forcedReplies: string[];
  /** The first line of the drill panel. */
  heading: string;
  /** The opponent line under it. */
  opponentLine(rating: number): string;
  /** A move in SAN and in from-to form, for the typed-move hints. */
  example: [string, string];
  /** Staged lines in the order they unlock (decisions 14b, 14d, 15). */
  stages: Stage[];
}

export const OPENINGS: Opening[] = [
  {
    id: 'london',
    name: 'London',
    side: 'w',
    tree: londonTree(),
    ideaFor: londonIdea,
    forcedReplies: [],
    heading: 'Play your London as White.',
    opponentLine: (rating) => `Black answers like a ${rating}-rated player.`,
    example: ['Nf3', 'e2e4'],
    // docs/review/staged-lines.md, one line per setup (decision 14d).
    stages: [
      stage('textbook', 'Textbook', 'd4 d5 Bf4 Nf6 e3 e6 Nf3 c5 c3 Nc6 Nbd2 Bd6 Bg3 O-O Bd3'),
      stage('nc6-bf5', '...Nc6 and ...Bf5', 'd4 d5 Bf4 Nc6 e3 Nf6 Nf3 Bf5 Nbd2 e6 c3 Bd6 Bg3 O-O Be2 Ne4'),
      stage('e6-bd6', '...e6 and early ...Bd6', 'd4 e6 Bf4 d5 e3 Nf6 Nf3 Bd6 Bg3 O-O Bd3 Nc6 c3'),
      stage('early-bf5', 'Early ...Bf5', 'd4 d5 Bf4 Bf5 e3 e6 Bd3 Bg6 Nf3 Nf6 c3'),
      stage('nf6-bf5', '...Bf5 after ...Nf6', 'd4 d5 Bf4 Nf6 e3 Bf5 Bd3 Bxd3 Qxd3 e6 Nf3 Bd6 Bg3'),
    ],
  },
  {
    id: 'caro-kann',
    name: 'Caro-Kann',
    side: 'b',
    tree: caroKannTree(),
    ideaFor: caroKannIdea,
    // The tree covers only 1.e4 (decision 14b stages Black's replies; Maia takes over after move 1).
    forcedReplies: ['e4'],
    heading: 'Play your Caro-Kann as Black.',
    opponentLine: (rating) => `White opens 1.e4, then answers like a ${rating}-rated player.`,
    example: ['Nf6', 'e7e5'],
    // docs/review/caro-kann-lines.md, in its order (decision 15).
    stages: [
      stage('classical', 'Classical', 'e4 c6 d4 d5 Nc3 dxe4 Nxe4 Bf5 Ng3 Bg6 h4 h6 Nf3 Nd7 h5 Bh7 Bd3 Bxd3 Qxd3 e6 Bf4 Ngf6 O-O-O Be7 Kb1 O-O'),
      stage('exchange-nf3', 'Exchange with Nf3', 'e4 c6 Nf3 d5 exd5 cxd5 d4 Nc6 Bb5 Bf5 Ne5 Rc8 Qf3 e6 g4 Bg6'),
      stage('bc4', '2.Bc4', 'e4 c6 Bc4 d5 exd5 cxd5 Bb3 Bf5 Nf3 e6 O-O Nd7 d4 Ngf6 Bg5'),
      stage('nc3-exd5', '2.Nc3 and exd5', 'e4 c6 Nc3 d5 exd5 cxd5 d4 Bf5 Nf3 e6 Bb5+ Nc6 Ne5'), // ends before 7...Ne7: the tree's prep there is now 7...Qb6
      stage('advance', 'Advance', 'e4 c6 d4 d5 e5 Bf5 Nf3 e6 Bd3 Bxd3 Qxd3 c5'),
      stage('classical-bd3', 'Classical with 5.Bd3', 'e4 c6 d4 d5 Nc3 dxe4 Nxe4 Bf5 Bd3 Qxd4 Nf3 Qd8 O-O'), // ends before 7...Bxe4: the tree's prep there is 7...e6
      stage('d3', '2.d3', 'e4 c6 d3 d5 Nd2 e5 Ngf3 Bd6 g3 Nf6 Bg2 O-O'),
    ],
  },
];

export const DEFAULT_OPENING = OPENINGS[0];
