// London System prep for White. DRAFT by Claude, pending Mitch's review (decision 4b).
// Policy (Mitch, 2026-10-21): system first, plus two traps; cover Black's common replies widely.
// LINES are hand-pinned. AUTO (london-auto.ts, from build-tree.mjs) fills the rest of the
// common replies with system moves; a pinned line always wins over AUTO.
import { AUTO } from './london-auto';
import { buildPrepTree, posKey, type PrepMove, type PrepTree } from './prep';

export { posKey, type PrepMove, type PrepTree };

export const LINES: string[] = [
  // Core setup vs ...d5 / ...Nf6 / ...e6
  'd4 d5 Bf4 Nf6 e3 e6 Nf3 c5 c3 Nc6 Nbd2 Bd6 Bg3 O-O Bd3',
  'd4 d5 Bf4 Nf6 e3 c5 c3 Nc6 Nd2 e6 Ngf3 Bd6 Bg3 O-O Bd3',
  'd4 d5 Bf4 Nf6 e3 e6 Nf3 Bd6 Bg3 O-O Bd3 c5 c3 Nc6 Nbd2',
  'd4 d5 Bf4 e6 e3 Nf6 Nf3',
  'd4 Nf6 Bf4 d5 e3',
  'd4 Nf6 Bf4 e6 e3 c5 c3 d5 Nd2',
  'd4 e6 Bf4 d5 e3',
  'd4 e6 Bf4 Nf6 e3',
  // Early ...Bf5: trade it off with Bd3 instead of chasing b7
  'd4 d5 Bf4 Nf6 e3 Bf5 Bd3 Bxd3 Qxd3',
  'd4 d5 Bf4 Bf5 e3 e6 Bd3 Bxd3 Qxd3',
  // Early ...c5 / ...Qb6: keep the setup, guard b2 with Qc1
  'd4 d5 Bf4 c5 e3 Nc6 c3',
  'd4 Nf6 Bf4 c5 e3 Qb6 Qc1',
  'd4 c5 c3',
  // ...Nc6 setups
  'd4 d5 Bf4 Nc6 e3 e6 Nf3 Nf6 Bd3',
  'd4 Nc6 Bf4 d5 e3',
  // King's Indian setups
  'd4 Nf6 Bf4 g6 e3 Bg7 Nf3 O-O Be2 d6 h3',
  'd4 d6 Bf4 Nf6 e3 g6 Nf3 Bg7 Be2',
  'd4 g6 Bf4 Bg7 e3 d6 Nf3',
  'd4 f5 Bf4 Nf6 e3 e6 Nf3',
  // The two traps
  'd4 d5 Bf4 f6 e3 e5 dxe5 fxe5 Qh5+ g6 Qxe5+',
  // Englund: the trap is for White. 6.Bc3?? Bb4 7.Qd2 Bxc3 8.Qxc3?? Qc1#. Learn 6.Nc3 instead.
  'd4 e5 dxe5 Nc6 Nf3 Qe7 Bf4 Qb4+ Bd2 Qxb2 Nc3',
  'd4 d5 Bf4 e5 Bxe5',
  // Intermediate tier (decision 16 pilot): the textbook continued to move 12
  'd4 d5 Bf4 Nf6 e3 e6 Nf3 c5 c3 Nc6 Nbd2 Bd6 Bg3 O-O Bd3 Re8 Ne5 cxd4 exd4 Nxe5 dxe5 Bxe5 Bxe5',
  // Intermediate tier (decision 16 pilot): King's Indian setup, extended to move 9
  'd4 Nf6 Bf4 g6 e3 Bg7 Nf3 O-O Be2 d6 h3 Nbd7 c3 Re8 Nbd2 e5 Bg5',
  // Advanced tier (decision 16): the ...f6 trap's second try, ...g5. Qh5+ first; Bxg5? fxg5 loses the bishop for a pawn
  'd4 d5 Bf4 f6 e3 g5 Qh5+ Kd7 Bg3 Qe8 Qf3 c6 h4 gxh4 Rxh4',
  // Advanced tier: ...Bb4+ and ...Ba5 put Black's bishop out of play; Ne5 then dxe5 hits the knight on f6
  'd4 d5 Bf4 Nc6 e3 Nf6 Nf3 e6 Bd3 Bb4+ c3 Ba5 Nbd2 O-O Qc2 Re8 Ne5 Nxe5 dxe5',
  // Advanced tier: ...Ne4 on move 3; f3 wins a pawn if Black trades on d3 first
  'd4 d5 Bf4 Nf6 e3 Ne4 Bd3 Bf5 f3 Nd6 Bxd6 Bxd3 Bxe7 Qxe7 Qxd3',
  // Advanced tier: ...Bxg3, taken back with the h-pawn
  'd4 d5 Bf4 Nf6 e3 e6 Nf3 Bd6 Bg3 Bxg3 hxg3 O-O Nc3 Nc6 Ne5 Nxe5 dxe5 Ne4 Nxe4',
];

export const buildTree = ({ auto = true }: { auto?: boolean } = {}): PrepTree =>
  buildPrepTree(LINES, auto ? AUTO : {}, 'w');
