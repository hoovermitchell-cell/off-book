// The one-line idea shown with each new Italian move (decisions 13 and 13b).
// DRAFT by Claude, pending Mitch's review (decision 16, batch 2). Same shape and voice as
// queens-gambit-ideas.ts, written for White. One idea per kind of move, not per position. Traps,
// the plan against each Black setup and the starter routes get their own notes, keyed by the moves
// before White's move.
import { Chess, SQUARES } from 'chess.js';
import { posKey, type PrepMove } from './prep';

/** Notes for exact moments, keyed by the moves played before White's move. */
const MOMENTS: [string, string][] = [
  // The opening
  ['e4 e5', 'Nf3 attacks the pawn on e5 and brings a knight out. Black has to guard the pawn.'],
  ['e4 e5 Nf3 Nc6', "Bc4 aims at f7, where only Black's king stands guard. It also gets your king ready to castle."],
  // Giuoco Piano, the slow plan
  ['e4 e5 Nf3 Nc6 Bc4 Bc5', 'c3 gets ready for d4. If Black takes on d4, you take back with the c-pawn and keep a strong center.'],
  ['e4 e5 Nf3 Nc6 Bc4 Bc5 c3 Nf6', "d3 guards e4, which Black's knight attacks. It is a quiet move on purpose. Build first, look for action later."],
  ['e4 e5 Nf3 Nc6 Bc4 Bc5 c3 Nf6 d3 d6 O-O O-O', 'Re1 puts the rook behind the e4 pawn. Your setup is finished, and now you can look for a good moment to play d4.'],
  ['e4 e5 Nf3 Nc6 Bc4 Bc5 c3 Nf6 d3 d6 O-O O-O Re1 a6', 'Bb3 steps back before ...b5 can chase the bishop. It still aims at f7.'],
  // Two Knights
  ['e4 e5 Nf3 Nc6 Bc4 Nf6', 'd3 guards e4 and keeps the game quiet. You skip the sharp lines and use the same setup as against ...Bc5.'],
  // Blackburne Shilling trap
  ['e4 e5 Nf3 Nc6 Bc4 Nd4', 'Take the knight. Nxe5?? runs into ...Qg5, which attacks e5 and g2 at once. This is the Blackburne Shilling trap.'],
  // Bc5 on move two
  ['e4 e5 Nf3 Bc5', "Nxe5 wins a pawn. Black's bishop already eyes f2, and ...Qh4 would add a second attacker."],
  // Petroff
  ['e4 e5 Nf3 Nf6', 'Nxe5 wins a pawn. Your own e4 pawn is now unguarded, so Black can take it with ...Nxe4.'],
  ['e4 e5 Nf3 Nf6 Nxe5 d6', 'The d6 pawn attacks your knight, so Nf3 goes back. You are a pawn up for now, until Black takes on e4.'],
  ['e4 e5 Nf3 Nf6 Nxe5 d6 Nf3 Nxe4', "d4 takes the center and opens your c1 bishop. Black's knight on e4 has no pawn guarding it yet."],
  ['e4 e5 Nf3 Nf6 Nxe5 d6 Nf3 Nxe4 d4 d5', 'Bd3 develops the bishop and attacks the knight on e4. The d5 pawn guards it, so this is pressure, not a win.'],
  // Petroff trap
  ['e4 e5 Nf3 Nf6 Nxe5 Nxe4', 'Qe2 attacks the knight on e4 and sets a trap. If Black retreats with ...Nf6??, Nc6+ wins the queen for a knight.'],
  ['e4 e5 Nf3 Nf6 Nxe5 Nxe4 Qe2 Nf6', 'Nc6+ is check from your queen on e2, because the knight left the e-file. It also attacks the queen on d8, so Black loses the queen for a knight.'],
  ['e4 e5 Nf3 Nf6 Nxe5 Nxe4 Qe2 d5', 'd3 attacks the knight on e4 again. If it goes back to f6, Nc6+ still wins the queen for a knight.'],
  // Philidor
  ['e4 e5 Nf3 d6', 'd4 attacks e5 and opens the center. If Black takes, Nxd4 puts your knight in the middle and your pieces come out fast.'],
  ['e4 e5 Nf3 d6 d4 exd4', "Take back with the knight. It lands in the center, and Black's d6 pawn can't hit it."],
  ['e4 e5 Nf3 d6 d4 exd4 Nxd4 Nf6', "Nc3 develops a knight and guards e4, which Black's knight is hitting."],
  // Starter route: Scandinavian
  ['e4 d5', 'Take the pawn on d5. Black will want it back with the queen or a knight, and you can chase either piece.'],
  ['e4 d5 exd5 Qxd5', 'Nc3 attacks the queen and develops a piece. The queen has to move again.'],
  ['e4 d5 exd5 Qxd5 Nc3 Qa5', "d4 takes the center. Black's queen is off to the side on a5, so you build while it is away."],
  // Starter route: French
  ['e4 e6', 'd4 builds a big center with pawns on d4 and e4.'],
  ['e4 e6 d4 d5', "e5 is the Advance. The pawn gains space and takes f6 away from Black's knight."],
  ['e4 e6 d4 d5 e5 c5', "c3 guards d4, which Black's c-pawn attacks. The pawns on c3, d4 and e5 hold together in a line."],
  ['e4 e6 d4 d5 e5 c5 c3 Nc6', 'Nf3 guards d4 again. Black hits d4 with the c-pawn and the knight, so it needs more than one guard.'],
  ['e4 e6 d4 d5 e5 c5 c3 Nc6 Nf3 Qb6', "a3 takes b4 away from Black's queen and bishop, so they can't pin or hit the c3 pawn from there."],
];

