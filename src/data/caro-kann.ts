// Caro-Kann prep for Black. DRAFT by Claude, pending Mitch's review (decision 4b).
// Policy (Mitch, decision 15, 2026-10-23: approved as drafted): one mainstream, coherent
// answer to each White try, sound and teachable at club level. Black plays ...c6 and ...d5, then gets
// the light-squared bishop out before ...e6 closes it in.
//   3.Nc3 / 3.Nd2  Classical: ...dxe4, ...Bf5, ...Bg6, ...h6, ...Nd7, trade bishops, ...e6, ...Ngf6
//   3.e5           Advance, short variation: ...Bf5, ...e6, ...c5, then ...Ne7 and ...Nbc6
//   3.exd5         Exchange: ...cxd5, ...Nc6, ...Nf6, ...Bg4; Panov (4.c4): ...Nf6, ...e6, ...Be7
//   3.f3           Fantasy: ...dxe4, ...e5! (5.dxe5?? Qh4+ wins a rook)
//   2.Nc3 + 3.Nf3  Two Knights: ...Bg4, trade the bishop for the knight, ...e6, ...Nf6
//   2.d3, 2.c4, 2.Nf3 are met by the same setup; most of their moves transpose into the lines above.
// Only 1.e4 is covered. After any other first move the student is out of book.
// LINES are hand-pinned, one per White try, ending on Black's last prep move. AUTO (caro-kann-auto.ts,
// from spike/build-tree.mjs) fills in the likelier White deviations; a pinned line always wins.
import { AUTO } from './caro-kann-auto';
import { buildPrepTree, type PrepTree } from './prep';

