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
| 11 | London repertoire policy | "Cover Black's common replies widely; White stays system-first plus the two traps." The ...f6 trap (Qh5+, Qxe5+) and the Englund, where the lesson is 6.Nc3, not 6.Bc3?? |
| 12 | When prep ends | "When prep ends, keep playing vs Maia; Stockfish flags only real mistakes; round ends at a set move." Spike uses move 12 and a 100-point Stockfish drop as "real mistake"; both are tuning knobs. Whether play after prep counts toward the line's level is still open. |
| 12b | How long play continues | Replaces the set move in 12: "Play the game out to mate or resign; add a Resign button." Draws also end it. |
| 13 | Learning before testing | "Show-then-test per position: new moves are shown with their idea, you play them, then they're drilled hidden." Mitch: "we need an instructive mode before we're forcing 'prep'." |
| 13b | What the ideas say | "One idea per move idea (~25 texts): you draft, I review. Specific notes for the traps." Texts in `src/data/london-ideas.ts`. Mitch, 2026-10-22: "The idea texts are approved as drafted." |
| 14 | Levelling | "Off book doesn't count towards levelling." Progression, in Mitch's words: "can execute the main line without fail" then "can execute the alternative lines without fail" then "doing the same in real matches would be the final stage." Refines decision 5. Open: what counts as the main line, what "without fail" means, how Black's replies change per stage, what replaces the tally. |
| 14b | Line progression | Main line "literally be staged moves": Black plays fixed moves. Mitch: "introduce the lines that are likely to be encountered, and then maia kicks in once you've reached the end of the line progression." Order: "Textbook line first, then the likely alternatives in order of how often they're met." Textbook line: 1.d4 d5 2.Bf4 Nf6 3.e3 e6 4.Nf3 c5 5.c3 Nc6 6.Nbd2 Bd6 7.Bg3 O-O 8.Bd3. The staged alternatives list goes to Mitch for review. |
| 14c | What "without fail" means, and what replaces the tally | Grill on 2026-10-25, Mitch choosing each answer. **Ladder per move**, Chessable-style: rungs at 4 hours, 1 day, 3 days, 1 week; a move is secure at the 1-week rung. A miss (wrong first try, or looking at the hint) drops that move one rung, never the whole line. **Runs play the whole line**: the student plays every move in order; a correct move climbs only if it was due, a miss drops any move. Positions shared between lines share one ladder entry. **Unlocking**: the next staged line opens once every move of the current line has reached the 1-day rung. A line is **Cleared** when all its moves are secure and stays in review. **Real matches**: one reviewed game where the student played every prep move right until the opponent left book or the prep ran out marks the line **Proven**; later games add to its battle record. **Progress UI**: per-line status (Learning, Cleared, Proven) with one rung mark per move and a "due today" count. The 10-move tally and the global level go. Still open: whether in-prep moves during Maia sparring count as ladder reviews; the staged-lines list itself ([review/staged-lines.md](review/staged-lines.md)). For the talk, later stages can be shown by restoring a prepared backup. |
| 15 | Caro-Kann repertoire | Grill on 2026-10-23 over [review/caro-kann-lines.md](review/caro-kann-lines.md), Mitch choosing each answer. Textbook line: the Classical (3.Nc3 dxe4 4.Nxe4 Bf5), with the Exchange with Nf3 staged second, per 14b. Repertoire as drafted: ...Bf5 and ...e6 against the Advance; ...Nc6, ...Nf6 and the bishop out before ...e6 against the Exchange; 3...dxe4 and ...e5 against the Fantasy. Advance: stage Maia's 5.Bd3, answered 5...Bxd3 6.Qxd3 c5 (not the generator's 5...Ne7); 5.Be2 stays in the tree. Keep setup A (6...Rc8) with a trap note: after 7.Qf3 e6 8.g4 only ...Bg6 holds, 8...Be4?? 9.Qxf7#. Keep 5.Bd3 Qxd4 in the Classical. Depth: hand-pin 2.d3 to about move 6; 2.Nf3 and 2.Bc4 stay generated to move 8, then Maia. Idea texts: Mitch reviewed all of them the same day, in seven groups, and approved them with Claude's corrections (wrong claims about ...Ngf6, ...Ne7, ...Nf6 and the Fantasy fixed, filler cut). 4.g4 in the Advance is now 4...Be4 5.f3 Bg6. |

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
