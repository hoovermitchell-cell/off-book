// The openings the drill offers. A small array, not a plugin system: add an entry to add an opening.
import { buildTree as londonTree } from './london';
import { ideaFor as londonIdea } from './london-ideas';
import { buildTree as caroKannTree } from './caro-kann';
import { ideaFor as caroKannIdea } from './caro-kann-ideas';
import { buildTree as queensGambitTree } from './queens-gambit';
import { ideaFor as queensGambitIdea } from './queens-gambit-ideas';
import { buildTree as slavTree } from './slav';
import { ideaFor as slavIdea } from './slav-ideas';
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
  {
    id: 'queens-gambit',
    name: "Queen's Gambit",
    side: 'w',
    tree: queensGambitTree(),
    ideaFor: queensGambitIdea,
    // The tree covers only 1.d4 d5 (decision 16); the drill forces 1...d5 and Maia takes over after it.
    forcedReplies: ['d5'],
    heading: "Play your Queen's Gambit as White.",
    opponentLine: (rating) => `Black answers 1.d4 with ...d5, then replies like a ${rating}-rated player.`,
    example: ['Nf3', 'e2e4'],
    // docs/review/qg-slav-lines.md: the Exchange line first, then the setups Maia meets most (decision 14d).
    stages: [
      stage('exchange', 'Exchange', 'd4 d5 c4 e6 Nc3 Nf6 cxd5 exd5 Bg5 c6 e3 Be7 Bd3 Nbd7 Qc2 O-O Nf3 Re8 O-O Nf8 Rab1'),
      stage('qga-b5', '2...dxc4 and ...b5', 'd4 d5 c4 dxc4 e3 b5 a4 c6 axb5 cxb5 Qf3'),
      stage('nf6-nf3', '2...Nf6', 'd4 d5 c4 Nf6 Nf3 dxc4 Nc3 Nc6 e3 Bg4 Bxc4 e6 Qc2 Bxf3 gxf3'),
      stage('semi-slav', '2...c6 and ...e6', 'd4 d5 c4 c6 Nf3 Nf6 Nc3 e6 e3 Bb4 Bd3'),
      stage('qgd-dxc4', '3...dxc4', 'd4 d5 c4 e6 Nc3 dxc4 e4 Bb4 Bxc4 Bxc3+ bxc3 Nf6 e5 Ne4 Qg4'),
    ],
  },
  {
    id: 'slav',
    name: 'Slav',
    side: 'b',
    tree: slavTree(),
    ideaFor: slavIdea,
    // The tree covers only 1.d4 (decision 16); Maia takes over after move 1, as in the Caro-Kann.
    forcedReplies: ['d4'],
    heading: 'Play your Slav as Black.',
    opponentLine: (rating) => `White opens 1.d4, then answers like a ${rating}-rated player.`,
    example: ['Nf6', 'e7e5'],
    // docs/review/qg-slav-lines.md: the main line first, then the setups Maia meets most (decision 14d).
    stages: [
      stage('main-line', 'Main line', 'd4 d5 c4 c6 Nf3 Nf6 Nc3 dxc4 a4 Bf5 e3 e6 Bxc4 Bb4 O-O O-O Qe2 Nbd7'),
      stage('nf3-bg5', '2.Nf3 and Bg5', 'd4 d5 Nf3 c6 Nc3 Nf6 Bg5 Bf5 e3 e6 Bd3 Nbd7 Bxf5 exf5 O-O Bd6'),
      stage('nc3-e4', '2.Nc3 and e4', 'd4 d5 Nc3 c6 e4 dxe4 Nxe4 Nf6 Nxf6+ exf6 Nf3 Bf5 Bd3 Bd6 Bxf5 Qa5+'),
      stage('e3-bd3', '2.e3 and Bd3', 'd4 d5 e3 Nf6 Nf3 c6 Bd3 Bg4 Nbd2 e6 O-O Nbd7'),
      stage('london-bf4', '2.Bf4, the London', 'd4 d5 Bf4 Nf6 e3 c6 Nf3 Bf5 Bd3 Bxd3 Qxd3 e6 Nbd2 Nbd7'),
    ],
  },
];

export const DEFAULT_OPENING = OPENINGS[0];
