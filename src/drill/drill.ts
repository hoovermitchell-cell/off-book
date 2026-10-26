// The opening drill as a DOM-free state machine, extracted from the spike's index.html.
// The student plays White or Black (deps.side, White by default); "the opponent" is the other side.
// Dependencies are injected so tests can fake the engines and a UI can
// render purely from `getState()` and the events passed to `on()`.
//
// Flow of one round:
//   learning:  a prep position the student has never played correctly is shown first (decision 13):
//              state.teach holds the move, only that move is legal, and playing it marks it learned.
//   in prep:   student move == prep move -> correct (a rep, unless they missed here first)
//              otherwise Stockfish compares it with the prep move (verdict "playable" or "mistake"),
//              the move is taken back and the student retries.
//   opponent:  plays the round's staged line while the game follows it (decision 14b), then
//              replies by sampling Maia at the chosen rating. A position outside the tree means
//              the student is off book. As Black, the opponent's first move is not sampled: the
//              opening config plays it (deps.openingMoves) before the student's first turn.
//   off book:  any legal move. Stockfish judges before/after; a drop of MISTAKE or more that is not
//              Stockfish's own best move is flagged, and play continues.
//   the game is played out to checkmate, a draw, or resign() (decision 12b).
// Sparring (v1 scope 3) is a round started with spar: a real game against Maia from move 1. Nothing is
// taught or shown, and a move that is not prep stands: Stockfish compares it with the prep move, the
// student is off book, and play goes on.
// Each answer at a learned position is a ladder review (decision 14c): a first-try correct move
// may climb, the first miss at a position (a wrong move, or looking) drops it.
import { Chess } from 'chess.js';
import { posKey, type PrepMove, type PrepTree } from '../data/prep';
import { sample, type MaiaMove } from '../chess/maia';

/** Centipawns a non-prep move may lose against the prep move and still be called "playable". */
export const PLAYABLE = 50;
/** Score drop off book that counts as a real mistake. Stockfish 19 normalizes scores so a position at +1.00 wins about half the time. */
export const MISTAKE = 100;
/** Stockfish think time per judgement, in ms. */
export const JUDGE_MS = 300;
/** Pause before the opponent's reply appears, in ms. */
export const OPPONENT_DELAY_MS = 350;
/** Pause after an off-book mistake is flagged, so the student can read it, in ms. */
export const MISTAKE_PAUSE_MS = 1200;
export const DEFAULT_RATING = 1000;

export type Result = 'won' | 'lost' | 'draw' | 'resigned';
export type EndReason = 'checkmate' | 'draw' | 'resign';
export type Phase = 'idle' | 'student' | 'judging' | 'opponent' | 'over';

export interface DrillDeps {
  tree: PrepTree;
  /** The student's colour. Defaults to White. */
  side?: 'w' | 'b';
  /** SAN moves played before the student's first turn, without Maia (the opening config's forced first move). */
  openingMoves?: string[];
  /** Scores are centipawns from White's point of view. */
  engine: { evaluate(fen: string, ms: number): Promise<Judgement> };
  /** Legal moves for the side to move with probabilities, sorted high to low. */
  maia: (chess: Chess, elo: number) => Promise<MaiaMove[]>;
  /** Prep positions (posKey) the student has already learned. Defaults to an in-memory set.
   *  `review`, when given, records each answer at a learned position and returns the level before and after. */
  learned?: { has(key: string): boolean; add(key: string): void; review?(key: string, ok: boolean): { from: number; to: number } };
  rand?: () => number;
  delay?: (ms: number) => Promise<void>;
}

/** Plain, serializable snapshot. */
export interface DrillState {
  phase: Phase;
  fen: string;
  /** SAN of every move played so far, both sides. */
  history: string[];
  rating: number;
  offBook: boolean;
  /** Prep moves played correctly this round. */
  prepMoves: number;
  /** Prep moves that counted as a rep (correct on the first try). */
  reps: number;
  /** Off-book mistakes flagged this round. */
  mistakes: number;
  /** The student has missed at the current prep position and has not yet played it correctly. */
  missed: boolean;
  /** A new prep move being shown to the student (learning step), or null when they are being tested. */
  teach: PrepMove | null;
  result: Result | null;
}

/** One Stockfish search. depth/nodes feed the "How did it know?" panel. */
export interface Judgement {
  cp: number;
  best: string;
  depth?: number;
  nodes?: number;
}

export interface TopMove {
  san: string;
  p: number;
}