const GUARD_D4 = 'c3 guards d4.';
const BACK_KNIGHT = 'd4 takes the center and guards the knight on e5.';
const H3_TAKE = "h3 takes g4 away from Black's pieces, so no bishop or knight can jump there.";
const RE1_E_PAWN = 'Re1 puts the rook on the e-file, behind your e4 pawn.';
const DEVELOP_BISHOP = 'Develop the bishop and get ready to castle.';
const ANSWER_CHECK = 'Answer the check.';
const STOCKFISH = "The usual setup doesn't fit this position, so this is Stockfish's choice.";
const PIECE: Record<string, string> = { p: 'pawn', n: 'knight', b: 'bishop', r: 'rook', q: 'queen' };

/** Ideas for the Italian's regular moves, by move. */
const MOVES: Record<string, string> = {
  e4: 'e4 takes the center and opens lines for your queen and f1 bishop.',
  Nf3: 'Nf3 develops a knight toward the center and guards e5 and d4.',
  Bc4: 'Bc4 develops the bishop and aims it at f7.',
  c3: 'c3 gets ready for d4, with a pawn to take back if Black captures.',
  d3: 'd3 guards e4 and opens the way for your c1 bishop.',
  d4: 'd4 takes more of the center and opens lines for your queen and c1 bishop.',
  Nc3: 'Nc3 develops a knight and watches e4 and d5.',
  Bb3: 'Bb3 moves the bishop back along the same diagonal, out of range of a ...b5 push.',
  Re1: 'Re1 puts the rook on the e-file.',
  Bb5: 'Bb5 pins the knight on c6 to the king.',
  Bg5: 'Bg5 pins the knight on f6 to the queen.',
  Be3: 'Be3 develops the bishop and guards d4.',
  Be2: DEVELOP_BISHOP,
  Bd3: DEVELOP_BISHOP,
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
  const queen = SQUARES.find((sq) => {
    const q = c.get(sq);
    return q?.type === 'q' && q.color === 'b' && c.attackers(sq, 'w').includes(move.to);
  });
  c.undo();

  if (c.inCheck() && move.piece !== 'k' && !move.captured) return ANSWER_CHECK;
  if (move.captured) {
    return prep.how === 'stockfish' ? STOCKFISH : `Take the ${PIECE[move.captured]} on ${move.to}.`;
  }
  if (queen) return `${base} attacks the queen on ${queen}.`;
  const d4 = c.get('d4');
  if (base === 'c3' && d4) return d4.color === 'w' ? GUARD_D4 : `c3 attacks the ${PIECE[d4.type]} on d4.`;
  if (base === 'd4' && c.get('d1')?.type !== 'q' && c.get('e5')?.type === 'n') return BACK_KNIGHT;
  const g4 = c.get('g4');
  if (base === 'h3') return g4 ? `h3 attacks the ${PIECE[g4.type]} on g4.` : H3_TAKE;
  if (base === 'Re1' && c.get('e4')?.type === 'p') return RE1_E_PAWN;
  return MOVES[base] ?? (prep.how === 'stockfish' ? STOCKFISH : null);
}

/** Every text, for review and tests. */
export const ALL_IDEAS = [
  ...MOMENTS.map(([, t]) => t),
  ...new Set(Object.values(MOVES)),
  GUARD_D4, BACK_KNIGHT, H3_TAKE, RE1_E_PAWN, ANSWER_CHECK, STOCKFISH,
];
