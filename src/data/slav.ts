// Slav prep for Black against 1.d4 (decision 16, batch 1). DRAFT by Claude, pending Mitch's review.
// Policy: ...d5 and ...c6, then the light-squared bishop out to f5 (or g4) before ...e6 shuts it in,
// the same idea as the Caro-Kann. Against 1.d4 means every 1.d4 setup, not only 2.c4:
//   2.c4          Slav: ...c6, ...Nf6; against Nc3 and Nf3, ...dxc4 and ...Bf5 (main line)
//   2.c4 + e3     Slow Slav: ...Bf5 before ...e6; after Nh4, give up the bishop and take back toward the center
//   cxd5 early    Exchange Slav: ...cxd5, ...Nc6, ...Bf5, ...e6, ...Bb4
//   2.Bf4         London: ...Nf6, ...c6, ...Bf5, trade bishops on d3
//   2.e3 / Bd3    Colle: ...Nf6, ...c6, ...Bg4
//   2.e4          Blackmar-Diemer Gambit: take, then take again on f3 and develop with ...Bf5
// Only 1.d4 is covered (the drill forces it). After 1.c4, 1.Nf3 or anything else the student is out
// of book on move one. The Queen's Gambit (queens-gambit.ts) meets these positions from White's side.
// LINES are hand-pinned and end on Black's last prep move. AUTO (slav-auto.ts, from
// spike/build-tree.mjs) fills in the likelier White deviations; a pinned line always wins.
import { AUTO } from './slav-auto';
import { buildPrepTree, type PrepTree } from './prep';

export const LINES: string[] = [
  // Main line: take on c4 once both knights are out, then ...Bf5 before ...e6
  'd4 d5 c4 c6 Nf3 Nf6 Nc3 dxc4 a4 Bf5 e3 e6 Bxc4 Bb4 O-O O-O Qe2 Nbd7',
  // Slow Slav (4.e3): the bishop comes out first; Nh4 wins the bishop pair but opens the h-file
  'd4 d5 c4 c6 Nf3 Nf6 e3 Bf5 Nc3 e6 Nh4 Bg6 Nxg6 hxg6',
  // Qb3 hits b7: meet it queen to queen
  'd4 d5 c4 c6 Nf3 Nf6 e3 Bf5 cxd5 cxd5 Qb3 Qb6 Qxb6 axb6',
  // Exchange Slav
  'd4 d5 c4 c6 cxd5 cxd5 Nc3 Nf6 Bf4 Nc6 e3 Bf5 Nf3 e6 Qb3 Bb4',
  // London: trade White's good bishop, the Caro-Kann Advance idea
  'd4 d5 Bf4 Nf6 e3 c6 Nf3 Bf5 Bd3 Bxd3 Qxd3 e6',
  'd4 d5 Bf4 Nf6 e3 c6 Nf3 Bf5 c4 e6 Nc3 Nbd7',
  // Colle
  'd4 d5 e3 Nf6 Bd3 c6 Nf3 Bg4',
  // Blackmar-Diemer Gambit
  'd4 d5 e4 dxe4 Nc3 Nf6 f3 exf3 Nxf3 Bf5',
];

export const buildTree = ({ auto = true }: { auto?: boolean } = {}): PrepTree =>
  buildPrepTree(LINES, auto ? AUTO : {}, 'b');
