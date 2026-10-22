# Brief for Codex: product brainstorm for Off Book

Read `AGENTS.md`, `DESIGN.md`, `docs/decisions.md`, `docs/research/2026-10-21-research.md`, and
`docs/review/staged-lines.md` if present. Then brainstorm. Do not edit code. Do not commit.

Off Book is a browser chess opening trainer for a US middle and high school chess club, built by a
parent volunteer. The loop: learn an opening, play it in real games, review how it held up. The
London drill exists; Caro-Kann, game import and review, puzzles, the collection, and a coach view
are decided but not built. Mitch decides everything; you are generating options for him.

Write `docs/brainstorm/codex-2026-10-22.md` (under 150 lines) with:
1. **Ten ideas** that would make students come back weekly, each fitting DESIGN.md's "Earned, not
   awarded" (no confetti, no streak guilt). One line each, then one line on why it fits.
2. **Five ways the review step could work** for over-the-board games entered by hand, given the
   student's staged lines and Stockfish/Maia in the browser.
3. **What a coach (read-only, no student data on a server) could see**, five options, each with what
   it needs stored and where.
4. **Three risks** you see in the current plan that nobody has named, each with a cheap test.
5. **Your top three**, from all of the above, and why.

Be concrete and plain. No em dashes. Mark anything that contradicts a recorded decision as such.
