// Quiet footer: backup and restore of device-only progress (decision 3) and the AGPL source link
// (decision 6). Mounted from main.ts so it stays out of the drill view.
import { exportBackup, loadSaved, parseBackup, updateSaved } from '../storage';

/** The public repo. Decision 6 makes the source public before students get the link, but the repo
 *  isn't published yet, so this link 404s until it is. */
export const SOURCE_URL = 'https://github.com/hoovermitchell-cell/off-book';

const stamp = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export function mountFooter(root: HTMLElement) {
  root.innerHTML = `
    <p>Your progress lives in this browser only. Back it up before you clear your data or switch computers.</p>
    <div class="row">
      <button type="button" class="quiet" id="backup">Back up progress</button>
      <button type="button" class="quiet" id="restore">Restore from file</button>
      <input type="file" id="restore-file" accept="application/json,.json" hidden>
      <a href="${SOURCE_URL}">Source code (AGPL-3.0)</a>
    </div>
    <p class="footer-msg" id="footer-msg" aria-live="polite"></p>`;

  const msg = root.querySelector<HTMLElement>('#footer-msg')!;
  const input = root.querySelector<HTMLInputElement>('#restore-file')!;
  const say = (text: string) => { msg.textContent = text; };

  root.querySelector('#backup')!.addEventListener('click', () => {
    const now = new Date();
    const blob = new Blob([JSON.stringify(exportBackup(loadSaved(), now), null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `off-book-progress-${stamp(now)}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href)); // same-tick revoke can cancel the download in Firefox
    say(`Saved ${a.download} to your downloads.`);
  });

  root.querySelector('#restore')!.addEventListener('click', () => input.click());
  input.addEventListener('change', async () => {
    const file = input.files?.[0];
    input.value = ''; // so picking the same file again still fires
    if (!file) return;
    const r = parseBackup(await file.text().catch(() => ''));
    if (!r.ok) return say(r.reason);
    const now = loadSaved();
    const ok = confirm(
      `Replace the progress in this browser (${now.correct} correct moves, ${now.learned.length} learned) ` +
      `with the backup (${r.saved.correct} correct moves, ${r.saved.learned.length} learned)? This can't be undone.`,
    );
    if (!ok) return say('Restore cancelled. Nothing changed.');
    if (!updateSaved(() => r.saved).ok) return say("This browser won't store progress, so the backup wasn't restored.");
    window.dispatchEvent(new Event('storage')); // the drill already reloads its state on this event
    say(`Restored ${r.saved.correct} correct moves and ${r.saved.learned.length} learned.`);
  });
}
