# Talk demo

Prepared progress for showing the later stages at the talk (decision 14c).

1. **Restore from file**, pick `off-book-demo.json`. The London rail then shows Textbook
   **Proven**, ...Nc6 and ...Bf5 **Cleared**, ...e6 and early ...Bd6 **Learning** with moves due,
   and the last two lines locked. The Caro-Kann's Classical line is part-way through Learning.
2. **Review a game**, **Paste a PGN**, paste `game.pgn`. It follows the ...Nc6 and ...Bf5 line
   until Black leaves book with 5...h6, so the review marks that line **Proven**.

Restoring replaces this browser's progress. Back up first if it matters.

`src/demo.test.ts` builds both files from the real staged lines and fails if they drift.
Regenerate with `WRITE_DEMO=1 npm test -- demo`.
