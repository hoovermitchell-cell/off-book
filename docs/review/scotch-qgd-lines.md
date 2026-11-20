# Batch 3: Scotch and Queen's Gambit Declined, coverage matrix

Decision 16, batch 3. Under the refinement loop (Mitch, 2026-10-25), Claude writes this matrix and keeps
going; Mitch reviews it with the texts at the PR. Data: `src/data/scotch.ts` and `src/data/qgd.ts` (pinned
lines), their `-auto.ts` trees, and their `-ideas.ts` texts.

The Scotch is an alternative to the Italian, and the QGD is an alternative to the Slav: the student picks one
on each side. The plan says each batch-3 opening reuses a previous batch; the counts are in "Reuse" below,
and they came out unevenly (the Scotch reuses a lot, the QGD very little).

## Scotch (White)

The drill forces 1...e5, as the Italian does. After 2.Nf3 Nc6 the Scotch plays 3.d4 where the Italian plays
3.Bc4. Against everything else after 1.e4 the Scotch uses the Italian's answers, move for move. Per the
plan: avoid the Scotch Gambit (4.Bc4), prefer the quiet main lines.

| Black plays | Our answer | Stops at | Teaching point | Left out |
|---|---|---|---|---|
| 3...exd4 4.Nxd4 Bc5 (Classical) | 5.Be3 Qf6 6.c3 Nge7 7.Bc4 | 7.Bc4 | Guard the knight on d4 (Be3, then c3), then bishop out to c4 aiming at f7 | 5.Nxc6, 5.Nb3, 4.Bc4 (the Scotch Gambit) |
| 4...Nf6 (Mieses) | 5.Nxc6 bxc6 6.e5 Qe7 7.Qe2 Nd5 8.c4 | 8.c4 | e5 hits the knight and gains time; Qe2 holds e5; c4 hits the knight again | 5.Nc3 Bb4 (Four Knights shape) |
| 4...Nxd4 | 5.Qxd4, then the generator (mostly Nc3, Be3) | about move 8 | The queen centralizes and Black has no quick attack on it | Deep queen-trade lines |
| 3...Nxd4 | 4.Nxd4 exd4 5.Qxd4 | 5.Qxd4 | Take with the knight, then the queen | 4.Nxe5-type tries |
| 3...Nf6 | 4.dxe5 Nxe4 5.Qd5 | 5.Qd5 | Win a pawn; the queen hits e4 and f7 together | 4.Nc3 (trails by over 100cp), 4.d5 (Stockfish's pick, sharper) |
| 3...d6, 3...Bb4+, ... | Generator picks (4.h3 against 3...d6) | about move 8 | n/a | n/a |
| 2...d6 (Philidor) | 3.d4 exd4 4.Nxd4 Nf6 5.Nc3 Be7 6.Bc4 O-O 7.O-O | 7.O-O | Open the center and develop fast (reused from the Italian) | 3...Nf6 lines (generator) |
| 2...Nf6 (Petroff) | 3.Nxe5 d6 4.Nf3 Nxe4 5.d4 d5 6.Bd3. Trap: 3...Nxe4? 4.Qe2 Nf6?? 5.Nc6+ wins the queen | 6.Bd3 | Win the pawn back first (reused from the Italian, trap included) | 5.Nc3 lines |
| 2...Bc5 | 3.Nxe5, then Stockfish's picks | about move 7 | Take the pawn, then watch ...Qh4 (reused from the Italian) | n/a |
| 1...d5 (Scandinavian) | 2.exd5; against ...Qxd5, 3.Nc3 4.d4 5.Nf3 6.Bc4; against ...Nf6, 3.d4 4.Nf3 | move 6 | Develop with gain of time on the queen (starter route, reused) | 3...Qd6, 3...Qd8 |
| 1...e6 (French) | The Advance: 3.e5, then 4.c3 5.Nf3 6.a3 | 6.a3 | Build the chain and stop ...Qb6 and ...Bb4+ (starter route, reused) | Everything else |

The Blackburne Shilling trap does not apply: it needs 3.Bc4 first. The Petroff queen trap is the one
Italian trap that does, and it is reused with its note. Every other first move is a prep boundary at move
one, and Maia plays on.

## Queen's Gambit Declined (Black, against 1.d4)

The drill forces 1.d4. The textbook is the **Orthodox**, not the Exchange. Reasons: it is the main line Black
students meet when White plays 4.Bg5; its plan is easy to say (get solid, trade pieces, play ...e5); and it
carries the Elephant trap. The Exchange is a pinned answer to 4.cxd5, with the minority attack left to
the next round. ...e6 is the QGD's mark: it is the one place the Slav plays ...c6, so a Slav game and a QGD
game are never the same game after move two.

"Against 1.d4" covers the London and the quiet e3 and Colle setups, as the Slav does.

| White plays | Our answer | Stops at | Teaching point | Left out |
|---|---|---|---|---|
| 2.c4 e6 3.Nc3 Nf6 4.Bg5 (Orthodox) | 4...Nbd7 5.e3 Be7 6.Nf3 O-O 7.Rc1 c6 8.Bd3 dxc4 9.Bxc4 Nd5 10.Bxe7 Qxe7 11.O-O Nxc3 12.Rxc3 e5 | 12...e5 | Solid setup; take on c4 once Bd3 has been played; trade pieces to free the game | Cambridge Springs (5.e3 c6 6.Nf3 Qa5), 5.Bxf6 lines, Tartakower |
| Elephant trap: 5.cxd5 exd5 6.Nxd5?? | 6...Nxd5! 7.Bxd8 Bb4+ 8.Qd2 Bxd2+ 9.Kxd2 Kxd8 | 9...Kxd8 | White loses a knight for a pawn | n/a |
| 4.cxd5 (Exchange) | 4...exd5 5.Bg5 Be7 6.e3 c6 7.Bd3 Nbd7 8.Qc2 O-O 9.Nf3 Re8 10.O-O Nf8 | 10...Nf8 | The pawns are fixed; knights head for g6 or e6 | The minority attack and ...Ne4 plans |
| 4.Nf3, 4.e3, 5.Nf3, 3.cxd5 | Pinned: ...Be7 and the same setup | about move 7 | One plan for every move order | n/a |
| 2.Bf4 (London) | 2...Nf6 3.e3 e6 4.Nf3 Bd6 5.Bg3 O-O 6.Bd3 Nbd7 7.Nbd2 b6 | 7...b6 | Offer to trade White's best bishop | 2...c5 lines |
| 2.e3, 2.Nf3 (Colle) | 2...Nf6 3.Bd3 e6 4.Nf3 c5 5.c3 Nc6 6.Nbd2 Bd6 7.O-O O-O | 7...O-O | Hit d4 with ...c5 and ...Nc6 | Stonewall (generator) |
| 2.Nc3 | 2...Nf6 3.Nf3 e6 4.Bg5 Be7 5.e3 O-O 6.Bd3 Nbd7 7.O-O c6; against 3.Bf4, 3...e6 4.Nb5 Bd6 5.Bxd6 cxd6 | move 7 | Same pieces as the Orthodox by another route | 3.e4 gambits (generator) |
| 2.e4 (Blackmar-Diemer) | 2...dxe4 3.Nc3 Nf6 4.f3 exf3 5.Nxf3 e6 | 5...e6 | Accept, take again, and play solidly with ...e6 (the Slav's line plays ...Bf5) | Other 5th moves |
| 2.Nf3 e6 3.g3, 3.Bg5, others | Generator picks; most transpose | about move 8 | n/a | n/a |

Only 1.d4 is covered. 1.c4 and 1.Nf3 are not claimed.

One generator limit: it follows only the replies Maia plays at least 8% of the time, and 2.c4 is not one of
them (under 8% at 800, 1200 and 1600). The 2.c4 branches are therefore pinned lines, not generated, so a student on the
Orthodox who meets a White move outside them is off book.

## Reuse

Counted from the trees. A position counts as reused when the other tree has the same position with the same
prep move.

**Scotch against the Italian.** 456 prep positions in the Scotch tree.

| | Positions |
|---|---|
| Same position, same move as the Italian | 326 (71%) |
| Same position, different move (2...Nc6: 3.d4 against 3.Bc4) | 1 |
| New to the Scotch | 129 |
| Italian-only (the Bc4 lines) | 153 of 480 |

The 326 were not re-run: the generator reused the Italian's picks (`KEEP=1` over a copy of its entries
for every line off 2...Nc6) and the Italian's pinned routes were copied into `scotch.ts`. That is also why
the tree carries the Italian's Stockfish fallbacks: 194 in all, 133 of them copied and 61 new.

Texts: 324 of the Scotch's 454 positions that show a text use the Italian's text as it is (63 distinct
Italian texts, 52 of them shown nowhere else in the Scotch). 130 positions use texts written for the
Scotch: 25 static texts (13 notes for exact moments, the rest per-move) plus phrases built from the
position (such as "Be3 develops the bishop and guards the knight on d4").

**QGD against the Queen's Gambit (and the Slav).** 259 prep positions in the QGD tree.

| | Positions |
|---|---|
| Also a position the QG tree reaches after one of its own prep moves | 12 (5%) |
| QG tree positions that lie on a QGD line | 13 of 488 |
| Same position as the Slav tree | 24, with the same move at 10 |

This is much less than the plan expected. The reasons: the QG tree's White moves come from Mitch's pins
and the generator, the QGD tree's White moves come from Maia, and Maia plays 2.Nf3, 2.Nc3 and 2.e3 far
more than 2.c4, so the QGD tree is mostly 1.d4 d5 without 2.c4, where the QG tree stops. No engine work
carried over. The 10 positions the QGD shares with the Slav with the same move are all the first move of a
setup (1...d5 and the first knight move against the London, Colle and Blackmar-Diemer), where the two Black
openings agree before parting at ...e6 or ...c6.

Texts: 9 of the QGD's 38 distinct texts have the same wording as one in another opening (5 in the Slav,
3 in the Queen's Gambit, and the generic "Answer the check" and Stockfish notes). None of the Orthodox,
Elephant, Exchange or London notes could be reused, since they describe Black's side of the move.

## Staged lines

Ranked by `spike/staged-lines.mjs`: the textbook line, then each place the opponent leaves it, with Maia's
probability averaged over ratings 800, 1000, 1200 and 1400 times the chance of reaching that position. The
percentage is how often a club player reaches the deviation, not the whole line. Output as run on the final
trees, top 24. Both runs treat only the first White move as given, so the Scotch's starter routes rank by
their share of all games, as in the Italian.

Scotch (White)

```
Textbook: 1.e4 e5 2.Nf3 Nc6 3.d4 exd4 4.Nxd4 Bc5 5.Be3 Qf6 6.c3 Nge7 7.Bc4
 1. 2...d6     12.2%  1.e4 e5 2.Nf3 d6 3.d4 exd4 4.Nxd4 Nf6 5.Nc3 Be7 6.Bc4 O-O 7.O-O c5 8.Nf5 Bxf5
 2. 1...d5     12.1%  1.e4 d5 2.exd5 Qxd5 3.Nc3
 3. 1...e6      7.9%  1.e4 e6 2.d4 d5 3.e5 c5 4.c3 Nc6 5.Nf3
 4. 2...Nf6     6.2%  1.e4 e5 2.Nf3 Nf6 3.Nxe5 Nxe4 4.Qe2 d5 5.d3 Nf6 6.Nc6+ Qe7 7.Nxe7 Bxe7 8.c3 O-O
 5. 4...Nxd4    4.8%  1.e4 e5 2.Nf3 Nc6 3.d4 exd4 4.Nxd4 Nxd4 5.Qxd4 Nf6 6.Nc3 d6 7.Be3 c5 8.Bb5+ Bd7
 6. 2...Bc5     4.3%  1.e4 e5 2.Nf3 Bc5 3.Nxe5 Qf6 4.d4 Bb6 5.Bc4 Nh6 6.Bxh6 gxh6 7.Nc3
 7. 3...d6      3.3%  1.e4 e5 2.Nf3 Nc6 3.d4 d6 4.h3 exd4 5.Nxd4 Nxd4 6.Qxd4 Nf6 7.Nc3 c5 8.Bb5+ Bd7
 8. 2...Nf6     2.3%  1.e4 d5 2.exd5 Nf6 3.d4 Nxd5 4.Nf3
 9. 3...Nc6     2.0%  1.e4 e5 2.Nf3 d6 3.d4 Nc6 4.h3 exd4 5.Nxd4 Nxd4 6.Qxd4 Nf6 7.Nc3 c5 8.Bb5+ Bd7
10. 3...Bg4     1.8%  1.e4 e5 2.Nf3 d6 3.d4 Bg4 4.Bc4 Bxf3 5.Qxf3 Nf6 6.dxe5 dxe5 7.Qb3 Qe7 8.Qxb7 Qb4+
11. 3...Qe7     1.8%  1.e4 e5 2.Nf3 Nf6 3.Nxe5 Qe7 4.d4 Nxe4 5.Bd3 d6 6.O-O dxe5 7.Bxe4 exd4 8.Re1 Be6
12. 3...Nf6     1.4%  1.e4 e5 2.Nf3 Nc6 3.d4 Nf6 4.dxe5 Nxe4 5.Qd5 Nc5 6.Nc3 d6 7.Bb5 Bd7 8.Bg5 Be7
13. 3...f6      1.2%  1.e4 e5 2.Nf3 d6 3.d4 f6 4.Bc4 Nc6 5.c3 Bg4 6.O-O
14. 4...Nf6     1.2%  1.e4 e5 2.Nf3 Nc6 3.d4 exd4 4.Nxd4 Nf6 5.Nxc6 bxc6 6.e5 Nd5 7.Nc3 Nxc3 8.bxc3 Bc5
15. 3...Nf6     1.2%  1.e4 e5 2.Nf3 d6 3.d4 Nf6 4.Nc3 exd4 5.Qxd4 Nc6 6.Bb5 Bd7 7.Qd3 Be7 8.Bf4 O-O
16. 5...d6      1.0%  1.e4 e5 2.Nf3 Nc6 3.d4 exd4 4.Nxd4 Nxd4 5.Qxd4 d6 6.Nc3 Nf6 7.Be3 c5 8.Bb5+ Bd7
17. 3...Nxd4    0.9%  1.e4 e5 2.Nf3 Nc6 3.d4 Nxd4 4.Nxd4 exd4 5.Qxd4 Nf6 6.Nc3 d6 7.Be3 c5 8.Bb5+ Bd7
18. 3...d6      0.9%  1.e4 e5 2.Nf3 Nf6 3.Nxe5 d6 4.Nf3 Nxe4 5.d4 d5 6.Bd3
19. 4...Nf6     0.8%  1.e4 e5 2.Nf3 Nc6 3.d4 d6 4.h3 Nf6 5.Nc3 exd4 6.Nxd4 Nxd4 7.Qxd4 c5 8.Bb5+ Bd7
20. 3...d6      0.7%  1.e4 e5 2.Nf3 Bc5 3.Nxe5 d6 4.Nf3 Nf6 5.c3 Nxe4 6.Qa4+ Bd7 7.Qxe4+
21. 5...c5      0.7%  1.e4 e5 2.Nf3 Nc6 3.d4 exd4 4.Nxd4 Nxd4 5.Qxd4 c5 6.Qe3 Nf6 7.Nc3 d6 8.Be2 Be7
22. 3...Qh4     0.7%  1.e4 e5 2.Nf3 Bc5 3.Nxe5 Qh4 4.d4 Qxe4+ 5.Be3 Bb4+ 6.c3 Bd6 7.Nd2 Qf5 8.Bd3 Qf6
23. 4...c5      0.6%  1.e4 e5 2.Nf3 d6 3.d4 exd4 4.Nxd4 c5 5.Nf3 Nf6 6.Nc3 Nc6 7.Bc4
24. 5...b6      0.5%  1.e4 e5 2.Nf3 Nc6 3.d4 exd4 4.Nxd4 Nxd4 5.Qxd4 b6 6.Nc3 Bb7 7.Be3 Bc5 8.Qxg7 Qf6
```

QGD (Black)

```
Textbook: 1.d4 d5 2.c4 e6 3.Nc3 Nf6 4.Bg5 Nbd7 5.e3 Be7 6.Nf3 O-O 7.Rc1 c6 8.Bd3 dxc4 9.Bxc4 Nd5 10.Bxe7 Qxe7 11.O-O Nxc3 12.Rxc3 e5
 1. 2.Nf3      23.1%  1.d4 d5 2.Nf3 e6 3.e3 Nf6 4.Bd3 c5 5.c3 Nc6 6.Nbd2 Bd6 7.O-O O-O 8.Re1
 2. 2.Nc3      22.1%  1.d4 d5 2.Nc3 Nf6 3.Nf3 e6 4.Bg5 Be7 5.e3 O-O 6.Bd3 Nbd7 7.O-O c6 8.Ne5
 3. 2.e3       20.2%  1.d4 d5 2.e3 Nf6 3.Nf3 e6 4.Bd3 c5 5.c3 Nc6 6.Nbd2 Bd6 7.O-O O-O 8.Re1
 4. 2.Bf4      13.4%  1.d4 d5 2.Bf4 Nf6 3.e3 e6 4.Nf3 Bd6 5.Bg3 O-O 6.Bd3 Nbd7 7.Nbd2 b6 8.c3
 5. 3.Nc3       5.2%  1.d4 d5 2.Nf3 e6 3.Nc3 Nf6 4.Bg5 Be7 5.e3 O-O 6.Bd3 Nbd7 7.O-O c6 8.Ne5
 6. 3.Bg5       4.1%  1.d4 d5 2.Nc3 Nf6 3.Bg5 e6 4.Nf3 Be7 5.e3 O-O 6.Bd3 Nbd7 7.O-O c6 8.Ne5
 7. 3.Bf4       4.1%  1.d4 d5 2.Nc3 Nf6 3.Bf4 e6 4.Nb5 Bd6 5.Bxd6 cxd6 6.e3 O-O 7.Nf3 Nc6 8.Bd3
 8. 3.Bf4       3.7%  1.d4 d5 2.Nf3 e6 3.Bf4 Nf6 4.e3 Bd6 5.Bg3 O-O 6.Bd3 Nbd7 7.Nbd2 b6 8.c3
 9. 3.Nc3       3.4%  1.d4 d5 2.e3 Nf6 3.Nc3 e6 4.Nf3 Be7 5.Bd3 O-O 6.O-O Nbd7
10. 3.c4        3.3%  1.d4 d5 2.e3 Nf6 3.c4 e6 4.Nc3 Be7 5.Nf3 O-O 6.Bd3 dxc4 7.Bxc4 c5 8.O-O Nbd7
11. 3.Nf3       3.0%  1.d4 d5 2.Bf4 Nf6 3.Nf3 e6 4.e3 Bd6 5.Bg3 O-O 6.Bd3 Nbd7 7.Nbd2 b6 8.c3
12. 2.e4        3.0%  1.d4 d5 2.e4 dxe4 3.Nc3 Nf6 4.f3 exf3 5.Nxf3 e6
13. 3.Nc3       2.0%  1.d4 d5 2.Bf4 Nf6 3.Nc3 e6 4.Nb5 Bd6 5.Bxd6 cxd6 6.e3 O-O 7.Nf3 Nc6 8.Bd3
14. 3.e3        2.0%  1.d4 d5 2.Nc3 Nf6 3.e3 e6 4.Nf3 Be7 5.Bd3 O-O 6.O-O Nbd7
15. 3.Bd3       1.9%  1.d4 d5 2.e3 Nf6 3.Bd3 e6 4.Nf3 c5 5.c3 Nc6 6.Nbd2 Bd6 7.O-O O-O 8.Re1
16. 3.c4        1.8%  1.d4 d5 2.Nf3 e6 3.c4 Nf6 4.Nc3 Be7 5.e3 O-O 6.Bd3 dxc4 7.Bxc4 c5 8.O-O Nbd7
17. 3.f3        1.8%  1.d4 d5 2.Nc3 Nf6 3.f3 e6 4.e4 Be7 5.e5 Nfd7 6.f4 O-O
18. 3.Bg5       1.6%  1.d4 d5 2.Nf3 e6 3.Bg5 Nf6 4.e3 Be7 5.Bd3 O-O
19. 3.e4        1.6%  1.d4 d5 2.Nc3 Nf6 3.e4 Nxe4 4.Nxe4 dxe4 5.f3 c5 6.fxe4 Qxd4 7.Qxd4 cxd4 8.Nf3
20. 3.g3        1.4%  1.d4 d5 2.Nf3 e6 3.g3 Nf6 4.Bg2 Be7 5.O-O O-O 6.Nc3 Nbd7
21. 4.e3        1.3%  1.d4 d5 2.Nc3 Nf6 3.Nf3 e6 4.e3 Be7 5.Bd3 O-O 6.O-O Nbd7
22. 4.Bd3       1.3%  1.d4 d5 2.Bf4 Nf6 3.e3 e6 4.Bd3 Be7 5.Nf3 O-O 6.Nbd2 Nbd7
23. 4.Bf4       1.2%  1.d4 d5 2.Nc3 Nf6 3.Nf3 e6 4.Bf4 Be7 5.e3 O-O 6.Bd3 Nbd7 7.O-O c5 8.dxc5
24. 4.c4        1.2%  1.d4 d5 2.e3 Nf6 3.Nf3 e6 4.c4 Be7 5.Nc3 O-O 6.Bd3 dxc4 7.Bxc4 c5 8.O-O Nbd7
```

Chosen stages: the textbook plus four alternatives for each opening, in ranked order, one per distinct setup.
Every line ends on a student move and agrees with the tree (`levels.test.ts` checks that). Where the ranked line
runs past the last student move, it is cut there. All are `tier: 'intro'`.

Scotch

| Stage id | Line | Frequency | Note |
|---|---|---|---|
| `scotch-classical` | Textbook, 4...Bc5 | the textbook | Ends on 7.Bc4 |
| `scotch-philidor` | 2...d6 | 12.2% | The Italian's `philidor` line move for move. Cut after 7.O-O; the ranked line goes on to 7...c5 8.Nf5, a Stockfish pick |
| `starter-scotch-scandinavian` | 1...d5 | 12.1% | The Italian's pinned route (3...Qa5 4.d4 5.Nf3 6.Bc4), not the ranked line, which stops at 3.Nc3 because the tree has no reply to 3...Qd6 or 3...Qd8 |
| `starter-scotch-french` | 1...e6, the Advance | 7.9% | The pinned route, to 6.a3 |
| `scotch-petroff` | 2...Nf6 | 6.2% | The ranked line with 4...d5, cut after 8.c3. It does not run through the queen trap; the trap is in the tree |

Four of the five Scotch stages are the Italian's routes under new ids, because that is what the ranking
gives: the Scotch's own deviations are small. The best of them, 4...Nxd4, is next at 4.8%, then 3...d6
at 3.3%. If you would rather the stages teach the Scotch than the shared routes, `scotch-petroff` and
`starter-scotch-french` are the two to swap for 4...Nxd4 and 3...d6. Because positions and moves are the
same, a student who has learned the Italian's version of one of these lines has already earned the credit.
The `starter-` prefix is kept on the two route stages because `openings.test.ts` exempts that prefix from the
forced-reply check.

QGD

| Stage id | Line | Frequency | Note |
|---|---|---|---|
| `qgd-orthodox` | Textbook, Orthodox | the textbook | Ends on 12...e5. Rarely met: Maia plays 2.c4 under 8% of the time, which is why the textbook is first but not the most useful line |
| `qgd-colle` | 2.Nf3 or 2.e3, the Colle | 23.1% | Cut after 7...O-O. 2.e3 (20.2%, 3.Bd3 at 1.9%) reaches the same positions, so it shares this stage |
| `qgd-nc3-bg5` | 2.Nc3 and Bg5 | 22.1% | Cut after 7...c6. 3.Nc3 (5.2%) and 3.Bg5 (4.1%) from other move orders reach the same structure |
| `qgd-london` | 2.Bf4 | 13.4% | Cut after 7...b6. 3.Bf4 and 3.Nf3 from other orders (3.7%, 3.0%) share it |
| `qgd-nc3-bf4` | 2.Nc3 and Bf4 | 4.1% | The next ranked setup that no earlier stage covers. The ranked line is cut after 7...Nc6 |

Not staged, next by frequency: the Blackmar-Diemer 2.e4 (3.0%), then 2.e3 Nf6 3.c4 (3.3%, the Orthodox
structure reached by another route) and 3.f3 (1.8%).

## Engine check

`spike/check-tree.mjs` on both trees: Scotch 456 prep positions (194 Stockfish fallbacks, 133 of them copied
from the Italian), QGD 259 (26 fallbacks).

**Scotch.** The first pass found seven picks trailing by more than 60cp at 400 ms. Each was re-tested at
3 s.

| Position | 400 ms | 3 s | What I did |
|---|---|---|---|
| 3...Nf6 4.Nc3 (my own first pin) | 121cp | 114cp (best 4.d5) | Re-pinned 4.dxe5, which trails 18cp |
| 4...Nxd4 5.Qxd4 Nf6, 6.Nc3 | 82cp | 45cp | Noise, left |
| 4...Nxd4 5.Qxd4 Nf6 6.Nc3 d6 7.Be3 Be6, 8.Bc4 | 73cp | 60cp (Be2 is -2cp) | Pinned 8.Be2 |
| 2...Bc5 3.Nxe5 Qh4 4.d4 Qxe4+ 5.Be3 Bd6, 6.Nc3 (copied from the Italian) | 83cp | 61cp (best Qd2) | Inherited, left for the Italian's next round |
| 2...Bc5 3.Nxe5 Nf6 4.d4 Bb6 5.Bc4 Nxe4, 6.Bxf7+ (copied) | 94cp | 0cp | Noise |
| 2...Bc5 3.Nxe5 Qf6 4.d4 Bb6 5.Bc4 Nh6 6.Bxh6 gxh6, 7.Nc3 (copied) | 69cp | 21cp | Noise |
| Petroff 3.Nxe5 Nxe4 4.Qe2 Nf6 5.Nc6+ Qe7 6.Nxe7 Bxe7 7.c3 Nc6, 8.h3 (copied) | 64cp | 70cp (best d4) | Inherited, left for the Italian's next round |

I regenerated once with `KEEP=1`. After it, `check-tree.mjs` reports three picks over 60cp at 400 ms, all
copied from the Italian: the Petroff h3 above, plus 6.c3 in the Petroff with ...d6 (63cp at 400 ms, 46cp at
3 s, noise) and 6.Bc4 after 2...Bc5 3.Nxe5 d6 4.Nf3 Nf6 5.c3 Ng4 (62cp, 29cp at 3 s, noise). Nothing new
trails.

**Left for the next round, both inherited from the Italian:** the two picks above that stay over 60cp at 3 s
(Nc3 at 61cp after the ...Qh4 line, and h3 at 70cp in the Petroff). They are the same positions the Italian's
review listed. I did not change them here: they are in the Italian's tree too, so a fix has to land in both,
and it changes a move an Italian student may already have learned.

**QGD.** One pick over 60cp at 400 ms: ...c5 at 61cp after 1.d4 d5 2.Nc3 Nf6 3.e4 Nxe4 4.Nxe4 dxe4 5.f3 (best
...e5). At 3 s it trails 47cp, noise, left. The regenerate round I used was for four extra pinned lines (the
other 2.c4 move orders, see above), not for a trailing move.

Pinned lines were checked as well: the Orthodox textbook's moves lose 0 to 22cp each at 2 s, the Scotch
Classical and Mieses lines 0 to 11cp.

## Idea texts

The idea texts are drafted for review (decision 16, batch 3): `src/data/scotch-ideas.ts` and
`src/data/qgd-ideas.ts`, with their tests. Both give a note to every teaching point and trap in the matrix.
Each note's claim is played out in chess.js in the test file (the Elephant trap move by move, with the only
block to the check and the material count; the Classical's three attackers on d4; the Mieses' doubled c-pawns;
the Blackmar-Diemer extra pawn).

