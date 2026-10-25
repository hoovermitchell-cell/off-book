// The one-line idea shown with each new Slav move (decisions 13 and 13b).
// DRAFT by Claude, pending Mitch's review (decision 16, batch 1). Same shape and voice as
// caro-kann-ideas.ts: the Slav is the Caro-Kann's idea against 1.d4, bishop out before ...e6.
// One idea per kind of move, not per position. Key moments get their own notes, keyed by the moves
// before Black's move.
import { Chess } from 'chess.js';
import { posKey, type PrepMove } from './prep';

/** Notes for exact moments, keyed by the moves played before Black's move. */
const MOMENTS: [string, string][] = [
  ['d4 d5 c4', 'c6 guards d5, so you never have to give up the center. Unlike ...e6, it leaves your c8 bishop free to come out.'],
  // Main line
  ['d4 d5 c4 c6 Nf3 Nf6 Nc3', 'Take on c4 now. White spends time winning the pawn back, and you use that time to get the bishop to f5.'],
  ['d4 d5 c4 c6 Nf3 Nf6 Nc3 dxc4 a4', 'a4 stops ...b5, so the pawn will go back. Bf5 gets the bishop out first, before ...e6 shuts it in.'],
  ['d4 d5 c4 c6 Nf3 Nf6 Nc3 dxc4 a4 Bf5 e3 e6 Bxc4', 'Bb4 pins the knight on c3. That knight is what supports e4, the push White wants.'],
  // Slow Slav and Qb3
  ['d4 d5 c4 c6 Nf3 Nf6 e3 Bf5 Nc3 e6 Nh4', 'The knight attacks your bishop. Bg6 keeps it on the same diagonal.'],
  ['d4 d5 c4 c6 Nf3 Nf6 e3 Bf5 Nc3 e6 Nh4 Bg6 Nxg6', 'Take back with the h-pawn. It moves toward the center, and your rook on h8 gets an open file.'],
  ['d4 d5 c4 c6 Nf3 Nf6 e3 Bf5 cxd5 cxd5 Qb3', 'Qb3 hits b7. Qb6 guards it and offers a queen trade.'],
  ['d4 d5 c4 c6 Nf3 Nf6 e3 Bf5 cxd5 cxd5 Qb3 Qb6 Qxb6', 'Take back with the a-pawn. Your rook gets the open a-file.'],
  // Exchange Slav
  ['d4 d5 c4 c6 cxd5 cxd5 Nc3 Nf6 Bf4 Nc6 e3 Bf5 Nf3 e6 Qb3', 'Qb3 eyes b7. Bb4 blocks the b-file and pins the knight on c3 to the king.'],
  // London
  ['d4 d5 Bf4 Nf6 e3 c6 Nf3 Bf5 Bd3', "White offers to trade the light-squared bishops. Take: that bishop was White's best attacker against your king."],
  // Colle
  ['d4 d5 e3 Nf6 Bd3 c6 Nf3', 'Bg4 pins the knight that would support e4, and gets the bishop out before ...e6.'],
  // Blackmar-Diemer Gambit
  ['d4 d5 e4', "Take the pawn. It's a gambit: White gives it up for fast development, so you answer by developing fast too."],
  ['d4 d5 e4 dxe4 Nc3', 'Nf6 guards the e4 pawn and develops a piece.'],
  ['d4 d5 e4 dxe4 Nc3 Nf6 f3', 'Take on f3. After Nxf3 you are still a pawn up, and White has no pawn left in the center.'],
];

const BISHOP_OUT = 'e6 backs up d5 and opens the way for your f8 bishop. The c8 bishop is already out, so nothing gets locked in.';
const BISHOP_IN = 'e6 backs up d5 and opens the way for your f8 bishop.';
const TRADE_BISHOPS = "Trade bishops. White's light-squared bishop was aimed at your kingside, so swapping it off makes castling safer.";
const TAKE_C = 'Take back with the c-pawn. You keep a pawn on d5 and get the open c-file.';
const TAKE_E = 'Take back with the e-pawn. It opens the e-file and the diagonal for your f8 bishop.';
const DEVELOP_BISHOP = 'Develop the bishop and clear the way to castle.';
const ANSWER_CHECK = 'Answer the check.';
const STOCKFISH = "The usual setup doesn't fit this position, so this is Stockfish's choice.";

/** Ideas for the Slav's regular moves, by move. */
const MOVES: Record<string, string> = {
  d5: 'd5 takes a share of the center and stops e4.',
  c6: 'c6 backs up d5 and keeps the road open for your c8 bishop.',
  Nf6: 'Nf6 develops a knight toward the center, covering d5 and e4.',
  Bf5: 'Bf5 gets the bishop out before ...e6 closes it in. That is the Slav idea, the same as in the Caro-Kann.',
  Bg4: "Bg4 puts the bishop outside the pawn chain, where ...e6 can't lock it in, and pins the knight on f3.",
  Bg6: 'Bg6 keeps the bishop out of reach and still in play.',
  Bh5: 'Bh5 keeps the pin on the knight.',
  Nbd7: 'Nd7 develops your last knight and backs up ...e5 or ...c5 later.',
  Bd6: DEVELOP_BISHOP,
  Be7: DEVELOP_BISHOP,
  Nc6: 'Nc6 develops a knight and puts pressure on d4.',
  Qb6: 'Qb6 hits b2 and d4 at once.',
  'O-O': 'Castle: your king gets safe and your rook joins the game.',
};

const momentKeys = new Map(
  MOMENTS.map(([line, text]) => {
    const c = new Chess();
    line.split(' ').forEach((m) => { c.move(m); });
    return [posKey(c.fen()), text] as const;
  }),
);

/** The idea for Black's prep move at `fen`, or null when only the arrow is shown. */
export function ideaFor(fen: string, prep: PrepMove): string | null {
  const moment = momentKeys.get(posKey(fen));
  if (moment) return moment;

  const c = new Chess(fen);
  const base = prep.san.replace(/[+#]/g, '');
  const move = c.move(prep.san);
  c.undo();

  if (c.inCheck() && move.piece !== 'k' && !move.captured) return ANSWER_CHECK;
  if (move.captured) {
    if (base === 'Bxd3') return TRADE_BISHOPS;
    if (base === 'cxd5') return TAKE_C;
    if (base === 'exf6' || base === 'exf5') return TAKE_E;
    return prep.how === 'stockfish' ? STOCKFISH : `Take on ${move.to}.`;
  }
  if (base === 'e6') return c.get('c8')?.type === 'b' ? BISHOP_IN : BISHOP_OUT;
  return MOVES[base] ?? (prep.how === 'stockfish' ? STOCKFISH : null);
}

/** Every text, for review and tests. */
export const ALL_IDEAS = [
  ...MOMENTS.map(([, t]) => t),
  ...new Set(Object.values(MOVES)),
  BISHOP_OUT, BISHOP_IN, TRADE_BISHOPS, TAKE_C, TAKE_E, ANSWER_CHECK, STOCKFISH,
];
