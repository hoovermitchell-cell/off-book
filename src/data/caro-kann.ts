// Caro-Kann prep for Black. DRAFT by Claude, pending Mitch's review (decision 4b).
// Policy (proposed, not decided; Mitch has not set one for this opening): one mainstream, coherent
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
  'e4 c6 d4 d5 e5 Bf5 h4 h5',
  'e4 c6 d4 d5 e5 Bf5 g4 Bg6',
  'e4 c6 d4 d5 e5 Bf5 Nc3 e6',
  'e4 c6 Nf3 d5 e5 Bf5 d4 e6',
  // Exchange, and the Panov attack (4.c4); 2.c4 d5 3.exd5 cxd5 4.d4 reaches the same position
  'e4 c6 d4 d5 exd5 cxd5 Bd3 Nc6 c3 Nf6 Bf4 Bg4 Qb3 Qd7 Nd2 e6 Ngf3 Bd6',
  'e4 c6 d4 d5 exd5 cxd5 c4 Nf6 Nc3 e6 Nf3 Be7 cxd5 Nxd5 Bd3 Nc6 O-O O-O Re1 Nf6',
  'e4 c6 d4 d5 exd5 cxd5 Nf3 Nc6',
  'e4 c6 c4 d5 exd5 cxd5 cxd5 Nf6 Nc3 Nxd5',
  // Fantasy: the pawn goes back at once, and 5.dxe5?? loses a rook
  'e4 c6 d4 d5 f3 dxe4 fxe4 e5 Nf3 Bg4 Bc4 Nd7',
  'e4 c6 d4 d5 f3 dxe4 fxe4 e5 dxe5 Qh4+ g3 Qxe4+ Qe2 Qxh1',
  // King's Indian Attack style: 2.d3
  'e4 c6 d3 d5 Nd2 e5 Ngf3 Bd6 g3 Nf6',
];

export const buildTree = ({ auto = true }: { auto?: boolean } = {}): PrepTree =>
  buildPrepTree(LINES, auto ? AUTO : {}, 'b');