The generic texts that depend on the position ("Be3 develops the bishop and guards the knight on d4", "Bd6
faces the bishop on f4 and offers a trade", "Be7 breaks the pin") were each checked against the exact
position at every tree position that shows them, in a throwaway test (deleted). The first run found two
wrong claims in drafts: "Be3 develops the bishop" at two positions where the bishop comes from c5, and a
copied "exd5 opens the diagonal for your f8 bishop" that was false (exd5 opens c8's diagonal, not f8's).
Both were fixed before the tests were written.

## Opening detection

Registering the two openings changes what a game can match, so I measured it. For every game that stays in
the book of an existing opening (each pinned line plus each generated position's path and prep move), I
compared the old detection (without the two new openings) with the new:

| Opening | Games | Detected the same | Changed |
|---|---|---|---|
| London | 185 | 185 | none |
| Queen's Gambit | 423 | 423 | none |
| Caro-Kann | 300 | 300 | none |
| French | 292 | 292 | none |
| Slav | 175 | 171 | 4 go from "book" to "tie" (all are short, such as 1.d4 d5 2.e3 Nf6 3.Bb5+ Bd7) |
| Italian | 445 | 142 | 303 go from "book" to "tie" |

**No game changes its opening.** Where there is a tie, the first registered opening is named, and the Italian
and the Slav are registered before the Scotch and the QGD. The change is the "tie" mark, which tells the
student the game fits more than one opening and which earns no Proven until the student picks one (decision
16, step 0).

For the Italian this is not small. 303 of 445 Italian paths are a tie, because the Scotch reuses the
Italian's Philidor, Petroff, 2...Bc5 and starter routes move for move, so a game on those routes fits both.
The tie is correct (Italian and Scotch students both play those moves), but an Italian student who meets the
Philidor now sees "This game fits more than one opening equally" and has to pick the Italian in the review
before it can count toward Proven. This is the choice the reuse forces. I kept the reuse because the plan asks
for it and the Scotch needs those answers, and I left detection alone, because making a tie resolve silently
would credit one opening for a game that may have been the other.

Options if you want fewer ties, none built:
1. Break ties toward the opening currently selected in the drill (`loadOpening()` already stores it). It is
   one extra argument to `detectPrep`, but it is a rule change in plumbing.
2. Stop the Scotch reusing the Italian's routes that are not needed to teach it (the two starter routes and
   the Petroff). Cheaper to review, less to learn, and it removes about half the ties.
3. Leave it: the correction control is there for this.

Tests: nothing existing had to change to keep passing, but one assertion changed for accuracy
(`import.test.ts`, the username test: the Black ...d5 ...Nf6 against 2.Bf4 game now also says `prepFrom:
'tie'`, since the Slav and the QGD both answer it; its comment now names both). New tests cover the Scotch for
White, the QGD for Black, the Slav still reading as the Slav, the Italian still reading as the Italian, and the
shared-route tie.
