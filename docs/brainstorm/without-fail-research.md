# What could "without fail" mean? Research for decision 14

Gathered 2026-10-22 by a Claude research agent for Mitch's open question in decision 14.
Nothing here is decided. Confidence: High = primary source, Medium = secondary, Low = inference.

## What existing trainers do

- **Chessable (MoveTrainer).** Each move has its own review timer: about 4 hours, 1 day,
  3 days, 1 week, 2 weeks, 1 month, 3 months, 6 months (levels 1 to 8). A wrong answer resets
  the timer to a shorter interval; how far it drops isn't documented. There is no "mastered"
  threshold. (High on the table, Low on the drop rule.)
  [support.chess.com](https://support.chess.com/en/articles/10319322-how-does-the-spaced-repetition-scheduling-work)
- **Listudy.** Each move is a card in a Leitner system: right moves it up, a mistake resets it to
  zero. No published intervals. (High) [listudy.org](https://listudy.org/en/blog/spaced-repetition-for-chess)
- **Chessbook.** Schedules per move, so one miss doesn't send you back through a whole line, and an
  allowed alternative isn't a failure. No published intervals. (Medium)
  [64squares review](https://64squares.substack.com/p/chessbook-review)
- **Chess Tempo, Anki chess decks.** No published mastery rule found. (Low)

**Pattern:** nobody defines "mastered"; they only schedule reviews. A mistake resets the one
move, not the whole line.

## FSRS

A modern memory model (MIT licensed). `ts-fsrs` 5.4.2 runs in the browser, about 15 KB gzipped.
It's sensible per move, but it optimizes how much you remember, it doesn't certify anything, and
its intervals are hard to explain to a club coach. Fits long-term maintenance better than a
"without fail" gate. (High on facts, Low on fit)
[ts-fsrs](https://github.com/open-spaced-repetition/ts-fsrs)

## Learning science

Rawson and Dunlosky's successive-relearning work, via secondary summaries (Medium):

- One correct recall in each of three spaced sessions gave about 68% recall a week later; three
  correct recalls in a single session gave about 26%.
- The system, not the learner, should decide when something is learned: letting students drop
  items themselves didn't help.
- Example spacing: 1, 3, 8, 10, 15 days. A 2022 review notes part of the effect is extra exposure.

[retrievalpractice.org](https://www.retrievalpractice.org/archive/2018/successive-relearning) ·
[Current Directions review](https://journals.sagepub.com/doi/full/10.1177/09637214221100484)

## Options for an 8-move line, stored only in the browser

| | Rule | Stored | Trade-off |
|---|---|---|---|
| A. Three-day streak | A position is secure after correct, unprompted answers on 3 separate days (gaps of at least 1 and then 3 days). A miss resets it. The line is done when every position is secure. | streak, last correct date, misses | Matches the research, easy to explain. Takes about a week at least; no long-term re-test. |
| B. Ladder | Chessable-style levels at 4 h, 1 d, 3 d, 1 w. Mastered at level 4; a miss drops two levels. The line is done when all positions reach level 4 and one clean run passes. | level, due date, last result | Familiar to Chessable users; extends to monthly upkeep. More state, and the drop rule needs tuning. |
| C. Positions plus whole-line runs | Option A for each position, plus 2 flawless runs of the whole line on separate days before alternatives unlock. | A's fields plus dates of clean runs | Tests playing the line in order, which matches "execute the line". Costs the most student time. |

The researcher recommends **C**, as the only option that tests the line as a whole, with FSRS only
later for upkeep. That's the researcher's view, not a decision.
