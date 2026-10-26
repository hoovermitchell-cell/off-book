// The one-line idea shown with each new French move (decisions 13 and 13b).
// DRAFT by Claude, pending Mitch's review (decision 16, batch 2). Same shape and voice as
// caro-kann-ideas.ts and slav-ideas.ts, written for Black. One idea per kind of move, not per
// position. The plan against each White setup and the traps get their own notes, keyed by the
// moves before Black's move.
import { Chess, SQUARES } from 'chess.js';
import { posKey, type PrepMove } from './prep';

/** Notes for exact moments, keyed by the moves played before Black's move. */
const MOMENTS: [string, string][] = [
  // The opening
  ['e4', 'e6 gets ready for ...d5 and opens the way for your f8 bishop. The price is that it shuts in the c8 bishop.'],
  ['e4 e6 d4', 'd5 fights for the center and attacks the pawn on e4. The e6 pawn guards it.'],
  // 2.Nf3, 2.Bc4 and 2.d3
  ['e4 e6 Nf3', "Nf3 doesn't change the plan. d5 takes the center and attacks the pawn on e4."],
  ['e4 e6 Bc4', 'd5 attacks the bishop on c4 and the pawn on e4 at once.'],
  ['e4 e6 d3', "d3 is the King's Indian Attack. White builds slowly, so d5 takes the center right away."],
  // Rubinstein
  ['e4 e6 d4 d5 Nc3', 'dxe4 takes the pawn. White takes back with a knight, and you get easy development. This is the Rubinstein French.'],
  ['e4 e6 d4 d5 Nd2', 'dxe4 takes the pawn. White takes back with a knight, and you get easy development. This is the Rubinstein French.'],
  ['e4 e6 d4 d5 Nc3 dxe4 Nxe4', 'Nd7 prepares ...Ngf6. If White trades on f6, you can take back with a knight and keep your pawns healthy.'],
  ['e4 e6 d4 d5 Nc3 dxe4 Nxe4 Nd7 Nf3', 'Ngf6 attacks the knight on e4. If White takes on f6, retake with the knight.'],
  ['e4 e6 d4 d5 Nc3 dxe4 Nxe4 Nd7 Nf3 Ngf6 Nxf6+', 'Take back with the knight, not the g-pawn. Your pawns stay in one piece.'],
  ['e4 e6 d4 d5 Nc3 dxe4 Nxe4 Nd7 Nf3 Ngf6 Nxf6+ Nxf6 Bd3', "c5 attacks the d4 pawn, White's last pawn in the center."],
  ['e4 e6 d4 d5 Nc3 dxe4 Nxe4 Nd7 Nf3 Ngf6 Nxf6+ Nxf6 Bd3 c5 dxc5', 'Take back with the bishop. It comes out to an active square and aims at f2.'],
  // Advance
  ['e4 e6 d4 d5 e5', "c5 attacks d4, the bottom of White's pawn chain. If d4 goes, the e5 pawn loses its support."],
  ['e4 e6 d4 d5 e5 c5 c3', 'Nc6 attacks d4 a second time. The c5 pawn and the knight both hit it.'],
  ['e4 e6 d4 d5 e5 c5 c3 Nc6 Nf3', 'Qb6 attacks b2 and lines up on d4 behind the c5 pawn. When that pawn takes, the queen hits d4 too.'],
  ['e4 e6 d4 d5 e5 c5 c3 Nc6 Nf3 Qb6 Bd3', "cxd4 pulls White's c-pawn away from c3. When it retakes on d4, your queen and knight both hit it."],
  ['e4 e6 d4 d5 e5 c5 c3 Nc6 Nf3 Qb6 Be2', "cxd4 pulls White's c-pawn away from c3. When it retakes on d4, your queen and knight both hit it."],
  ['e4 e6 d4 d5 e5 c5 c3 Nc6 Nf3 Qb6 Bd3 cxd4 cxd4', "Bd7 guards the knight and gets the bishop out. Don't take on d4 yet. ...Nxd4? Nxd4 Qxd4 loses to Bb5+, which is check and opens the d-file so White's queen attacks yours."],
  ['e4 e6 d4 d5 e5 c5 c3 Nc6 Nf3 Qb6 a3', "c4 gains space and takes d3 away from White's bishop. The diagonal from b6 to d4 is open now, so your queen hits d4."],
  ['e4 e6 d4 d5 e5 c5 c3 Nc6 Nf3 Qb6 Be2 cxd4 cxd4', 'Nh6 heads for f5, where the knight hits d4 again. If White trades on h6, retake with the g-pawn.'],
  ['e4 e6 d4 d5 e5 c5 Nf3', "cxd4 takes the base of White's pawn chain. After Nxd4, ...Nc6 attacks the knight."],
  ['e4 e6 d4 d5 e5 c5 Nf3 cxd4 Nxd4 Nc6 Nxc6', 'Retake with the b-pawn. It puts a pawn on c6 to guard d5 and opens the b-file for your rook.'],
  ['e4 e6 d4 d5 e5 c5 dxc5 Bxc5 Be3 Bxe3 fxe3 Nc6 Bb5', 'Qg5 attacks the pawns on e3, e5 and g2 at once.'],
  // Exchange
  ['e4 e6 d4 d5 exd5', 'Take back with the e-pawn. The center is balanced, so the game is about development and a safe king.'],
];

