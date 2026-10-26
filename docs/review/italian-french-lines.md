# Batch 2: Italian and French, coverage matrix

Decision 16, batch 2. Under the refinement loop (Mitch, 2026-10-25), Claude writes this matrix and keeps
going; Mitch reviews it with the texts at the PR. Data: `src/data/italian.ts` and `src/data/french.ts`
(pinned lines), their `-auto.ts` trees, and their `-ideas.ts` texts.

## The re-pick

Decision 16 left batch 2 provisional until the tier pilot showed what a batch costs. Batch 1 and the
pilot each came in at one loop iteration. The expensive part was engine-checking sharp gambit branches
(the QGA), which the KEEP=1 and 3-second rules now contain. Nothing argues for changing the pair, so
batch 2 stays **Italian (White) + French (Black)**. The French is an alternative to the Caro-Kann, not
an addition to it: a Black student picks one.

**Italian starter routes, by decision 16's rule.** Maia's replies to 1.e4, averaged equally over 800,
1000, 1200 and 1400, are 1...e5 51.1%, 1...d5 12.1%, 1...e6 7.9%, 1...c5 5.4%, 1...Nc6 5.1%,
1...d6 4.6%, 1...Nf6 3.8% and 1...c6 3.7%. The top two non-...e5 replies are the Scandinavian and the
French, so those get starter routes.

## Italian (White)

The drill forces 1...e5. 1...d5 and 1...e6 get short starter routes. Every other first move is a prep
boundary at move one, and Maia plays on from there.

| Black plays | Our answer | Stops at | Teaching point | Left out |
|---|---|---|---|---|
| 2...Nc6 3...Bc5 (Giuoco Piano) | 4.c3 5.d3 6.O-O 7.Re1, and Bb3 against ...a6 | 8.Bb3 | The slow Italian: build with c3 and d3, then move the pieces | 4.b4 Evans, 4.d4 |
| 3...Nf6 (Two Knights) | 4.d3, then the same setup | 7.Re1 or 7.c3 | Quiet on purpose: the plan is the same as against ...Bc5 | 4.Ng5 and the Fried Liver |
| 3...Be7 (Hungarian) | 4.d3, then the same setup | 7.c3 | One plan for every quiet reply | 4.d4 |
| 3...Nd4 | 4.Nxd4 exd4 5.O-O | 5.O-O | Blackburne Shilling trap: 4.Nxe5?? Qg5 hits e5 and g2 | n/a |
| 2...Nf6 (Petroff) | 3.Nxe5 d6 4.Nf3 Nxe4 5.d4 d5 6.Bd3 | 6.Bd3 | Win the pawn back first. Trap: 3...Nxe4? 4.Qe2 Nf6?? 5.Nc6+ wins the queen | 5.Nc3 lines |
| 2...d6 (Philidor) | 3.d4 exd4 4.Nxd4 Nf6 5.Nc3 Be7 6.Bc4 | 7.O-O | Open the center and develop fast | 3...Nf6 lines (generator) |
| 1...d5 (Scandinavian) | 2.exd5; against ...Qxd5, 3.Nc3 4.d4 5.Nf3 6.Bc4; against ...Nf6, 3.d4 4.Nf3 | move 6 | Develop with gain of time on the queen | 3...Qd6 and 3...Qd8 (generator) |
| 1...e6 (French) | The Advance: 3.e5, then 4.c3 5.Nf3 6.a3 | 6.a3 | Build the chain, and stop ...Qb6 and ...Bb4+ from bothering it | Everything else |

## French (Black, against 1.e4)

The drill forces 1.e4. Every other first move is a prep boundary at move one.

