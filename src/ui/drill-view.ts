// The drill screen. Renders from the drill's state and events; owns no chess rules.
// Canon: DESIGN.md (board first, show the work, glyphs not color alone).
import { Chessground } from 'chessground';
import type { Api } from 'chessground/api';
import type { DrawBrushes, DrawShape } from 'chessground/draw';
import type { Key } from 'chessground/types';
import { Chess, type Move } from 'chess.js';
import { createDrill, PLAYABLE, type DrillEvent, type TopMove } from '../drill/drill';
import { buildTree } from '../data/london';
import { ideaFor } from '../data/london-ideas';
import { maiaMoves } from '../chess/maia';
import { createMaiaRunner } from '../chess/maia-ort';
import { createStockfish } from '../chess/stockfish-worker';
import { levelOf, loadSaved, save, REPS_PER_LEVEL } from '../storage';
import markUrl from '../../design/brand/off-the-page/favicon.svg';
import prepEndsSvg from '../../design/icons/prep-ends.svg?raw';

// ponytail: display-only split of a "mistake" into ? and ??; the drill only knows MISTAKE.
const BLUNDER = 300;
const RATINGS = [600, 700, 800, 900, 1000, 1100, 1200, 1300, 1400, 1500, 1600, 1700, 1800];
const NAMES: Record<string, string> = { p: 'pawn', n: 'knight', b: 'bishop', r: 'rook', q: 'queen', k: 'king' };

const pts = (cp: number) => (cp / 100).toFixed(1);
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

