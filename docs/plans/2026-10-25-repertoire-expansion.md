# Repertoire expansion: consensus plan (Claude Code + Astra/Codex)

Planning session, 2026-10-25. Claude Code and Astra (Codex) each wrote an independent proposal,
traded critiques, and converged in two rounds. Mitch ruled on it the same day: decision 16 in
`docs/decisions.md`, summarized at the end. Where the two differ, decision 16 wins.

Mitch's asks: (1) more openings, "a white and black for each session we implement them on";
(2) deeper lines in the openings we already have, as intro, intermediate and advanced additions,
each with more explanation of the theory.

## Timing

All of this comes after the talk and after `feat/sparring` merges. The talk needs none of it:
London, Caro-Kann, the ladder, a restored backup and one real-game review already tell the story.

## Order of work

| Step | What | Why here |
|---|---|---|
| 0 | Plumbing slice (below) | Every later step is data on top of it |
| 1 | **Batch 1, new openings:** Queen's Gambit (White) + Slav (Black, vs 1.d4) | Fills the real hole first: a Caro-Kann student has no prep against 1.d4. The pair shares the 1.d4 d5 2.c4 c6 positions from both sides, so one generation and engine pass serves both. The Slav also rhymes with the Caro (bishop out before ...e6). |
| 2 | **Tier pilot:** Intermediate London + Intermediate Caro-Kann | Tests the tier system on content Mitch already knows before it touches anything new |
| 3 | **Batch 2:** Italian (White) + French (Black, alternative to the Caro) | First 1.e4 choice for White. The French tree is narrow: after 1.e4 e6, White mostly plays 2.d4. |
| 4 | **Batch 3:** Scotch (White) + Queen's Gambit Declined (Black, alternative to the Slav) | Each reuses a previous batch: the Scotch reuses the Italian's support routes, and the QGD reuses the QG's positions and engine work. Confirm the savings by counting positions and texts before authoring. |
| later | Advanced tiers; the Sicilian and King's Indian | After the pilot shows what a tier costs |

Every batch is one White plus one Black, as Mitch asked. Tier batches follow the same pairing:
one existing White opening and one existing Black opening together.

**Alternative versus complement.** The Slav *complements* the Caro: different first move, same
Black student. The QG, Italian, Scotch, French and QGD are *alternatives*: the student picks one.
The code has to handle both cases.

## How wide an opening must be to ship

- Mitch approves a **coverage matrix** before any authoring: opponent's choice, our answer,
  stopping position, teaching point, branches left out.
- "Against 1.d4" means against 1.d4, including the London and quiet e3 setups, not only 2.c4.
  1.c4 and 1.Nf3 are not claimed until they are checked separately.
- **Italian:** all common ...e5 branches (Giuoco Piano, Two Knights, Petroff, Philidor), plus
  short starter routes against the two most common non-...e5 replies. Astra ran Maia
  800 to 1400 after 1.e4: Scandinavian 12.1%, French 7.9%, Sicilian 5.4%, Alekhine 7.4% at
  800. Those are model predictions, not counts from club games. Provisional pair: Scandinavian +
  French. Every other defense is an honest prep boundary at move one, and Maia plays on, the way
  the Caro-Kann handles 1.d4 today.
- Intro packages: about 3 to 5 staged lines per new opening plus the generated tree, stopping
  around moves 6 to 8 unless the line is forcing.

## Depth tiers (ask 2)

- A tier is a group of staged lines. **Intro** is what each opening has now: the London's 5
  stages and the Caro's 7, with IDs, order and stopping points unchanged. **Intermediate** adds
  more opponent setups and continuations, plus pawn breaks, exchanges and move-order choices.
  **Advanced** adds the critical continuations and tactical exceptions, with why the plausible
  alternatives fail. No fixed depth target.
- Unlocking stays decision 14c: the next line opens when every move of the current one reaches
  the 1-day rung. Tiers do not add a second gate.
