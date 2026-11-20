// The drill screen. Renders from the drill's state and events; owns no chess rules.
// Canon: DESIGN.md (board first, show the work, glyphs not color alone).
import { Chessground } from 'chessground';
import type { Api } from 'chessground/api';
import type { DrawBrushes, DrawShape } from 'chessground/draw';
import type { Key } from 'chessground/types';
import { Chess, type Move } from 'chess.js';
import { createDrill, PLAYABLE, type DrillEvent, type TopMove } from '../drill/drill';
import { DEFAULT_OPENING, OPENINGS, type Stage, type Tier } from '../data/openings';
import { maiaMoves } from '../chess/maia';
import { createMaiaRunner } from '../chess/maia-ort';
import { createStockfish } from '../chess/stockfish-worker';
import type { ImportedGame } from '../import/pgn';
import { loadOpening, loadSaved, saveOpening, updateSaved, type Saved } from '../storage';
import { dueNow, learn, pickStage, review, SECURE, stageViews, type Status } from '../levels';
import prepEndsSvg from '../../design/icons/prep-ends.svg?raw';
import badgeBook from '../../design/icons/badges/book.svg?raw';
import badgeGood from '../../design/icons/badges/good.svg?raw';
import badgeMistake from '../../design/icons/badges/mistake.svg?raw';
import badgeBlunder from '../../design/icons/badges/blunder.svg?raw';

// ponytail: display-only split of a "mistake" into ? and ??; the drill only knows MISTAKE.
const BLUNDER = 300;
const RATINGS = [600, 700, 800, 900, 1000, 1100, 1200, 1300, 1400, 1500, 1600, 1700, 1800];
const NAMES: Record<string, string> = { p: 'pawn', n: 'knight', b: 'bishop', r: 'rook', q: 'queen', k: 'king' };

const sideName = (side: 'w' | 'b') => (side === 'w' ? 'White' : 'Black');
const pts = (cp: number) => (cp / 100).toFixed(1);
/** A loss in pawns. Below zero means the move scored as well as the better one; a mate swing reads as a cap, as in the review. */
const drop = (cp: number) => (cp >= 1000 ? 'more than 10.0' : pts(Math.max(0, cp)));
const pct = (p: number) => `${Math.round(p * 100)}%`;
/** "6. Nbd2" for White's ply, "5...Nc6" for Black's. */
const label = (ply: number, san: string) => (ply % 2 ? `${(ply + 1) / 2}...${san}` : `${ply / 2 + 1}. ${san}`);
const glyphFor = (loss: number) => (loss >= BLUNDER ? { g: '??', cls: 'blunder', word: 'Blunder' } : { g: '?', cls: 'mistake', word: 'Mistake' });

function describe(m: Move): string {
  const side = m.color === 'w' ? 'White' : 'Black';
  if (m.flags.includes('k')) return `${side} castles kingside`;
  if (m.flags.includes('q')) return `${side} castles queenside`;
  const what = `${side} ${NAMES[m.piece]} from ${m.from}`;
  let text = m.captured ? `${what} captures ${NAMES[m.captured]} on ${m.to}` : `${what} to ${m.to}`;
  if (m.promotion) text += `, promotes to ${NAMES[m.promotion]}`;
  return text;
}

