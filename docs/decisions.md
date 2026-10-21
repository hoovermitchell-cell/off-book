# Decisions

Product decisions from the planning grill on 2026-10-21 (Claude Code session,
Mitch deciding each question). Only what Mitch said is recorded as decided.
Quotes are his words. Research behind each fork:
[research/2026-10-21-research.md](research/2026-10-21-research.md).

## Who and why

Mitch was asked to do AI work for his wife's school, which has a strong chess
program (middle and high school). The app is for those students first and
should be useful to anyone, Mitch included: "at the very least I can use this
for my own personal growth."

## Decided

| # | Question | Decision |
|---|---|---|
| 1 | What is the app at its center? | A blend of a full trainer and "your games are the curriculum": "they should be able to train new openings, and then review how they performed when they took them to a real competition for additional analysis." |
| 1b | Where do competition games come from? | Online import (Lichess, Chess.com) plus board entry or PGN paste for over-the-board games. Scoresheet photo transcription is a named later layer. |
| 2 | Primary user | "Student first. Coach view is a later, read-only summary." |
| 3 | Where progress lives | "Device only in v1, with a backup/restore file. Sync code comes with the coach view." |
| 4a | Maia | Included in v1: "I think it's worth it." Chromebook performance and believability below 1100 are checked in the spike, not a gate on the decision. |
| 4b | Explanations | Pre-written, Mitch-reviewed text for opening lessons; templates for game review; live LLM later. "Keep things deterministic where we can get away with it, we can always make this more and more robust over time." Jev (TypeSafe AI) noted as a candidate for the later layer. |
| 4c | Teaching how the AI works | "Light under-the-hood panels behind a 'How did it know?' button, using numbers the engines already produce." |
| 5 | Gamification | "Repertoire as a collection: lines level up from drilling, earn battle records from real games. Effort-based, weekly rhythm." |
| 6 | Home and license | "Its own public repo, AGPL-3.0, scaffolded with project-start; source link in the app." |
| 7 | Puzzles | Opening-linked to start (Lichess puzzles filtered to the openings in the student's collection). "We may expand later, presumably to further lichess puzzling." |
| 8 | v1 cut | Approved as listed below. Openings: London System for White, Caro-Kann for Black. |
| 8b | Own-game puzzles | "Own-game puzzles are later; v1 puzzles are the opening filter only." |
| 9 | First spike | "Combined spike: one London line, Maia likely-replies + Stockfish judge, level meter, run on a school Chromebook with those pass bars." Plan: [plans/2026-10-21-spike-london-drill.md](plans/2026-10-21-spike-london-drill.md). |
| 10 | Name | "Off Book. Repo slug off-book." GitHub search found no chess projects with that name; trademark and app-store check still to do before going public. |

## v1 scope

**In**

1. Opening library: London (White) and Caro-Kann (Black), with pre-written
   explanations Mitch reviews. Lichess `chess-openings` (CC0) for names and
   recognition.
2. Collect and drill: per-move spaced repetition; Maia's likely replies at the
   student's rating decide what gets drilled first.
3. Sparring against Maia at the student's rating.
4. Game import by Lichess or Chess.com username; board entry or PGN paste for
   over-the-board games.
5. Review: Stockfish in the browser, where the student left prep and who deviated
   first, template explanations, "How did it know?" panels.
6. Collection: lines level up from drilling, battle record from real games,
   weekly goal.
7. Opening-linked puzzles from the Lichess puzzle database (CC0).
8. Progress in the browser, backup/restore file, source link in the footer.

**Later** (deferred, not rejected)

- Scoresheet photo transcription
- Sync code and the read-only coach view
- Live LLM explanations (Jev a candidate)
- Puzzles cut from the student's own games
- Broader Lichess puzzles
- Cosmetic unlocks
- An AI lessons section
- Shared leaderboards: impossible while progress is device-only; whether they
  return with the coach view is undecided

**Rejected for v1**

- Online-only import (misses over-the-board tournaments)
- Stockfish-only sparring (weakened Stockfish doesn't play like a 1000)
- Live LLM explanations
- Google sign-in or accounts
- Living inside the private `vibe-games` repo
- A standalone puzzle mode

## Still open

- Whether solving opening-linked puzzles also levels up the line (raise when the
  collection screen is designed)
- School facts: club or class, size, grades, devices, existing accounts, access
  to a Chromebook for the spike
- Whether any stored data (later sync code) needs an NC DPI data agreement; ask
  the school before building the coach view
