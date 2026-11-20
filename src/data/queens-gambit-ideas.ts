// The one-line idea shown with each new Queen's Gambit move (decisions 13 and 13b).
// DRAFT by Claude, pending Mitch's review (decision 16, batch 1). Same shape and voice as
// london-ideas.ts. One idea per kind of move, not per position. Traps and key moments get their own
// notes, keyed by the moves before White's move.
import { Chess } from 'chess.js';
import { posKey, type PrepMove } from './prep';

/** Notes for exact moments, keyed by the moves played before White's move. */
const MOMENTS: [string, string][] = [
  ['d4 d5', 'c4 attacks d5 from the side. If Black takes, you win the pawn back.'],
  // QGD, Exchange
  ['d4 d5 c4 e6 Nc3 Nf6', "Take on d5. After ...exd5 the pawns are fixed: Black has the center pawn, and you get a clear plan on the queenside."],
  ['d4 d5 c4 e6 Nc3 Nf6 cxd5 exd5', 'Bg5 pins the knight to the queen and keeps an eye on d5.'],
  ['d4 d5 c4 e6 Nc3 Nf6 cxd5 exd5 Bg5 c6 e3 Be7 Bd3 Nbd7', "Qc2 lines up behind the bishop on the diagonal to h7, and both cover e4, so Black's knight can't settle there."],
  ['d4 d5 c4 e6 Nc3 Nf6 cxd5 exd5 Bg5 c6 e3 Be7 Bd3 Nbd7 Qc2 O-O Nf3 Re8 O-O Nf8', "Rab1 gets ready for b4 and b5: the minority attack. Two of your pawns go after Black's three to leave a weak pawn on c6."],
  // QGA
  ['d4 d5 c4 dxc4', 'e3 opens the way for your f1 bishop, which takes back on c4. Win the pawn back; don\'t chase it.'],
  ['d4 d5 c4 dxc4 e3 b5', 'a4 attacks the pawn that guards c4. Black cannot hold on to the extra pawn.'],
  ['d4 d5 c4 dxc4 e3 b5 a4 c6', 'Take on b5. After ...cxb5, the long diagonal from f3 to a8 is empty.'],
  ['d4 d5 c4 dxc4 e3 b5 a4 c6 axb5 cxb5', 'Trap: Qf3 hits the rook on a8 down the empty diagonal. Black loses material whatever it does.'],
  ['d4 d5 c4 dxc4 e3 e5', 'Take the pawn back first. Then deal with ...exd4.'],
  // Slav and Semi-Slav
  ['d4 d5 c4 c6 Nf3 Nf6 Nc3 dxc4', 'a4 stops ...b5, which would hold on to the c4 pawn. You win it back with e3 and Bxc4.'],
  ['d4 d5 c4 c6 Nf3 Nf6 Nc3 dxc4 a4 Bf5 e3 e6 Bxc4 Bb4 O-O O-O', 'Qe2 gets ready for e4 and lets a rook come to d1.'],
  ['d4 d5 c4 c6 Nf3 Nf6 Nc3 e6 e3 Nbd7', 'Qc2 covers e4, so Black has a harder time freeing the position with ...e5 or a knight jump.'],
  // Albin Counter-Gambit
  ['d4 d5 c4 e5', 'Take the pawn. Black gives it up for a pawn on d4 that cramps you.'],
  ['d4 d5 c4 e5 dxe5 d4', 'Nf3, not e3. After e3? Bb4+ Bd2 dxe3, Bxb4?? loses to ...exf2+ and ...fxg1=N+: a pawn becomes a knight with check (the Lasker trap).'],
  ['d4 d5 c4 e5 dxe5 d4 Nf3 Nc6', 'g3 and Bg2 aim your bishop down the long diagonal at b7.'],
  // Chigorin
  ['d4 d5 c4 Nc6 Nf3 Bg4', "Take on d5 first. Black's queen has to take back, and your pieces gain time hitting it."],
  ['d4 d5 c4 Nc6 Nf3 Bg4 cxd5 Bxf3', 'Take back with the g-pawn. Your e-pawn stays in the middle, and two bishops make up for the split pawns.'],
];

const BACK_C4 = 'Take the pawn back. Material is level and your bishop is out.';
const DEVELOP_BISHOP = 'Develop the bishop and get ready to castle.';
const ANSWER_CHECK = 'Answer the check.';
const STOCKFISH = "The usual setup doesn't fit this position, so this is Stockfish's choice.";

/** Ideas for the Queen's Gambit's regular moves, by move. */
const MOVES: Record<string, string> = {
  d4: 'd4 takes the center and opens the way for your c1 bishop.',
  c4: 'c4 attacks d5 from the side.',
  Nc3: 'Nc3 develops a knight and adds pressure on d5.',
  Nf3: 'Nf3 develops a knight and guards d4.',
  e3: 'e3 guards d4 and opens the way for your f1 bishop.',
  Bg5: 'Bg5 develops the bishop and puts pressure on f6.',
  Bd3: 'Bd3 develops the bishop toward Black\'s king and gets you ready to castle.',
  Be2: DEVELOP_BISHOP,
  Qc2: 'Qc2 connects your pieces and covers e4.',
  Qb3: 'Qb3 puts pressure on b7 and d5.',
  a4: "a4 stops ...b5, so Black can't hold on to the c4 pawn.",
  e4: 'e4 builds a big center with pawns on d4 and e4.',
  Ne5: 'Ne5 puts the knight on a strong central square.',
  h3: "h3 keeps Black's pieces off g4.",
  Bg2: 'Bg2 aims the bishop down the long diagonal at b7.',
  'O-O': 'Castle: your king gets safe and your rook joins the game.',
};

const momentKeys = new Map(
  MOMENTS.map(([line, text]) => {
    const c = new Chess();
    line.split(' ').forEach((m) => { c.move(m); });
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

  if (c.inCheck() && move.piece !== 'k' && !move.captured) return ANSWER_CHECK;
  if (move.captured) {
    if (base === 'Bxc4') return BACK_C4;
    return prep.how === 'stockfish' ? STOCKFISH : `Take on ${move.to}.`;
  }
  return MOVES[base] ?? (prep.how === 'stockfish' ? STOCKFISH : null);
}

/** Every text, for review and tests. */
export const ALL_IDEAS = [
  ...MOMENTS.map(([, t]) => t),
  ...new Set(Object.values(MOVES)),
  BACK_C4, ANSWER_CHECK, STOCKFISH,
];
