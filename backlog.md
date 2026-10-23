# Backlog

`## Ready` is the trust boundary: items here run **unattended** through `cycle`
(plan → work → review → PR → green CI). Putting an item here is the approval.
Everything below waits for a human. Start the loop with the command in AGENTS.md.

## Ready

<!-- approved, scoped work — the loop drains these top to bottom -->

## Needs shaping

- Mitch reviews the Caro-Kann idea texts in `src/data/caro-kann-ideas.ts` (the repertoire questions are answered: decision 15)
- Mitch reviews the review-screen copy in `src/review/templates.ts` (decision 4b)
- Drill the Caro-Kann: the drill and review assume White today; playing Black needs both to take a side (after Mitch's Caro-Kann answers)
- Review Black games too (the Caro-Kann), once the Caro-Kann is in the drill
- Mitch reviews the London tree's pinned lines (`src/data/london.ts`) and the 38 Stockfish-fallback positions in `london-auto.ts`
- Design the three-stage levelling from decision 14 (main line, alternatives, real matches)
- Publish as public GitHub repo `off-book` (LICENSE and footer link are on `feat/backup-license`). Name check done: fine for GitHub; an app-store listing would hit a live US mark, see `docs/research/2026-10-23-name-check.md`
- Set up CI (test + lint) so the loop has a green-gate to enforce; needs the GitHub repo first
- Define this project's "done" gate beyond green CI, if any
- Low priority, since the app is for a talk, not a rollout (Mitch, 2026-10-23): Chromebook load time and engine speed; questions for the school about devices and accounts

## Done

- Combined spike (London drill, Maia replies, Stockfish judge): works on Mitch's PC, 2026-10-21
- Real build slice 1: drill screen on TS + Vite from DESIGN.md, 2026-10-21
- On review branches, 2026-10-22: staged-lines fix, drill polish, WOFF2 fonts, Cloudflare deploy script (`docs/review/branches-2026-10-22.md`)
- On review branches, 2026-10-23: game import and prep-boundary review, backup/restore, LICENSE and footer, centered pieces, Caro-Kann draft data, name check (`docs/review/branches-2026-10-23.md`)
