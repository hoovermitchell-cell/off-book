# Staged lines: proposal for Mitch's review

Decision 14b: the textbook line first, then the likely alternatives in order of how often
they're met, all staged (Black plays fixed moves). Maia takes over once they're cleared.

How this was made: `spike/staged-lines.mjs` takes each point where Black most often leaves
a line, follows Black's most likely replies through the prep tree to move 8, and ranks the
result by how often a club player meets it. "How often" is Maia's probability averaged over
ratings 800, 1000, 1200 and 1400. Nothing here is decided.

## The finding that shapes this

The alternatives collapse into a few **setups**. Different move orders by Black reach the
exact same position by move 8, which I checked position by position:

| Setup | Black's move orders that reach it | Met in |
|---|---|---|
| A. ...Nc6 and ...Bf5 | 1...Nf6, 1...Nc6, 2...Nc6, 3...Nc6 | about 37% of games |
| B. ...e6 and early ...Bd6 | 1...e6, 2...e6, 4...Bd6 | about 20% |
| C. Early 2...Bf5 | 2...Bf5 | about 6% |
| D. 3...Bf5 after ...Nf6 | 3...Bf5 | about 2% |

The textbook line is met in full far less often than any of these at club level. That is
expected; it's still first, per 14b.

## Proposed staged lines, in order

1. **Textbook.** 1.d4 d5 2.Bf4 Nf6 3.e3 e6 4.Nf3 c5 5.c3 Nc6 6.Nbd2 Bd6 7.Bg3 O-O 8.Bd3
2. **Setup A, ...Nc6 and ...Bf5.** 1.d4 d5 2.Bf4 Nc6 3.e3 Nf6 4.Nf3 Bf5 5.Nbd2 e6 6.c3 Bd6 7.Bg3 O-O 8.Be2 Ne4
3. **Setup B, ...e6 and ...Bd6.** 1.d4 e6 2.Bf4 d5 3.e3 Nf6 4.Nf3 Bd6 5.Bg3 O-O 6.Bd3 Nc6 7.c3
4. **Setup C, early ...Bf5.** 1.d4 d5 2.Bf4 Bf5 3.e3 e6 4.Bd3 Bg6 5.Nf3 Nf6 6.c3
5. **Setup D, ...Bf5 after ...Nf6.** 1.d4 d5 2.Bf4 Nf6 3.e3 Bf5 4.Bd3 Bxd3 5.Qxd3 e6 6.Nf3 Bd6 7.Bg3

## Questions for you

1. **Move orders.** Setup A is reached four ways. Stage each move order as its own line, or
   stage one line per setup and let Maia's stage cover the other move orders?
2. **How many.** Five lines cover the setups met in roughly two thirds of club games. Keep
   five, trim to the top three, or add more (the King's Indian ...g6 setups are next)?
3. **Moves to check.** In setup A, White plays 8.Be2 rather than 8.Bd3, because Black's
   bishop on f5 covers d3. In setup C, 4.Bd3 is met by 4...Bg6 rather than a trade. Both
   come from the generator, not a hand-pinned line.
