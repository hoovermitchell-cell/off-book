# Backlog

`## Ready` is the trust boundary: items here run **unattended** through `cycle`
(plan → work → review → PR → green CI). Putting an item here is the approval.
Everything below waits for a human. Start the loop with the command in AGENTS.md.

## Ready

<!-- approved, scoped work — the loop drains these top to bottom -->

## Needs shaping

- After the talk and after sparring merges (decision 16): repertoire plumbing slice, step 0 of `docs/plans/2026-10-25-repertoire-expansion.md`; then batch 1 (Queen's Gambit + Slav), starting with Mitch approving its coverage matrix
- Mitch reviews the review-screen copy in `src/review/templates.ts` (decision 4b)
- Mitch reviews the London tree's pinned lines (`src/data/london.ts`) and the 38 Stockfish-fallback positions in `london-auto.ts`
- Build the levelling from decision 14c (per-move ladder, staged-line unlocks, Proven from real games, per-line status UI); staged lines settled in 14d
- Define this project's "done" gate beyond green CI, if any
- Low priority, since the app is for a talk, not a rollout (Mitch, 2026-10-23): Chromebook load time and engine speed; questions for the school about devices and accounts

## Done

- Combined spike (London drill, Maia replies, Stockfish judge): works on Mitch's PC, 2026-10-21
- Real build slice 1: drill screen on TS + Vite from DESIGN.md, 2026-10-21
- On review branches, 2026-10-22: staged-lines fix, drill polish, WOFF2 fonts, Cloudflare deploy script (`docs/review/branches-2026-10-22.md`)
- On review branches, 2026-10-23: game import and prep-boundary review, backup/restore, LICENSE and footer, centered pieces, Caro-Kann draft data, name check (`docs/review/branches-2026-10-23.md`)
- Caro-Kann in the drill as Black, next to the London, with an opening picker, 2026-10-23 (`feat/caro-kann-drill`)
- Review tab handles Black games and the Caro-Kann, 2026-10-23 (`feat/review-black`)
- Layout: notes under the board, tools in a rail, for drill and review (Codex studies, Mitch's pick), 2026-10-23 (`feat/layout-notes-under`)
- All review branches (2026-10-22 and 2026-10-23 batches) merged to `main` by fast-forward, 2026-10-25
- Repo public at github.com/hoovermitchell-cell/off-book (AGPL-3.0, footer link live), 2026-10-25
- CI on GitHub Actions: build (with tsc) and tests on every PR and push to main, 2026-10-25 (#1). No linter yet; add one if the loop needs it
