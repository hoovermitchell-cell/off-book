# Backlog

`## Ready` is the trust boundary: items here run **unattended** through `cycle`
(plan → work → review → PR → green CI). Putting an item here is the approval.
Everything below waits for a human. Start the loop with the command in AGENTS.md.

## Ready

<!-- approved, scoped work — the loop drains these top to bottom -->

## Needs shaping

- Chromebook run of the real drill screen: load time on school Wi-Fi (about 15 MB gzipped: Maia model 10.8 MB, onnxruntime wasm 3.7 MB), Maia and Stockfish ms per move. Needs a public URL
- Mitch reviews the London tree's pinned lines (`src/data/london.ts`) and the 38 Stockfish-fallback positions in `london-auto.ts`
- Design the three-stage levelling from decision 14 (main line, alternatives, real matches)
- Fonts ship as TTF (Kalam 427 KB); subset to WOFF2
- Check "Off Book" for trademark and app-store conflicts, then publish as public GitHub repo `off-book` with an AGPL-3.0 LICENSE file and a source link in the app footer
- Ask the school: club size, grades, devices, which students have Lichess/Chess.com accounts, and whether a school Chromebook can be borrowed for the spike
- Set up CI (test + lint) so the loop has a green-gate to enforce
- Define this project's "done" gate beyond green CI, if any

## Done

- Combined spike (London drill, Maia replies, Stockfish judge): works on Mitch's PC, 2026-10-21
- Real build slice 1: drill screen on TS + Vite from DESIGN.md, 2026-10-21