export type DrillEvent =
  | { type: 'start'; state: DrillState }
  | { type: 'judging'; kind: 'prep' | 'offbook' }
  | { type: 'prep-correct'; san: string; counted: boolean; prepMoves: number; reps: number; learnedNow: boolean; climbed: boolean }
  | { type: 'prep-miss'; played: string; prep: string; prepUci: string; loss: number; verdict: 'playable' | 'mistake'; depth?: number; nodes?: number }
  /** Sparring: the student's non-prep move stands, so the student left prep. */
  | { type: 'left-prep'; played: string; prep: string; loss: number; verdict: 'playable' | 'mistake'; depth?: number; nodes?: number }
  | { type: 'opponent-move'; san: string; uci: string; p: number; top: TopMove[]; rating: number; staged: boolean }
  | { type: 'off-book'; san: string }
  | { type: 'offbook-mistake'; played: string; better: string; betterUci: string; loss: number; depth?: number; nodes?: number }
  | { type: 'game-over'; result: Result; reason: EndReason; prepMoves: number; reps: number; mistakes: number }
  /** Stockfish or Maia failed mid-game. The round is over; start() begins a fresh one. */
  | { type: 'engine-error'; message: string };

export interface StudentMove {
  from: string;
  to: string;
  promotion?: string;
}

export interface Drill {
  getState(): DrillState;
  /** Starts (or restarts) a round. As Black, the opponent has moved when this returns, or is about to.
   *  `staged`: SAN moves from the start, both sides, that the opponent plays while the game follows them.
   *  `spar`: a sparring round, with no teaching, no hints and no takebacks. */
  start(rating?: number, staged?: string[], spar?: boolean): void;
  setRating(rating: number): void;
  /** Plays the student's move. Resolves once the whole cycle (judging, the opponent's reply) is done.
   *  Resolves false if the move was ignored (not the student's turn, or illegal). */
  play(move: StudentMove): Promise<boolean>;
  resign(): void;
  /** Legal destinations for the student, keyed by origin square. Empty unless it is their turn. */
  dests(): Map<string, string[]>;
  /** The prep move at the current position, while still in prep. */
  prepHint(): PrepMove | undefined;
  /** Shows the prep move to the student. Looking costs the rep at this position. */
  revealPrep(): PrepMove | undefined;
  /** Subscribe to events. Returns an unsubscribe function. */
  on(listener: (e: DrillEvent) => void): () => void;
}

