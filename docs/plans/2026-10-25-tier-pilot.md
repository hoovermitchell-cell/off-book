# Tier pilot: Intermediate London and Caro-Kann (decision 16, step 2)

Built on `feat/batch1-qg-slav`, branch `feat/tier-pilot`. The refinement loop runs it under Mitch's
"full autonomy" for openings; he reviews the lines and notes at the PR.

## What Intermediate means here

Decision 16: Intermediate "adds more opponent setups and continuations". The pilot does one of each
kind per opening, ranked by frequency within the tier (14b):

- **More setups, from lines already in the tree.** Both openings have hand-pinned, engine-checked
  lines that were never staged. Staging them adds no tree content, so the content rule (a deeper
  tier never changes a learned prep move) holds by construction.
  - London: King's Indian setup (`d4 Nf6 Bf4 g6 …`), and ...c5 with ...Qb6, extended through the
    tree to about move 8 by Maia's likeliest replies.
  - Caro-Kann: Panov (4.c4), Fantasy (3.f3), Two Knights (2.Nc3 3.Nf3).
- **One continuation per opening.** The textbook line goes on past where Intro stops (London 8.Bd3,
  Caro 13...O-O) to about move 12, following Maia's likeliest replies, with the student's moves from the
  generator's policy (system move within 35cp, else Stockfish). These are new pins beyond the tree's
  frontier, so they also leave every existing prep move alone.

Each Intermediate stage gets a theory note (`Stage.note`): the plan, the pawn structure, and the usual
mistake, in three or four sentences. Claude drafts them; Mitch reviews them like idea texts.

## Rejected for the pilot

- Advanced tier, and Intermediate for the QG and Slav: after the pilot shows the cost.
- New generator depth for the whole tree: the continuation is a single staged line, and Maia takes
  over when the opponent leaves it, as at the end of any stage.
- Theory notes for Intro stages. Intro stays exactly as it is.

## Product changes

1. **Tier groups in the rail.** The drill's line list shows a small "Intro" and "Intermediate"
   heading over its stages. Unlocking is unchanged (14c): the first Intermediate line opens when the
   last Intro line reaches the next-day rung.
2. **More on this line.** A stage with a `note` gets a native `<details>` "More on this line" in its
   rail row. Reading it earns nothing.
3. **Pause new lines.** One checkbox per opening, in the rail. While it's on, `pickStage` only picks
   lines the student has already started (at least one learned move), so reviews carry on and no new
   line begins. It's saved in `Saved.paused` (opening ids) and goes in the backup.
4. **Content-rule test.** No pinned line overrides an AUTO entry with a different move, and every
   stage agrees with its opening's tree.

## As built

- **Stages.** London: the textbook to move 12, then the King's Indian setup (2.0% by Maia). Caro-Kann:
  the Classical into the endgame, then Two Knights (1.6%), Fantasy (1.0%) and Panov (0.7%). The textbook
  continuation leads each tier, per 14b. Extended with `spike/extend-line.mjs`; every new student
  move is within 14cp of Stockfish at 3 s, and no existing prep move changed.
- **Dropped: ...c5 and ...Qb6 for the London.** Extending it exposed that the pinned Intro move 4.Qc1
  loses the d4 pawn (4...cxd4 5.exd4 Qxd4); Stockfish prefers 4.Nc3 by about 70cp at 3 s. That is
  an Intro correction for Mitch, not a tier addition.
- **Proven, with nested lines.** A deeper line can contain a whole Intro line, so the "a move only that
  line has" rule (plumbing, item 2) now ignores lines that contain all of this one's moves. Without it,
  the Intro textbook could never be proven again.
- **Pause** sits in the setup row beside Mode and rating. A line counts as started only when it has a
  learned move no earlier line has: every London line opens 1.d4 d5 2.Bf4, so "any learned move" would
  never pause anything.
- **Rail.** A tier still all locked folds to one line, headings show only once a later tier opens, and
  the line record moved below the controls, so at 1366x657 the controls never move however long it grows.
- **Data fix.** Regenerating the Caro-Kann tree with `KEEP=1` dropped a stale AUTO entry an old pin
  had overridden (the content-rule test caught it) and cleared the old 5...Nd7 trailer.

## Done when

Tests, lint and tsc pass. `check-tree` is clean for London and Caro-Kann. In the browser, the rail
shows both tiers, a note opens, Pause stops a new line from starting, and an old backup restores.
