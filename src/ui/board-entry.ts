// Board entry (decision 1b): play an over-the-board game's moves on a board, then hand the game to the
// import's confirm step as a pasted game would be. Owns no chess rules beyond chess.js's legal moves.
import { Chessground } from 'chessground';
import type { Api } from 'chessground/api';
import type { Key } from 'chessground/types';
import { Chess } from 'chess.js';
import { boardGame, boardMove, type ImportedGame } from '../import/pgn';

const RESULTS = [['*', '* (unknown or unfinished)'], ['1-0', '1-0 (White won)'], ['0-1', '0-1 (Black won)'], ['1/2-1/2', '1/2-1/2 (draw)']] as const;

export function mountBoardEntry(host: HTMLElement, onDone: (game: ImportedGame) => void, onBack: () => void): { open(fresh: boolean): void } {
  host.innerHTML = `
    <div class="review entry">
      <section class="play" aria-label="Enter the game">
        <div class="now"><h2 tabindex="-1">Enter the game</h2><small>Play the moves from your scoresheet, White and Black in turn.</small></div>
        <div class="board" id="be-board"></div>
        <div class="under"><p id="be-turn" role="status"></p></div>
      </section>
      <aside class="rail" aria-label="Moves and buttons">
        <div class="rail-section">
          <div class="scoresheet"><ol class="moves" id="be-moves" aria-label="Moves entered"></ol></div>
          <form class="row" id="be-form">
            <label>Type a move <input type="text" id="be-typed" autocomplete="off" spellcheck="false" placeholder="Nf3"></label>
            <button type="submit" class="quiet">Play</button>
          </form>
          <p class="typed-error" id="be-error" aria-live="polite"></p>
        </div>
        <div class="rail-section">
          <div class="row">
            <button type="button" class="quiet" id="be-undo">Undo</button>
            <label>Result <select id="be-result">${RESULTS.map(([v, t]) => `<option value="${v}">${t}</option>`).join('')}</select></label>
          </div>
          <div class="row"><button type="button" id="be-done">Done</button><button type="button" class="quiet" id="be-back">Back</button></div>
        </div>
      </aside>
    </div>`;
  const $ = <T extends HTMLElement>(id: string) => host.querySelector<T>(`#${id}`)!;
  const els = { board: $('be-board'), turn: $('be-turn'), moves: $('be-moves'), scoresheet: host.querySelector<HTMLElement>('.scoresheet')!, form: $<HTMLFormElement>('be-form'), typed: $<HTMLInputElement>('be-typed'), error: $('be-error'), undo: $<HTMLButtonElement>('be-undo'), result: $<HTMLSelectElement>('be-result'), done: $<HTMLButtonElement>('be-done') };

  let chess = new Chess();
  let ground: Api | null = null;

  const dests = () => {
    const d = new Map<Key, Key[]>();
    for (const m of chess.moves({ verbose: true })) d.set(m.from, [...(d.get(m.from) ?? []), m.to]);
    return d;
  };

  /** Brings the board, move list, status line and buttons in line with `chess`. */
  function sync() {
    const turn = chess.turn();
    const last = chess.history({ verbose: true }).at(-1);
    ground?.set({ fen: chess.fen(), turnColor: turn === 'w' ? 'white' : 'black', check: chess.inCheck(), lastMove: last ? [last.from, last.to] : undefined, movable: { color: turn === 'w' ? 'white' : 'black', dests: dests() } });
    const sans = chess.history();
    let rows = '';
    for (let i = 0; i < sans.length; i += 2) rows += `<li><span class="n">${i / 2 + 1}.</span><span>${sans[i]}</span><span>${sans[i + 1] ?? ''}</span></li>`;
    els.moves.innerHTML = rows;
    els.scoresheet.scrollTop = els.scoresheet.scrollHeight;
    els.turn.textContent = chess.isGameOver() ? (chess.isCheckmate() ? 'Checkmate. Set the result, then press Done.' : 'The game is over. Set the result, then press Done.') : `${turn === 'w' ? 'White' : 'Black'} to move.`;
    els.undo.disabled = !sans.length;
    els.done.disabled = !sans.length;
  }

  function play(move: string | { from: string; to: string }): boolean {
    const m = boardMove(chess, move);
    sync(); // a refused drag snaps back; an accepted one also redraws the castling rook, en passant and the queen
    return !!m;
  }

  els.form.addEventListener('submit', (ev) => {
    ev.preventDefault();
    const text = els.typed.value.trim();
    if (!text) return;
    if (play(text)) {
      els.typed.value = '';
      els.error.textContent = '';
    } else {
      const eg = chess.moves({ verbose: true })[0];
      els.error.textContent = eg ? `"${text}" isn't a legal move for ${chess.turn() === 'w' ? 'White' : 'Black'} here. Try a move like ${eg.san} or ${eg.from}${eg.to}.` : `"${text}" can't be played: the game is over.`;
    }
    els.typed.focus();
    els.typed.select(); // a wrong entry is replaced by typing again
  });
  els.undo.addEventListener('click', () => {
    chess.undo();
    els.error.textContent = '';
    sync();
    if (els.undo.disabled) els.typed.focus(); // the button just went away under the keyboard
  });
  els.done.addEventListener('click', () => onDone(boardGame(chess.history(), els.result.value, `board-${Date.now()}`)));
  $('be-back').addEventListener('click', onBack);

  return {
    /** `fresh` starts an empty game; otherwise the moves entered so far stay (back from the confirm step). */
    open(fresh) {
      if (fresh) {
        chess = new Chess();
        els.result.value = '*';
        els.typed.value = '';
        els.error.textContent = '';
      }
      ground?.destroy(); // made again on the visible board, so its square sizes are measured
      ground = Chessground(els.board, {
        coordinates: true,
        // No animation: a scoresheet is entered fast, and a click landing inside a piece's slide was lost.
        animation: { enabled: false },
        highlight: { lastMove: true, check: true },
        movable: { free: false, showDests: true, events: { after: (from, to) => { els.error.textContent = ''; play({ from, to }); } } },
        premovable: { enabled: false },
      });
      sync();
    },
  };
}
