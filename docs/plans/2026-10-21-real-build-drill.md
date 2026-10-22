# Real build, slice 1: the drill screen

Mitch, 2026-10-21: "Start the real build (TS + Vite) with the drill screen
designed from DESIGN.md." The spike stays as a reference; nothing new goes in it.

## Slice

The London drill from the spike, rebuilt as the first screen of the real app:
prep from the tree, Black from Maia, Stockfish judging, off-book play to the
finish (decisions 11, 12, 12b), level tally, and the "How did it know?" panel
(decision 4c). Not in this slice: Caro-Kann, spaced repetition, collection,
import, review, puzzles, backup file, binder tabs. Tabs come when a second
section exists; a tab that goes nowhere is worse than none.

## Structure

- Repo root is the Vite + TS app (`npm run dev`). `scripts/assets.mjs` copies
  the Stockfish and onnxruntime wasm files and downloads the Maia model into
  `public/` (gitignored).
- `src/chess/`: Maia encoding and ONNX runner, UCI engine client, Stockfish worker.
- `src/data/`: the London tree (pinned lines plus generated `london-auto.ts`).
- `src/drill/drill.ts`: the drill as a DOM-free state machine with injected
  engine and Maia, emitting events. Unit-tested with fakes.
- `src/ui/`: the drill screen. Renders from drill events; owns no chess rules.
- Design comes straight from `design/tokens.css` and `design/board.css`
  (imported, not copied), so DESIGN.md stays the single source.

## Drill screen (Extend mode on DESIGN.md)

- **Visual thesis:** the binder sheet beside a tournament board. Board first
  and largest, one paper sheet to its right holding everything else, ink on
  cool paper, highlighter only for prep.
- **Content, top to bottom on the sheet:** what to do now (one line, the
  fix for "I didn't even realize there were instructions"); the latest
  verdict as a glyph row with its number; the scoresheet with book moves
  highlighted and glyphs on judged moves; the level tally; opponent rating;
  actions (How did it know?, Resign, New game). A Kalam margin note carries
  coach-style lines only ("You're off book now. Play it out.").
- **States:** loading engines, your move (prep), checking, Black thinking,
  off book, game over (won, lost, draw, resigned), level-up.
- **Motion:** piece slide 150 ms, glyph ink-in 120 ms, level stamp 400 ms
  once. Nothing else. Reduced motion makes all of them instant.
- **Floor:** keyboard move entry (type a move, e.g. `Nf3`) plus moves
  announced in a live region; 44 px targets; fits 1366x768 without scrolling;
  AA contrast; never color alone (glyphs carry meaning).

## Verify

`npm test`, `npm run build`, browser pane at 1366x768 (and 1440, 768 wide),
keyboard-only run, a scripted full game, screenshots for Mitch.
