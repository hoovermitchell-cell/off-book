// Import flow: pick a source, pick a game, confirm the moves. Nothing is analysed until the student
// has confirmed the move list (a legal but mistyped move would give a convincing wrong analysis).
import { parsePgn, plyLabel, type GameSource, type ImportedGame } from '../import/pgn';
import { loadRecent, saveRecent } from '../import/recent';
import { fetchChessCom, fetchLichess, ImportError } from '../import/sources';

const SITES: Record<GameSource, string> = { lichess: 'Lichess', chesscom: 'Chess.com', paste: 'pasted PGN' };
const esc = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

export function mountImport(root: HTMLElement, onReview: (game: ImportedGame) => void): { show(): void } {
  root.innerHTML = `
    <section class="import" aria-labelledby="im-h">
      <div id="im-start">
        <h2 id="im-h" tabindex="-1">Review a game</h2>
        <p class="soft">Bring a game you played as White. Off Book finds where your London prep ended, who left it first, and whether leaving cost you anything. The only request that leaves this browser is the one to Lichess or Chess.com that you start.</p>
        <div class="seg row" role="group" aria-label="Where is the game from?">
          ${(['lichess', 'chesscom', 'paste'] as const).map((s) => `<button type="button" class="quiet" data-src="${s}">${s === 'paste' ? 'Paste a PGN' : SITES[s]}</button>`).join('')}
        </div>
        <form class="row" id="im-user">
          <label>Username <input type="text" id="im-name" autocomplete="off" autocapitalize="off" spellcheck="false" maxlength="30"></label>
          <button type="submit" id="im-go">Get my games</button>
        </form>
        <form class="field" id="im-paste">
          <label class="field" for="im-pgn">Paste the game in PGN, from a scoresheet or anywhere else</label>
          <textarea id="im-pgn" rows="7" spellcheck="false" placeholder="1. d4 d5 2. Bf4 Nf6 3. e3 e6"></textarea>
          <div class="row"><button type="submit">Read the game</button></div>
        </form>
        <p class="im-msg" id="im-msg" role="alert"></p>
        <div id="im-recent"></div>
      </div>
      <div id="im-list" hidden></div>
      <div id="im-confirm" hidden></div>
    </section>`;

  const $ = <T extends HTMLElement>(id: string) => root.querySelector<T>(`#${id}`)!;
  const els = { start: $('im-start'), list: $('im-list'), confirm: $('im-confirm'), msg: $('im-msg'), recent: $('im-recent'), name: $<HTMLInputElement>('im-name'), go: $<HTMLButtonElement>('im-go'), pgn: $<HTMLTextAreaElement>('im-pgn'), user: $<HTMLFormElement>('im-user'), paste: $<HTMLFormElement>('im-paste') };
  const sourceButtons = [...root.querySelectorAll<HTMLButtonElement>('[data-src]')];

  let source: GameSource = 'lichess';
  let games: ImportedGame[] = [];
  let title = '';
  let londonOnly = true;
  let picked: ImportedGame | null = null;
  let skipped = ''; // why some pasted games were left out

  function step(which: 'start' | 'list' | 'confirm') {
    els.start.hidden = which !== 'start';
    els.list.hidden = which !== 'list';
    els.confirm.hidden = which !== 'confirm';
    (root.querySelector<HTMLElement>(`#im-${which} h2`))?.focus();
  }

  function setSource(s: GameSource) {
    source = s;
    sourceButtons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.src === s)));
    els.user.hidden = s === 'paste';
    els.paste.hidden = s !== 'paste';
    els.name.labels![0].firstChild!.textContent = `${SITES[s]} username `;
    els.msg.textContent = '';
  }

  function renderRecent() {
    const r = loadRecent();
    els.recent.innerHTML = r ? `<p class="soft">Last import: ${esc(SITES[r.source])}, ${esc(r.label)}, ${r.games.length} games, ${esc(new Date(r.at).toLocaleDateString())}. Kept on this device only. <button type="button" class="quiet" id="im-reopen">Open them</button></p>` : '';
    els.recent.querySelector('#im-reopen')?.addEventListener('click', () => { games = r!.games; title = `Games from ${r!.label}`; skipped = ''; londonOnly = true; renderList(); });
  }

  function renderList() {
    const shown = londonOnly ? games.filter((g) => g.london) : games;
    const london = games.filter((g) => g.london).length;
    const rows = shown.map((g) => `
      <li><button type="button" class="game" data-id="${games.indexOf(g)}">
        <span class="g-names">${esc(g.white)} vs ${esc(g.black)}</span>
        ${g.london ? '<span class="prep-tag">London</span>' : '<span></span>'}
        <span class="g-meta">${[g.date, g.result, g.opening ?? `${Math.ceil(g.sans.length / 2)} moves`].filter(Boolean).map(esc).join(' · ')}</span>
      </button></li>`).join('');
    const none = !shown.length
      ? `<p>${games.length ? `None of these ${games.length} games are London games as White (1.d4 and an early Bf4).` : 'No games found.'}</p>${games.length ? '<p><button type="button" id="im-all">Show all games</button></p>' : ''}`
      : '';
    els.list.innerHTML = `
      <h2 tabindex="-1">${esc(title)}</h2>
      <p class="soft">${london} of ${games.length} are London games as White. Pick one to review.${skipped ? ` ${esc(skipped)}` : ''}</p>
      <label><input type="checkbox" id="im-london"${londonOnly ? ' checked' : ''}> Only London games</label>
      ${none}<ol class="games">${rows}</ol>
      <div class="row"><button type="button" class="quiet" id="im-back">Back</button></div>`;
    step('list');
  }

  function renderConfirm(g: ImportedGame) {
    picked = g;
    let moves = '';
    for (let i = 0; i < g.sans.length; i += 2) moves += `<li><span class="n">${i / 2 + 1}.</span><span>${g.sans[i]}</span><span>${g.sans[i + 1] ?? ''}</span></li>`;
    els.confirm.innerHTML = `
      <h2 tabindex="-1">Is this the game as you played it?</h2>
      <p>${esc(g.white)} vs ${esc(g.black)}${g.date ? `, ${esc(g.date)}` : ''}, result ${esc(g.result)}. ${g.sans.length} half-moves, ending ${esc(plyLabel(g.sans.length - 1, g.sans.at(-1)!))}.</p>
      <p class="soft">Check it against your scoresheet. A move that is legal but mistyped would give an analysis that looks right and isn't. Off Book reviews the White side.</p>
      <div class="scoresheet"><ol class="moves" aria-label="Moves of the game">${moves}</ol></div>
      <div class="row"><button type="button" id="im-yes">Yes, review this game</button><button type="button" class="quiet" id="im-no">No, go back</button></div>`;
    step('confirm');
  }

  function loaded(label: string, found: ImportedGame[]) {
    games = found;
    title = `Games from ${label}`;
    londonOnly = true;
    saveRecent({ source, label, at: Date.now(), games: found });
    renderRecent();
    renderList();
  }

  // ---- events ----------------------------------------------------------------------------------
  sourceButtons.forEach((b) => b.addEventListener('click', () => setSource(b.dataset.src as GameSource)));

  els.user.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    els.msg.textContent = '';
    els.go.disabled = true;
    els.go.textContent = 'Getting games…';
    try {
      const name = els.name.value.trim();
      const found = await (source === 'lichess' ? fetchLichess : fetchChessCom)(name);
      if (!found.length) els.msg.textContent = `${SITES[source]} has no standard games as White for "${name}" yet.`;
      else { skipped = ''; loaded(name, found); }
    } catch (err) {
      els.msg.textContent = err instanceof ImportError ? err.message : `Something went wrong reading the games (${String(err)}). Try again.`;
    } finally {
      els.go.disabled = false;
      els.go.textContent = 'Get my games';
    }
  });

  els.paste.addEventListener('submit', (ev) => {
    ev.preventDefault();
    const { games: found, errors } = parsePgn(els.pgn.value, 'paste');
    if (!found.length) {
      els.msg.textContent = errors[0]?.message ?? 'Nothing to read yet. Paste a game in PGN.';
      return;
    }
    els.msg.textContent = '';
    skipped = errors.length ? `${errors.length} pasted game${errors.length === 1 ? ' was' : 's were'} left out. ${errors[0].message}` : '';
    if (found.length === 1) { games = found; renderConfirm(found[0]); return; }
    loaded('pasted PGN', found);
  });

  els.list.addEventListener('click', (ev) => {
    const t = ev.target as HTMLElement;
    const row = t.closest<HTMLElement>('[data-id]');
    if (row) renderConfirm(games[Number(row.dataset.id)]);
    else if (t.id === 'im-all') { londonOnly = false; renderList(); }
    else if (t.id === 'im-back') step('start');
  });
  els.list.addEventListener('change', (ev) => {
    if ((ev.target as HTMLElement).id !== 'im-london') return;
    londonOnly = (ev.target as HTMLInputElement).checked;
    renderList();
    root.querySelector<HTMLElement>('#im-london')!.focus();
  });
  els.confirm.addEventListener('click', (ev) => {
    const id = (ev.target as HTMLElement).id;
    if (id === 'im-yes' && picked) onReview(picked);
    if (id === 'im-no') { if (games.length > 1) renderList(); else step('start'); }
  });

  setSource('lichess');
  renderRecent();
  return { show: () => (games.length > 1 ? renderList() : step('start')) };
}