export function mountDrill(root: HTMLElement) {
  root.innerHTML = `
    <header class="masthead">
      <img src="${markUrl}" alt="">
      <h1>Off Book</h1>
      <p>London drill · you play White</p>
    </header>
    <main class="drill">
      <div class="board" id="board"></div>
      <section class="sheet" aria-label="Drill">
        <p class="now" id="now" role="status">Loading the engines…</p>
        <p class="fb" id="verdict" role="status" hidden></p>
        <p class="note" id="note" hidden></p>
        <div class="scoresheet" id="scoresheet"><ol class="moves" id="moves" aria-label="Moves"></ol></div>
        <section class="know" id="know" hidden aria-labelledby="know-h"></section>
        <div class="level" id="level"></div>
        <div class="row">
          <label>Opponent rating
            <select id="rating">${RATINGS.map((r) => `<option${r === 1000 ? ' selected' : ''}>${r}</option>`).join('')}</select>
          </label>
          <button type="button" class="quiet" id="show-prep">Show my prep</button>
          <button type="button" class="quiet" id="know-btn" aria-expanded="false" aria-controls="know">How did it know?</button>
        </div>
        <form class="row" id="typed-form">
          <label>Type a move <input type="text" id="typed" autocomplete="off" spellcheck="false" placeholder="Nf3"></label>
          <button type="submit" class="quiet">Play</button>
          <button type="button" class="quiet" id="resign">Resign</button>
          <button type="button" id="new-game" hidden>New game</button>
        </form>
        <p class="typed-error" id="typed-error" aria-live="polite"></p>
      </section>
    </main>
    <p class="visually-hidden" id="announce" aria-live="polite"></p>`;

  const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
  const els = {
    now: $('now'), verdict: $('verdict'), note: $('note'), moves: $('moves'), scoresheet: $('scoresheet'),
    know: $('know'), knowBtn: $('know-btn'), level: $('level'), rating: $<HTMLSelectElement>('rating'),
    showPrep: $<HTMLButtonElement>('show-prep'), resign: $<HTMLButtonElement>('resign'), newGame: $<HTMLButtonElement>('new-game'),
    typedForm: $<HTMLFormElement>('typed-form'), typed: $<HTMLInputElement>('typed'), typedError: $('typed-error'), announce: $('announce'),
  };

  const css = getComputedStyle(document.documentElement);
  const token = (name: string) => css.getPropertyValue(name).trim();
  const durPiece = parseFloat(token('--dur-piece')) || 0;

  const ground: Api = Chessground($('board'), {
    orientation: 'white',
    coordinates: true,
    animation: { enabled: durPiece > 0, duration: durPiece },
    highlight: { lastMove: true, check: true },
    movable: { free: false, color: 'white', showDests: true, events: { after: (from, to) => void play(from, to) } },
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
  let know: { kind: 'maia'; san: string; ply: number; top: TopMove[]; rating: number; p: number }
    | { kind: 'stockfish'; text: string; depth?: number; nodes?: number } | null = null;

  // ---- engines ---------------------------------------------------------------------------------
  const ready = Promise.all([createStockfish(), createMaiaRunner()]);
  const tree = buildTree();
  let drill: ReturnType<typeof createDrill>;

  // Learned positions live on the device with the tally (decisions 3 and 13).
  const learnedSet = new Set(saved.learned);
  const learned = {
    has: (k: string) => learnedSet.has(k),
    add: (k: string) => { learnedSet.add(k); saved = { ...saved, learned: [...learnedSet] }; save(saved); },
  };

  ready.then(([sf, run]) => {
    drill = createDrill({ tree, learned, engine: sf.engine, maia: (chess, elo) => maiaMoves(run, chess, elo, elo) });
    drill.on(onEvent);
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
      return `<span${ply < book ? ' class="book"' : ''}>${san}${glyph}</span>`;
    };
    let html = '';
    for (let ply = 0; ply < history.length; ply += 2) {
      html += `<li><span class="n">${ply / 2 + 1}.</span>${cell(ply)}${cell(ply + 1)}</li>`;
    }
    els.moves.innerHTML = html;
    els.scoresheet.scrollTop = els.scoresheet.scrollHeight;
  }

  function renderLevel(stamp = false) {
    const { level, progress } = levelOf(saved.correct);
    let s = '';
    for (let i = 0; i < REPS_PER_LEVEL; i++) {
      const g = Math.floor(i / 5), k = i % 5, x = g * 44 + 6;
      const color = i < progress ? 'var(--ink)' : 'var(--rule)';
      s += k < 4
        ? `<line x1="${x + k * 7}" y1="4" x2="${x + k * 7}" y2="26" stroke="${color}" stroke-width="2.5" stroke-linecap="round"/>`
        : `<line x1="${x - 4}" y1="22" x2="${x + 25}" y2="8" stroke="${color}" stroke-width="2.5" stroke-linecap="round"/>`;
    }
    els.level.innerHTML = `
      <span class="badge-level${stamp ? ' stamp' : ''}">Level ${level}</span>
      <span class="tally" role="img" aria-label="${progress} of ${REPS_PER_LEVEL} first-try prep moves toward level ${level + 1}">
        <svg width="88" height="30" viewBox="0 0 88 30" aria-hidden="true">${s}</svg></span>
      <span class="soft">${progress} of ${REPS_PER_LEVEL} to level ${level + 1} · ${learnedSet.size} move${learnedSet.size === 1 ? '' : 's'} learned</span>`;
  }

  function renderKnow() {
    if (els.know.hidden) return;
    const unit = '<p class="soft">Stockfish scores are from White\'s side. A drop of 1.0 is about a 50% swing in winning chances.</p>';
    if (!know) {
      els.know.innerHTML = '<h2 id="know-h">How did it know?</h2><p>Play a move. Here you\'ll see why Black chose its reply and how Stockfish judged yours.</p>';
      return;
    }
    if (know.kind === 'maia') {
      const rows = know.top.map((m) => `<tr><td class="mv">${m.san}</td><td><span class="bar" style="--w:${Math.round(m.p * 100)}%"></span></td><td>${pct(m.p)}</td></tr>`).join('');
      els.know.innerHTML = `<h2 id="know-h">How did it know?</h2>
        <p>Black is Maia, an engine trained on millions of human games. It plays the way a ${know.rating}-rated player does, not the best move.</p>
        <p>It played <b>${label(know.ply, know.san)}</b>. Maia estimates ${pct(know.p)} of ${know.rating}-rated players would play that here. Its top choices:</p>
        <table><tbody>${rows}</tbody></table>`;
    } else {
      const depth = know.depth ? ` It looked ${know.depth} moves ahead and checked ${know.nodes?.toLocaleString()} positions in 0.3 seconds.` : '';
      els.know.innerHTML = `<h2 id="know-h">How did it know?</h2><p>${know.text}${depth}</p>${unit}`;
    }
  }

  function sync(shapes?: DrawShape[]) {
    const s = drill.getState();
    const c = new Chess(); s.history.forEach((m) => c.move(m));
    const verbose = c.history({ verbose: true });
    const last = verbose.at(-1);
    ground.set({
      fen: s.fen,
      turnColor: s.fen.split(' ')[1] === 'w' ? 'white' : 'black',
      lastMove: last ? [last.from as Key, last.to as Key] : undefined,
      check: c.inCheck(),
      movable: { color: 'white', dests: drill.dests() as Map<Key, Key[]> },
    });
    // A new move being taught always shows its arrow and says so (decision 13).
    if (s.teach) {
      ground.setAutoShapes([{ orig: s.teach.uci.slice(0, 2) as Key, dest: s.teach.uci.slice(2, 4) as Key, brush: 'prep' }]);
      const lastBlack = verbose.length && verbose.length % 2 === 0 ? `Black played ${label(verbose.length - 1, verbose.at(-1)!.san)}. ` : '';
      setNow(`New move: play ${label(verbose.length, s.teach.san)}.`, `${lastBlack}Follow the arrow. Next time you reach this position, you'll play it from memory.`);
      setNote(ideaFor(s.fen, s.teach) ?? '');
    } else if (shapes) ground.setAutoShapes(shapes);
    renderMoves(s.history, !s.offBook);
    // Announce new moves for screen readers.
    if (verbose.length < announced) announced = 0;
    const fresh = verbose.slice(announced).map(describe);
    if (fresh.length) els.announce.textContent = fresh.join('. ') + '.';
    announced = verbose.length;
    const over = s.phase === 'over';
    els.resign.hidden = over;
    els.newGame.hidden = !over;
    els.showPrep.disabled = s.offBook || s.phase !== 'student' || !!s.teach;
    els.typed.disabled = s.phase !== 'student';
  }

  // ---- events ----------------------------------------------------------------------------------
  function onEvent(e: DrillEvent) {
    const s = drill.getState();
    const ply = s.history.length - 1;
    switch (e.type) {
      case 'start':
        bookPlies = null; marks = new Map(); know = null; announced = 0;
        els.verdict.hidden = true;
        setNow('Play your London as White.', `Black answers like a ${s.rating}-rated player. Moves you've learned, you play from memory.`);
        setNote('New moves get an arrow. Learned ones are up to you.');
        sync([]);
        break;
      case 'judging':
        setNow('Checking with Stockfish…');
        sync();
        break;
      case 'prep-correct': {
        if (e.learnedNow) setVerdict('!', 'good', `${label(ply, e.san)}. Learned.`, 'new move');
        else setVerdict('!', 'good', `${label(ply, e.san)}. Your prep, from memory.`, e.counted ? '+1 tally' : 'no tally, you looked');
        if (e.learnedNow) renderLevel();
        if (e.counted) {
          saved = { ...saved, correct: saved.correct + 1 };
          save(saved);
          renderLevel(levelOf(saved.correct).progress === 0);
        }
        setNow('Black is thinking…');
        setNote('');
        sync([]);
        break;
      }
      case 'prep-miss': {
        const moveNo = label(s.history.length, e.played);
        const prepNo = label(s.history.length, e.prep);
        if (e.verdict === 'playable') setVerdict('?!', 'dubious', `${moveNo}. Playable, but not your prep. Your prep is ${prepNo}.`, `${pts(e.loss)} behind prep`);
        else { const m = glyphFor(e.loss); setVerdict(m.g, m.cls, `${moveNo}. ${m.word}. Your prep is ${prepNo}.`, `${pts(e.loss)} behind prep`); }
        know = { kind: 'stockfish', text: `Stockfish scored ${e.played} ${pts(e.loss)} lower than your prep move ${e.prep}. Under ${pts(PLAYABLE)} counts as playable.`, depth: e.depth, nodes: e.nodes };
        setNow('Try again: play your prep move.', 'The arrow shows it. This one won\'t add a tally.');
        sync([{ orig: e.prepUci.slice(0, 2) as Key, dest: e.prepUci.slice(2, 4) as Key, brush: 'prep' }]);
        break;
      }
      case 'black-move':
        know = { kind: 'maia', san: e.san, ply, top: e.top, rating: e.rating, p: e.p };
        setNow(s.offBook ? 'Your move. You\'re off book: play it out.' : 'Your move. Stay in your prep.', `Black played ${label(ply, e.san)}.`);
        sync([]);
        break;
      case 'off-book':
        bookPlies = s.history.length - 1;
        setNow('Your prep ends here. Play it out.', `Black played ${label(ply, e.san)}, which isn't in your prep. Stockfish only speaks up for real mistakes now.`);
        setNote(`They left your prep with ${label(ply, e.san)}. From here it's your own chess.`, prepEndsSvg);
        sync([]);
        break;
      case 'offbook-mistake': {
        const m = glyphFor(e.loss);
        marks.set(ply, m);
        setVerdict(m.g, m.cls, `${label(ply, e.played)}. ${m.word}. ${label(ply, e.better)} was better.`, `${pts(e.loss)} lower`);
        know = { kind: 'stockfish', text: `Stockfish scored ${e.played} ${pts(e.loss)} lower than its choice, ${e.better}. A drop of 1.0 or more counts as a mistake; 3.0 or more as a blunder.`, depth: e.depth, nodes: e.nodes };
        setNow('Black is thinking…');
        sync([{ orig: e.betterUci.slice(0, 2) as Key, dest: e.betterUci.slice(2, 4) as Key, brush: 'better' }]);
        break;
      }
      case 'game-over': {
        const head = { won: 'You won by checkmate.', lost: 'Checkmate. Black wins.', draw: 'Draw.', resigned: 'You resigned.' }[e.result];
        setNow(head, `Prep lasted ${e.prepMoves} move${e.prepMoves === 1 ? '' : 's'}. Off book: ${e.mistakes} mistake${e.mistakes === 1 ? '' : 's'} flagged.`);
        sync();
        els.newGame.focus();
        break;
      }
    }
    renderKnow();
  }

  // ---- input -----------------------------------------------------------------------------------
  async function play(from: string, to: string) {
    els.typedError.textContent = '';
    const ok = await drill.play({ from, to });
    if (!ok) sync();
  }

  function newGame() {
    drill.start(Number(els.rating.value));
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
    if (!m || m.color !== 'w') {
      els.typedError.textContent = `"${text}" isn't a legal move for White here. Try a move like Nf3 or e2e4.`;
      return;
    }
    els.typed.value = '';
    void play(m.from, m.to);
  });

  els.rating.addEventListener('change', () => drill?.setRating(Number(els.rating.value)));
  els.resign.addEventListener('click', () => drill?.resign());
  els.newGame.addEventListener('click', () => drill && newGame());
  els.showPrep.addEventListener('click', () => {
    const hint = drill?.revealPrep();
    if (!hint) return;
    setNow(`Your prep here is ${hint.san}.`, 'Play it. Looking means this move won\'t add a tally.');
    ground.setAutoShapes([{ orig: hint.uci.slice(0, 2) as Key, dest: hint.uci.slice(2, 4) as Key, brush: 'prep' }]);
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