- New: a **"Pause new lines"** switch per opening. Today `pickStage` (`src/levels.ts`) moves a
  student onto the next open line automatically. With the switch on, reviews and sparring carry
  on but no new line starts.
- **Content rule:** a deeper tier adds positions and stages with new IDs. It never changes the
  prep move at a position already in the tree, and it never lengthens a Cleared or Proven line.
- **Explanation:** the one short idea per move stays (13b). Each tier adds a theory note per
  staged line (the plan, the pawn structure, the usual mistake), behind a "More on this line"
  control. Mitch reviews these like idea texts. Reading a note earns no progress.
- Maia takes over at the end of the last unlocked line, as now (14b).

## Plumbing slice (step 0)

1. **Ladder key becomes position + prescribed move**, not position alone. Otherwise the London
   (2.Bf4) and the QG (2.c4) collide at 1.d4 d5. Version the save and backup format, and migrate
   old keys using the two legacy openings only, so London credit cannot turn into QG credit.
2. **Proven attribution:** `provenStage` uses a half-the-line overlap rule. Require the game to
   reach a line's distinguishing segment, so a shared prefix cannot prove a line nobody played.
3. **Opening detection:** replace `isLondonAsWhite` / `isCaroKannAsBlack` with one walk of the
   game through every candidate tree on the student's side. The longest in-book run suggests the
   opening. A tie is left for the student to resolve, and no match means review without prep.
   **Every review has a small correction control**: a student who meant the Italian but played
   the Scotch move should get Italian feedback. Corrections survive re-import (`recent.ts`
   currently recomputes them), and an unresolved game earns no Proven.
4. `openingForSide` goes; review uses the game's confirmed opening ID. `Opening['id']` widens.
   `openingMoves` becomes forced moves for the opponent, so an Italian drill can force 1...e5.
5. `Stage` gets a `tier` and an optional `note`. The drill picker groups openings by side.
6. Generalize `spike/check-caro-kann.mjs` into a checker for either colour, and give
   `build-tree.mjs` a per-opening move policy instead of the London's system list.
7. Test fixtures for the collisions: London vs QG, Italian vs Scotch, Slav vs QGD. Shared moves
   share credit, conflicting moves don't, and an old backup keeps exactly what was earned.

## Pipeline per opening (or per tier)

Coverage matrix approved -> pinned lines and stopping points -> generated tree -> engine check
(every prep move, deeper search on tactics) -> staged lines ranked by Maia -> idea texts and
theory notes -> Mitch review -> register, test, and rehearse the whole loop (learn, drill, Maia,
import, review, restore).

Mitch's review time is the limit. To keep it manageable:
- Review packets of 2 to 3 related lines and 8 to 12 texts.
- One representative stage and its texts are reviewed **before** the whole pair is generated,
  so the template gets fixed while it is still cheap.
- A batch is one pair of Intro packages, not two openings at all three depths.

## Risks and cheap tests

1. **An opening rarely reaches its lesson.** Before authoring, count where Maia's games (and any
   club PGNs we're allowed to use) leave each proposed tree.
2. **Alternatives corrupt progress or attribution.** The collision fixtures in step 0, item 7.
3. **Review load outgrows usable lessons.** The one-stage packet first, as above.
4. **Advanced lines nobody meets.** Check Maia frequency per staged line at 800 to 1400 before
   it goes into a tier (Claude's addition; Astra's risk 1 covers it in part).

## Decided (Mitch, 2026-10-25, decision 16)

1. Order: plumbing, batch 1, the tier pilot, then batch 2.
2. Picks: only batch 1 (QG + Slav) is locked. Italian + French and Scotch + QGD are re-picked
   after the tier pilot.
3. Italian starter routes are chosen when batch 2 is shaped: Maia's 1.e4 replies averaged
   equally over 800 to 1400, and the top two non-...e5 replies get a starter route.
4. Tiers approved as written above.
5. All of it starts after the talk and after sparring merges.