const uciOf = (m: { from: string; to: string; promotion?: string }) => m.from + m.to + (m.promotion ?? '');
const defaultDelay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export function createDrill(deps: DrillDeps): Drill {
  const { tree, engine, maia } = deps;
  const student = deps.side ?? 'w';
  const openingMoves = deps.openingMoves ?? [];
  const learned: NonNullable<DrillDeps['learned']> = deps.learned ?? new Set<string>();
  const rand = deps.rand ?? Math.random;
  const delay = deps.delay ?? defaultDelay;
  const listeners = new Set<(e: DrillEvent) => void>();

  let chess = new Chess();
  let phase: Phase = 'idle';
  let rating = DEFAULT_RATING;
  let offBook = false;
  let missed = false;
  let prepMoves = 0;
  let reps = 0;
  let mistakes = 0;
  let result: Result | null = null;
  // Bumped on every start() so that work left over from a previous round is dropped.
  let round = 0;
  let staged: string[] = [];
  let spar = false;
  // A wrong prep move is on the board while Stockfish judges it; resign() must take it back.
  let pendingMiss = false;

  const emit = (e: DrillEvent) => listeners.forEach((l) => { l(e); });
  const isOver = () => phase === 'over';

  function getState(): DrillState {
    return {
      phase,
      fen: chess.fen(),
      history: chess.history(),
      rating,
      offBook,
      prepMoves,
      reps,
      mistakes,
      missed,
      teach: teaching(),
      result,
    };
  }

  /** The prep move to show, if the student is at a prep position they have not learned yet. */
  function teaching(): PrepMove | null {
    if (phase !== 'student' || offBook || spar) return null;
    const key = posKey(chess.fen());
    const prep = tree.get(key);
    return prep && !learned.has(key) ? prep : null;
  }

  function start(r?: number, line: string[] = [], sparring = false) {
    round++;
    if (r !== undefined) rating = r;
    staged = line;
    spar = sparring;
    chess = new Chess();
    for (const san of openingMoves) chess.move(san);
    phase = chess.turn() === student ? 'student' : 'opponent';
    offBook = false;
    missed = false;
    prepMoves = 0;
    reps = 0;
    mistakes = 0;
    result = null;
    pendingMiss = false;
    emit({ type: 'start', state: getState() });
    // The opponent moves first and the config has not said how: Maia picks.
    if (phase === 'opponent') {
      const myRound = round;
      void guard(myRound, async () => { await opponentReply(myRound); return true; });
    }
  }

  function endGame(reason: EndReason) {
    phase = 'over';
    if (reason === 'resign') result = 'resigned';
    else if (reason === 'checkmate') result = chess.turn() === student ? 'lost' : 'won';
    else result = 'draw';
    emit({ type: 'game-over', result, reason, prepMoves, reps, mistakes });
  }

  /** Ends the game if the position is terminal. */
  function checkOver(): boolean {
    if (chess.isCheckmate()) endGame('checkmate');
    else if (chess.isDraw() || chess.isStalemate()) endGame('draw');
    return isOver();
  }

  /** Stockfish score for the position after the student's move. A checkmate cannot be searched, so score it directly. */
  async function evalAfter(): Promise<Judgement> {
    // The opponent is the one mated. Scores are White's point of view, so Black mating is -100000.
    if (chess.isCheckmate()) return { cp: student === 'w' ? 100000 : -100000, best: '' };
    return engine.evaluate(chess.fen(), JUDGE_MS);
  }

  /** Centipawns the student's move lost against the better one. Scores are White's point of view,
   *  so a Black student loses when the score goes up. */
  const lossOf = (better: Judgement, played: Judgement) => (student === 'w' ? better.cp - played.cp : played.cp - better.cp);

  async function opponentReply(myRound: number): Promise<void> {
    phase = 'opponent';
    const elo = rating; // a rating change mid-search applies to the next reply, not this one
    const history = chess.history();
    const next = staged[history.length];
    const onLine = next !== undefined && history.every((san, i) => san === staged[i]);
    let moves: MaiaMove[];
    let pick: MaiaMove;
    if (onLine) {
      const m = new Chess(chess.fen()).move(next);
      pick = { san: m.san, uci: uciOf(m), logit: 0, p: 1 };
      moves = [pick];
    } else {
      moves = await maia(new Chess(chess.fen()), elo);
      if (myRound !== round || isOver()) return;
      pick = sample(moves, rand);
    }
    await delay(OPPONENT_DELAY_MS);
    if (myRound !== round || isOver()) return;
    chess.move(pick.san);
    // Settle the state before emitting, so a listener that renders from getState() sees the student's turn.
    const leftBook = !offBook && !tree.has(posKey(chess.fen()));
    if (leftBook) offBook = true;
    phase = 'student';
    emit({
      type: 'opponent-move',
      san: pick.san,
      uci: pick.uci,
      p: pick.p,
      top: moves.slice(0, 4).map((m) => ({ san: m.san, p: m.p })),
      rating: elo,
      staged: onLine,
    });
    if (checkOver()) return;
    if (leftBook) emit({ type: 'off-book', san: pick.san });
  }

  // Off book: any move is allowed; Stockfish only speaks up for a real mistake.
  async function playOn(myRound: number, before: string, played: { from: string; to: string; promotion?: string; san: string }) {
    phase = 'judging';
    emit({ type: 'judging', kind: 'offbook' });
    const [a, b] = await Promise.all([engine.evaluate(before, JUDGE_MS), evalAfter()]);
    if (myRound !== round || isOver()) return;
    const loss = lossOf(a, b);
    if (loss >= MISTAKE && a.best !== uciOf(played)) {
      mistakes++;
      const better = new Chess(before).move({ from: a.best.slice(0, 2), to: a.best.slice(2, 4), promotion: a.best[4] });
      phase = 'opponent';
      emit({ type: 'offbook-mistake', played: played.san, better: better.san, betterUci: uciOf(better), loss, depth: a.depth, nodes: a.nodes });
      await delay(MISTAKE_PAUSE_MS);
      if (myRound !== round || isOver()) return;
    }
    if (checkOver()) return;
    return opponentReply(myRound);
  }

  /** Runs one cycle. If an engine fails, the round ends in a state the student can recover from with start(). */
  async function guard(myRound: number, run: () => Promise<boolean>): Promise<boolean> {
    try {
      return await run();
    } catch (err) {
      if (myRound !== round || isOver()) return true;
      if (pendingMiss) chess.undo();
      pendingMiss = false;
      phase = 'over';
      emit({ type: 'engine-error', message: String(err) });
      return true;
    }
  }

  async function play(move: StudentMove): Promise<boolean> {
    if (phase !== 'student') return false;
    const myRound = round;
    return guard(myRound, () => runPlay(move, myRound));
  }

  async function runPlay(move: StudentMove, myRound: number): Promise<boolean> {
    const before = chess.fen();
    let played: ReturnType<Chess['move']>;
    try {
      played = chess.move({ from: move.from, to: move.to, promotion: move.promotion ?? 'q' });
    } catch {
      return false;
    }

    if (!offBook) {
      const prep = tree.get(posKey(before));
      if (prep && !spar && !learned.has(posKey(before))) {
        // Learning step: only the shown move is accepted.
        if (played.san !== prep.san) {
          chess.undo();
          return false;
        }
        learned.add(posKey(before));
        prepMoves++;
        missed = false;
        phase = 'opponent';
        emit({ type: 'prep-correct', san: played.san, counted: false, prepMoves, reps, learnedNow: true, climbed: false });
        if (checkOver()) return true;
        await opponentReply(myRound);
        return true;
      }
      if (!prep) {
        // Cannot happen while the tree covers every position we sent the student to.
        offBook = true;
        emit({ type: 'off-book', san: played.san });
      } else if (played.san === prep.san) {
        prepMoves++;
        // Sparring reaches prep positions not learned yet; only learned ones are reviewed.
        const counted = !missed && learned.has(posKey(before));
        let climbed = false;
        if (counted) {
          reps++;
          const r = learned.review?.(posKey(before), true);
          climbed = !!r && r.to > r.from;
        }
        missed = false;
        phase = 'opponent';
        emit({ type: 'prep-correct', san: played.san, counted, prepMoves, reps, learnedNow: false, climbed });
        if (checkOver()) return true;
        await opponentReply(myRound);
        return true;
      } else {
        // Not prep: Stockfish compares it with the prep move, then the student retries.
        phase = 'judging';
        pendingMiss = !spar;
        emit({ type: 'judging', kind: 'prep' });
        const prepChess = new Chess(before);
        prepChess.move(prep.san);
        const [a, b] = await Promise.all([engine.evaluate(prepChess.fen(), JUDGE_MS), evalAfter()]);
        if (myRound !== round || isOver()) return true; // resign() already took the move back
        pendingMiss = false;
        const loss = lossOf(a, b);
        const verdict = loss < PLAYABLE ? 'playable' : 'mistake';
        miss(before);
        if (spar) {
          offBook = true;
          phase = 'opponent';
          emit({ type: 'left-prep', played: played.san, prep: prep.san, loss, verdict, depth: a.depth, nodes: a.nodes });
          if (checkOver()) return true;
          await opponentReply(myRound);
          return true;
        }
        chess.undo();
        phase = 'student';
        emit({
          type: 'prep-miss',
          played: played.san,
          prep: prep.san,
          prepUci: prep.uci,
          loss,
          verdict,
          depth: a.depth,
          nodes: a.nodes,
        });
        return true;
      }
    }
    await playOn(myRound, before, played);
    return true;
  }

  /** The first miss at a position drops it a rung; retries there cost nothing more. */
  function miss(fen: string) {
    if (!missed && learned.has(posKey(fen))) learned.review?.(posKey(fen), false);
    missed = true;
  }

  function resign() {
    if (phase === 'idle' || phase === 'over') return;
    // Take back a wrong prep move still being judged, so game-over renders the settled board.
    if (pendingMiss) chess.undo();
    pendingMiss = false;
    endGame('resign');
  }

  function prepHint(): PrepMove | undefined {
    return offBook || phase === 'idle' ? undefined : tree.get(posKey(chess.fen()));
  }

  function dests(): Map<string, string[]> {
    const d = new Map<string, string[]>();
    if (phase !== 'student') return d;
    const teach = teaching();
    if (teach) return new Map([[teach.uci.slice(0, 2), [teach.uci.slice(2, 4)]]]);
    for (const m of chess.moves({ verbose: true })) d.set(m.from, [...(d.get(m.from) ?? []), m.to]);
    return d;
  }

  return {
    getState,
    start,
    setRating: (r) => {
      rating = r;
    },
    play,
    resign,
    dests,
    prepHint,
    revealPrep: () => {
      const hint = phase === 'student' && !spar && !teaching() ? prepHint() : undefined;
      if (hint) miss(chess.fen());
      return hint;
    },
    on: (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
  };
}
