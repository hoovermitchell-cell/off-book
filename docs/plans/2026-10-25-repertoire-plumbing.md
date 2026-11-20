# Repertoire plumbing (decision 16, step 0)

Built on `feat/levelling` (levelling plus sparring), branch `feat/repertoire-plumbing`. This is the
build plan for step 0 of [2026-10-25-repertoire-expansion.md](2026-10-25-repertoire-expansion.md).
No new opening data lands here: tests use small made-up openings.

**Not done here (rejected for this slice):** the "Pause new lines" switch and theory-note UI (the
tier pilot needs them, so they ship with it); review of a game with no matching opening (today's
"can't review this side yet" stays); namespacing `proven` by opening (a test that stage IDs are
unique across openings covers it for now).

## 1. Ladder key = position + prescribed move

- `src/data/prep.ts`: `ladderKey(fen, uci) = posKey(fen) + ' ' + uci`. Five space-separated fields,
  so a legacy key (four fields) is told apart by shape.
- `src/drill/drill.ts`: every `learned.has/add/review` call uses `ladderKey(fen, tree move uci)`.
  The `miss(fen)` path looks the prep move up in the tree; no prep move there means no review.
- `src/levels.ts`: `stageKeys` keys each student position with the stage's own next move.
  `provenStage` builds its played set the same way, from the moves actually played.
- `src/storage.ts`: `sanitize` migrates four-field keys through the London and Caro-Kann trees only
  (the two openings that existed before this format). A legacy key in neither tree is dropped.
  Migration is idempotent. `BACKUP_VERSION` becomes 3; versions 1, 2 and 3 restore.

## 2. Proven needs the line's own moves

`provenStage` keeps the half-the-line rule and adds: the hit set must include at least one key of
that stage that no other stage of the same opening has. A shared prefix proves nothing.

## 3. Opening detection by walking every tree

- `src/import/pgn.ts`: `detectPrep(sans, side)` walks the game through every opening on that side
  (`walkPrep`), scores each by the student's moves in prep, and needs at least one. Highest score
  wins; equal top scores are a tie. Returns `{ prep, prepFrom }` with `prepFrom: 'book' | 'tie'`;
  a tie still names the first tied opening so the review can open, but is marked.
  `isLondonAsWhite` and `isCaroKannAsBlack` go. `guessSide` becomes: Black when a Black opening
  matches and no White one does.
- `ImportedGame` gets `prepFrom?: 'book' | 'tie' | 'student'`. `recent.ts` recomputes the opening
  only when `prepFrom !== 'student'`, so a student's correction survives re-import.
- `src/ui/review-view.ts`: a small "Reviewed as" select, listing the openings for the game's side,
  shown when there are two or more. Changing it sets `prep` and `prepFrom: 'student'`, saves the
  recent list, and re-runs the review. A game with `prepFrom: 'tie'` earns no Proven.

## 4. Opening plumbing

- `openingForSide` goes. Review and import use `OPENINGS.find((o) => o.id === game.prep)`.
- `Opening['id']` widens to `string`.
- `openingMoves` becomes `forcedReplies`: the opponent's first moves, played by rule at the
  opponent's turns before Maia takes over. A staged line still wins over them. The Caro-Kann's is
  `['e4']`; an Italian would use `['e5']`.

## 5. Stage fields and picker

- `Stage` gets `tier: 'intro' | 'intermediate' | 'advanced'` (every current stage is `intro`) and
  an optional `note` (theory note, decision 16). No UI reads `note` yet.
- The drill picker wraps options in `<optgroup>` by side: "You play White", "You play Black".

## 6. Tooling

`spike/check-london.mjs` and `spike/check-caro-kann.mjs` merge into `spike/check-tree.mjs <name>`,
with the side's sign taken from the opening. `build-tree.mjs` already has a per-opening policy.

## 7. Collision fixtures

Tests with tiny synthetic openings: London vs QG (1.d4 d5, 2.Bf4 vs 2.c4), Italian vs Scotch
(shared 1.e4 e5 2.Nf3 Nc6, then 3.Bc4 vs 3.d4), Slav vs QGD (2...c6 vs 2...e6). Shared position
and move share credit; a conflicting move at the same position does not. A version 2 backup
restores with exactly its earned rungs under the new keys. Detection picks the longer in-book
run, marks a tie, and a student correction survives `loadRecent`.

## Done when

`npm test`, `npm run build` and lint pass; the drill and review still work for the London and the
Caro-Kann in the browser; an old save in localStorage carries over.
