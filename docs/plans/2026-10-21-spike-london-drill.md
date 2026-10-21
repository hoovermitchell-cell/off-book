# Spike: one London line, Maia replies, Stockfish judge, level meter

Decision 9 in [../decisions.md](../decisions.md). Throwaway code; ugly is fine.

## What it proves

1. **Tech:** Maia and Stockfish run well enough in a browser on a school
   Chromebook.
2. **Believability:** Maia at 800 to 1000 plays replies a real player at that
   level would play.
3. **Fun:** drilling against likely replies, with a level meter, makes someone
   want a second round.

## Pass bars (Mitch's)

| Bar | Target | How measured |
|---|---|---|
| Load | about 10 s or less on school Wi-Fi | on-screen timer from navigation start to "ready" |
| Maia reply | under about 1 s | on-screen inference ms per move |
| Believable at 800 to 1000 | Mitch judges by playing | sanity check: step 7 |
| Second round | Mitch, ideally a student or two, ask for another go | observation |

**If Maia fails tech or believability below 1100:** stop and bring it back to
Mitch. The fallback on the table is Stockfish sparring for the lowest ratings.
Nothing else in v1 changes.

## Shape

- `spike/index.html`, no build step. Libraries vendored into `spike/vendor/`:
  - `chess.js` (BSD-2) for move legality.
  - `chessground` (GPL-3.0) for the board.
  - `stockfish.js` v19 **lite single-threaded** build (about 1.7 MB, no
    COOP/COEP headers needed).
  - `onnxruntime-web` plus the Maia-3 **5M fp16** ONNX model (about 10.8 MB,
    AGPL, unofficial export: huggingface.co/bqrio/maia3-onnx).
- Served by any static file server (`npx serve spike`). Checked first in the
  Claude Code browser pane, then on a school Chromebook.

## Steps

1. **Pin Maia's input and output.** Read the maia3-onnx model card and the
   Maia-3 repo (github.com/CSSLab/maia3) for the board encoding, the Elo inputs
   (self and opponent), and the policy output's move indexing. Write
   `maiaMoves(fen, eloSelf, eloOppo)` that returns legal moves with
   probabilities.
   - Check: at the start position with Elo 1100, the top moves are e4, d4 and
     Nf3, with probabilities that sum to about 1 over legal moves.
   - If the encoding can't be pinned from the docs and code, stop and report.
     This is the spike's main kill risk.
2. **Stockfish in a Web Worker.** `evaluate(fen, ms)` returns centipawns
   (White's view) and the best move.
   - Check: after 1.e4 e5 2.Qh5 Nc6 3.Bc4 Nf6, Qxf7# is found as mate.
3. **London repertoire tree.** JSON in the page. For each of Black's 2 or 3
   most likely Maia replies at 1000, White's prep move, to about move 8.
   Moves come from standard London setups (d4, Bf4, e3, Nf3, c3, Nbd2, Bd3,
   h3) adapted to Black's choices. Claude drafts it and Mitch reviews it
   (decision 4b) before the spike is played for real.
4. **Drill loop.**
   - The student plays White, with a rating slider from 600 to 1800 (default
     1000).
   - Black's reply is sampled from `maiaMoves` at the slider rating, not
     always the top move, so the student sees realistic variety.
   - **Student plays the prep move:** mark it correct and count a rep on that
     node.
   - **Student plays something else:** Stockfish compares it with the prep move.
     - Loss under 50 cp: "Playable, but not your prep."
     - Otherwise: "Mistake."
     - Either way, show the prep move and let the student retry.
   - **Maia plays a reply that isn't in the tree:** "Your prep ends here," then
     show Stockfish's suggested move. The round ends.
5. **Level meter.** One bar for the line. Each correct node fills it, and the
   line levels up every 10 correct nodes. Show the level number and a short
   level-up moment. No persistence beyond `localStorage`.
6. **Timing readout.** Small on-screen panel: page load to ready, Maia ms per
   move, Stockfish ms per judgement, user agent.
7. **Believability sanity check (offline, optional).** For 3 or 4 positions in
   the tree, compare Maia's 900 distribution with Lichess's
   opening-explorer stats for players rated about 800 to 1000. The explorer
   needs a token now, so run this as a local script with Mitch's personal
   token, never in the page.

## Done when

- Steps 1 to 6 run end to end locally with no console errors.
- The timing panel shows numbers from Mitch's machine.
- Mitch has played it, and the Chromebook run is scheduled or done. The
  Chromebook run needs the school; it is the one bar this repo can't close
  alone.

## Status, 2026-10-21 (Claude Code)

Steps 1 to 6 built and running locally; step 7 not run. Run it:

    cd spike && npm install && npm run model && npm start   # http://localhost:5180

- **Maia encoding pinned** from the upstream source (`maia3/dataset.py`, `utils.py`,
  `models.py`): see the header of `spike/maia.js`. Elo is raw, clamped 0 to 5000
  and interpolated, so 600 to 1000 is accepted; whether it's believable there is
  still Mitch's call. `node check-maia.mjs` passes. Sample: after 1.d4 d5 2.Bf4,
  Maia at 900 plays ...Nc6 33%, ...Nf6 20%, ...e6 16%, ...Bf5 12%, ...f6 6%; at
  1800 it shifts to ...Nf6 30%, ...e6 24%.
- **Stockfish wrapper** (`spike/engine.js`): `node check-engine.mjs` passes (mate
  found from both sides, score sign correct). Stockfish 19 scores are
  win-probability normalized (100 = about 50% win chance), so a hung bishop reads
  about 6.6, not 3. UI copy avoids "pawns".
- **London tree** (`spike/london.js`): 25 lines, 64 White-to-move positions,
  transpositions handled by position key. `node check-london.mjs`: every prep move
  within 60 cp of Stockfish's best at 400 ms. **Needs Mitch's review.**
- **Measured on Mitch's PC, Claude Code browser pane:** load to ready 1.2 to 1.5 s,
  Maia 125 to 190 ms per move, Stockfish judgement about 600 ms (two 300 ms
  searches), single-threaded. No console errors. Chromebook numbers still to come.
- Design gate (design-lead) skipped on purpose: throwaway programmer-art page. The
  design pass belongs to the real build.

## Not in the spike

Spaced-repetition scheduling, the Caro-Kann, game import, review, puzzles,
"How did it know?" panels, backup file, styling, and anything TypeScript or
Vite. Those belong to the real build once the spike passes.
