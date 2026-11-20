// The Review tab: import flow, then the prep-boundary review of the confirmed game.
// Renders from review.ts and templates.ts; owns no chess rules. Canon: DESIGN.md.
import { Chessground } from 'chessground';
import type { Api } from 'chessground/api';
import type { DrawBrushes, DrawShape } from 'chessground/draw';
import type { Key } from 'chessground/types';
import { Chess, type Move } from 'chess.js';
import { openingForSide } from '../data/openings';
import { plyLabel, type ImportedGame } from '../import/pgn';
import { analyze, chooseLesson, walkPrep, type MoveCheck } from '../review/review';
import { boundaryText, lessonText, pendingText, SCORE_NOTE, stepText, type Text } from '../review/templates';
import { createStockfish, type StockfishHandle } from '../chess/stockfish-worker';
import { provenStage } from '../levels';
import { updateSaved } from '../storage';
import { mountImport } from './import-view';
import prepEndsSvg from '../../design/icons/prep-ends.svg?raw';
import badgeBook from '../../design/icons/badges/book.svg?raw';
import badgeMistake from '../../design/icons/badges/mistake.svg?raw';
import badgeBlunder from '../../design/icons/badges/blunder.svg?raw';

const ICONS = {
  first: '<path d="m11 17-5-5 5-5M18 17l-5-5 5-5"/>',
  prev: '<path d="m15 18-6-6 6-6"/>',
  next: '<path d="m9 18 6-6-6-6"/>',
  last: '<path d="m6 17 5-5-5-5M13 17l5-5-5-5"/>',
};
const icon = (p: string) => `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;

// One Stockfish for the page's life, started when the first review needs it. A cancelled review leaves
// at most one 0.3 s search in flight, which the engine's queue absorbs.
let stockfish: Promise<StockfishHandle> | null = null;
const getStockfish = () => (stockfish ??= createStockfish().catch((err) => { stockfish = null; throw err; }));
const dropStockfish = () => { const p = stockfish; stockfish = null; p?.then((h) => h.terminate(), () => {}); };

type Status = 'starting' | 'running' | 'done' | 'stopped' | 'failed';

/** Returns `open`, which reviews a game handed over from outside the import flow (a sparring game). */
export function mountReview(root: HTMLElement): { open(game: ImportedGame): void } {
  root.innerHTML = '<div id="rv-import"></div><div id="rv-screen" hidden></div>';
  const importEl = root.querySelector<HTMLElement>('#rv-import')!;
  const screen = root.querySelector<HTMLElement>('#rv-screen')!;
  let teardown = () => {};

  const imp = mountImport(importEl, openGame);

  function leave() {
    teardown();
    teardown = () => {};
    screen.hidden = true;
    screen.innerHTML = '';
    importEl.hidden = false;
    imp.show();
  }

  function openGame(game: ImportedGame) {
    teardown();
    importEl.hidden = true;
    screen.hidden = false;
    teardown = review(screen, game, leave, () => !!screen.closest('[hidden]'));
    screen.querySelector<HTMLElement>('#rv-now')?.focus();
  }

  return { open: openGame };
}

/** Builds the review screen for one game inside `host`. Returns a function that stops everything it started. */
function review(host: HTMLElement, game: ImportedGame, onLeave: () => void, isHidden: () => boolean): () => void {
  const { sans, side } = game;
  const opening = openingForSide(side)!; // the import step only opens games whose side has an opening
  const walk = walkPrep(sans, opening);
  // A clean real game proves the staged line it followed (decision 14c). Recorded once, on opening the review.
  // A sparring game is not a real game, so it proves nothing.
  const proven = game.source === 'spar' ? undefined : provenStage(sans, opening);
  const newlyProven = !!proven && updateSaved((s) => (s.proven.includes(proven.id) ? s : { ...s, proven: [...s.proven, proven.id] })).ok;
  if (newlyProven) window.dispatchEvent(new Event('storage')); // the drill reloads its line list on this event

  // One replay of the game: the position, last move and check state after every ply.
  const replay = new Chess();
  const fens = [replay.fen()];
  const moves: Move[] = [];
  const inCheck = [false];
  for (const san of sans) {
    moves.push(replay.move(san));
    fens.push(replay.fen());
    inCheck.push(replay.inCheck());
  }

  host.innerHTML = `
    <main class="review">
      <section class="play" aria-label="Game review">
        <p class="now" id="rv-now" tabindex="-1"></p>
        <div class="board" id="rv-board"></div>
        <div class="under">
          <p class="fb" id="rv-step"></p>
          ${proven ? `<p class="note">This game proves your ${proven.name} line: you played your prep right until it ended or your opponent left it.${newlyProven ? '' : " This browser couldn't save that."}</p>` : ''}
        </div>
      </section>
      <aside class="rail" aria-label="Lesson, moves and steps">
        <section class="lesson rail-section" id="rv-lesson" aria-labelledby="rv-lesson-h"></section>
        <div class="rail-section">
          <div class="scoresheet"><ol class="moves rv-moves" id="rv-moves" aria-label="Moves of the game"></ol></div>
          <div class="row">
            <button type="button" class="quiet icon" id="rv-first" aria-label="First position" title="First position">${icon(ICONS.first)}</button>
            <button type="button" class="quiet icon" id="rv-prev" aria-label="Previous move" title="Previous move (left arrow)">${icon(ICONS.prev)}</button>
            <button type="button" class="quiet icon" id="rv-next" aria-label="Next move" title="Next move (right arrow)">${icon(ICONS.next)}</button>
            <button type="button" class="quiet icon" id="rv-last" aria-label="Last position" title="Last position">${icon(ICONS.last)}</button>
          </div>
          <div class="rv-prog" id="rv-prog"></div>
        </div>
        <div class="rail-section">
          <div class="row"><button type="button" class="quiet" id="rv-other">Choose another game</button></div>
        </div>
      </aside>
    </main>
    <p class="visually-hidden" id="rv-live" aria-live="polite"></p>`;
  const $ = <T extends HTMLElement>(id: string) => host.querySelector<T>(`#${id}`)!;
  const els = { now: $('rv-now'), lesson: $('rv-lesson'), step: $('rv-step'), moves: $('rv-moves'), scoresheet: host.querySelector<HTMLElement>('.scoresheet')!, prog: $('rv-prog'), live: $('rv-live') };
  const btn = { first: $<HTMLButtonElement>('rv-first'), prev: $<HTMLButtonElement>('rv-prev'), next: $<HTMLButtonElement>('rv-next'), last: $<HTMLButtonElement>('rv-last') };

  const css = getComputedStyle(document.documentElement);
  const token = (name: string) => css.getPropertyValue(name).trim();
  const durPiece = parseFloat(token('--dur-piece')) || 0;
  const ground: Api = Chessground($('rv-board'), {
    orientation: side === 'w' ? 'white' : 'black',
    coordinates: true,
    viewOnly: true,
    animation: { enabled: durPiece > 0, duration: durPiece },
    highlight: { lastMove: true, check: true },
    drawable: {
      brushes: {
        prep: { key: 'ob-rv-prep', color: token('--mark-good'), opacity: 0.85, lineWidth: 12 },
        better: { key: 'ob-rv-better', color: token('--mark-mistake'), opacity: 0.85, lineWidth: 12 },
      } as Partial<DrawBrushes> as DrawBrushes,
    },
  });

  // ---- state -----------------------------------------------------------------------------------
  let checks: MoveCheck[] = [];
  let status: Status = walk.leftBy ? 'starting' : 'done';
  let total = 0;
  let failure = '';
  let ctl: AbortController | null = null;
  let cursor = walk.deviationPly === null ? sans.length : walk.leftBy === 'student' ? walk.deviationPly : walk.deviationPly + 1;
  const byPly = () => new Map(checks.map((c) => [c.ply, c]));

  // ---- rendering -------------------------------------------------------------------------------
  const verdict = (t: Text) => `<b class="${t.cls ?? ''}" aria-hidden="true">${t.g ?? ''}</b><span></span><span class="num"></span>`;
  function fill(el: HTMLElement, t: Text) {
    el.innerHTML = verdict(t);
    el.children[1].textContent = t.head;
    el.children[2].textContent = t.num;
  }

  function renderBoundary() {
    const t = boundaryText(walk, sans, opening);
    els.now.textContent = t.head;
    for (const line of [t.body, t.num]) {
      if (!line) continue;
      const s = document.createElement('small');
      s.textContent = line;
      if (line === t.num) s.className = 'num';
      els.now.append(s);
    }
  }

  function renderLesson() {
    const lesson = chooseLesson(sans, walk, checks, opening.ideaFor);
    const t = (status !== 'done' && pendingText(lesson, status === 'starting' || status === 'running')) || lessonText(lesson);
    els.lesson.innerHTML = `<h3 id="rv-lesson-h">Lesson to revisit</h3><p class="fb"></p><p class="body"></p>${lesson.kind === 'deviation' && lesson.idea ? '<p class="note"></p>' : ''}`;
    fill(els.lesson.querySelector<HTMLElement>('.fb')!, t);
    els.lesson.querySelector('.body')!.textContent = t.body ?? '';
    if (lesson.kind === 'deviation' && lesson.idea) els.lesson.querySelector('.note')!.textContent = lesson.idea;
    const target = lesson.kind === 'deviation' ? lesson.ply : lesson.kind === 'mistake' ? lesson.check.ply : null;
    if (target !== null) {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'quiet';
      b.textContent = 'Show it on the board';
      b.addEventListener('click', () => go(target));
      els.lesson.append(b);
    }
  }

  function renderMoves() {
    const marks = byPly();
    const cell = (ply: number) => {
      const san = sans[ply];
      if (san === undefined) return '<span></span>';
      const c = marks.get(ply);
      const glyph = c?.glyph ? `<span class="glyph ${c.glyph === '??' ? 'blunder' : 'mistake'}">${c.glyph}</span><span class="visually-hidden"> ${c.glyph === '??' ? 'blunder' : 'mistake'}</span>` : '';
      const inPrep = ply <= walk.lastPrepPly;
      const end = ply === walk.lastPrepPly && walk.deviationPly !== null ? `<span class="prep-end" title="Prep ends here">${prepEndsSvg}</span>` : '';
      const text = inPrep ? `<span class="book">${san}<span class="visually-hidden"> (prep)</span></span>` : san;
      return `<span><button type="button" class="mv" data-ply="${ply}">${text}${glyph}</button>${end}</span>`;
    };
    let html = '';
    for (let ply = 0; ply < sans.length; ply += 2) {
      html += `<li><span class="n">${ply / 2 + 1}.</span>${cell(ply)}${cell(ply + 1)}</li>`;
      // The marker goes under the row that holds the last prep move.
      if (walk.lastPrepPly >= 0 && walk.deviationPly !== null && Math.floor(walk.lastPrepPly / 2) === ply / 2) html += `<li class="prep-ends-row">${prepEndsSvg}Prep ends here</li>`;
    }
    els.moves.innerHTML = html;
    markCurrent(false);
  }

  function markCurrent(scroll = true) {
    els.moves.querySelectorAll('.mv[aria-current]').forEach((b) => { b.removeAttribute('aria-current'); });
    const now = cursor > 0 ? els.moves.querySelector<HTMLElement>(`.mv[data-ply="${cursor - 1}"]`) : null;
    now?.setAttribute('aria-current', 'step');
    if (scroll) now?.scrollIntoView({ block: 'nearest' });
  }

  function renderProg() {
    const running = status === 'starting' || status === 'running';
    const text = {
      starting: 'Starting Stockfish…',
      running: `Checking your moves with Stockfish: ${checks.length} of ${total}`,
      stopped: `Check stopped after ${checks.length} of ${total} moves.`,
      failed: `Stockfish stopped, so the check didn't finish. ${failure}`,
      done: checks.length ? `Stockfish checked ${checks.length} of your moves after prep, about 0.3 seconds each. ${SCORE_NOTE}` : '',
    }[status];
    els.prog.innerHTML = `<span class="soft"></span>${running ? '<button type="button" class="quiet" id="rv-cancel">Cancel</button>' : status === 'stopped' || status === 'failed' ? '<button type="button" class="quiet" id="rv-retry">Try again</button>' : ''}`;
    els.prog.firstElementChild!.textContent = text;
    els.prog.querySelector('#rv-cancel')?.addEventListener('click', () => ctl?.abort());
    els.prog.querySelector('#rv-retry')?.addEventListener('click', () => void run());
  }

  function drawShapes() {
    const shapes: DrawShape[] = [];
    const prep = walk.prep;
    if (walk.leftBy === 'student' && prep && cursor === walk.deviationPly) shapes.push({ orig: prep.uci.slice(0, 2) as Key, dest: prep.uci.slice(2, 4) as Key, brush: 'prep' });
    const here = byPly().get(cursor);
    if (here?.glyph && here.bestUci.length >= 4 && here.bestUci !== prep?.uci) shapes.push({ orig: here.bestUci.slice(0, 2) as Key, dest: here.bestUci.slice(2, 4) as Key, brush: 'better' });
    // A move-quality badge sits on the top-right of the square the last move landed on (design/icons/BRIEF.md).
    const last = cursor > 0 ? byPly().get(cursor - 1) : undefined;
    const svg = last?.glyph ? (last.glyph === '??' ? badgeBlunder : badgeMistake) : cursor > 0 && (cursor - 1) % 2 === (side === 'w' ? 0 : 1) && cursor - 1 <= walk.lastPrepPly ? badgeBook : null;
    if (svg) shapes.push({ orig: moves[cursor - 1].to as Key, customSvg: { html: svg.replace(/<svg[^>]*>/, '<svg x="60" y="2" width="38" height="38" viewBox="0 0 32 32">') } });
    ground.setAutoShapes(shapes);
  }

  function show() {
    const last = cursor > 0 ? moves[cursor - 1] : undefined;
    ground.set({
      fen: fens[cursor],
      turnColor: cursor % 2 ? 'black' : 'white',
      lastMove: last ? [last.from as Key, last.to as Key] : undefined,
      check: inCheck[cursor],
    });
    drawShapes();
    markCurrent();
    const t = cursor > 0 ? stepText(cursor - 1, sans[cursor - 1], walk, byPly().get(cursor - 1)) : null;
    if (cursor === 0) els.step.textContent = 'Start of the game. Step through with the arrow keys.';
    else if (t) fill(els.step, t);
    else els.step.textContent = plyLabel(cursor - 1, sans[cursor - 1]);
    els.live.textContent = t ? `${t.head} ${t.num}` : cursor > 0 ? plyLabel(cursor - 1, sans[cursor - 1]) : 'Start of the game.';
    btn.first.disabled = btn.prev.disabled = cursor === 0;
    btn.next.disabled = btn.last.disabled = cursor === sans.length;
  }

  function go(n: number) {
    cursor = Math.max(0, Math.min(sans.length, n));
    show();
  }

  // ---- analysis --------------------------------------------------------------------------------
  async function run() {
    ctl?.abort();
    const mine = new AbortController();
    ctl = mine;
    checks = [];
    status = 'starting';
    renderProg(); renderLesson(); renderMoves();
    try {
      const sf = await getStockfish();
      mine.signal.throwIfAborted();
      status = 'running';
      await analyze(sans, walk, sf.engine, {
        signal: mine.signal,
        onProgress: (_done, t, check) => {
          if (mine !== ctl) return;
          total = t;
          if (check) checks.push(check);
          renderProg();
          if (check) { renderLesson(); renderMoves(); show(); }
        },
      });
      if (mine !== ctl) return;
      status = 'done';
    } catch (err) {
      if (mine !== ctl) return;
      status = mine.signal.aborted ? 'stopped' : 'failed';
      if (status === 'failed') { failure = String(err instanceof Error ? err.message : err); dropStockfish(); }
    }
    renderProg(); renderLesson(); renderMoves(); show();
  }

  // ---- events ----------------------------------------------------------------------------------
  btn.first.addEventListener('click', () => go(0));
  btn.prev.addEventListener('click', () => go(cursor - 1));
  btn.next.addEventListener('click', () => go(cursor + 1));
  btn.last.addEventListener('click', () => go(sans.length));
  $('rv-other').addEventListener('click', onLeave);
  els.moves.addEventListener('click', (ev) => {
    const b = (ev.target as HTMLElement).closest<HTMLElement>('.mv');
    if (b) go(Number(b.dataset.ply) + 1);
  });
  const onKey = (ev: KeyboardEvent) => {
    if (isHidden() || ev.altKey || ev.ctrlKey || ev.metaKey) return;
    const t = ev.target as HTMLElement;
    if (t.closest('input, textarea, select, [contenteditable]')) return;
    const to = { ArrowLeft: cursor - 1, ArrowRight: cursor + 1, Home: 0, End: sans.length }[ev.key];
    if (to === undefined) return;
    ev.preventDefault();
    go(to);
  };
  document.addEventListener('keydown', onKey);

  renderBoundary();
  renderLesson();
  renderMoves();
  renderProg();
  show();
  if (walk.leftBy) void run();

  return () => {
    ctl?.abort();
    ctl = null;
    document.removeEventListener('keydown', onKey);
    ground.destroy();
  };
}
