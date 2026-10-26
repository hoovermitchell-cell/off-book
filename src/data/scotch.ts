// Scotch prep for White (decision 16, batch 3). DRAFT by Claude, pending Mitch's review.
// Policy: after 1.e4 e5 2.Nf3 Nc6, open the center with 3.d4 and take back with the knight, never
// the Scotch Gambit (4.Bc4): the quiet main lines, one simple plan per Black reply.
//   3...exd4 4.Nxd4   Bc5: Be3, Qf6, c3, Bc4. Nf6: Nxc6, then e5 with a tempo and Qe2
//   3...Nxd4          take with the knight, then the queen
//   3...Nf6           dxe5 Nxe4, then Qd5 hits the knight and f7
// The support routes are the Italian's (italian.ts), copied pin for pin, so a position that both
// openings reach has the same prep move in both and the two share ladder credit:
//   2...d6 Philidor, 2...Nf6 Petroff (with the Qe2 / Nc6+ queen trap), 2...Bc5,
//   1...d5 Scandinavian and 1...e6 French (the Advance) starter routes.
// Every other first move is a prep boundary at move one. The drill forces 1...e5 (forcedReplies).
// LINES are hand-pinned and end on White's last prep move. AUTO (scotch-auto.ts, from
// spike/build-tree.mjs) fills in the likelier Black deviations; a pinned line always wins.
import { AUTO } from './scotch-auto';
import { buildPrepTree, type PrepTree } from './prep';

export const LINES: string[] = [
  // Classical Scotch: Be3 guards d4 and the bishop trade is met by Qf6; c3 holds d4, Bc4 aims at f7
  'e4 e5 Nf3 Nc6 d4 exd4 Nxd4 Bc5 Be3 Qf6 c3 Nge7 Bc4',
  // Mieses: trade on c6, then e5 hits the knight and Qe2 holds the pawn
  'e4 e5 Nf3 Nc6 d4 exd4 Nxd4 Nf6 Nxc6 bxc6 e5 Qe7 Qe2 Nd5 c4',
  // 3...Nf6: take on e5 with the pawn (4.Nc3 trails by over 100cp), and Qd5 hits the knight and f7
  'e4 e5 Nf3 Nc6 d4 Nf6 dxe5 Nxe4 Qd5',
  // 3...Nxd4: take with the knight, then the queen
  'e4 e5 Nf3 Nc6 d4 Nxd4 Nxd4 exd4 Qxd4',
  // 4...Nxd4 5.Qxd4 Nf6 6.Nc3 d6 7.Be3 Be6: the generator's 8.Bc4 trailed Stockfish by 60cp at 3 s
  'e4 e5 Nf3 Nc6 d4 exd4 Nxd4 Nxd4 Qxd4 Nf6 Nc3 d6 Be3 Be6 Be2',
  // Italian support routes, copied from italian.ts. Philidor
  'e4 e5 Nf3 d6 d4 exd4 Nxd4 Nf6 Nc3 Be7 Bc4 O-O O-O',
  // Petroff: take the pawn back first
  'e4 e5 Nf3 Nf6 Nxe5 d6 Nf3 Nxe4 d4 d5 Bd3',
  // Petroff trap: 3...Nxe4? 4.Qe2 Nf6?? 5.Nc6+ wins the queen
  'e4 e5 Nf3 Nf6 Nxe5 Nxe4 Qe2 Nf6 Nc6+',
  // Starter route: Scandinavian
  'e4 d5 exd5 Qxd5 Nc3 Qa5 d4 Nf6 Nf3 c6 Bc4',
  'e4 d5 exd5 Nf6 d4 Nxd5 Nf3',
  // Starter route: French, Advance
  'e4 e6 d4 d5 e5 c5 c3 Nc6 Nf3 Qb6 a3',
  // 2...Bc5, the Italian's pin that trailed Stockfish by more than 60cp at 3 s
  'e4 e5 Nf3 Bc5 Nxe5 Qh4 d4 Qxe4+ Be3 Bxd4 Qxd4 Qxc2 Bd3',
];

export const buildTree = ({ auto = true }: { auto?: boolean } = {}): PrepTree =>
  buildPrepTree(LINES, auto ? AUTO : {}, 'w');
