// The one-line idea shown with each new Caro-Kann move (decisions 13 and 13b).
// Drafted by Claude; Mitch reviewed every text on 2026-10-23 and approved them with the edits below
// applied. Same shape and voice as london-ideas.ts, written for Black.
// One idea per kind of move, not per position: most of the tree shares a dozen ideas. Traps and key
// moments get their own notes, keyed by the moves before Black's move.
import { Chess } from 'chess.js';
import { posKey, type PrepMove } from './prep';

/** Notes for exact moments, keyed by the moves played before Black's move. */
const MOMENTS: [string, string][] = [
  // Classical
  ['e4 c6 d4 d5 Nc3', 'Take the pawn. White takes back with a knight, and then ...Bf5 hits that knight.'],
  ['e4 c6 d4 d5 Nd2', 'Take the pawn. White takes back with a knight, and then ...Bf5 hits that knight.'],
  ['e4 c6 d4 d5 Nc3 dxe4 Nxe4', 'Bf5 attacks the knight and gets your bishop out. Do not play ...Nd7 first: after Qe2, ...Ngf6?? loses to Nd6 mate.'],
  ['e4 c6 d4 d5 Nc3 dxe4 Nxe4 Bf5 Ng3', "The knight attacks your bishop. Bg6 keeps it on the same diagonal, still aimed at White's kingside."],
  ['e4 c6 d4 d5 Nc3 dxe4 Nxe4 Bf5 Ng3 Bg6 h4', 'h4 wants h5, which would chase your bishop again. h6 stops a knight jump to g5 and gets ready for ...Bh7.'],
  ['e4 c6 d4 d5 Nc3 dxe4 Nxe4 Bf5 Bd3', "Bd3 blocks the queen's guard of d4. Qxd4 wins the pawn."],
  // Advance
  ['e4 c6 d4 d5 e5', "e5 closes the center. Get the bishop out to f5 now: once ...e6 is played, it can't get out."],
  ['e4 c6 d4 d5 e5 Bf5 Nf3 e6 Be2', "c5 attacks d4, the base of White's pawn chain. If d4 goes, the e5 pawn is weak."],
  ['e4 c6 d4 d5 e5 Bf5 Nf3 e6 Be2 c5 Be3', 'Take on d4. White usually takes back with the knight, and the c-file opens for you.'],
  ['e4 c6 d4 d5 e5 Bf5 h4', "White's h-pawn wants to run to h5 and chase your bishop. h5 stops it."],
  ['e4 c6 d4 d5 e5 Bf5 g4', 'g4 chases the bishop. Be4 hits the rook on h1 through the gap g4 left, so White has to spend a move on f3. Then drop back to g6.'],
  ['e4 c6 d4 d5 e5 Bf5 Nf3 e6 Bd3', "White offers to trade the light-squared bishops. Take: White's bishop was its good one, and ...c5 comes next."],
  ['e4 c6 d4 d5 e5 Bf5 Nf3 e6 Bd3 Bxd3 Qxd3', 'c5 attacks d4, the base of the pawn chain, the same plan as against Be2.'],
  // Exchange with Nf3: Bb5 and Ne5 both hit c6
  ['e4 c6 d4 d5 exd5 cxd5 Nf3 Nc6 Bb5 Bf5 Ne5', 'Bb5 and Ne5 both attack c6. Rc8 guards it a second time.'],
  ['e4 c6 d4 d5 exd5 cxd5 Nf3 Nc6 Bb5 Bf5 Ne5 Rc8 Qf3', 'Qf3 hits your bishop. e6 guards it. Your bishop also blocks the f-file, which keeps the queen off f7.'],
  ['e4 c6 d4 d5 exd5 cxd5 Nf3 Nc6 Bb5 Bf5 Ne5 Rc8 Qf3 e6 g4', 'Trap: only Bg6 is safe. It still guards f7. After Be4??, Qxf7 is mate, because Ne5 covers d7.'],
  // Fantasy
  ['e4 c6 d4 d5 f3', 'f3 props up e4. Take anyway: after fxe4, ...e5 hits d4 at once.'],
  ['e4 c6 d4 d5 f3 dxe4 fxe4', 'e5 strikes at d4 at once. If White takes with dxe5??, Qh4+ is coming.'],
  ['e4 c6 d4 d5 f3 dxe4 fxe4 e5 dxe5', 'Qh4+. With the f-pawn gone, only g3 blocks the check, and then Qxe4+ also hits the rook on h1.'],
  ['e4 c6 d4 d5 f3 dxe4 fxe4 e5 dxe5 Qh4+ g3', 'Take on e4 with check. Whatever White blocks with, your queen takes the rook on h1.'],
  ['e4 c6 d4 d5 f3 dxe4 fxe4 e5 Nf3 Bg4 Bc4', "Nd7 guards e5. Don't trade on f3 first: after Qxf3, the queen and the c4 bishop both hit f7."],
  // Two Knights
  ['e4 c6 Nc3 d5 Nf3', 'Bg4 pins the knight to the queen and gets your bishop out before ...e6.'],
  ['e4 c6 Nc3 d5 Nf3 Bg4 h3', 'Trade the bishop for the knight. It removes a defender of e5 and d4, and then you can play ...e6.'],
  // Exchange
  ['e4 c6 d4 d5 exd5 cxd5 Bd3 Nc6 c3 Nf6 Bf4 Bg4 Qb3', 'The queen hits b7. Qd7 guards it, and ...e6 and ...Bd6 come next.'],
];

