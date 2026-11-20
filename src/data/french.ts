// French prep for Black against 1.e4 (decision 16, batch 2). DRAFT by Claude, pending Mitch's review.
// An alternative to the Caro-Kann: the student picks one. Policy: one solid, teachable answer per
// White system, with one plan wherever it fits:
//   3.Nc3 / 3.Nd2   Rubinstein: ...dxe4, ...Nd7, ...Ngf6, then ...c5. One answer to both moves
//   3.e5            Advance: ...c5, ...Nc6, ...Qb6, pressure on d4. After Bd3 cxd4 cxd4, ...Bd7, not
//                   ...Nxd4?? (Bb5+ wins the queen)
//   3.exd5          Exchange: ...exd5, ...Bd6, ...Ne7, castle
//   2.d3            King's Indian Attack: ...d5, ...Nf6, ...c5, ...Nc6, ...Be7, castle
// The drill forces 1.e4; every other first move is a prep boundary at move one. The Italian
// (italian.ts) meets the Advance from White's side.
// LINES are hand-pinned and end on Black's last prep move. AUTO (french-auto.ts, from
// spike/build-tree.mjs) fills in the likelier White deviations; a pinned line always wins.
import { AUTO } from './french-auto';
import { buildPrepTree, type PrepTree } from './prep';

export const LINES: string[] = [
  // Rubinstein: give up the center for free development, then strike with ...c5
  'e4 e6 d4 d5 Nc3 dxe4 Nxe4 Nd7 Nf3 Ngf6 Nxf6+ Nxf6 Bd3 c5 dxc5 Bxc5 O-O O-O',
  'e4 e6 d4 d5 Nd2 dxe4 Nxe4 Nd7',
  // Advance: hit the base of the chain
  'e4 e6 d4 d5 e5 c5 c3 Nc6 Nf3 Qb6 Bd3 cxd4 cxd4 Bd7',
  'e4 e6 d4 d5 e5 c5 c3 Nc6 Nf3 Qb6 a3 c4',
  'e4 e6 d4 d5 e5 c5 c3 Nc6 Nf3 Qb6 Be2 cxd4 cxd4 Nh6',
  // Exchange
  'e4 e6 d4 d5 exd5 exd5 Bd3 Bd6 Nf3 Ne7 O-O O-O',
  // King's Indian Attack
  'e4 e6 d3 d5 Nd2 Nf6 Ngf3 c5 g3 Nc6 Bg2 Be7 O-O O-O',
  // Generator picks that trailed Stockfish by more than 60cp at 3 s; each line ends on Stockfish's move
  'e4 e6 d4 d5 e5 c5 dxc5 Bxc5 Be3 Bxe3 fxe3 Nc6 Bb5 Qg5',
];

export const buildTree = ({ auto = true }: { auto?: boolean } = {}): PrepTree =>
  buildPrepTree(LINES, auto ? AUTO : {}, 'b');
