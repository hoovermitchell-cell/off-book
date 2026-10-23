// Load order from design/board.css: tokens, chessground base, board theme.
import '../design/tokens.css';
import 'chessground/assets/chessground.base.css';
import '../design/board.css';
import './ui/app.css';
import markUrl from '../design/brand/off-the-page/favicon.svg';
import { mountDrill } from './ui/drill-view';
import { mountReview } from './ui/review-view';

// Binder index tabs (DESIGN.md): the smallest switch between the drill and the import -> review flow.
// Both screens stay mounted, so a drill in progress survives a trip to the review tab.
const SCREENS = [{ id: 'drill', label: 'Drill' }, { id: 'review', label: 'Review a game' }] as const;

const app = document.getElementById('app')!;
app.innerHTML = `
  <header class="masthead">
    <img src="${markUrl}" alt="">
    <h1>Off Book</h1>
    <nav class="tabs" aria-label="Screens">
      ${SCREENS.map((s, i) => `<button type="button" class="tab" data-screen="${s.id}"${i === 0 ? ' aria-current="page"' : ''}>${s.label}</button>`).join('')}
    </nav>
  </header>
  ${SCREENS.map((s, i) => `<div id="screen-${s.id}"${i === 0 ? '' : ' hidden'}></div>`).join('')}`;

mountDrill(document.getElementById('screen-drill')!);
mountReview(document.getElementById('screen-review')!);

const tabs = [...app.querySelectorAll<HTMLButtonElement>('.tab')];
for (const tab of tabs) {
  tab.addEventListener('click', () => {
    for (const t of tabs) {
      const on = t === tab;
      if (on) t.setAttribute('aria-current', 'page'); else t.removeAttribute('aria-current');
      document.getElementById(`screen-${t.dataset.screen}`)!.hidden = !on;
    }
  });
}
