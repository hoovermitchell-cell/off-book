// DRAFT pending Mitch's review (decision 4b): every sentence the game review shows.
// Rules: plain chess words; each verdict sits next to the number that produced it
// (DESIGN.md "Show the work"); no hype, no exclamation marks, no em dashes.
// Scores are centipawns from White's side, and the student is White, so higher is better for them.
import { MISTAKE, PLAYABLE } from '../drill/drill';
import { plyLabel } from '../import/pgn';
import { BLUNDER, type Lesson, type MoveCheck, type PrepWalk } from './review';

export const pts = (cp: number) => (cp / 100).toFixed(1);
/** A drop for display. Mate scores make drops of 1000 or more, which would read as noise. */
const drop = (cp: number) => (cp > 1000 ? 'more than 10.0' : pts(cp));

/** "+0.4", "-1.3", "mate in 3", "mated in 2": a score as the student reads it. */
export function fmtEval(cp: number): string {
  if (Math.abs(cp) >= 90000) return cp > 0 ? `mate in ${100000 - cp}` : `mated in ${100000 + cp}`;
  return `${cp > 0 ? '+' : ''}${pts(cp)}`;
}

export interface Text {
  /** Annotation glyph and its class (good, dubious, mistake, blunder), when the text carries a verdict. */
  g?: string;
  cls?: string;
  head: string;
  /** The number behind the verdict. */
  num: string;
  body?: string;
}

const moveNo = (ply: number) => Math.floor(ply / 2) + 1;

/** The headline: where prep ended and who left first. */
export function boundaryText(walk: PrepWalk, sans: string[]): Text {
  const last = walk.lastPrepPly >= 0 ? `Last prep move: ${plyLabel(walk.lastPrepPly, sans[walk.lastPrepPly])}` : 'Last prep move: none';
  if (walk.deviationPly === null) {
    return { head: 'You stayed in prep all game.', body: `Every White move matched your London prep until the game ended after move ${moveNo(sans.length - 1)}.`, num: last };
  }
  const ply = walk.deviationPly;
  if (walk.leftBy === 'student') {
    return {
      head: `You left prep on move ${moveNo(ply)}.`,
      body: `You played ${plyLabel(ply, sans[ply])}. Your prep move was ${plyLabel(ply, walk.prep?.san ?? '?')}.`,
      num: last,
    };
  }
  return {
    head: `Your opponent left book on move ${moveNo(ply)}.`,
    body: `They played ${plyLabel(ply, sans[ply])}, which your prep doesn't cover. From here it's your own play.`,
    num: last,
  };
}

/** The one lesson card. `checked` is false while Stockfish is still working or didn't finish. */
export function lessonText(lesson: Lesson): Text {
  if (lesson.kind === 'clean') {
    if (lesson.reason === 'in-prep') return { head: 'Nothing to revisit.', body: 'Your prep held for the whole game, so there is no opening lesson in it.', num: '' };
    if (!lesson.checked) return { head: 'Nothing to check.', body: 'Your opponent left book on their last move, so there are no moves of yours to check.', num: '' };
    return {
      head: 'Nothing to revisit.',
      body: `Your opponent left book first. Stockfish checked your next ${lesson.checked} move${lesson.checked === 1 ? '' : 's'} and none lost ${pts(MISTAKE)} or more.`,
      num: `${lesson.checked} checked, 0 mistakes`,
    };
  }
  if (lesson.kind === 'mistake') {
    const c = lesson.check;
    const word = c.glyph === '??' ? 'Blunder' : 'Mistake';
    return {
      g: c.glyph ?? '?', cls: c.glyph === '??' ? 'blunder' : 'mistake',
      head: `${plyLabel(c.ply, c.san)}. ${word}. ${plyLabel(c.ply, c.best)} was better.`,
      body: `Your opponent left book first, so this one is your own play. Stockfish scores ${c.san} ${drop(c.loss)} lower than ${c.best}. A drop of ${pts(MISTAKE)} or more counts as a mistake; ${pts(BLUNDER)} or more as a blunder.`,
      num: `${fmtEval(c.before)} before, ${fmtEval(c.after)} after`,
    };
  }
  const { prep, played, ply, check } = lesson;
  const head = `${plyLabel(ply, played)}. Your prep move was ${plyLabel(ply, prep.san)}.`;
  if (!check || check.prepAfter === undefined) return { head, body: `Stockfish didn't finish checking this move, so there's no score to show. The move to learn is ${prep.san}.`, num: '' };
  const behind = check.prepAfter - check.after;
  const scores = `${prep.san} ${fmtEval(check.prepAfter)}, ${played} ${fmtEval(check.after)}`;
  if (behind < PLAYABLE) {
    return {
      head, num: scores,
      body: `Stockfish scores ${played} within ${pts(PLAYABLE)} of ${prep.san}, so it was playable. It just isn't the move you drilled.`,
    };
  }
  if (behind < MISTAKE) {
    return { g: '?!', cls: 'dubious', head, num: scores, body: `Stockfish scores ${played} ${drop(behind)} lower than ${prep.san}. Under ${pts(PLAYABLE)} counts as playable; this is past that.` };
  }
  return {
    g: behind >= BLUNDER ? '??' : '?', cls: behind >= BLUNDER ? 'blunder' : 'mistake', head, num: scores,
    body: `Stockfish scores ${played} ${drop(behind)} lower than ${prep.san}. A drop of ${pts(MISTAKE)} or more counts as a mistake.`,
  };
}

/** What to say about one move while stepping through the game, or null for a move with nothing to add. */
export function stepText(ply: number, san: string, walk: PrepWalk, check: MoveCheck | undefined): Text | null {
  const label = plyLabel(ply, san);
  if (check?.glyph) {
    const word = check.glyph === '??' ? 'Blunder' : 'Mistake';
    return { g: check.glyph, cls: check.glyph === '??' ? 'blunder' : 'mistake', head: `${label}. ${word}. ${plyLabel(ply, check.best)} was better.`, num: `${fmtEval(check.before)} before, ${fmtEval(check.after)} after` };
  }
  if (ply === walk.deviationPly && walk.leftBy === 'student') return { head: `${label}. Not your prep. ${plyLabel(ply, walk.prep?.san ?? '?')} was.`, num: check ? `${fmtEval(check.before)} before, ${fmtEval(check.after)} after` : '' };
  if (ply === walk.deviationPly) return { head: `${label}. Your opponent leaves book here.`, num: '' };
  if (ply <= walk.lastPrepPly) return { head: `${label}. In prep.`, num: '' };
  if (check) return { head: `${label}. No mistake.`, num: `${fmtEval(check.before)} before, ${fmtEval(check.after)} after` };
  return null;
}
