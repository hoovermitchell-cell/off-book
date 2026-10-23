// The one-line idea shown with each new Caro-Kann move (decisions 13 and 13b).
// DRAFT by Claude, pending Mitch's review. Same shape and voice as london-ideas.ts, written for Black.
// One idea per kind of move, not per position: most of the tree shares a dozen ideas. Traps and key
// moments get their own notes, keyed by the moves before Black's move.
import { Chess } from 'chess.js';
import { posKey, type PrepMove } from './prep';

/** Notes for exact moments, keyed by the moves played before Black's move. */
const MOMENTS: [string, string][] = [
  // Classical
  ['e4 c6 d4 d5 Nc3', 'Take the pawn. White takes back with a knight, and then ...Bf5 hits that knight.'],
  ['e4 c6 d4 d5 Nd2', 'Take the pawn. White takes back with a knight, and then ...Bf5 hits that knight.'],
  ['e4 c6 d4 d5 Nc3 dxe4 Nxe4', 'Bf5 attacks the knight and gets your bishop out. Do not play ...Nd7 first: after Qe2, ...Ngf6?? loses to Nd6, which is mate.'],
  ['e4 c6 d4 d5 Nc3 dxe4 Nxe4 Bf5 Ng3', "The knight attacks your bishop. Bg6 keeps it on the diagonal, and the h-pawn can't trap it."],
  ['e4 c6 d4 d5 Nc3 dxe4 Nxe4 Bf5 Ng3 Bg6 h4', 'h4 wants h5, which would chase your bishop again. h6 stops a knight jump to g5 and gets ready for ...Bh7.'],
  ['e4 c6 d4 d5 Nc3 dxe4 Nxe4 Bf5 Bd3', "Bd3 blocks the queen's guard of d4. Qxd4 wins the pawn."],
  // Advance
  ['e4 c6 d4 d5 e5', "e5 closes the center. Get the bishop out to f5 now: once ...e6 is played, it can't get out."],
  ['e4 c6 d4 d5 e5 Bf5 Nf3 e6 Be2', "c5 attacks d4, the base of White's pawn chain. If d4 goes, the e5 pawn is weak."],
  ['e4 c6 d4 d5 e5 Bf5 Nf3 e6 Be2 c5 Be3', 'Take on d4. White has to recapture with a knight, and the c-file opens for you.'],
  ['e4 c6 d4 d5 e5 Bf5 h4', "White's h-pawn wants to run to h5 and chase your bishop. h5 stops it."],
  ['e4 c6 d4 d5 e5 Bf5 g4', "g4 chases the bishop but weakens White's own kingside. Step back to g6 and stay calm."],
  ['e4 c6 d4 d5 e5 Bf5 Nf3 e6 Bd3', "White offers to trade the light-squared bishops. Take: White's bishop was its good one, and ...c5 comes next."],
  ['e4 c6 d4 d5 e5 Bf5 Nf3 e6 Bd3 Bxd3 Qxd3', 'c5 attacks d4, the base of the pawn chain, the same plan as against Be2.'],
  // Exchange with Nf3: Bb5 and Ne5 both hit c6
  ['e4 c6 d4 d5 exd5 cxd5 Nf3 Nc6 Bb5 Bf5 Ne5', 'Bb5 and Ne5 both attack c6. Rc8 guards it a second time.'],
  ['e4 c6 d4 d5 exd5 cxd5 Nf3 Nc6 Bb5 Bf5 Ne5 Rc8 Qf3', 'Qf3 hits your bishop. e6 guards it. Your bishop also blocks the f-file, which keeps the queen off f7.'],
  ['e4 c6 d4 d5 exd5 cxd5 Nf3 Nc6 Bb5 Bf5 Ne5 Rc8 Qf3 e6 g4', 'Trap: only Bg6 is safe. It still guards f7. After Be4??, Qxf7 is mate, because Ne5 covers d7.'],
  // Fantasy
  ['e4 c6 d4 d5 f3', 'White offers a gambit. Take the pawn: if fxe4, you hit d4 with ...e5.'],
  ['e4 c6 d4 d5 f3 dxe4 fxe4', 'e5 strikes at d4 at once. If White takes with dxe5??, Qh4+ is coming.'],
  ['e4 c6 d4 d5 f3 dxe4 fxe4 e5 dxe5', "Check. White's f-pawn is gone, so nothing covers the king. After g3, Qxe4+ also hits the rook on h1."],
  ['e4 c6 d4 d5 f3 dxe4 fxe4 e5 dxe5 Qh4+ g3', 'Take on e4 with check. After Qe2, your queen takes the rook on h1.'],
  ['e4 c6 d4 d5 f3 dxe4 fxe4 e5 Nf3 Bg4 Bc4', 'Nd7 guards e5 and keeps your pieces connected. Do not trade on f3 first: after Qxf3, Bxf7+ is coming.'],
  // Two Knights
  ['e4 c6 Nc3 d5 Nf3', 'Bg4 pins the knight to the queen and gets your bishop out before ...e6.'],
  ['e4 c6 Nc3 d5 Nf3 Bg4 h3', 'Trade the bishop for the knight. It removes a defender of e5 and d4, and then you can play ...e6.'],
  // Exchange
  ['e4 c6 d4 d5 exd5 cxd5 Bd3 Nc6 c3 Nf6 Bf4 Bg4 Qb3', 'The queen hits b7 and d5. Qd7 guards b7 and keeps your pieces connected.'],
];

