// Queen's Gambit prep for White (decision 16, batch 1). DRAFT by Claude, pending Mitch's review.
// Policy: after 1.d4 d5 2.c4, one mainstream, teachable answer to each Black reply.
//   2...e6        QGD, Exchange (Carlsbad): cxd5, Bg5, e3, Bd3, Qc2, Nf3, O-O, then Rab1 and b4
//   2...dxc4      QGA: e3 and Bxc4. Win the pawn back; never try to keep it
//   2...c6        Slav: Nf3, Nc3, and after ...dxc4 the main line with a4, e3, Bxc4
//   2...e5        Albin: dxe5, Nf3, g3. Not e3, which walks into the Lasker trap
//   2...Nc6       Chigorin: Nf3, cxd5, take back on f3 with the pawn
// Only 1...d5 is covered: the drill forces it, and after 1...Nf6 or anything else the student is out
// of book on move one. The Slav (slav.ts) is the same family from Black's side and shares positions.
// LINES are hand-pinned and end on White's last prep move. AUTO (queens-gambit-auto.ts, from
// spike/build-tree.mjs) fills in the likelier Black deviations; a pinned line always wins.
import { AUTO } from './queens-gambit-auto';
import { buildPrepTree, type PrepTree } from './prep';

export const LINES: string[] = [
  // QGD, Exchange: one pawn structure (Carlsbad) and one plan, the minority attack
  'd4 d5 c4 e6 Nc3 Nf6 cxd5 exd5 Bg5 c6 e3 Be7 Bd3 Nbd7 Qc2 O-O Nf3 Re8 O-O Nf8 Rab1',
  // QGA: take the pawn back with the bishop
  'd4 d5 c4 dxc4 e3 Nf6 Bxc4 e6 Nf3 c5 O-O a6 Bb3',
  'd4 d5 c4 dxc4 e3 e5 Bxc4 exd4 exd4 Nf6 Nf3 Be7 O-O',
  // Holding the pawn with ...b5 fails: a4 and axb5 empty the long diagonal, and Qf3 hits the rook on a8
  'd4 d5 c4 dxc4 e3 b5 a4 c6 axb5 cxb5 Qf3',
  // Slav: the main line, which the Slav student (slav.ts) meets from the other side
  'd4 d5 c4 c6 Nf3 Nf6 Nc3 dxc4 a4 Bf5 e3 e6 Bxc4 Bb4 O-O O-O Qe2',
  // Semi-Slav: quiet development with Qc2 and Bd3
  'd4 d5 c4 c6 Nf3 Nf6 Nc3 e6 e3 Nbd7 Qc2 Bd6 Bd3 O-O O-O',
  // Albin Counter-Gambit: Nf3 and g3, keep the e5 pawn
  'd4 d5 c4 e5 dxe5 d4 Nf3 Nc6 g3 Bg4 Bg2 Qd7 O-O',
  // Chigorin
  'd4 d5 c4 Nc6 Nf3 Bg4 cxd5 Bxf3 gxf3 Qxd5 e3',
  // Generator picks that trailed Stockfish by more than 60cp; each line ends on Stockfish's move
  'd4 d5 c4 dxc4 e3 b5 a4 Bd7 axb5 Bxb5 Nc3 Ba6 Qf3',
  'd4 d5 c4 Nf6 Nf3 Bg4 Nc3 e6 Ne5 Bf5 cxd5 Nxd5 f3',
  'd4 d5 c4 e6 Nc3 Nf6 cxd5 Nxd5 Nf3 Nxc3 bxc3 Nc6 e4',
  'd4 d5 c4 c6 Nf3 Bg4 Nc3 e6 Ne5 Bh5 cxd5 cxd5 g4 Bg6 Qa4+',
  'd4 d5 c4 Nf6 Nf3 dxc4 Nc3 Bg4 Ne5',
  'd4 d5 c4 dxc4 e3 Nf6 Bxc4 Nc6 Nf3 e5 Qb3',
  'd4 d5 c4 dxc4 e3 b5 a4 b4 Qf3 c6 Bxc4 Nf6 Ne2',
  'd4 d5 c4 dxc4 e3 b5 a4 a6 Qf3 c6 axb5 cxb5 Qxa8 Qc7 Qf3',
  'd4 d5 c4 Nf6 Nf3 Nc6 cxd5 Qxd5 Nc3 Qa5 Bd2',
  'd4 d5 c4 c6 Nf3 Bf5 Nc3 e6 Qb3 Nf6 Qxb7 Nbd7 c5',
  'd4 d5 c4 e6 Nc3 dxc4 e4 Bb4 Bxc4 Bxc3+ bxc3 Nf6 e5 Ne4 Qg4',
  'd4 d5 c4 Nf6 Nf3 Bg4 Nc3 Nc6 cxd5',
  'd4 d5 c4 dxc4 e3 Nf6 Bxc4 Nc6 Nf3 Bf5 d5',
  'd4 d5 c4 dxc4 e3 b5 a4 bxa4 Qxa4+ c6 Nf3 Bd7 Bd2',
  'd4 d5 c4 dxc4 e3 b5 a4 b4 Qf3 c6 Bxc4 e6 Ne2',
];

export const buildTree = ({ auto = true }: { auto?: boolean } = {}): PrepTree =>
  buildPrepTree(LINES, auto ? AUTO : {}, 'w');