export const LINES: string[] = [
  // Classical (textbook): 3.Nc3 and 3.Nd2 reach the same position after 4.Nxe4
  'e4 c6 d4 d5 Nc3 dxe4 Nxe4 Bf5 Ng3 Bg6 h4 h6 Nf3 Nd7 h5 Bh7 Bd3 Bxd3 Qxd3 e6 Bf4 Ngf6 O-O-O Be7 Kb1 O-O',
  'e4 c6 d4 d5 Nd2 dxe4 Nxe4 Bf5',
  // Two Knights, and 2.Nf3 d5 3.Nc3 by transposition. 2.Nc3 d5 3.d4 is the Classical.
  'e4 c6 Nc3 d5 Nf3 Bg4 h3 Bxf3 Qxf3 e6 d3 Nf6',
  // Advance: short variation, with a quiet answer to each early sideline
  'e4 c6 d4 d5 e5 Bf5 Nf3 e6 Be2 c5 Be3 cxd4 Nxd4 Ne7 Nd2 Nbc6',
  'e4 c6 d4 d5 e5 Bf5 Bd3 Bxd3 Qxd3 e6',
  // 5.Bd3, what club White plays (decision 15): trade White's good bishop, then hit d4
  'e4 c6 d4 d5 e5 Bf5 Nf3 e6 Bd3 Bxd3 Qxd3 c5',
  'e4 c6 d4 d5 e5 Bf5 h4 h5',
  'e4 c6 d4 d5 e5 Bf5 g4 Be4 f3 Bg6', // 4...Be4 hits h1 first (Mitch, 2026-10-23)
  'e4 c6 d4 d5 e5 Bf5 Nc3 e6',
  'e4 c6 Nf3 d5 e5 Bf5 d4 e6',
  // Exchange, and the Panov attack (4.c4); 2.c4 d5 3.exd5 cxd5 4.d4 reaches the same position
  'e4 c6 d4 d5 exd5 cxd5 Bd3 Nc6 c3 Nf6 Bf4 Bg4 Qb3 Qd7 Nd2 e6 Ngf3 Bd6',
  'e4 c6 d4 d5 exd5 cxd5 c4 Nf6 Nc3 e6 Nf3 Be7 cxd5 Nxd5 Bd3 Nc6 O-O O-O Re1 Nf6',
  'e4 c6 d4 d5 exd5 cxd5 Nf3 Nc6',
  // 5.Bb5 and 6.Ne5 hit c6 twice; after 7.Qf3 e6 8.g4 only ...Bg6 holds (decision 15)
  'e4 c6 d4 d5 exd5 cxd5 Nf3 Nc6 Bb5 Bf5 Ne5 Rc8 Qf3 e6 g4 Bg6',
  'e4 c6 c4 d5 exd5 cxd5 cxd5 Nf6 Nc3 Nxd5',
  // Two generator picks that trailed Stockfish by more than 60cp after the decision-15 regeneration
  'e4 c6 Bc4 d5 exd5 cxd5 Bb5+ Bd7 Bd3 Nc6 Nf3 e5 Bb5 e4',
  'e4 c6 d4 d5 Nc3 dxe4 Nxe4 Bf5 f3 e6 g4 Bxe4 fxe4 Qh4+ Kd2 Qf2+',
  // Fantasy: the pawn goes back at once, and 5.dxe5?? loses a rook
  'e4 c6 d4 d5 f3 dxe4 fxe4 e5 Nf3 Bg4 Bc4 Nd7',
  'e4 c6 d4 d5 f3 dxe4 fxe4 e5 dxe5 Qh4+ g3 Qxe4+ Qe2 Qxh1',
  // King's Indian Attack style: 2.d3
  'e4 c6 d3 d5 Nd2 e5 Ngf3 Bd6 g3 Nf6 Bg2 O-O',
  'e4 c6 d3 d5 exd5 cxd5 Nf3 Nc6 Be2 Nf6 O-O Bg4',
  // Intermediate tier (decision 16 pilot): the Classical continued to move 17
  'e4 c6 d4 d5 Nc3 dxe4 Nxe4 Bf5 Ng3 Bg6 h4 h6 Nf3 Nd7 h5 Bh7 Bd3 Bxd3 Qxd3 e6 Bf4 Ngf6 O-O-O Be7 Kb1 O-O Ne4 c5 dxc5 Nxc5 Nxc5 Bxc5 Qxd8 Raxd8',
  // Intermediate tier (decision 16 pilot): the Panov continued to move 12
  'e4 c6 d4 d5 exd5 cxd5 c4 Nf6 Nc3 e6 Nf3 Be7 cxd5 Nxd5 Bd3 Nc6 O-O O-O Re1 Nf6 Be3 b6 Qc2 Nb4',
  // Intermediate tier (decision 16 pilot): the Fantasy continued to move 8
  'e4 c6 d4 d5 f3 dxe4 fxe4 e5 Nf3 Bg4 Bc4 Nd7 O-O Ngf6 dxe5 Qb6+',
  // Intermediate tier (decision 16 pilot): the Two Knights continued to move 8
  'e4 c6 Nc3 d5 Nf3 Bg4 h3 Bxf3 Qxf3 e6 d3 Nf6 Bg5 Nbd7 exd5 cxd5',
  // Advanced tier (decision 16): 3.Nf3 dxe4 4.Ne5 Nd7, then the knight trade and ...Qa5+ win the e5 pawn
  'e4 c6 d4 d5 Nf3 dxe4 Ne5 Nd7 Bc4 Nxe5 dxe5 Qa5+ Bd2 Qxe5',
  // Advanced tier: 2.Qh5 Nf6 hits the queen; ...e5 and ...d5 take the center, and ...bxc6 (not ...Bd7) after Bxc6+
  'e4 c6 Qh5 Nf6 Qf3 e5 Bc4 d5 exd5 cxd5 Bb5+ Nc6 Bxc6+ bxc6 d3 Bd6',
  // Advanced tier: 2.Nf3 d5 3.Ne5 dxe4 4.Bc4 e6 5.O-O Qd4! hits e5 and c4 and b2; ...g6 meets Qh5
  'e4 c6 Nf3 d5 Ne5 dxe4 Bc4 e6 O-O Qd4 Qh5 g6',
  // Advanced tier: 2.Nc3 d5 3.f3 d4! and, after c3, ...d3! wedges a pawn into White's camp
  'e4 c6 Nc3 d5 f3 d4 Nce2 e5 c3 d3 Ng3 g6',
];

export const buildTree = ({ auto = true }: { auto?: boolean } = {}): PrepTree =>
  buildPrepTree(LINES, auto ? AUTO : {}, 'b');
