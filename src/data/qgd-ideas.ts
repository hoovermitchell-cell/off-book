// The one-line idea shown with each new Queen's Gambit Declined move (decisions 13 and 13b).
// DRAFT by Claude, pending Mitch's review (decision 16, batch 3). Same shape and voice as
// slav-ideas.ts and french-ideas.ts, written for Black: ...e6 where the Slav plays ...c6. One idea per
// kind of move, not per position. The plan against each White setup and the Elephant trap get their
// own notes, keyed by the moves before Black's move.
import { Chess, SQUARES } from 'chess.js';
import { posKey, type PrepMove } from './prep';

/** Notes for exact moments, keyed by the moves played before Black's move. */
const MOMENTS: [string, string][] = [
  ['d4 d5 c4', 'e6 backs up d5 and opens the way for your f8 bishop. The price is that your c8 bishop is shut in for now. You free it later with ...dxc4 or ...b6.'],
  ['d4 d5 c4 e6 Nc3', "Nf6 develops a knight and guards d5. You are declining the pawn on c4 and keeping your center. That is the Queen's Gambit Declined."],
  // Orthodox
  ['d4 d5 c4 e6 Nc3 Nf6 Bg5', 'Nbd7 adds a guard to the pinned knight on f6. It also sets the Elephant trap: if White takes on d5 and then grabs the pawn with the knight, ...Nxd5 wins a knight for a pawn.'],
  ['d4 d5 c4 e6 Nc3 Nf6 Bg5 Nbd7 e3 Be7 Nf3 O-O Rc1 c6 Bd3', "dxc4 takes the pawn. White's bishop has already gone to d3, so taking back on c4 is its second move, and you gain a move."],
  ['d4 d5 c4 e6 Nc3 Nf6 Bg5 Nbd7 e3 Be7 Nf3 O-O Rc1 c6 Bd3 dxc4 Bxc4', 'Nd5 attacks the knight on c3 and offers a trade. Fewer pieces means more room for your cramped pieces.'],
  ['d4 d5 c4 e6 Nc3 Nf6 Bg5 Nbd7 e3 Be7 Nf3 O-O Rc1 c6 Bd3 dxc4 Bxc4 Nd5 Bxe7 Qxe7 O-O', 'Nxc3 trades a pair of knights, which gives the rest of your pieces more room.'],
  ['d4 d5 c4 e6 Nc3 Nf6 Bg5 Nbd7 e3 Be7 Nf3 O-O Rc1 c6 Bd3 dxc4 Bxc4 Nd5 Bxe7 Qxe7 O-O Nxc3 Rxc3', 'e5 hits the center and frees your game. If White takes, ...Nxe5 puts a knight in the middle and opens the diagonal for your c8 bishop.'],
  // Elephant trap
  ['d4 d5 c4 e6 Nc3 Nf6 Bg5 Nbd7 cxd5', "Take back with the e-pawn. If White's knight now takes on d5, that is the Elephant trap."],
  ['d4 d5 c4 e6 Nc3 Nf6 Bg5 Nbd7 cxd5 exd5 Nxd5', 'Nxd5! If White takes your queen with Bxd8, ...Bb4+ forces Qd2, and after ...Bxd2+ Kxd2 Kxd8 you have won a knight for a pawn.'],
  ['d4 d5 c4 e6 Nc3 Nf6 Bg5 Nbd7 cxd5 exd5 Nxd5 Nxd5 Bxd8', 'Bb4+ is check, and the only way to block it is Qd2.'],
  ['d4 d5 c4 e6 Nc3 Nf6 Bg5 Nbd7 cxd5 exd5 Nxd5 Nxd5 Bxd8 Bb4+ Qd2', 'Bxd2+ takes the queen, with check.'],
  ['d4 d5 c4 e6 Nc3 Nf6 Bg5 Nbd7 cxd5 exd5 Nxd5 Nxd5 Bxd8 Bb4+ Qd2 Bxd2+ Kxd2', 'Kxd8 takes the last piece. You gave up a queen, a bishop and a pawn, and White gave up a queen, a bishop and a knight.'],
  // Exchange
  ['d4 d5 c4 e6 Nc3 Nf6 cxd5', 'Take back with the e-pawn. This is the Exchange: the pawns are fixed, so the game is about pieces. Develop and castle.'],
  ['d4 d5 c4 e6 Nc3 Nf6 cxd5 exd5 Bg5 Be7 e3 c6 Bd3 Nbd7 Qc2 O-O Nf3 Re8 O-O', 'Nf8 clears d7 for the c8 bishop and sends the knight toward g6 or e6.'],
  // London
  ['d4 d5 Bf4 Nf6 e3 e6 Nf3', "Bd6 faces the bishop on f4 and offers a trade. The London bishop is White's best-placed piece, so trading it helps you."],
  // Blackmar-Diemer Gambit
  ['d4 d5 e4', 'Take the pawn. White offers it as a gambit for fast development, so answer by developing fast yourself.'],
  ['d4 d5 e4 dxe4 Nc3', 'Nf6 guards e4 and develops a piece.'],
  ['d4 d5 e4 dxe4 Nc3 Nf6 f3', 'Take on f3. After Nxf3 you are still a pawn up.'],
  ['d4 d5 e4 dxe4 Nc3 Nf6 f3 exf3 Nxf3', 'e6 opens the way for your f8 bishop and is a solid setup. You are a pawn up, so you can play quietly.'],
];

