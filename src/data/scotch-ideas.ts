// The one-line idea shown with each new Scotch move (decisions 13 and 13b).
// DRAFT by Claude, pending Mitch's review (decision 16, batch 3). Same shape and voice as
// italian-ideas.ts, written for White. Where the Scotch and the Italian reach the same position with
// the same move (the Philidor, the Petroff and its queen trap, 2...Bc5, the Scandinavian and French
// starter routes), the Italian's text is used as is; everything else is written here. Traps, the plan
// against each Black setup and the 3.d4 break get their own notes, keyed by the moves before White's move.
import { Chess, SQUARES } from 'chess.js';
import { buildTree as italianTree } from './italian';
import { ideaFor as italianIdea } from './italian-ideas';
import { posKey, type PrepMove } from './prep';

/** Notes for exact moments, keyed by the moves played before White's move. */
const MOMENTS: [string, string][] = [
  // The break
  ['e4 e5 Nf3 Nc6', 'd4 opens the center right away. If Black takes, you take back with the knight, and it lands on a strong square in the middle. This is the Scotch.'],
  ['e4 e5 Nf3 Nc6 d4 exd4', 'Take back with the knight. Bc4 here would be the Scotch Gambit, which is sharper. Taking back keeps the game simple.'],
  // 4...Bc5, the Classical plan
  ['e4 e5 Nf3 Nc6 d4 exd4 Nxd4 Bc5', "Be3 guards the knight on d4, which Black's bishop attacks. It also brings out your bishop."],
  ['e4 e5 Nf3 Nc6 d4 exd4 Nxd4 Bc5 Be3 Qf6', "c3 gives the knight on d4 one more guard. Black's bishop, knight and queen all aim at it."],
  ['e4 e5 Nf3 Nc6 d4 exd4 Nxd4 Bc5 Be3 Qf6 c3 Nge7', 'Bc4 develops the bishop and aims it at f7. Now you can castle.'],
  // 4...Nf6, the Mieses plan
  ['e4 e5 Nf3 Nc6 d4 exd4 Nxd4 Nf6', 'Nxc6 takes the knight. If Black retakes with the b-pawn, Black ends up with two pawns on the c-file, and your e-pawn can attack the knight on f6.'],
  ['e4 e5 Nf3 Nc6 d4 exd4 Nxd4 Nf6 Nxc6 bxc6', 'e5 attacks the knight on f6 and gains space. Black has to deal with it right away.'],
  ['e4 e5 Nf3 Nc6 d4 exd4 Nxd4 Nf6 Nxc6 bxc6 e5 Qe7', "Qe2 guards the pawn on e5, which Black's queen attacks, and puts your queen on the e-file."],
  ['e4 e5 Nf3 Nc6 d4 exd4 Nxd4 Nf6 Nxc6 bxc6 e5 Qe7 Qe2 Nd5', 'c4 attacks the knight on d5, so it has to move again. You keep gaining time.'],
  // 3...Nxd4
  ['e4 e5 Nf3 Nc6 d4 Nxd4', 'Take with the knight. After ...exd4, your queen can take the pawn.'],
  ['e4 e5 Nf3 Nc6 d4 Nxd4 Nxd4 exd4', 'Qxd4 takes the pawn. Your queen stands in the middle, and none of Black\'s pieces attack it yet.'],
  // 3...Nf6
  ['e4 e5 Nf3 Nc6 d4 Nf6', 'dxe5 takes a pawn and attacks the knight on f6.'],
  ['e4 e5 Nf3 Nc6 d4 Nf6 dxe5 Nxe4', 'Qd5 attacks the knight on e4 and the pawn on f7 at the same time.'],
];

const ANSWER_CHECK = 'Answer the check.';
const STOCKFISH = "The usual setup doesn't fit this position, so this is Stockfish's choice.";
const DEVELOP_BISHOP = 'Develop the bishop and get ready to castle.';
const H3_TAKE = "h3 takes g4 away from Black's pieces, so no bishop or knight can jump there.";
const PIECE: Record<string, string> = { p: 'pawn', n: 'knight', b: 'bishop', r: 'rook', q: 'queen', k: 'king' };
const VALUE = 'qrbn';