const BISHOP_OUT = 'e6 backs up d5 and opens the way for your f8 bishop. The c8 bishop is already out, so nothing gets locked in.';
const BISHOP_IN = 'e6 backs up d5 and opens the way for your f8 bishop.';
const TRADE_BISHOPS = 'Trade bishops. Yours got out first, so you can swap it for the one that was aiming at your kingside.';
const QUEEN_TRADE = 'Trade queens. If White takes back with the king, it can no longer castle.';
const TAKE_C = 'Take back with the c-pawn. You get a pawn on d5 and an open c-file.';
const DEVELOP_BISHOP = 'Develop the bishop and clear the way to castle.';
const ANSWER_CHECK = 'Answer the check.';
const STOCKFISH = "The usual setup doesn't fit this position, so this is Stockfish's choice.";

/** Ideas for the Caro-Kann's regular moves, by move. */
const MOVES: Record<string, string> = {
  c6: 'c6 gets ready for ...d5. The pawn will back up d5, and your c8 bishop stays free to come out.',
  d5: 'd5 challenges the e4 pawn at once. The c6 pawn guards it, so it is safe.',
  Bf5: 'Bf5 gets the bishop out before ...e6 closes it in. That is the Caro-Kann idea: the c8 bishop never gets stuck behind its own pawns.',
  Bg4: "Bg4 puts the bishop outside the pawn chain, where ...e6 can't lock it in.",
  Bh7: 'h5 attacks the bishop. Bh7 keeps it safe on the same diagonal.',
  h6: 'h6 stops a knight jump to g5 and gives your bishop room.',
  Nd7: 'Nd7 gets ready for ...Ngf6. If White takes on f6, you take back with the knight.',
  Nbd7: 'Nd7 gets ready for ...Ngf6. If White takes on f6, you take back with the knight.',
  Ngf6: 'Ngf6 challenges the knight on e4. If Nxf6+, take back with the knight and your pawns stay healthy.',
  Nf6: 'Nf6 develops a knight and presses on e4 and d5.',
  Be7: DEVELOP_BISHOP,
  Bd6: DEVELOP_BISHOP,
  c5: "c5 attacks d4, the base of White's pawn chain.",
  e5: 'e5 claims the center and opens the f8 bishop.',
  Nc6: 'Nc6 develops a knight and puts pressure on d4.',
  Nbc6: 'Nc6 develops a knight and puts pressure on d4.',
  Ne7: 'Ne7 clears the way for ...Nbc6 and covers d5 and the bishop on f5.',
  Qb6: 'Qb6 hits b2 and d4 at once.',
  Qd7: 'Qd7 guards b7 and keeps your pieces connected.',
  'O-O': 'Castle: your king gets safe and your rook joins the game.',
};

const momentKeys = new Map(
  MOMENTS.map(([line, text]) => {
    const c = new Chess();
    line.split(' ').forEach((m) => c.move(m));
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
    if (base.startsWith('Qxd1')) return QUEEN_TRADE;
    if (base === 'Bxd3') return TRADE_BISHOPS;
    if (base === 'cxd5') return TAKE_C;
    return prep.how === 'stockfish' ? STOCKFISH : `Take on ${move.to}.`;
  }
  if (base === 'e6') return c.get('c8')?.type === 'b' ? BISHOP_IN : BISHOP_OUT;
  return MOVES[base] ?? (prep.how === 'stockfish' ? STOCKFISH : null);
}

/** Every text, for review and tests. */
export const ALL_IDEAS = [
  ...MOMENTS.map(([, t]) => t),
  ...new Set(Object.values(MOVES)),
  BISHOP_OUT, BISHOP_IN, TRADE_BISHOPS, QUEEN_TRADE, TAKE_C, ANSWER_CHECK, STOCKFISH,
];
