# Brief for Codex: three layout renders for the drill screen

From Claude Code, 2026-10-23, at Mitch's request. Mitch: "I don't like having to look to the right for
all the info, rethink the UI." He wants three different layouts to look at, plus your recommendation,
and then he and Claude decide together. Nothing here is decided.

## The problem

Today the board sits on the left and everything the student needs on each move sits in a panel to its
right: the "what to do now" line, the verdict on the last move, the handwritten idea note, the
scoresheet, the level tally and the controls. The student's eyes leave the board on every move. The
fix should keep the per-move information within easy reach of the board.

## Canon you must follow

Read `DESIGN.md` and `design/tokens.css` first. In short:

- **Board first:** the board is the biggest, calmest thing on screen, and everything else is a margin
  note around it.
- **North Star:** a serious player's prep binder.
- **Margin notes:** Kalam is used only for coach-style margin notes.
- **Annotation glyphs:** `!` `?!` `?` `??`, with the highlighter for book moves.
- **Fit on a laptop:** at 1366x768 the board, the move list and the current feedback are all visible
  without scrolling.
- **Touch targets:** at least 44px.
- **Rejected looks:** the ones listed in DESIGN.md stay rejected.

Use only tokens from `tokens.css` and the self-hosted fonts in `design/fonts/`, plus the Off Book piece
set in `design/pieces/offbook/*.webp`.

## What to make

Three static HTML pages, each a distinct layout, not three variations of one:

- `design/layouts/layout-1.html`
- `design/layouts/layout-2.html`
- `design/layouts/layout-3.html`

Each page shows the same moment so they can be compared:

- **Opening:** the Caro-Kann drill, student playing Black, board flipped (Black at the bottom).
- **Position:** after 1.e4 c6 2.Nc3. The student must now play 2...d5, a new move.
- **Arrow:** the learn arrow d7 to d5.
- **What to do now:** "New move: play 2...d5." with "White played 2. Nc3. Follow the arrow. Next time
  you reach this position, you'll play it from memory."
- **Verdict on the last move:** `!` "1...c6. Your prep, from memory." with "+1 tally".
- **Idea note, in Kalam:** "d5 challenges the e4 pawn at once. The c6 pawn guards it, so it is safe."
- **Scoresheet:** 1. e4 c6, 2. Nc3, with the prep moves highlighted.
- **Level:** "Level 1", tally marks, "2 of 10 to level 2 · 3 moves learned".
- **Controls:**
  - Opening select ("Caro-Kann (you play Black)").
  - Opponent rating select (1000).
  - Buttons: "Show my prep", "How did it know?", "Resign".
  - "Type a move" input with a Play button.
- **App chrome:** the app header with the Off Book mark, the Drill and Review a game tabs, and the
  footer (backup/restore and the source link).

Draw the board statically: an 8x8 CSS grid with the `--board-light` and `--board-dark` tokens, and the
piece images centered on their squares. Draw the arrow as SVG. No JavaScript and no chessground needed.
Each page must look right at a 1366x768 viewport.

The three layouts should explore genuinely different answers. Claude's quick sketches, as a starting
point you may beat:

- **(a) Notes under the board:** the status line sits just above the board, and the verdict and idea
  sit just below it. The scoresheet and controls go in a slim side rail.
- **(b) A pencil note on the board:** the note sits beside the square in play.
- **(c) One column, no side panel.**

Use your own judgement. If you see a better third option than one of these, make it.

Also say in your write-up how each layout would carry over to the Review tab, which today has the same
right-hand panel with a lesson card.

## Your input

Write `design/layouts/README.md`, up to about 60 lines:

- One paragraph per layout: what it is, what it costs, and how the Review tab would use it.
- Your recommendation and why, judged against DESIGN.md's principles and the 1366x768 rule.

## Rules

- **What you may write:** only `design/layouts/` and its files. Do not touch `src/`, `DESIGN.md`, or
  anything else.
- **No commits.** The pages land in the working tree for Mitch to review.
- **Self-contained:** no outside network requests in the pages. Use relative paths to `../tokens.css`,
  `../fonts/`, `../pieces/` and `../brand/`.
- **Rendering:** Claude Code will render the pages to PNGs in a browser, because your sandbox can't run
  a browser.
