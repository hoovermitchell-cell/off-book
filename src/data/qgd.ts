// Queen's Gambit Declined prep for Black against 1.d4 (decision 16, batch 3). DRAFT by Claude,
// pending Mitch's review. An alternative to the Slav: the student picks one.
// Policy: ...d5 and ...e6, then knights out, ...Be7, castle, ...c6. Take on c4 only when White's
// bishop has left d3's reach, then trade pieces to free the game. Against 1.d4 means every 1.d4
// setup, not only 2.c4, and ...e6 is the QGD's mark (the Slav plays ...c6 where this plays ...e6):
//   2.c4 e6 3.Nc3 Nf6 4.Bg5   Orthodox: ...Nbd7, ...Be7, castle, ...c6, ...dxc4, ...Nd5, ...e5.
//                              The Elephant trap: 5.cxd5 exd5 6.Nxd5?? Nxd5! 7.Bxd8 Bb4+ wins a piece
//   4.cxd5 exd5               Exchange: ...Be7, ...c6, ...Nbd7, castle, ...Re8, ...Nf8
//   2.Bf4                     London: ...Nf6, ...e6, ...Bd6 to trade White's good bishop
//   2.e3 / Bd3                Colle: ...Nf6, ...e6, ...c5, ...Nc6, ...Bd6
//   2.e4                      Blackmar-Diemer Gambit: take, take again on f3, and play ...e6
// Only 1.d4 is covered (the drill forces it). After 1.c4, 1.Nf3 or anything else the student is out
// of book on move one. The Queen's Gambit (queens-gambit.ts) meets these positions from White's side,
// and the Slav (slav.ts) shares only 1...d5.
// LINES are hand-pinned and end on Black's last prep move. AUTO (qgd-auto.ts, from
// spike/build-tree.mjs) fills in the likelier White deviations; a pinned line always wins.
import { AUTO } from './qgd-auto';
import { buildPrepTree, type PrepTree } from './prep';

export const LINES: string[] = [
  // Orthodox: develop, castle, ...c6, then take on c4 and trade pieces to free the game
  'd4 d5 c4 e6 Nc3 Nf6 Bg5 Nbd7 e3 Be7 Nf3 O-O Rc1 c6 Bd3 dxc4 Bxc4 Nd5 Bxe7 Qxe7 O-O Nxc3 Rxc3 e5',
  // Elephant trap: Nxd5? Nxd5! and the bishop on g5 takes the queen into a losing check
  'd4 d5 c4 e6 Nc3 Nf6 Bg5 Nbd7 cxd5 exd5 Nxd5 Nxd5 Bxd8 Bb4+ Qd2 Bxd2+ Kxd2 Kxd8',
  // Exchange: the pawn structure is fixed, so the knights head for f8 and g6 / e6
  'd4 d5 c4 e6 Nc3 Nf6 cxd5 exd5 Bg5 Be7 e3 c6 Bd3 Nbd7 Qc2 O-O Nf3 Re8 O-O Nf8',
  // The other 2.c4 move orders: 5.Nf3, 4.Nf3, 4.e3 and 3.cxd5 reach the same setups. The generator only
  // follows replies Maia plays at least 8% of the time, and 2.c4 is not one of them, so these are pinned.
  'd4 d5 c4 e6 Nc3 Nf6 Bg5 Nbd7 Nf3 Be7 e3 O-O',
  'd4 d5 c4 e6 Nc3 Nf6 Nf3 Be7 Bg5 O-O e3 Nbd7',
  'd4 d5 c4 e6 Nc3 Nf6 e3 Be7 Nf3 O-O Bd3 dxc4 Bxc4 c5',
  'd4 d5 c4 e6 cxd5 exd5 Nc3 Nf6 Bg5 Be7',
  // London: trade White's good bishop
  'd4 d5 Bf4 Nf6 e3 e6 Nf3 Bd6',
  // Colle
  'd4 d5 e3 Nf6 Bd3 e6 Nf3 c5 c3 Nc6 Nbd2 Bd6 O-O O-O',
  // Blackmar-Diemer Gambit: take, then take again, and play ...e6 (not ...Bf5, which is the Slav's)
  'd4 d5 e4 dxe4 Nc3 Nf6 f3 exf3 Nxf3 e6',
];

export const buildTree = ({ auto = true }: { auto?: boolean } = {}): PrepTree =>
  buildPrepTree(LINES, auto ? AUTO : {}, 'b');