const E6_SHUT = 'e6 backs up d5 and opens the way for your f8 bishop. It shuts in the c8 bishop for now.';
const E6_OPEN = 'e6 backs up d5 and opens the way for your f8 bishop.';
const BE7_UNPIN = 'Be7 breaks the pin on the knight and gets ready to castle.';
const BE7 = 'Be7 develops the bishop and gets ready to castle.';
const NF6_GUARD = 'Nf6 develops a knight and guards d5.';
const NBD7_GUARD = 'Nbd7 develops your last knight and guards the knight on f6.';
const C6_CAPTURE = 'c6 backs up d5 and gets ready for ...dxc4.';
const C6 = 'c6 backs up d5.';
const C5_ATTACK = "c5 attacks the d4 pawn and fights for White's center.";
const NC6_ATTACK = 'Nc6 develops a knight and attacks the pawn on d4.';
const B6 = 'b6 gets ready for ...Bb7, so the c8 bishop can come out.';
const TAKE_E = 'Take back with the e-pawn, so you keep a pawn on d5.';
const TAKE_C4 = "Take the pawn on c4. Don't try to hold it: let White win it back while you finish developing.";
const ANSWER_CHECK = 'Answer the check.';
const STOCKFISH = "The usual setup doesn't fit this position, so this is Stockfish's choice.";
const PIECE: Record<string, string> = { p: 'pawn', n: 'knight', b: 'bishop', r: 'rook', q: 'queen', k: 'king' };
const VALUE = 'qrbn';

/** Ideas for the QGD's regular moves, by move. */
const MOVES: Record<string, string> = {
  d5: 'd5 takes a share of the center and stops e4.',
  Bd6: "Bd6 develops the bishop on a diagonal that points at White's kingside.",
  Re8: 'Re8 puts the rook on the e-file, ready for the moment the bishop steps aside.',
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

  const before = new Chess(fen);
  const base = prep.san.replace(/[+#]/g, '');
  const wasInCheck = before.inCheck();
  const g5 = before.get('g5');
  const f6 = before.get('f6');
  const pinned = g5?.type === 'b' && g5.color === 'w' && f6?.type === 'n' && f6.color === 'b' && before.get('d8')?.type === 'q' && !before.get('e7');
  const c = new Chess(fen);
  const move = c.move(prep.san);
  const gaveCheck = c.inCheck();
  // The most valuable White piece (not a pawn or the king) that the moved piece attacks from its new square.
  const target = SQUARES.map((sq) => ({ sq, p: c.get(sq) }))
    .filter(({ sq, p }) => p && p.color === 'w' && VALUE.includes(p.type) && c.attackers(sq, 'b').includes(move.to))
    .sort((a, b) => VALUE.indexOf(a.p?.type ?? '') - VALUE.indexOf(b.p?.type ?? ''))[0];
  const hits = target?.p ? PIECE[target.p.type] : '';
  const answersBack = target ? c.attackers(move.to, 'w').includes(target.sq) : false; // the target attacks the moved piece too
  const d4 = c.get('d4');
  const c4 = c.get('c4');
  const d5 = c.get('d5');
  const c8 = c.get('c8');
  const f6After = c.get('f6');

  if (wasInCheck && move.piece !== 'k' && !move.captured) return ANSWER_CHECK;
  if (move.captured) {
    if (base === 'exd5') return TAKE_E;
    if (base === 'dxc4') return TAKE_C4;
    return prep.how === 'stockfish' ? STOCKFISH : `Take the ${PIECE[move.captured]} on ${move.to}.`;
  }
  if (base === 'O-O') return MOVES['O-O'];
  if (gaveCheck) return `${base} gives check.`;
  if (move.piece === 'p' && target) return `${base} attacks the ${hits} on ${target.sq}.`;
  if (base === 'e6') return c8?.type === 'b' && c8.color === 'b' ? E6_SHUT : E6_OPEN;
  if (base === 'Nf6' && d5?.color === 'b' && d5.type === 'p') return NF6_GUARD;
  if (base === 'Be7') return pinned ? BE7_UNPIN : BE7;
  if (base === 'Nbd7' && f6After?.type === 'n' && f6After.color === 'b') return NBD7_GUARD;
  if (base === 'c6') return c4?.color === 'w' && c4.type === 'p' && d5?.color === 'b' ? C6_CAPTURE : C6;
  if (base === 'c5' && d4?.color === 'w' && d4.type === 'p') return C5_ATTACK;
  if (base === 'Nc6' && d4?.color === 'w' && d4.type === 'p') return NC6_ATTACK;
  if (base === 'b6' && c8?.type === 'b' && c8.color === 'b') return B6;
  if (target && answersBack && target.p?.type === move.piece) return `${base} faces the ${hits} on ${target.sq} and offers a trade.`;
  if (move.piece !== 'p' && target) return `${base} attacks the ${hits} on ${target.sq}.`;
  return MOVES[base] ?? (prep.how === 'stockfish' ? STOCKFISH : null);
}

/** Every text, for review and tests. */
export const ALL_IDEAS = [
  ...MOMENTS.map(([, t]) => t),
  ...new Set(Object.values(MOVES)),
  E6_SHUT, E6_OPEN, BE7_UNPIN, BE7, NF6_GUARD, NBD7_GUARD, C6_CAPTURE, C6, C5_ATTACK,
  NC6_ATTACK, B6, TAKE_E, TAKE_C4, ANSWER_CHECK, STOCKFISH,
];
