// Import flow: pick a source, pick a game, confirm the moves. Nothing is analysed until the student
// has confirmed the move list (a legal but mistyped move would give a convincing wrong analysis).
import { OPENINGS, openingForSide } from '../data/openings';
import { detectPrep, parsePgn, plyLabel, type GameSource, type ImportedGame } from '../import/pgn';
import { loadRecent, saveRecent } from '../import/recent';
import { fetchChessCom, fetchLichess, ImportError } from '../import/sources';

const SITES: Record<GameSource, string> = { lichess: 'Lichess', chesscom: 'Chess.com', paste: 'pasted PGN' };
const SIDE = { w: 'White', b: 'Black' } as const;
/** "the London as White and the Caro-Kann as Black", from OPENINGS. */
const prepList = OPENINGS.map((o) => `the ${o.name} as ${SIDE[o.side]}`).join(' and ');
const esc = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

export function mountImport(root: HTMLElement, onReview: (game: ImportedGame) => void): { show(): void } {
  root.innerHTML = `
    <section class="import" aria-labelledby="im-h">
      <div id="im-start">
        <h2 id="im-h" tabindex="-1">Review a game</h2>
        <p class="soft">Bring a game you played in your London as White or your Caro-Kann as Black. Off Book finds where your prep ended, who left it first, and whether leaving cost you anything. The only request that leaves this browser is the one to Lichess or Chess.com that you start.</p>
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
  let prepOnly = true;
  let picked: ImportedGame | null = null;
  let side: 'w' | 'b' = 'w'; // the side chosen on the confirm step
  let skipped = ''; // why some pasted games were left out

  function step(which: 'start' | 'list' | 'confirm') {
    els.start.hidden = which !== 'start';
    els.list.hidden = which !== 'list';
    els.confirm.hidden = which !== 'confirm';
    (root.querySelector<HTMLElement>(`#im-${which} h2`))?.focus();
  }

  function setSource(s: GameSource) {
    source = s;
    sourceButtons.forEach((b) => { b.setAttribute('aria-pressed', String(b.dataset.src === s)); });
    els.user.hidden = s === 'paste';
    els.paste.hidden = s !== 'paste';
    els.name.labels![0].firstChild!.textContent = `${SITES[s]} username `;
    els.msg.textContent = '';
  }

  function renderRecent() {
    const r = loadRecent();
    els.recent.innerHTML = r ? `<p class="soft">Last import: ${esc(SITES[r.source])}, ${esc(r.label)}, ${r.games.length} games, ${esc(new Date(r.at).toLocaleDateString())}. Kept on this device only. <button type="button" class="quiet" id="im-reopen">Open them</button></p>` : '';
    els.recent.querySelector('#im-reopen')?.addEventListener('click', () => { games = r!.games; title = `Games from ${r!.label}`; skipped = ''; prepOnly = true; renderList(); });
  }

  function renderList() {
    const shown = prepOnly ? games.filter((g) => g.prep) : games;
    const inPrep = games.filter((g) => g.prep).length;
    const rows = shown.map((g) => `
      <li><button type="button" class="game" data-id="${games.indexOf(g)}">
        <span class="g-names">${esc(g.white)} vs ${esc(g.black)}</span>
        ${g.prep ? `<span class="prep-tag">${esc(OPENINGS.find((o) => o.id === g.prep)!.name)}</span>` : '<span></span>'}
        <span class="g-meta">${[g.source === 'paste' ? '' : `as ${SIDE[g.side]}`, g.date, g.result, g.opening ?? `${Math.ceil(g.sans.length / 2)} moves`].filter(Boolean).map(esc).join(' · ')}</span>
      </button></li>`).join('');
    const none = !shown.length
      ? `<p>${games.length ? `None of these ${games.length} games are in your openings: ${prepList} (1.d4 with an early Bf4, or 1.e4 c6).` : 'No games found.'}</p>${games.length ? '<p><button type="button" id="im-all">Show all games</button></p>' : ''}`
      : '';
    els.list.innerHTML = `
      <h2 tabindex="-1">${esc(title)}</h2>
      <p class="soft">${inPrep} of ${games.length} are in your openings (${prepList}). Pick one to review.${skipped ? ` ${esc(skipped)}` : ''}</p>
      <label><input type="checkbox" id="im-prep"${prepOnly ? ' checked' : ''}> Only games in your openings</label>
      ${none}<ol class="games">${rows}</ol>
      <div class="row"><button type="button" class="quiet" id="im-back">Back</button></div>`;
    step('list');
  }

  function renderConfirm(g: ImportedGame, played = g.side) {
    picked = g;
    side = played;
    const opening = openingForSide(side);
    // A username import knows the side; only a paste asks.
    const choice = g.source === 'paste'
      ? `<div class="row"><span id="im-side-l">You played</span><div class="seg row" role="group" aria-labelledby="im-side-l">${(['w', 'b'] as const).map((c) => `<button type="button" class="quiet" data-side="${c}" aria-pressed="${c === side}">${SIDE[c]}</button>`).join('')}</div></div>`
      : '';
    const verdict = opening
      ? `Off Book will check your ${opening.name} prep and your moves as ${SIDE[side]}.`
      : `Off Book has prep for ${prepList}, so it can't review a game as ${SIDE[side]} yet.`;
    let moves = '';
    for (let i = 0; i < g.sans.length; i += 2) moves += `<li><span class="n">${i / 2 + 1}.</span><span>${g.sans[i]}</span><span>${g.sans[i + 1] ?? ''}</span></li>`;
    els.confirm.innerHTML = `
      <h2 tabindex="-1">Is this the game as you played it?</h2>
      <p>${esc(g.white)} vs ${esc(g.black)}${g.date ? `, ${esc(g.date)}` : ''}${g.result && g.result !== '*' ? `, ${esc(g.result)}` : ''}. ${Math.ceil(g.sans.length / 2)} moves, ending ${esc(plyLabel(g.sans.length - 1, g.sans.at(-1)!))}.</p>
      <p class="soft">Check it against your scoresheet. A move that is legal but mistyped would give an analysis that looks right and isn't.</p>
      ${choice}
      <p class="soft">${esc(verdict)}</p>
      <div class="scoresheet"><ol class="moves" aria-label="Moves of the game">${moves}</ol></div>
      <div class="row">${opening ? '<button type="button" id="im-yes">Yes, review this game</button>' : ''}<button type="button" class="quiet" id="im-no">No, go back</button></div>`;
    step('confirm');
  }

  function loaded(label: string, found: ImportedGame[]) {
    games = found;
    title = `Games from ${label}`;
    prepOnly = true;
    saveRecent({ source, label, at: Date.now(), games: found });
    renderRecent();
    renderList();
  }

  // ---- events ----------------------------------------------------------------------------------
  for (const b of sourceButtons) b.addEventListener('click', () => setSource(b.dataset.src as GameSource));

  els.user.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    els.msg.textContent = '';
    els.go.disabled = true;
    els.go.textContent = 'Getting games…';
    try {
      const name = els.name.value.trim();
      const found = await (source === 'lichess' ? fetchLichess : fetchChessCom)(name);
      if (!found.length) els.msg.textContent = `${SITES[source]} has no standard games for "${name}" yet.`;
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
    else if (t.id === 'im-all') { prepOnly = false; renderList(); }
    else if (t.id === 'im-back') step('start');
  });
  els.list.addEventListener('change', (ev) => {
    if ((ev.target as HTMLElement).id !== 'im-prep') return;
    prepOnly = (ev.target as HTMLInputElement).checked;
    renderList();
    root.querySelector<HTMLElement>('#im-prep')!.focus();
  });
  els.confirm.addEventListener('click', (ev) => {
    const t = ev.target as HTMLElement;
    const id = t.id;
    if (t.dataset.side && picked) {
      renderConfirm(picked, t.dataset.side as 'w' | 'b');
      root.querySelector<HTMLElement>(`[data-side="${side}"]`)!.focus();
    }
    if (id === 'im-yes' && picked) onReview({ ...picked, side, prep: detectPrep(picked.sans, side) });
    if (id === 'im-no') { if (games.length > 1) renderList(); else step('start'); }
  });

  setSource('lichess');
  renderRecent();
  return { show: () => (games.length > 1 ? renderList() : step('start')) };
}