/** Notes for the Advanced tier's lines (decision 16, docs/plans/2026-10-26-advanced-tier.md), keyed the same way. DRAFT, pending Mitch's review. */
const ADVANCED_MOMENTS: [string, string][] = [
  // 3.Nf3 and 4.Ne5
  ['e4 c6 d4 d5 Nf3', "Take the pawn. The knight on f3 doesn't guard e4, so you are a pawn up for now."],
  ['e4 c6 d4 d5 Nf3 dxe4 Ne5', "Nd7 attacks the knight on e5. Don't defend f7; make the knight move or trade it."],
  ['e4 c6 d4 d5 Nf3 dxe4 Ne5 Nd7 Bc4', 'The knight and the bishop both aim at f7. Take the knight: ...Nxe5 removes one of the attackers.'],
  ['e4 c6 d4 d5 Nf3 dxe4 Ne5 Nd7 Bc4 Nxe5 dxe5', 'Qa5+ checks the king and attacks the pawn on e5 at the same time.'],
  // 2.Qh5
  ['e4 c6 Qh5', 'Nf6 attacks the queen and develops a piece. White loses time again.'],
  ['e4 c6 Qh5 Nf6 Qf3', "Grab the center with e5. White's queen has moved twice and no other piece is out."],
  ['e4 c6 Qh5 Nf6 Qf3 e5 Bc4', 'd5 hits the bishop and the center at once. If White takes, cxd5 attacks the bishop again.'],
  ['e4 c6 Qh5 Nf6 Qf3 e5 Bc4 d5 exd5', 'Take back with the c-pawn. It attacks the bishop on c4 again.'],
  ['e4 c6 Qh5 Nf6 Qf3 e5 Bc4 d5 exd5 cxd5 Bb5+ Nc6 Bxc6+', 'Take back with the b-pawn. ...Bd7?? and ...Ke7?? both lose.'],
  // 2.Nc3 d5 3.f3
  ['e4 c6 Nc3 d5 f3', "d4! attacks the knight. Its best square, e2, blocks White's own bishop on f1."],
  ['e4 c6 Nc3 d5 f3 d4 Nce2', 'e5 builds the center. Your pawns on d4 and e5 take space from White.'],
  ['e4 c6 Nc3 d5 f3 d4 Nce2 e5 c3', "d3! The pawn attacks the knight on e2. White has nothing that attacks it: the queen is blocked by the pawn on d2 and the bishop by the knight."],
  ['e4 c6 Nc3 d5 f3 d4 Nce2 e5 c3 d3 Ng3', 'g6 takes the f5 square from the knight. ...h5 comes next.'],
  // 2.Nf3 d5 3.Ne5
  ['e4 c6 Nf3 d5 Ne5', "Take the pawn. The knight on e5 attacks f7, but it doesn't attack e4, so you are a pawn up for now."],
  ['e4 c6 Nf3 d5 Ne5 dxe4 Bc4', "e6 blocks the bishop's diagonal to f7, so only the knight still attacks it. It also opens the way for your f8 bishop."],
  ['e4 c6 Nf3 d5 Ne5 dxe4 Bc4 e6 O-O', 'Qd4! The queen attacks the knight on e5, and nothing guards it. It also eyes the bishop on c4 and the pawn on b2.'],
  ['e4 c6 Nf3 d5 Ne5 dxe4 Bc4 e6 O-O Qd4 Qh5', 'g6 attacks the queen and blocks its diagonal to f7, so Qxf7+ is off.'],
];