| White plays | Our answer | Stops at | Teaching point | Left out |
|---|---|---|---|---|
| 3.Nc3 or 3.Nd2 | Rubinstein: 3...dxe4 4...Nd7 5...Ngf6 6...Nxf6 7...c5 | 9...O-O | One answer to both moves: free development, then ...c5 | Winawer and Classical, Tarrasch 3...c5 |
| 3.e5 (Advance) | 3...c5 4...Nc6 5...Qb6; against 6.Bd3, cxd4 and ...Bd7; against 6.a3, ...c4; against 6.Be2, ...Nh6 | move 7 | Hit d4, the base of the chain. Trap: after Bd3 cxd4 cxd4, ...Nxd4?? Nxd4 Qxd4 Bb5+ loses the queen | Milner-Barry gambit lines |
| 3.exd5 (Exchange) | 3...exd5 4...Bd6 5...Ne7 6...O-O | 6...O-O | A symmetrical structure: develop and castle | 4.c4 (generator) |
| 2.d3 (King's Indian Attack) | 2...d5 3...Nf6 4...c5 5...Nc6 6...Be7 7...O-O | 7...O-O | Take space on the queenside while White builds on the kingside | n/a |
| 2.Nf3, 2.Qe2, 2.f4, others | Generator picks; most transpose | about move 8 | n/a | n/a |

## Staged lines

Ranked by `spike/staged-lines.mjs`: the textbook line, then each place the opponent leaves it, with Maia's
probability averaged over ratings 800, 1000, 1200 and 1400 times the chance of reaching that position. The
percentage is how often a club player reaches the deviation, not the whole line. Output as run, top 24.

Both runs treat only 1.e4 as given, so the percentages are shares of all games, not of games that went 1...e5.
That is how the Italian's starter routes (1...d5, 1...e6) rank next to its own deviations. The script's second
round used to count the replies before a deviation twice (it started `reach` at the deviation's reach and then
multiplied again from move 1). Fixed in this batch; the round-1 output for the London and Caro-Kann is unchanged.

Italian (White)

```
Textbook: 1.e4 e5 2.Nf3 Nc6 3.Bc4 Bc5 4.c3 Nf6 5.d3 d6 6.O-O O-O 7.Re1 a6 8.Bb3
 1. 2...d6     12.2%  1.e4 e5 2.Nf3 d6 3.d4 exd4 4.Nxd4 Nf6 5.Nc3 Be7 6.Bc4 O-O 7.O-O c5 8.Nf5 Bxf5
 2. 1...d5     12.1%  1.e4 d5 2.exd5 Qxd5 3.Nc3
 3. 1...e6      7.9%  1.e4 e6 2.d4 d5 3.e5 c5 4.c3 Nc6 5.Nf3
 4. 3...Nf6     6.6%  1.e4 e5 2.Nf3 Nc6 3.Bc4 Nf6 4.d3 Bc5 5.c3 O-O 6.O-O d6 7.Re1 Bg4 8.Bb3 d5
 5. 2...Nf6     6.2%  1.e4 e5 2.Nf3 Nf6 3.Nxe5 Nxe4 4.Qe2 d5 5.d3 Nf6 6.Nc6+ Qe7 7.Nxe7 Bxe7 8.c3 O-O
 6. 2...Bc5     4.3%  1.e4 e5 2.Nf3 Bc5 3.Nxe5 Qf6 4.d4 Bb6 5.Bc4 Nh6 6.Bxh6 gxh6 7.Nc3
 7. 2...Nf6     2.3%  1.e4 d5 2.exd5 Nf6 3.d4 Nxd5 4.Nf3
 8. 3...Nc6     2.0%  1.e4 e5 2.Nf3 d6 3.d4 Nc6 4.h3 exd4 5.Nxd4 Nxd4 6.Qxd4 Nf6 7.Nc3 c5 8.Bb5+ Bd7
 9. 3...d6      1.9%  1.e4 e5 2.Nf3 Nc6 3.Bc4 d6 4.c3 Nf6 5.Ng5 d5 6.exd5 Nxd5 7.d4
10. 3...Bg4     1.8%  1.e4 e5 2.Nf3 d6 3.d4 Bg4 4.Bc4 Bxf3 5.Qxf3 Nf6 6.dxe5 dxe5 7.Qb3 Qe7 8.Qxb7 Qb4+
11. 3...h6      1.8%  1.e4 e5 2.Nf3 Nc6 3.Bc4 h6 4.O-O Nf6 5.Re1 Bc5 6.c3 d6 7.d3 Bg4 8.Bb3 O-O
12. 3...Qe7     1.8%  1.e4 e5 2.Nf3 Nf6 3.Nxe5 Qe7 4.d4 Nxe4 5.Bd3 d6 6.O-O dxe5 7.Bxe4 exd4 8.Re1 Be6
13. 4...d5      1.4%  1.e4 e5 2.Nf3 Nc6 3.Bc4 Nf6 4.d3 d5 5.exd5 Nxd5 6.O-O Bg4 7.Re1
14. 3...f6      1.2%  1.e4 e5 2.Nf3 d6 3.d4 f6 4.Bc4 Nc6 5.c3 Bg4 6.O-O
15. 3...Nf6     1.2%  1.e4 e5 2.Nf3 d6 3.d4 Nf6 4.Nc3 exd4 5.Qxd4 Nc6 6.Bb5 Bd7 7.Qd3 Be7 8.Bf4 O-O
16. 3...Nd4     1.0%  1.e4 e5 2.Nf3 Nc6 3.Bc4 Nd4 4.Nxd4 exd4 5.O-O
17. 4...d6      1.0%  1.e4 e5 2.Nf3 Nc6 3.Bc4 Bc5 4.c3 d6 5.d4 exd4 6.cxd4 Bb6 7.O-O Nf6 8.Re1 O-O
18. 3...d6      0.9%  1.e4 e5 2.Nf3 Nf6 3.Nxe5 d6 4.Nf3 Nxe4 5.d4 d5 6.Bd3
19. 4...d6      0.7%  1.e4 e5 2.Nf3 Nc6 3.Bc4 Nf6 4.d3 d6 5.Ng5 d5 6.exd5 Nxd5 7.O-O Be7 8.Nxf7 Kxf7
20. 3...d6      0.7%  1.e4 e5 2.Nf3 Bc5 3.Nxe5 d6 4.Nf3 Nf6 5.c3 Nxe4 6.Qa4+ Bd7 7.Qxe4+
21. 3...Qh4     0.7%  1.e4 e5 2.Nf3 Bc5 3.Nxe5 Qh4 4.d4 Qxe4+ 5.Be3 Bb4+ 6.c3 Bd6 7.Nd2 Qf5 8.Bd3 Qf6
22. 5...d6      0.7%  1.e4 e5 2.Nf3 Nc6 3.Bc4 Nf6 4.d3 Bc5 5.c3 d6 6.O-O O-O 7.Re1 Bg4 8.Bb3 d5
23. 4...h6      0.6%  1.e4 e5 2.Nf3 Nc6 3.Bc4 Nf6 4.d3 h6 5.c3 Bc5 6.O-O d6 7.Re1 Bg4 8.Bb3 O-O
24. 4...c5      0.6%  1.e4 e5 2.Nf3 d6 3.d4 exd4 4.Nxd4 c5 5.Nf3 Nf6 6.Nc3 Nc6 7.Bc4
```

French (Black)

```
Textbook: 1.e4 e6 2.d4 d5 3.Nc3 dxe4 4.Nxe4 Nd7 5.Nf3 Ngf6 6.Nxf6+ Nxf6 7.Bd3 c5 8.dxc5 Bxc5 9.O-O O-O
 1. 2.Nf3      25.5%  1.e4 e6 2.Nf3 d5 3.exd5 exd5 4.d4 Nc6 5.Bb5 Nf6 6.O-O Be7 7.Re1 O-O 8.Bxc6
 2. 2.Nc3      14.0%  1.e4 e6 2.Nc3 d5 3.exd5 exd5 4.d4 Nc6 5.Nf3 Nf6 6.Bb5 Be7 7.O-O O-O 8.Bxc6
 3. 2.Bc4      10.1%  1.e4 e6 2.Bc4 d5 3.exd5 exd5 4.Bb3 c5 5.Nf3 Nc6 6.O-O Nf6
 4. 3.e5        8.9%  1.e4 e6 2.d4 d5 3.e5 c5 4.Nf3 cxd4 5.Nxd4 Nc6 6.Nxc6 bxc6 7.Nc3 Bd7 8.Bd3
 5. 3.exd5      7.6%  1.e4 e6 2.d4 d5 3.exd5 exd5 4.Nf3 Nc6 5.Bb5 Nf6 6.O-O Be7 7.Re1 O-O 8.Bxc6
 6. 2.d3        4.7%  1.e4 e6 2.d3 d5
 7. 3.e5        4.4%  1.e4 e6 2.Nf3 d5 3.e5 c5 4.d4 cxd4 5.Nxd4 Nc6 6.Nxc6 bxc6 7.Nc3 Bd7 8.Bd3
 8. 3.Nc3       3.1%  1.e4 e6 2.Nf3 d5 3.Nc3 Nc6 4.exd5 exd5 5.d4 Nf6 6.Bb5 Be7 7.O-O O-O 8.Bxc6
 9. 4.c3        2.3%  1.e4 e6 2.d4 d5 3.e5 c5 4.c3 Nc6 5.Nf3 Qb6
10. 4.Nc3       2.3%  1.e4 e6 2.Nf3 d5 3.exd5 exd5 4.Nc3 d4 5.Nb5 Nc6 6.d3 a6
11. 3.d3        2.2%  1.e4 e6 2.Nf3 d5 3.d3 c5 4.exd5 exd5 5.Be2 Nc6 6.O-O Nf6
12. 4.Nc3       1.7%  1.e4 e6 2.d4 d5 3.exd5 exd5 4.Nc3 Nc6 5.Nf3 Nf6 6.Bb5 Be7 7.O-O O-O 8.Bxc6
13. 4.Nf3       1.6%  1.e4 e6 2.Nc3 d5 3.exd5 exd5 4.Nf3 d4 5.Nb5 Nc6 6.d3 a6
14. 4.dxc5      1.5%  1.e4 e6 2.d4 d5 3.e5 c5 4.dxc5 Bxc5 5.Nf3 Nc6 6.Bb5 Qb6 7.Bxc6+ bxc6 8.O-O Ba6
15. 4.Bb5+      1.4%  1.e4 e6 2.Bc4 d5 3.exd5 exd5 4.Bb5+ Bd7 5.Bxd7+ Nxd7 6.Nf3 Ngf6 7.O-O Be7 8.d4 c5
16. 3.Nf3       1.4%  1.e4 e6 2.Nc3 d5 3.Nf3 Nc6 4.exd5 exd5 5.d4 Nf6 6.Bb5 Be7 7.O-O O-O 8.Bxc6
17. 3.e5        1.4%  1.e4 e6 2.Nc3 d5 3.e5 c5 4.Nf3 Nc6 5.Bb5 Ne7 6.d4 cxd4
18. 3.d4        1.3%  1.e4 e6 2.Nc3 d5 3.d4 dxe4 4.Nxe4 Nd7 5.Nf3 Ngf6 6.Nxf6+ Nxf6 7.Bg5 c5 8.Bb5+ Bd7
19. 3.d3        1.1%  1.e4 e6 2.Nc3 d5 3.d3 c5 4.exd5 exd5 5.Nf3 Nc6
20. 5.Nc3       1.1%  1.e4 e6 2.Nf3 d5 3.exd5 exd5 4.d4 Nc6 5.Nc3 Nf6 6.Bb5 Be7 7.O-O O-O 8.Bxc6
21. 4.Bb5+      1.1%  1.e4 e6 2.Nf3 d5 3.exd5 exd5 4.Bb5+ Bd7 5.Bxd7+ Nxd7 6.O-O Bd6 7.Re1+ Ne7 8.d4
22. 5.Qxd4      0.8%  1.e4 e6 2.d4 d5 3.e5 c5 4.Nf3 cxd4 5.Qxd4 Nc6 6.Qa4 Bd7
23. 3.Bb3       0.8%  1.e4 e6 2.Bc4 d5 3.Bb3 dxe4 4.Nc3 Nf6 5.Qe2 Bd7 6.Nxe4 Nxe4 7.Qxe4 Bc6 8.Qg4
24. 3.Bb5+      0.8%  1.e4 e6 2.Bc4 d5 3.Bb5+ c6 4.Ba4 dxe4 5.Nc3 Nf6
```

Chosen stages: the textbook plus four alternatives for each opening, one per distinct opponent setup, by frequency.
Every line ends on a student move and agrees with the tree (`levels.test.ts` checks that). Where the ranked line
runs past the last student move, it is cut there.

Italian

| Stage id | Line | Frequency | Note |
|---|---|---|---|
| `giuoco-piano` | Textbook, Giuoco Piano with 3...Bc5 | the textbook | Matches the first pinned line. Ends on 8.Bb3 |
| `philidor` | 2...d6 | 12.2% | Cut after 7.O-O; the ranked line goes on to 7...c5 8.Nf5, a Stockfish pick |
| `starter-scandinavian` | 1...d5 | 12.1% | The pinned route (3...Qa5 4.d4 5.Nf3 6.Bc4), not the ranked line, which stops at 3.Nc3 because the tree has no reply to 3...Qd6 or 3...Qd8 |
| `starter-french` | 1...e6, the Advance | 7.9% | The pinned route, to 6.a3 |
| `two-knights-nf6` | 3...Nf6 | 6.6% | Cut after 8.Bb3 |

Not staged, next by frequency: the Petroff 2...Nf6 (6.2%), 2...Bc5 (4.3%), 3...Nc6 in the Philidor (2.0%). The Petroff
has the queen trap, so it is the first one to add.

The two starter-route stages open with another first move than the forced 1...e5. The drill lets a staged line win
over the forced reply (`drill.test.ts`), but `openings.test.ts` required every stage to start with the forced replies.
It now exempts ids that start with `starter-` and checks that they really do open differently.

French

| Stage id | Line | Frequency | Note |
|---|---|---|---|
| `rubinstein` | Textbook, Rubinstein | the textbook | Matches the first pinned line. Ends on 9...O-O |
| `french-exchange-nf3` | 2.Nf3 and the Exchange | 25.5% | Cut after 7...O-O. 2.Nc3 (14.0%) and 2.d4 3.exd5 (7.6%) reach the same structure, so they share this stage |
| `french-bc4` | 2.Bc4 | 10.1% | Ends on 6...Nf6 |
| `french-advance-nf3` | 3.e5, the Advance with 4.Nf3 | 8.9% | Cut after 7...Bd7. The pinned 4.c3 line is 2.3%, so the Nf3 route is the one a student meets |
| `french-kia` | 2.d3, King's Indian Attack | 4.7% | The pinned line, since the ranked line stops at 2...d5 |

## Engine check

`spike/check-tree.mjs` on both trees: Italian 480 prep positions (185 Stockfish fallbacks among the generated ones),
French 316 (42). None of Mitch's pinned moves trails. The generator picks that trailed by more than 60cp at 400 ms
were re-tested at 3 s. Three genuinely trailed (87, 71 and 70cp) and are pinned at the end of `italian.ts` and
`french.ts`, each line ending on Stockfish's move, then regenerated with `KEEP=1`. Three were noise (45cp or less at 3 s).

After that round, the Italian still has four picks over 60cp at 400 ms. At 3 s two are real (Nc3 at 74cp after
1.e4 e5 2.Nf3 Bc5 3.Nxe5 Qf6 4.d4 Bd6, and h3 at 89cp after the Petroff line 3.Nxe5 Nxe4 4.Qe2 Nf6 5.Nc6+ Qe7 6.Nxe7
Bxe7 7.c3 Nc6) and two are noise. They are left for the next round. The French has none.

## Idea texts

The idea texts are drafted for review (decision 16, batch 2): `src/data/italian-ideas.ts` and `src/data/french-ideas.ts`, with their tests. The key claims (the Blackburne Shilling and Petroff queen traps, the Advance `...Nxd4??` trap, the Rubinstein recaptures) are checked move by move in the tests.
