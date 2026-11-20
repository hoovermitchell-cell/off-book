// Italian prep for White (decision 16, batch 2). DRAFT by Claude, pending Mitch's review.
// Policy: after 1.e4 e5 2.Nf3, one quiet, teachable system: Bc4, c3, d3, castle, Re1 (the Giuoco
// Pianissimo plan), plus an answer to each common ...e5 sideline:
//   2...Nc6 3.Bc4   Bc5 / Nf6 / Be7: c3, d3, O-O, Re1. Against 3...Nd4, take the knight (not Nxe5??)
//   2...Nf6         Petroff: Nxe5, then Nf3 and d4. Against 3...Nxe4?, Qe2 sets up a discovered check
//   2...d6          Philidor: d4, take back with the knight, develop
// Starter routes against the two most common non-...e5 replies (decision 16 rule: Maia over
// 800-1400 plays 1...d5 12.1% and 1...e6 7.9%):
//   1...d5          Scandinavian: exd5, Nc3 hitting the queen, d4, Nf3, Bc4
//   1...e6          French: the Advance, with c3, Nf3 and a3. The French (french.ts) is this batch's Black opening.
// Every other first move is a prep boundary at move one. The drill forces 1...e5 (forcedReplies).
// LINES are hand-pinned and end on White's last prep move. AUTO (italian-auto.ts, from
// spike/build-tree.mjs) fills in the likelier Black deviations; a pinned line always wins.
import { AUTO } from './italian-auto';
import { buildPrepTree, type PrepTree } from './prep';

export const LINES: string[] = [
  // Giuoco Piano, slow: c3, d3, castle, Re1; ...a6 is met by Bb3 so ...b5 doesn't gain time
  'e4 e5 Nf3 Nc6 Bc4 Bc5 c3 Nf6 d3 d6 O-O O-O Re1 a6 Bb3',
  // Two Knights: d3 keeps it quiet, the same setup as above
  'e4 e5 Nf3 Nc6 Bc4 Nf6 d3 Be7 O-O O-O Re1 d6 c3',
  'e4 e5 Nf3 Nc6 Bc4 Nf6 d3 Bc5 c3 d6 O-O O-O Re1',
  // Hungarian: the same setup again
  'e4 e5 Nf3 Nc6 Bc4 Be7 d3 Nf6 O-O O-O Re1 d6 c3',
  // Blackburne Shilling trap: Nxd4, never Nxe5?? Qg5
  'e4 e5 Nf3 Nc6 Bc4 Nd4 Nxd4 exd4 O-O',
  // Petroff: take the pawn back first
  'e4 e5 Nf3 Nf6 Nxe5 d6 Nf3 Nxe4 d4 d5 Bd3',
  // Petroff trap: 3...Nxe4? 4.Qe2 Nf6?? 5.Nc6+ wins the queen
  'e4 e5 Nf3 Nf6 Nxe5 Nxe4 Qe2 Nf6 Nc6+',
  // Philidor
  'e4 e5 Nf3 d6 d4 exd4 Nxd4 Nf6 Nc3 Be7 Bc4 O-O O-O',
  // Starter route: Scandinavian
  'e4 d5 exd5 Qxd5 Nc3 Qa5 d4 Nf6 Nf3 c6 Bc4',
  'e4 d5 exd5 Nf6 d4 Nxd5 Nf3',
  // Starter route: French, Advance
  'e4 e6 d4 d5 e5 c5 c3 Nc6 Nf3 Qb6 a3',
  // Generator picks that trailed Stockfish by more than 60cp at 3 s; each line ends on Stockfish's move
  'e4 e5 Nf3 Bc5 Nxe5 Qh4 d4 Qxe4+ Be3 Bxd4 Qxd4 Qxc2 Bd3',
  'e4 e5 Nf3 Nc6 Bc4 Bc5 c3 d6 d4 exd4 cxd4 Bb6 O-O Bg4 Bb5',
];

export const buildTree = ({ auto = true }: { auto?: boolean } = {}): PrepTree =>
  buildPrepTree(LINES, auto ? AUTO : {}, 'w');
