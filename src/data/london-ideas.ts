// The one-line idea shown with each new London move (decisions 13 and 13b).
// DRAFT by Claude, pending Mitch's review (decision 13b). Students shouldn't see these until he signs off.
// One idea per kind of move, not per position: the London is one plan, so most of the 218 positions
// share a dozen ideas. Traps and key moments get their own notes, keyed by the moves before them.
import { Chess } from 'chess.js';
import { posKey, type PrepMove } from './london';

/** Notes for exact moments, keyed by the moves played before White's move. */
const MOMENTS: [string, string][] = [
  // The ...f6 trap
  ['d4 d5 Bf4 f6 e3 e5', 'Take the pawn. If Black takes back with ...fxe5, Qh5+ is coming.'],
  ['d4 d5 Bf4 f6 e3 e5 dxe5 fxe5', "Check. With Black's f-pawn gone, nothing stands between your queen and the king."],
  ['d4 d5 Bf4 f6 e3 e5 dxe5 fxe5 Qh5+ g6', 'Check, and your queen also hits the rook on h8. Black has to answer the check, then you take the rook.'],
  // The Englund Gambit: the trap is aimed at White
  ['d4 e5', 'Take the pawn. This is the Englund Gambit: Black gives up a pawn to set traps.'],
  ['d4 e5 dxe5 Nc6', 'Nf3 guards your extra pawn on e5.'],
  ['d4 e5 dxe5 Nc6 Nf3 Qe7', 'Bf4 guards e5 a second time. Expect ...Qb4+ next.'],
  ['d4 e5 dxe5 Nc6 Nf3 Qe7 Bf4 Qb4+', 'Block the check with your bishop.'],
  ['d4 e5 dxe5 Nc6 Nf3 Qe7 Bf4 Qb4+ Bd2 Qxb2', "Here's the trap: 6.Bc3?? Bb4 7.Qd2 Bxc3 8.Qxc3 Qc1 is mate. Nc3 develops instead, your queen still guards a1, and Black's queen is short of squares."],
  // Key moments in the pinned lines
  ['d4 Nf6 Bf4 c5 e3 Qb6', "Black's queen is aiming at b2. Qc1 guards it and keeps your setup."],
  ['d4 c5', 'Against ...c5, c3 keeps d4 protected. If Black takes on d4, take back with the c-pawn.'],
];

/** Ideas for the London's regular moves, by move. */
const MOVES: Record<string, string> = {
  d4: "The London starts with d4: your queen's pawn takes the center.",
  Bf4: 'Bf4 comes before e3. Once e3 is played, this bishop has no way out.',
  e3: 'e3 backs up d4 and opens a path for your other bishop.',
  Nf3: 'Nf3 develops a piece and watches e5, the square Black wants to push to.',
  c3: 'c3 gives d4 a second defender, so ...c5 pressure has nothing to bite on.',
  Bd3: "Bd3 aims your bishop at h7, where Black's king usually ends up after castling.",
  Nbd2: 'Your knight goes to d2, not c3, so the c-pawn can still move to c3.',
  Nd2: 'Your knight goes to d2, not c3, so the c-pawn can still move to c3.',
  Ngf3: 'Now your other knight comes out to f3.',
  Bg3: 'Bg3 tucks your bishop back to safety and keeps it on the same diagonal.',
  h3: "h3 keeps Black's pieces off g4 and gives your bishop a retreat on h2.",
  Be2: 'Be2 is enough here: develop quietly and get ready to castle.',
  Qc1: "Black's queen is aiming at b2. Qc1 guards it and keeps your setup.",
  'O-O': 'Castle: your king gets safe and your rook joins the game.',
};

const TRADE_BISHOP_D3 = "Black's bishop on f5 is one of their best pieces. Bd3 offers to trade it off.";
const BG3_VS_BD6 = 'Black offers a bishop trade. Step back to g3: if ...Bxg3, hxg3 opens the h-file for your rook.';
const BLOCK_CHECK = 'Block the check.';
const QUEEN_TRADE = 'Trade queens. If Black takes back with the king, it can no longer castle.';
const TAKE_E5 = "Black's ...e5 push lets you capture. Take on e5.";
const STOCKFISH = "The usual setup doesn't fit this position, so this is Stockfish's choice.";

const momentKeys = new Map(
  MOMENTS.map(([line, text]) => {
    const c = new Chess();
    line.split(' ').forEach((m) => c.move(m));
    return [posKey(c.fen()), text] as const;
  }),
);

/** The idea for White's prep move at `fen`, or null when only the arrow is shown. */
export function ideaFor(fen: string, prep: PrepMove): string | null {
  const moment = momentKeys.get(posKey(fen));
  if (moment) return moment;

  const c = new Chess(fen);
  const base = prep.san.replace(/[+#]/g, '');
  const move = c.move(prep.san);
  c.undo();

  if (c.inCheck() && move.piece !== 'k' && !move.captured) return BLOCK_CHECK;
  if (move.captured) {
    if (base.startsWith('Qxd8')) return QUEEN_TRADE;
    if (move.to === 'e5' && move.captured === 'p') return TAKE_E5;
    if (base === 'exd4') return 'Take back toward the center with your e-pawn.';
    if (base === 'hxg3') return 'Take back with the h-pawn. The h-file opens for your rook.';
    return prep.how === 'stockfish' ? STOCKFISH : `Take on ${move.to}.`;
  }
  if (base === 'Bd3' && c.get('f5')?.type === 'b' && c.get('f5')?.color === 'b') return TRADE_BISHOP_D3;
  if (base === 'Bg3' && c.get('d6')?.type === 'b' && c.get('d6')?.color === 'b') return BG3_VS_BD6;
  return MOVES[base] ?? (prep.how === 'stockfish' ? STOCKFISH : null);
}

/** Every text, for review and tests. */
export const ALL_IDEAS = [
  ...MOMENTS.map(([, t]) => t),
  ...new Set(Object.values(MOVES)),
  TRADE_BISHOP_D3, BG3_VS_BD6, BLOCK_CHECK, QUEEN_TRADE, TAKE_E5, STOCKFISH,
  'Take back toward the center with your e-pawn.',
  'Take back with the h-pawn. The h-file opens for your rook.',
];
