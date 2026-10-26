# Backlog

`## Ready` is the trust boundary: items here run **unattended** through `cycle`
(plan → work → review → PR → green CI). Putting an item here is the approval.
Everything below waits for a human. Start the loop with the command in AGENTS.md.

## Refinement loop

Mitch, 2026-10-25. Each iteration runs one slot, then the pointer moves on:
opening → polish → feature → opening …

**Next slot: feature**. Rolling polish PR: #6. Next opening: batch 3 (decision 16's order), based on `feat/batch2-italian-french` (#12) until it merges.
First, each tick: check open loop PRs' CI and fix any red ones.

- **Opening.** The next step in decision 16's order: plumbing (step 0), batch 1
  (QG + Slav), the tier pilot, batch 2 (re-picked by decision 16's rule), batch 3.
  Full autonomy: write the coverage matrix yourself into the plan doc and keep
  going; Mitch reviews the texts and matrix at the PR. A step too big for one
  iteration keeps the pointer on "opening" with a note on where it stopped. Own
  branch and PR per step. Engine check: re-test a trailing move at about 3 s
  before pinning (400 ms is noisy at ±60cp), and regenerate with `KEEP=1` so a
  pin doesn't re-roll the rest of the tree (batch 1 took six rounds without).
- **Polish.** Run the app, find the most valuable rough edge (or take one from
  `## Polish ideas`). Small (a few lines, no behaviour change worth a review):
  commit to the rolling branch `refine/polish`, one PR kept open. Larger: its own
  branch and PR.
- **Feature.** Fewer than 5 items under `## Feature ideas`: brainstorm and add
  some, ranked. Otherwise build the top one, sized like polish.

Every slot: work in a worktree under `.claude/worktrees/`, keep this checkout on
`main`. Base on `feat/levelling` until PR #3 merges, then on `main`. Run `cycle`,
green CI, never merge (`propose`). Log one line under `## Done`. Removing a
worktree: delete its `node_modules` junction first. A new worktree run with vite directly
skips `predev`, so copy `public/vendor` and `public/models` in from another one or the engines won't load.

## Polish ideas

From the design audit of 2026-10-25 (`refine/polish`, first polish slot). Best first.

- P2, copy (Mitch): the 6.Nbd2 idea in `london-ideas.ts` says "so the c-pawn can still move to c3" when c3 is already played in the Textbook line
- P3: three live regions announce each drill move; the review step line is announced twice
- P3: drill and review round the same loss differently (4.2 vs 4.3)

## Feature ideas

Brainstorm, 2026-10-25 (loop slot 3). Ranked by how much each strengthens the core loop
(learn → play → review) and the talk demo. Feature slots build from the top.

1. **Battle record per line** (medium, decision 5, v1 scope 6). Each staged line in the rail shows
   the W-D-L of imported real games that followed it (same attribution as Proven). Records,
   not badges, per DESIGN.md.
2. **Opening names in review** (small-medium, v1 scope 1). Name the position where prep ended
   from Lichess `chess-openings` (CC0): "you left prep in the Caro-Kann, Advance Variation".
   Build-time TSV filtered to the trees' positions, so no runtime fetch.
3. **Opening-linked puzzles** (large, decision 7, v1 scope 7). Lichess puzzles (CC0) filtered
   offline to positions in the student's trees, shown per line, not as a standalone mode.
   Open question for Mitch first: do solved puzzles level the line (decisions, Still open).
4. **Weekly goal** (medium, decision 5, v1 scope 6). Effort-based: reviews done this week against
   a target, no streak guilt. Needs Mitch's call on what counts and the default target before
   building; until then it stays last.

## Ready

<!-- approved, scoped work — the loop drains these top to bottom -->

## Needs shaping

- Repertoire plumbing and batches: now run by the refinement loop above
- Mitch: the London's pinned 4.Qc1 against 1.d4 Nf6 2.Bf4 c5 3.e3 Qb6 loses d4 (4...cxd4 5.exd4 Qxd4); Stockfish prefers 4.Nc3 by ~71cp at 3 s. Found by the tier pilot (#9); an Intro change, so it waits for you
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
- Loop: repertoire plumbing (decision 16, step 0), PR #5 on `feat/repertoire-plumbing`, 2026-10-25
- Loop: polish batch 1 (9 design-audit fixes, two P1), rolling PR #6 on `refine/polish`, 2026-10-25
- Loop: feature brainstorm, 6 ranked ideas under `## Feature ideas`, 2026-10-25
- Loop: batch 1, Queen's Gambit + Slav (decision 16), PR #7 on `feat/batch1-qg-slav`, 2026-10-25
- Loop: polish batch 2 (loading state, steady status, legal-move hint), on rolling PR #6, 2026-10-25
- Loop: feature "Drill this line" from a review, PR #8 on `feat/drill-from-review`, 2026-10-25
- Loop: tier pilot, Intermediate London + Caro-Kann with Pause new lines and theory notes (decision 16 step 2), PR #9 on `feat/tier-pilot`, 2026-10-25
- Loop: polish, confirm before Resign or a switch discards a game, PR #10 on `fix/confirm-discard`, 2026-10-25
- Loop: feature, board entry for over-the-board games, PR #11 on `feat/board-entry`, 2026-10-25
- Loop: batch 2, Italian + French with idea texts (decision 16), PR #12 on `feat/batch2-italian-french`, 2026-10-26
- Loop: polish, How did it know? keeps Stockfish's verdict after the reply and no longer hides the scoresheet, PR #13 on `fix/know-panel`, 2026-10-26