/** `onReview` opens a finished sparring game in the review screen. */
export function mountDrill(root: HTMLElement, onReview: (game: ImportedGame) => void) {
  // The picked opening decides the student's side; everything below reads it through these.
  let opening = OPENINGS.find((o) => o.id === loadOpening()) ?? DEFAULT_OPENING;
  const color = () => (opening.side === 'w' ? 'white' : 'black');
  const me = () => sideName(opening.side);
  const opp = () => sideName(opening.side === 'w' ? 'b' : 'w');

  root.innerHTML = `
    <main class="drill">
      <section class="play" aria-label="Drill">
        <p class="now" id="now" role="status">Loading the engines…</p>
        <div class="board" id="board"></div>
        <div class="under">
          <p class="fb" id="verdict" role="status" hidden></p>
          <p class="note" id="note" hidden></p>
        </div>
      </section>
      <aside class="rail" aria-label="Drill setup and record">
        <div class="rail-section setup">
          <label>Opening
            <select id="opening">${(['w', 'b'] as const).map((side) => `<optgroup label="You play ${sideName(side)}">${OPENINGS.filter((o) => o.side === side).map((o) => `<option value="${o.id}"${o === opening ? ' selected' : ''}>${o.name}</option>`).join('')}</optgroup>`).join('')}</select>
          </label>
          <label>Mode
            <select id="mode"><option value="drill">Drill</option><option value="spar">Spar</option></select>
          </label>
          <label>Opponent rating
            <select id="rating">${RATINGS.map((r) => `<option${r === 1000 ? ' selected' : ''}>${r}</option>`).join('')}</select>
          </label>
          <label class="pause"><input type="checkbox" id="pause"> Pause new lines</label>
        </div>
        <div class="rail-section">
          <div class="scoresheet" id="scoresheet"><ol class="moves" id="moves" aria-label="Moves"></ol></div>
          <section class="know" id="know" hidden aria-labelledby="know-h"></section>
        </div>
        <div class="rail-section">
          <div class="row">
            <button type="button" class="quiet" id="show-prep">Show my prep</button>
            <button type="button" class="quiet" id="know-btn" aria-expanded="false" aria-controls="know">How did it know?</button>
            <button type="button" class="quiet" id="resign">Resign</button>
            <button type="button" id="review-game" hidden>Review this game</button>
            <button type="button" id="new-game" hidden>New game</button>
          </div>
          <form class="row" id="typed-form">
            <label>Type a move <input type="text" id="typed" autocomplete="off" spellcheck="false" placeholder="Nf3"></label>
            <button type="submit" class="quiet">Play</button>
          </form>
          <p class="typed-error" id="typed-error" aria-live="polite"></p>
          <p class="soft" id="storage-note" role="status" hidden>This browser isn't saving your progress (a private window can do this). Your learned moves will reset when you close it.</p>
        </div>
        <!-- The line record goes last: it grows with every tier, and the controls above must not move. -->
        <div class="rail-section">
          <div class="level-head"><p class="soft" id="due"></p></div>
          <div class="level" id="level"></div>
        </div>
      </aside>
    </main>
    <p class="visually-hidden" id="announce" aria-live="polite"></p>`;

  const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
  const els = {
    now: $('now'), verdict: $('verdict'), note: $('note'), moves: $('moves'), scoresheet: $('scoresheet'),
    know: $('know'), knowBtn: $('know-btn'), level: $('level'), rating: $<HTMLSelectElement>('rating'), mode: $<HTMLSelectElement>('mode'), reviewGame: $<HTMLButtonElement>('review-game'), opening: $<HTMLSelectElement>('opening'),
    due: $('due'), pause: $<HTMLInputElement>('pause'), showPrep: $<HTMLButtonElement>('show-prep'), resign: $<HTMLButtonElement>('resign'), newGame: $<HTMLButtonElement>('new-game'),
    typedForm: $<HTMLFormElement>('typed-form'), typed: $<HTMLInputElement>('typed'), typedError: $('typed-error'), announce: $('announce'), storageNote: $('storage-note'),
  };

  const css = getComputedStyle(document.documentElement);
  const token = (name: string) => css.getPropertyValue(name).trim();
  const durPiece = parseFloat(token('--dur-piece')) || 0;

  const ground: Api = Chessground($('board'), {
    orientation: color(),
    coordinates: true,
    animation: { enabled: durPiece > 0, duration: durPiece },
    highlight: { lastMove: true, check: true },
    movable: { free: false, color: color(), showDests: true, events: { after: (from, to) => { typedLast = false; void play(from, to); } } },
    premovable: { enabled: false },
    drawable: {
      brushes: {
        prep: { key: 'ob-prep', color: token('--mark-good'), opacity: 0.85, lineWidth: 12 },
        better: { key: 'ob-better', color: token('--mark-mistake'), opacity: 0.85, lineWidth: 12 },
      } as Partial<DrawBrushes> as DrawBrushes, // deep-merged into chessground's defaults
    },
  });

  let saved = loadSaved();
  let bookPlies: number | null = null; // plies played inside prep; null while still in prep
  let marks = new Map<number, { g: string; cls: string }>(); // ply -> glyph on the scoresheet
  let announced = 0;
  // Arrows on the board, plus a move-quality badge on the square of the student's last judged move
  // (design/icons/BRIEF.md: badges sit on a square's top-right corner).
  let arrows: DrawShape[] = [];
  let badge: { sq: Key; svg: string } | null = null;
  function drawShapes() {
    // customSvg draws in the square's 100x100 box; nest the 32x32 badge in its top-right corner.
    const b = badge && { orig: badge.sq, customSvg: { html: badge.svg.replace(/<svg[^>]*>/, '<svg x="60" y="2" width="38" height="38" viewBox="0 0 32 32">') } };
    ground.setAutoShapes(b ? [...arrows, b] : arrows);
  }
  /** Destination square of the last move on the board, for the badge. */
  const lastTo = () => { const c = new Chess(); drill.getState().history.forEach((m) => { c.move(m); }); return c.history({ verbose: true }).at(-1)?.to as Key; };
  let know: { kind: 'maia'; san: string; ply: number; top: TopMove[]; rating: number; p: number }
    | { kind: 'staged'; san: string; ply: number; line: string }
    | { kind: 'forced'; san: string; ply: number }
    | { kind: 'stockfish'; text: string; depth?: number; nodes?: number } | null = null;

  // ---- engines ---------------------------------------------------------------------------------
  const ready = Promise.all([
    createStockfish(),
    createMaiaRunner(undefined, (f) => setNow('Loading the engines…', `${opp()}'s engine: ${Math.round(f * 100)}% of about 11 MB`)),
  ]);
  // One drill per opening, so each keeps its own side and tree; only the current one drives the screen.
  let drills: Map<string, ReturnType<typeof createDrill>> | null = null;
  let drill: ReturnType<typeof createDrill>;

  // Learned positions and their ladder rungs live on the device (decisions 3, 13 and 14c).
  /** Writes against the latest save, so another open tab's progress isn't overwritten. */
  function persist(fn: (latest: Saved) => Saved) {
    const r = updateSaved(fn);
    saved = r.saved;
    if (!r.ok) els.storageNote.hidden = false;
  }
  const learned = {
    has: (k: string) => k in saved.ladder,
    add: (k: string) => persist((s) => ({ ...s, ladder: learn(s.ladder, k, Date.now()) })),
    review: (k: string, ok: boolean) => {
      let r = { from: -1, to: -1 };
      persist((s) => { const x = review(s.ladder, k, ok, Date.now()); r = x; return { ...s, ladder: x.ladder }; });
      return { from: r.from, to: r.to };
    },
  };
  /** The staged line this round follows; null is free play against Maia. */
  let current: Stage | null = null;
  /** This round is a sparring game (v1 scope 3): no arrows, hints or takebacks, then a review. */
  let sparring = false;
  // Progress made in another tab shows up here too.
  window.addEventListener('storage', () => { saved = loadSaved(); renderLevel(); });

  ready.then(([sf, run]) => {
    drills = new Map(OPENINGS.map((o) => {
      const d = createDrill({ tree: o.tree, side: o.side, forcedReplies: o.forcedReplies, learned, engine: sf.engine, maia: (chess, elo) => maiaMoves(run, chess, elo, elo) });
      d.on((e) => { if (d === drill) onEvent(e); });
      return [o.id, d];
    }));
    drill = drills.get(opening.id)!;
    newGame();
  }).catch((err: unknown) => {
    setNow('The engines did not load.', `Reload the page. If it keeps happening, the school network may be blocking files. (${String(err)})`);
  });

  // ---- rendering -------------------------------------------------------------------------------
  function setNow(text: string, sub = '') {
    els.now.innerHTML = '';
    els.now.append(text);
    if (sub) { const s = document.createElement('small'); s.textContent = sub; els.now.append(s); }
  }

  function setVerdict(g: string, cls: string, text: string, num: string) {
    els.verdict.hidden = false;
    els.verdict.innerHTML = `<b class="${cls}" aria-hidden="true"></b><span></span><span class="num"></span>`;
    els.verdict.children[0].textContent = g;
    els.verdict.children[1].textContent = text;
    els.verdict.children[2].textContent = num;
    // Re-trigger the ink-in.
    els.verdict.style.animation = 'none'; void els.verdict.offsetWidth; els.verdict.style.animation = '';
  }

  function setNote(text: string, icon = '') {
    els.note.hidden = !text;
    els.note.innerHTML = icon;
    els.note.append(text);
  }

  function renderMoves(history: string[], inPrep: boolean) {
    const book = inPrep ? history.length : (bookPlies ?? 0);
    const cell = (ply: number) => {
      const san = history[ply];
      if (san === undefined) return '<span></span>';
      const m = marks.get(ply);
      const glyph = m ? `<span class="glyph ${m.cls}">${m.g}</span>` : '';
      if (ply >= book) return `<span>${san}${glyph}</span>`;
      // Never color alone: the highlighter is backed by hidden text, and the prep boundary by an icon.
      const end = !inPrep && ply === book - 1 ? `<span class="prep-end" title="Prep ends here">${prepEndsSvg}</span>` : '';
      return `<span><span class="book">${san}<span class="visually-hidden"> (prep)</span></span>${glyph}${end}</span>`;
    };
    let html = '';
    for (let ply = 0; ply < history.length; ply += 2) {
      html += `<li><span class="n">${ply / 2 + 1}.</span>${cell(ply)}${cell(ply + 1)}</li>`;
    }
    els.moves.innerHTML = html;
    els.scoresheet.scrollTop = els.scoresheet.scrollHeight;
  }

  const STATUS: Record<Status, string> = { locked: 'Locked', learning: 'Learning', cleared: 'Cleared', proven: 'Proven' };
  const TIER: Record<Tier, string> = { intro: 'Intro', intermediate: 'Intermediate', advanced: 'Advanced' };
  const paused = () => saved.paused.includes(opening.id);
  let shown = new Map<string, Status>();
  /** Notes the student has open; the rail redraws after every move and must not shut them. */
  const openNotes = new Set<string>();
  els.level.addEventListener('toggle', (ev) => {
    const d = ev.target as HTMLDetailsElement;
    if (d.dataset.stage) d.open ? openNotes.add(d.dataset.stage) : openNotes.delete(d.dataset.stage);
  }, true); // toggle does not bubble
  /** One row per staged line: a small ladder per move, then the line's status (decision 14c).
   *  Wear and records, never a progress bar (DESIGN.md). A status that just changed gets the stamp. */
  function renderLevel() {
    const views = stageViews(opening, saved.ladder, saved.proven);
    const due = dueNow(opening, saved.ladder, saved.proven, Date.now(), paused());
    els.pause.checked = paused();
    const rowOf = (v: (typeof views)[number]) => {
      const svg = v.levels.map((l, i) => {
        let r = '';
        for (let k = 0; k < SECURE; k++) {
          const y = 20 - k * 5;
          r += `<line x1="${i * 9 + 1}" y1="${y}" x2="${i * 9 + 7}" y2="${y}" stroke="${l > k ? 'var(--ink)' : 'var(--rule)'}" stroke-width="2" stroke-linecap="round"/>`;
        }
        return `<g${l < 0 ? ' opacity="0.4"' : ''}>${r}</g>`;
      }).join('');
      const secure = v.levels.filter((l) => l >= SECURE).length;
      const known = v.levels.filter((l) => l >= 0).length;
      const was = shown.get(v.stage.id);
      const stamp = was !== undefined && was !== v.status ? ' stamp' : '';
      const cls = v.status === 'cleared' || v.status === 'proven' ? `badge-level${stamp}` : `soft${stamp}`;
      return `<li class="line-row${v.stage === current ? ' current' : ''}">
        <span class="line-name">${v.stage.name}</span>
        <span class="rungs" role="img" aria-label="${known} of ${v.levels.length} moves learned, ${secure} secure"><svg width="${v.levels.length * 9}" height="22" viewBox="0 0 ${v.levels.length * 9} 22" aria-hidden="true">${svg}</svg></span>
        <span class="${cls}">${STATUS[v.status]}</span>${v.stage.note && v.status !== 'locked' ? `<details class="line-more" data-stage="${v.stage.id}"${openNotes.has(v.stage.id) ? ' open' : ''}><summary>More on this line</summary><p></p></details>` : ''}</li>`;
    };
    shown = new Map(views.map((v) => [v.stage.id, v.status]));
    // One list per run of equal tiers, in stage order; headings only when the opening has more than one tier.
    const runs: (typeof views)[] = [];
    for (const v of views) {
      if (runs.at(-1)?.[0].stage.tier === v.stage.tier) runs.at(-1)!.push(v);
      else runs.push([v]);
    }
    // A later tier that is still all locked folds to one line, and the headings wait until one opens,
    // so the rail stays short on a Chromebook.
    const folded = (run: (typeof views), i: number) => i > 0 && run.every((v) => v.status === 'locked');
    const headed = runs.some((run, i) => i > 0 && !folded(run, i));
    els.due.textContent = due ? `${due} move${due === 1 ? '' : 's'} due for review` : 'Nothing due for review now';
    els.level.innerHTML = runs.map((run, i) => {
        const tier = run[0].stage.tier;
        if (folded(run, i)) return `<p class="soft tier-locked">${TIER[tier]}: ${run.length} more lines open after the ${TIER[runs[i - 1][0].stage.tier]} lines.</p>`;
        return `${headed ? `<h3 class="tier-h" id="tier-${i}">${TIER[tier]}</h3>` : ''}<ol class="lines" ${headed ? `aria-labelledby="tier-${i}"` : 'aria-label="Staged lines"'}>${run.map(rowOf).join('')}</ol>`;
      }).join('');
    // Notes are set as text, never markup.
    for (const v of views) {
      const p = v.stage.note && els.level.querySelector(`[data-stage="${v.stage.id}"] p`);
      if (p) p.textContent = v.stage.note!;
    }
  }

  function renderKnow() {
    if (els.know.hidden) return;
    const unit = opening.side === 'w'
      ? '<p class="soft">Scores are from White\'s side: higher is better for White. The number shown is how far your move\'s score fell below the better move.</p>'
      : '<p class="soft">Stockfish scores positions from White\'s side: higher is better for White. You play Black, so the number shown is flipped to your side: how far your move\'s score fell below the better move.</p>';
    if (!know) {
      els.know.innerHTML = `<h2 id="know-h">How did it know?</h2><p>Play a move. Here you'll see why ${opp()} chose its reply and how Stockfish judged yours.</p>`;
      return;
    }
    if (know.kind === 'forced') {
      els.know.innerHTML = `<h2 id="know-h">How did it know?</h2>
        <p>${opp()} played <b>${label(know.ply, know.san)}</b> because your ${opening.name} starts from it. After that, Maia plays like a human at your chosen rating.</p>`;
    } else if (know.kind === 'staged') {
      els.know.innerHTML = `<h2 id="know-h">How did it know?</h2>
        <p>${opp()} played <b>${label(know.ply, know.san)}</b> because it is the next move of your staged line, ${know.line}. Staged lines come first, so you meet the likely positions in order. When the line ends, Maia takes over and plays like a human at your chosen rating.</p>`;
    } else if (know.kind === 'maia') {
      const rows = know.top.map((m) => `<tr><td class="mv">${m.san}</td><td><span class="bar" style="--w:${Math.round(m.p * 100)}%"></span></td><td>${pct(m.p)}</td></tr>`).join('');
      els.know.innerHTML = `<h2 id="know-h">How did it know?</h2>
        <p>${opp()} is Maia, an engine trained on millions of human games. It plays the way a ${know.rating}-rated player does, not the best move.</p>
        <p>It played <b>${label(know.ply, know.san)}</b>. Maia estimates ${pct(know.p)} of ${know.rating}-rated players would play that here. Its top choices:</p>
        <table><tbody>${rows}</tbody></table>`;
    } else {
      const depth = know.depth ? ` It searched to depth ${know.depth} (counted in single moves, and deeper on forcing lines) and checked ${know.nodes?.toLocaleString()} positions in 0.3 seconds.` : '';
      els.know.innerHTML = `<h2 id="know-h">How did it know?</h2><p>${know.text}${depth}</p>${unit}`;
    }
  }

  function sync(shapes?: DrawShape[]) {
    const s = drill.getState();
    const c = new Chess(); s.history.forEach((m) => { c.move(m); });
    const verbose = c.history({ verbose: true });
    const last = verbose.at(-1);
    ground.set({
      fen: s.fen,
      turnColor: s.fen.split(' ')[1] === 'w' ? 'white' : 'black',
      lastMove: last ? [last.from as Key, last.to as Key] : undefined,
      check: c.inCheck(),
      movable: { color: color(), dests: drill.dests() as Map<Key, Key[]> },
    });
    // A new move being taught always shows its arrow and says so (decision 13).
    if (shapes) arrows = shapes;
    if (s.teach) {
      arrows = [{ orig: s.teach.uci.slice(0, 2) as Key, dest: s.teach.uci.slice(2, 4) as Key, brush: 'prep' }];
      const lastOpp = verbose.length ? `${opp()} played ${label(verbose.length - 1, verbose.at(-1)!.san)}. ` : '';
      setNow(`New move: play ${label(verbose.length, s.teach.san)}.`, `${lastOpp}Follow the arrow. Next time you reach this position, you'll play it from memory.`);
      setNote(opening.ideaFor(s.fen, s.teach) ?? '');
    }
    drawShapes();
    renderMoves(s.history, !s.offBook);
    // Announce new moves for screen readers.
    if (verbose.length < announced) announced = 0;
    const fresh = verbose.slice(announced).map(describe);
    if (fresh.length) els.announce.textContent = `${fresh.join('. ')}.`;
    announced = verbose.length;
    const over = s.phase === 'over';
    els.resign.hidden = over;
    els.newGame.hidden = !over;
    els.reviewGame.hidden = !over || !sparring || !s.history.length;
    els.showPrep.hidden = sparring;
    els.showPrep.disabled = s.offBook || s.phase !== 'student' || !!s.teach;
    els.typed.disabled = s.phase !== 'student';
  }

  // ---- events ----------------------------------------------------------------------------------
  function onEvent(e: DrillEvent) {
    const s = drill.getState();
    const ply = s.history.length - 1;
    switch (e.type) {
      case 'start':
        bookPlies = null; marks = new Map(); know = null; announced = 0; badge = null;
        els.verdict.hidden = true;
        if (sparring) {
          setNow(opening.heading, `Sparring: a full game against Maia at ${s.rating}. No arrows and no takebacks. Learned prep moves still count when they're due.`);
        } else if (current) {
          const n = opening.stages.indexOf(current) + 1;
          setNow(opening.heading, `Staged line ${n} of ${opening.stages.length}: ${current.name}. ${opp()} plays it move by move, then Maia takes over.`);
        } else {
          setNow(opening.heading, `${paused() ? 'New lines are paused and nothing is due' : 'Nothing new or due'}, so this is free play. ${opening.opponentLine(s.rating)} Prep moves still count when they're due.`);
        }
        setNote(sparring ? 'Play it like a real game. Review it when it ends.' : 'New moves get an arrow. Learned ones are up to you.');
        sync([]);
        break;
      case 'judging':
        badge = null;
        setNow('Checking with Stockfish…');
        sync();
        break;
      case 'prep-correct': {
        if (e.learnedNow) setVerdict('!', 'good', `${label(ply, e.san)}. Learned.`, 'new move');
        // Sparring has no misses before a prep move, so an uncounted one there is not learned yet.
        else setVerdict('!', 'good', `${label(ply, e.san)}. Your prep, from memory.`, !e.counted ? (sparring ? 'not learned yet' : 'no climb after a miss') : e.climbed ? 'up a rung' : 'not due yet');
        renderLevel();
        badge = { sq: lastTo(), svg: e.learnedNow ? badgeBook : badgeGood };
        setNow(`${opp()} is thinking…`);
        setNote('');
        sync([]);
        break;
      }
      case 'prep-miss': {
        const moveNo = label(s.history.length, e.played);
        const prepNo = label(s.history.length, e.prep);
        if (e.verdict === 'playable') setVerdict('?!', 'dubious', `${moveNo}. Playable, but not your prep. Your prep is ${prepNo}.`, `${drop(e.loss)} behind prep`);
        else { const m = glyphFor(e.loss); setVerdict(m.g, m.cls, `${moveNo}. ${m.word}. Your prep is ${prepNo}.`, `${drop(e.loss)} behind prep`); }
        know = { kind: 'stockfish', text: `Stockfish scored ${e.played} ${drop(e.loss)} lower than your prep move ${e.prep}. Under ${pts(PLAYABLE)} counts as playable.`, depth: e.depth, nodes: e.nodes };
        setNow('Try again: play your prep move.', 'The arrow shows it. A miss drops this move one rung.');
        renderLevel();
        sync([{ orig: e.prepUci.slice(0, 2) as Key, dest: e.prepUci.slice(2, 4) as Key, brush: 'prep' }]);
        break;
      }
      case 'left-prep': {
        bookPlies = s.history.length - 1;
        const prepNo = label(ply, e.prep);
        if (e.verdict === 'playable') setVerdict('?!', 'dubious', `${label(ply, e.played)}. Playable, but you left your prep. It was ${prepNo}.`, `${drop(e.loss)} behind prep`);
        else { const m = glyphFor(e.loss); marks.set(ply, m); setVerdict(m.g, m.cls, `${label(ply, e.played)}. ${m.word}. You left your prep. It was ${prepNo}.`, `${drop(e.loss)} behind prep`); }
        know = { kind: 'stockfish', text: `Stockfish scored ${e.played} ${drop(e.loss)} lower than your prep move ${e.prep}. Under ${pts(PLAYABLE)} counts as playable.`, depth: e.depth, nodes: e.nodes };
        setNote(`You left your prep with ${label(ply, e.played)}. From here it's your own chess.`, prepEndsSvg);
        renderLevel();
        setNow(`${opp()} is thinking…`);
        sync([]);
        break;
      }
      case 'opponent-move':
        know = e.staged && current ? { kind: 'staged', san: e.san, ply, line: current.name }
          : e.forced ? { kind: 'forced', san: e.san, ply }
          : { kind: 'maia', san: e.san, ply, top: e.top, rating: e.rating, p: e.p };
        setNow(s.offBook ? 'Your move. You\'re off book: play it out.' : 'Your move. Stay in your prep.', `${opp()} played ${label(ply, e.san)}.`);
        sync([]);
        break;
      case 'off-book':
        bookPlies = s.history.length - 1;
        setNow('Your prep ends here. Play it out.', `${opp()} played ${label(ply, e.san)}, which isn't in your prep. Stockfish only speaks up for real mistakes now.`);
        setNote(`They left your prep with ${label(ply, e.san)}. From here it's your own chess.`, prepEndsSvg);
        sync([]);
        break;
      case 'offbook-mistake': {
        const m = glyphFor(e.loss);
        marks.set(ply, m);
        badge = { sq: lastTo(), svg: m.g === '??' ? badgeBlunder : badgeMistake };
        setVerdict(m.g, m.cls, `${label(ply, e.played)}. ${m.word}. ${label(ply, e.better)} was better.`, `${drop(e.loss)} lower`);
        know = { kind: 'stockfish', text: `Stockfish scored ${e.played} ${drop(e.loss)} lower than its choice, ${e.better}. A drop of 1.0 or more counts as a mistake; 3.0 or more as a blunder.`, depth: e.depth, nodes: e.nodes };
        setNow(`${opp()} is thinking…`);
        sync([{ orig: e.betterUci.slice(0, 2) as Key, dest: e.betterUci.slice(2, 4) as Key, brush: 'better' }]);
        break;
      }
      case 'engine-error':
        setNow('The engine stopped, so this game is over.', 'Start a new game. If it keeps happening, reload the page.');
        sync();
        els.newGame.focus();
        break;
      case 'game-over': {
        const head = { won: 'You won by checkmate.', lost: `Checkmate. ${opp()} wins.`, draw: 'Draw.', resigned: 'You resigned.' }[e.result];
        setNow(head, `Prep lasted ${e.prepMoves} move${e.prepMoves === 1 ? '' : 's'}. Off book: ${e.mistakes} mistake${e.mistakes === 1 ? '' : 's'} flagged.`);
        sync();
        (els.reviewGame.hidden ? els.newGame : els.reviewGame).focus();
        break;
      }
    }
    renderKnow();
  }

  // ---- input -----------------------------------------------------------------------------------
  let typedLast = false; // the student is moving by keyboard: give the move box focus back each turn
  async function play(from: string, to: string, promotion?: string) {
    els.typedError.textContent = '';
    const ok = await drill.play({ from, to, promotion });
    if (!ok) sync();
    if (typedLast && !els.typed.disabled) els.typed.focus();
  }

  function newGame() {
    ground.set({ orientation: color() });
    els.typed.placeholder = opening.example[0];
    sparring = els.mode.value === 'spar';
    current = sparring ? null : pickStage(opening, saved.ladder, saved.proven, Date.now(), paused());
    drill.start(Number(els.rating.value), current?.moves, sparring);
    renderLevel();
  }

  els.typedForm.addEventListener('submit', (ev) => {
    ev.preventDefault();
    const text = els.typed.value.trim();
    if (!text || !drill) return;
    let m: Move | undefined;
    try { m = new Chess(drill.getState().fen).move(text); } catch { m = undefined; }
    const teach = drill.getState().teach;
    if (m && teach && m.san !== teach.san) {
      els.typedError.textContent = `This one's new. Play the shown move: ${teach.san}.`;
      return;
    }
    if (!m || m.color !== opening.side) {
      els.typedError.textContent = `"${text}" isn't a legal move for ${me()} here. Try a move like ${opening.example[0]} or ${opening.example[1]}.`;
      return;
    }
    els.typed.value = '';
    typedLast = true;
    void play(m.from, m.to, m.promotion);
  });

  els.opening.addEventListener('change', () => {
    opening = OPENINGS.find((o) => o.id === els.opening.value) ?? DEFAULT_OPENING;
    saveOpening(opening.id);
    if (!drills) return; // the engines are still loading; they start the picked opening when ready
    drill = drills.get(opening.id)!;
    newGame();
  });
  els.pause.addEventListener('change', () => {
    const on = els.pause.checked;
    persist((s) => ({ ...s, paused: [...s.paused.filter((id) => id !== opening.id), ...(on ? [opening.id] : [])] }));
    renderLevel(); // the line this round follows stays; the next round picks by the new setting
  });
  els.mode.addEventListener('change', () => { if (drills) newGame(); });
  els.reviewGame.addEventListener('click', () => {
    const s = drill.getState();
    const result = s.result === 'draw' ? '1/2-1/2' : (s.result === 'won') === (opening.side === 'w') ? '1-0' : '0-1';
    const maia = `Maia ${s.rating}`;
    onReview({
      id: `spar-${Date.now()}`, source: 'spar', result, date: new Date().toISOString().slice(0, 10), sans: s.history,
      white: opening.side === 'w' ? 'You' : maia, black: opening.side === 'w' ? maia : 'You', side: opening.side, prep: opening.id,
    });
  });
  els.rating.addEventListener('change', () => drill?.setRating(Number(els.rating.value)));
  els.resign.addEventListener('click', () => drill?.resign());
  els.newGame.addEventListener('click', () => { if (!drill) return; newGame(); els.typed.focus(); });
  els.showPrep.addEventListener('click', () => {
    const hint = drill?.revealPrep();
    if (!hint) return;
    setNow(`Your prep here is ${hint.san}.`, 'Play it. Looking drops this move one rung.');
    renderLevel();
    arrows = [{ orig: hint.uci.slice(0, 2) as Key, dest: hint.uci.slice(2, 4) as Key, brush: 'prep' }];
    drawShapes();
  });
  els.knowBtn.addEventListener('click', () => {
    const open = els.know.hidden;
    els.know.hidden = !open;
    els.scoresheet.hidden = open;
    els.knowBtn.setAttribute('aria-expanded', String(open));
    renderKnow();
  });

  renderLevel();
}