const NF6_GUARD = 'Nf6 develops a knight and guards d5.';
const NF6_DEVELOP = 'Nf6 develops a knight toward the center.';
const C5_ATTACK = "c5 attacks the d4 pawn and fights for White's center.";
const C5_SPACE = 'c5 takes space on the queenside and controls d4.';
const BD7_OUT = 'Bd7 gets the c8 bishop into the game. In the French it is the piece that has the hardest time.';
const BD7_UNPIN = 'Bd7 unpins the knight on c6.';
const TAKE_E = 'Take back with the e-pawn. It keeps the center even.';
const ANSWER_CHECK = 'Answer the check.';
const STOCKFISH = "The usual setup doesn't fit this position, so this is Stockfish's choice.";
const PIECE: Record<string, string> = { p: 'pawn', n: 'knight', b: 'bishop', r: 'rook', q: 'queen' };

/** Ideas for the French's regular moves, by move. */
const MOVES: Record<string, string> = {
  d5: 'd5 takes a share of the center and attacks e4.',
  Nc6: 'Nc6 develops a knight and eyes d4 and e5.',
  Be7: 'Be7 develops the bishop and gets ready to castle.',
  Bd6: "Bd6 develops the bishop on a diagonal that points at White's kingside.",
  Ne7: 'Ne7 develops the kingside knight and guards d5.',
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
  const hit = move.piece === 'p'
    ? SQUARES.find((sq) => {
        const t = c.get(sq);
        return t && t.color === 'w' && t.type !== 'p' && c.attackers(sq, 'b').includes(move.to);
      })
    : undefined;
  const hitType = hit ? c.get(hit)?.type : undefined;
  const target = move.piece === 'q'
    ? SQUARES.find((sq) => c.get(sq)?.color === 'w' && c.get(sq)?.type !== 'p' && c.attackers(sq, 'b').includes(move.to)) ??
      SQUARES.find((sq) => c.get(sq)?.color === 'w' && c.attackers(sq, 'b').includes(move.to))
    : undefined;
  const targetType = target ? c.get(target)?.type : undefined;
  c.undo();

  if (c.inCheck() && move.piece !== 'k' && !move.captured) return ANSWER_CHECK;
  if (move.captured) {
    if (base === 'exd5') return TAKE_E;
    return prep.how === 'stockfish' ? STOCKFISH : `Take the ${PIECE[move.captured]} on ${move.to}.`;
  }
  if (hit && hitType) return `${base} attacks the ${PIECE[hitType]} on ${hit}.`;
  const e4 = c.get('e4');
  const d4 = c.get('d4');
  const d5 = c.get('d5');
  if (base === 'Nf6' || base === 'Ngf6') {
    if (e4?.color === 'w') return `Nf6 develops a knight and attacks the ${PIECE[e4.type]} on e4.`;
    return d5?.color === 'b' ? NF6_GUARD : NF6_DEVELOP;
  }
  if (base === 'Qb6' && target && targetType) return `Qb6 attacks the ${PIECE[targetType]} on ${target}.`;
  if (base === 'Bd7') {
    const pinner = c.get('b5');
    return pinner?.type === 'b' && pinner.color === 'w' && c.get('c6')?.type === 'n' ? BD7_UNPIN : BD7_OUT;
  }
  if (base === 'Nc6' && d4?.color === 'w') return `Nc6 develops a knight and attacks the ${PIECE[d4.type]} on d4.`;
  if (base === 'c5') return d4?.type === 'p' && d4.color === 'w' ? C5_ATTACK : C5_SPACE;
  return MOVES[base] ?? (prep.how === 'stockfish' ? STOCKFISH : null);
}

/** Every text, for review and tests. */
export const ALL_IDEAS = [
  ...MOMENTS.map(([, t]) => t),
  ...new Set(Object.values(MOVES)),
  BD7_OUT, BD7_UNPIN, NF6_GUARD, NF6_DEVELOP, C5_ATTACK, C5_SPACE, TAKE_E, ANSWER_CHECK, STOCKFISH,
];