const BISHOP_OUT = 'e6 backs up d5 and opens the way for your f8 bishop. The c8 bishop is already out, so nothing gets locked in.';
const BISHOP_IN = 'e6 backs up d5 and opens the way for your f8 bishop.';
const TRADE_BISHOPS = "Trade bishops. White's bishop was aimed at your kingside, so swapping it off makes castling safer.";
const QUEEN_TRADE = 'Trade queens. If White takes back with the king, it can no longer castle.';
const TAKE_C = 'Take back with the c-pawn. You get a pawn on d5 and an open c-file.';
const DEVELOP_BISHOP = 'Develop the bishop and clear the way to castle.';
const ANSWER_CHECK = 'Answer the check.';
const ND7_LATE = 'Nd7 develops your last knight toward the center.';
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
  Ngf6: 'Ngf6 develops your last knight, guards the kingside and gets you ready to castle.',
  Nf6: 'Nf6 develops a knight toward the center, covering d5 and e4.',
  Be7: DEVELOP_BISHOP,
  Bd6: DEVELOP_BISHOP,
  c5: 'c5 attacks d4 and fights for the center.',
  e5: 'e5 claims the center and opens the f8 bishop.',
  Nc6: 'Nc6 develops a knight and puts pressure on d4.',
  Nbc6: 'Nc6 develops a knight and puts pressure on d4.',
  Ne7: 'Ne7, because the e5 pawn takes away f6. From e7 the knight can go to c6, f5 or g6.',
  Qb6: 'Qb6 hits b2 and d4 at once.',
  Qd7: 'Qd7 guards b7 and clears d8 for a rook.',
  'O-O': 'Castle: your king gets safe and your rook joins the game.',
};

const momentKeys = new Map(
  [...MOMENTS, ...ADVANCED_MOMENTS].map(([line, text]) => {
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
    if (base.startsWith('Qxd1')) return QUEEN_TRADE;
    if (base === 'Bxd3') return TRADE_BISHOPS;
    if (base === 'cxd5') return TAKE_C;
    return prep.how === 'stockfish' ? STOCKFISH : `Take on ${move.to}.`;
  }
  if ((base === 'Nd7' || base === 'Nbd7') && c.get('g8')?.type !== 'n') return ND7_LATE;
  if (base === 'e6') return c.get('c8')?.type === 'b' ? BISHOP_IN : BISHOP_OUT;
  return MOVES[base] ?? (prep.how === 'stockfish' ? STOCKFISH : null);
}

export const ADVANCED_IDEAS = ADVANCED_MOMENTS.map(([, t]) => t);

/** Every text, for review and tests. */
export const ALL_IDEAS = [
  ...MOMENTS.map(([, t]) => t),
  ...ADVANCED_IDEAS,
  ...new Set(Object.values(MOVES)),
  BISHOP_OUT, BISHOP_IN, ND7_LATE, TRADE_BISHOPS, QUEEN_TRADE, TAKE_C, ANSWER_CHECK, STOCKFISH,
];