/** Ideas for the Scotch's regular moves, by move. */
const MOVES: Record<string, string> = {
  Nc3: 'Nc3 develops a knight toward the center.',
  c3: 'c3 gets ready for d4, with a pawn to take back if Black captures.',
  Bc4: 'Bc4 develops the bishop.',
  Be2: DEVELOP_BISHOP,
  Bd3: DEVELOP_BISHOP,
  'O-O': 'Castle: your king gets safe and your rook joins the game.',
  'O-O-O': 'Castle long: your king gets safe and the rook comes to d1.',
};
const BE3 = 'Be3 develops the bishop and eyes the center.';
const GUARD = (piece: string) => `Be3 develops the bishop and guards the ${piece} on d4.`;
const MOVE_KNIGHT = 'Nc3 develops a knight and guards the pawn on e4.';
const AIM_F7 = 'Bc4 develops the bishop and aims it at f7.';
const GUARD_D4 = (piece: string) => `c3 gives the ${piece} on d4 a pawn to guard it.`;
const CHECK_BISHOP = (base: string) => `${base} gives check and brings the bishop out.`;

const momentKeys = new Map(
  MOMENTS.map(([line, text]) => {
    const c = new Chess();
    line.split(' ').forEach((m) => { c.move(m); });
    return [posKey(c.fen()), text] as const;
  }),
);

const italian = italianTree();

/** The idea for White's prep move at `fen`, or null when only the arrow is shown. */
export function ideaFor(fen: string, prep: PrepMove): string | null {
  const key = posKey(fen);
  const moment = momentKeys.get(key);
  if (moment) return moment;
  // A position the Italian also has, with the same move, keeps the Italian's text.
  if (italian.get(key)?.san === prep.san) return italianIdea(fen, prep);

  const c = new Chess(fen);
  const base = prep.san.replace(/[+#]/g, '');
  const wasInCheck = c.inCheck();
  const move = c.move(prep.san);
  const gaveCheck = c.inCheck();
  // The most valuable Black piece (not a pawn or the king) that the moved piece attacks from its new square.
  const target = SQUARES.map((sq) => ({ sq, p: c.get(sq) }))
    .filter(({ sq, p }) => p && p.color === 'b' && VALUE.includes(p.type) && c.attackers(sq, 'w').includes(move.to))
    .sort((a, b) => VALUE.indexOf(a.p!.type) - VALUE.indexOf(b.p!.type))[0];
  const d4 = c.get('d4');
  const e4 = c.get('e4');
  const g4 = c.get('g4');
  const f7Attacked = c.attackers('f7', 'w').includes(move.to);
  c.undo();

  if (wasInCheck && move.piece !== 'k' && !move.captured) return ANSWER_CHECK;
  if (move.captured) {
    return prep.how === 'stockfish' ? STOCKFISH : `Take the ${PIECE[move.captured]} on ${move.to}.`;
  }
  if (base === 'O-O' || base === 'O-O-O') return MOVES[base];
  if (gaveCheck) return move.piece === 'b' && move.from === 'f1' ? CHECK_BISHOP(base) : `${base} gives check.`;
  if (move.piece === 'p' && base === 'c3' && d4?.color === 'w') return GUARD_D4(PIECE[d4.type]);
  if (move.piece === 'p' && target) return `${base} attacks the ${PIECE[target.p!.type]} on ${target.sq}.`;
  if (base === 'Be3' && d4?.color === 'w') return GUARD(PIECE[d4.type]);
  if (base === 'Be3' && move.from === 'c1') return BE3;
  if (base === 'Nc3' && e4?.color === 'w' && e4.type === 'p') return MOVE_KNIGHT;
  if (base === 'Bc4') return f7Attacked ? AIM_F7 : MOVES.Bc4;
  if (base === 'h3') return g4 ? `h3 attacks the ${PIECE[g4.type]} on g4.` : H3_TAKE;
  if (move.piece !== 'p' && target) return `${base} attacks the ${PIECE[target.p!.type]} on ${target.sq}.`;
  return MOVES[base] ?? (prep.how === 'stockfish' ? STOCKFISH : null);
}

/** Every text this file writes, for review and tests. The Italian's texts are listed in italian-ideas.ts. */
export const ALL_IDEAS = [
  ...MOMENTS.map(([, t]) => t),
  ...new Set(Object.values(MOVES)),
  BE3, ANSWER_CHECK, STOCKFISH, H3_TAKE, MOVE_KNIGHT, AIM_F7,
];
