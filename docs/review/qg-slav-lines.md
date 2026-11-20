# Batch 1: Queen's Gambit and Slav, coverage matrix

Decision 16, batch 1. Under the refinement loop (Mitch, 2026-10-25), Claude writes this matrix and
keeps going instead of waiting for approval. Mitch reviews it, with the texts, at the PR. Data:
`src/data/queens-gambit.ts` and `src/data/slav.ts` (pinned lines), their `-auto.ts` trees,
and their `-ideas.ts` texts.

The pair shares the 1.d4 d5 2.c4 c6 positions from both sides. In the main line, the Queen's
Gambit student plays White's moves and the Slav student plays Black's.

## Queen's Gambit (White)

The drill forces 1...d5. Every other first move is a prep boundary at move one, so Maia plays on.

| Black plays | Our answer | Stops at | Teaching point | Left out |
|---|---|---|---|---|
| 2...e6 (QGD) | 3.Nc3 Nf6 4.cxd5 exd5 5.Bg5 c6 6.e3 Be7 7.Bd3 Nbd7 8.Qc2 O-O 9.Nf3 Re8 10.O-O Nf8 11.Rab1 | 11.Rab1 | Exchange on d5 to fix the Carlsbad structure; Rab1 and b4 are the minority attack | The 4.Bg5 Orthodox lines and the Elephant trap |
| 2...dxc4 (QGA) | 3.e3 and 4.Bxc4 | move 7 | Win the pawn back at once. Holding it with ...b5 fails to a4 and b3 | 3.e4 lines |
| 2...c6 (Slav) | 3.Nf3 Nf6 4.Nc3 dxc4 5.a4 Bf5 6.e3 e6 7.Bxc4 Bb4 8.O-O O-O 9.Qe2 | 9.Qe2 | a4 stops ...b5, and the c4 pawn comes back | 5.e4 gambits, Geller |
| 2...c6 3.Nf3 Nf6 4.Nc3 e6 (Semi-Slav) | 5.e3 Nbd7 6.Qc2 Bd6 7.Bd3 O-O 8.O-O | 8.O-O | Quiet development, with no Botvinnik or Meran theory | 5.Bg5 |
| 2...e5 (Albin) | 3.dxe5 d4 4.Nf3 Nc6 5.g3 | move 7 | Never play e3 here: the Lasker trap (...Bb4+, ...dxe3, ...exf2+, ...fxg1=N+) | 4.a3 lines |
| 2...Nc6 (Chigorin) | 3.Nf3 Bg4 4.cxd5 Bxf3 5.gxf3 Qxd5 6.e3 | 6.e3 | Two bishops and the center for a damaged kingside | 3.Nc3 |
| 2...Bf5, 2...Nf6, others | Generator picks | about move 8 | n/a | n/a |

## Slav (Black, against 1.d4)

The drill forces 1.d4. 1.c4, 1.Nf3 and the rest are prep boundaries at move one, as the
Caro-Kann does for 1.d4. "Against 1.d4" covers the London and the quiet e3 systems, not only 2.c4.

| White plays | Our answer | Stops at | Teaching point | Left out |
|---|---|---|---|---|
| 2.c4 3.Nf3 4.Nc3 (main line) | 2...c6 3...Nf6 4...dxc4 5...Bf5 6...e6 7...Bb4 8...O-O 9...Nbd7 | 9...Nbd7 | Take on c4 only once both knights are out, then develop the bishop before ...e6 | 6.Ne5 |
| 4.e3 (Slow Slav) | 4...Bf5 5...e6; 6.Nh4 Bg6 7.Nxg6 hxg6 | 7...hxg6 | Bishop out before ...e6; recapture toward the center | 6.Be2 lines (generator) |
| 5.cxd5, 6.Qb3 | 5...cxd5 6...Qb6 7.Qxb6 axb6 | 7...axb6 | Meet Qb3 queen to queen; the half-open a-file is yours | Other queen moves |
| 3.cxd5 (Exchange) | 3...cxd5 4...Nf6 5...Nc6 6...Bf5 7...e6 8...Bb4 | 8...Bb4 | The symmetrical structure: develop, and pin with Bb4 | n/a |
| 2.Bf4 (London) | 2...Nf6 3...c6 4...Bf5 5...Bxd3 6...e6; against 5.c4, ...e6 and ...Nbd7 | move 6 | Trade White's good bishop, the Caro-Kann Advance idea | 2...c5 lines |
| 2.e3 3.Bd3 (Colle) | 2...Nf6 3...c6 4...Bg4 | 4...Bg4 | Pin the knight that supports e4 | Stonewall (generator) |
| 2.e4 (Blackmar-Diemer) | 2...dxe4 3...Nf6 4...exf3 5...Bf5 | 5...Bf5 | Accept, return nothing, develop | Other 5th moves |
| 2.Nf3, 2.Nc3, 2.g3, others | Generator picks; most transpose | about move 8 | n/a | n/a |

## Staged lines

Ranked by `spike/staged-lines.mjs`: the textbook line, then each place the opponent leaves it, with Maia's
probability averaged over ratings 800, 1000, 1200 and 1400 times the chance of reaching that position. The
percentage is how often a club player reaches the deviation, not the whole line. Output as run, top 24:

Queen's Gambit (White)

```
Textbook: 1.d4 d5 2.c4 e6 3.Nc3 Nf6 4.cxd5 exd5 5.Bg5 c6 6.e3 Be7 7.Bd3 Nbd7 8.Qc2 O-O 9.Nf3 Re8 10.O-O Nf8 11.Rab1
 1. 2...dxc4   40.3%  1.d4 d5 2.c4 dxc4 3.e3 b5 4.a4 c6 5.axb5 cxb5 6.b3 cxb3 7.Bxb5+ Bd7 8.Nc3 Bxb5
 2. 2...Nf6    21.7%  1.d4 d5 2.c4 Nf6 3.Nf3 dxc4 4.Nc3 Nc6 5.e3 Bg4 6.Bxc4 e6 7.Qc2 Bxf3 8.gxf3 Bb4
 3. 2...c6      7.5%  1.d4 d5 2.c4 c6 3.Nf3 Nf6 4.Nc3 e6 5.e3 Bb4 6.Bd3
 4. 3...dxc4    5.0%  1.d4 d5 2.c4 e6 3.Nc3 dxc4 4.e4 Bb4 5.Bxc4 Bxc3+ 6.bxc3 Nf6 7.e5 Ne4 8.Qg4 Nxc3
 5. 2...Nc6     3.7%  1.d4 d5 2.c4 Nc6 3.Nf3
 6. 3...Nf6     2.8%  1.d4 d5 2.c4 dxc4 3.e3 Nf6 4.Bxc4 e6 5.Nf3 Bb4+ 6.Bd2 Bxd2+ 7.Nbxd2 O-O 8.Qc2 Nc6
 7. 3...Bb4     2.5%  1.d4 d5 2.c4 e6 3.Nc3 Bb4 4.Nf3 Bxc3+ 5.bxc3 dxc4 6.e3 b5 7.a4 c6 8.Ne5 f6
 8. 3...c5      2.2%  1.d4 d5 2.c4 e6 3.Nc3 c5 4.Nf3 Nc6 5.e3 Nf6 6.Bd3 cxd4 7.exd4
 9. 3...Nc6     1.9%  1.d4 d5 2.c4 dxc4 3.e3 Nc6 4.Nc3 Nf6 5.Nf3 Bg4 6.Bxc4 e6 7.Qc2 Bxf3 8.gxf3 Bb4
10. 3...e6      1.5%  1.d4 d5 2.c4 dxc4 3.e3 e6 4.Nc3 Bb4 5.Nf3 Bxc3+ 6.bxc3 b5 7.a4 c6 8.Ne5 f6
11. 3...c6      1.5%  1.d4 d5 2.c4 e6 3.Nc3 c6 4.Nf3 Nf6 5.e3 Bb4 6.Bd3
12. 4...Nxd5    1.5%  1.d4 d5 2.c4 e6 3.Nc3 Nf6 4.cxd5 Nxd5 5.Nf3 Bb4 6.Qc2 O-O 7.e4 Nxc3 8.bxc3 Ba5
13. 3...Be6     1.4%  1.d4 d5 2.c4 dxc4 3.e3 Be6 4.Nc3 Nc6 5.d5 Bxd5 6.Qxd5 Qxd5 7.Nxd5 O-O-O 8.Nc3 Nb4
14. 3...e6      1.1%  1.d4 d5 2.c4 Nf6 3.Nf3 e6 4.Nc3 Bb4 5.e3 O-O 6.Bd3
15. 3...Nc6     1.1%  1.d4 d5 2.c4 e6 3.Nc3 Nc6 4.Nf3 dxc4 5.e4 Bb4 6.Bxc4 Nf6 7.O-O Bxc3 8.bxc3 Nxe4
16. 3...e5      0.9%  1.d4 d5 2.c4 dxc4 3.e3 e5 4.Bxc4 exd4 5.exd4 Nf6 6.Nf3 Bb4+ 7.Bd2 Bxd2+ 8.Nbxd2 O-O
17. 4...bxa4    0.9%  1.d4 d5 2.c4 dxc4 3.e3 b5 4.a4 bxa4 5.Qxa4+ Bd7 6.Qxc4 Nc6 7.d5 Ne5 8.Qc3 f6
18. 5...Be7     0.7%  1.d4 d5 2.c4 e6 3.Nc3 Nf6 4.cxd5 exd5 5.Bg5 Be7 6.Nf3 O-O 7.e3 h6 8.Bxf6 Bxf6
19. 4...Bd7     0.7%  1.d4 d5 2.c4 dxc4 3.e3 b5 4.a4 Bd7 5.axb5 Bxb5 6.Nc3 c6 7.b3 cxb3 8.Nxb5 cxb5
20. 4...a6      0.7%  1.d4 d5 2.c4 dxc4 3.e3 b5 4.a4 a6 5.Qf3 c6 6.axb5 cxb5 7.Qxa8 Qc7 8.Qf3 Bb7
21. 3...Nc6     0.6%  1.d4 d5 2.c4 Nf6 3.Nf3 Nc6 4.cxd5 Nxd5 5.e4 Nf6 6.Nc3 Bg4 7.d5 Ne5 8.Nxe5 Bxd1
22. 4...b4      0.5%  1.d4 d5 2.c4 dxc4 3.e3 b5 4.a4 b4 5.Qf3 c6 6.Bxc4 e6 7.Ne2
23. 5...h6      0.5%  1.d4 d5 2.c4 e6 3.Nc3 Nf6 4.cxd5 exd5 5.Bg5 h6 6.Bxf6 Qxf6 7.Nxd5 Qd6 8.Nc3 Nc6
24. 3...Bf5     0.4%  1.d4 d5 2.c4 Nf6 3.Nf3 Bf5 4.cxd5 Nxd5 5.Nc3 e6 6.e3 Bb4 7.Qb3
```

Slav (Black)

```
Textbook: 1.d4 d5 2.c4 c6 3.Nf3 Nf6 4.Nc3 dxc4 5.a4 Bf5 6.e3 e6 7.Bxc4 Bb4 8.O-O O-O 9.Qe2 Nbd7
 1. 2.Nf3      23.1%  1.d4 d5 2.Nf3 c6 3.Nc3 Nf6 4.Bg5 Bf5 5.e3 e6 6.Bd3 Nbd7 7.Bxf5 exf5 8.O-O Bd6
 2. 2.Nc3      22.1%  1.d4 d5 2.Nc3 c6 3.e4 dxe4 4.Nxe4 Nf6 5.Nxf6+ exf6 6.Nf3 Bf5 7.Bd3 Bd6 8.Bxf5 Qa5+
 3. 2.e3       20.2%  1.d4 d5 2.e3 Nf6 3.Nf3 c6 4.Bd3 Bg4 5.Nbd2 e6 6.O-O Nbd7
 4. 2.Bf4      13.4%  1.d4 d5 2.Bf4 Nf6 3.e3 c6 4.Nf3 Bf5 5.Bd3 Bxd3 6.Qxd3 e6 7.Nbd2 Nbd7 8.O-O
 5. 2.e4        3.0%  1.d4 d5 2.e4 dxe4 3.Nc3 Nf6 4.f3 exf3 5.Nxf3 Bf5
 6. 3.Nf3       1.3%  1.d4 d5 2.Nc3 c6 3.Nf3 Nf6 4.Bg5 Bf5 5.e3 e6 6.Bd3 Nbd7 7.Bxf5 exf5 8.O-O Bd6
 7. 3.e3        1.3%  1.d4 d5 2.Nf3 c6 3.e3 Nf6 4.Bd3 Bg4 5.Nbd2 e6 6.O-O Nbd7
 8. 2.c4        1.2%  1.d4 d5 2.c4 c6
 9. 3.Bf4       1.2%  1.d4 d5 2.Nc3 c6 3.Bf4 Nf6 4.e3 Bf5 5.Bd3 e6 6.Nf3 Nbd7 7.O-O Be7 8.Bxf5
10. 3.Bf4       1.1%  1.d4 d5 2.Nf3 c6 3.Bf4 Nf6 4.e3 Bf5 5.Bd3 Bxd3 6.Qxd3 e6 7.Nbd2 Nbd7 8.O-O
11. 3.cxd5      0.9%  1.d4 d5 2.c4 c6 3.cxd5 cxd5 4.Nc3 Nf6 5.Nf3 e6
12. 3.Nc3       0.7%  1.d4 d5 2.e3 Nf6 3.Nc3 c6 4.Nf3 Bf5 5.Bd3 e6 6.Bxf5 exf5 7.O-O Nbd7 8.Ne5
13. 3.c4        0.7%  1.d4 d5 2.e3 Nf6 3.c4 c6 4.Nc3 Bf5 5.Nf3 e6 6.Bd3 Be7
14. 3.Nf3       0.4%  1.d4 d5 2.Bf4 Nf6 3.Nf3 c6 4.e3 Bf5 5.Bd3 Bxd3 6.Qxd3 e6 7.Nbd2 Nbd7 8.O-O
15. 3.Bd3       0.4%  1.d4 d5 2.e3 Nf6 3.Bd3 c6 4.Nf3 Bg4 5.Nbd2 e6 6.O-O Nbd7
16. 3.c4        0.4%  1.d4 d5 2.Nf3 c6 3.c4 Nf6 4.Nc3 dxc4 5.e4 b5 6.e5 Nd5
17. 3.e3        0.3%  1.d4 d5 2.Nc3 c6 3.e3 Nf6 4.Nf3 Bf5 5.Bd3 e6 6.Bxf5 exf5 7.O-O Nbd7 8.Ne5
18. 4.Bf4       0.3%  1.d4 d5 2.Nf3 c6 3.Nc3 Nf6 4.Bf4 Bf5 5.e3 e6 6.Bd3 Nbd7 7.O-O Be7 8.Bxf5
19. 4.e3        0.3%  1.d4 d5 2.Nf3 c6 3.Nc3 Nf6 4.e3 Bf5 5.Bd3 e6 6.Bxf5 exf5 7.O-O Nbd7 8.Ne5
20. 3.Nc3       0.3%  1.d4 d5 2.Bf4 Nf6 3.Nc3 c6 4.e3 Bf5 5.Bd3 e6 6.Nf3 Nbd7 7.O-O Be7 8.Bxf5
21. 4.c4        0.2%  1.d4 d5 2.e3 Nf6 3.Nf3 c6 4.c4 Bf5 5.Nc3 e6 6.Bd3 Be7
22. 5.e4        0.2%  1.d4 d5 2.c4 c6 3.Nf3 Nf6 4.Nc3 dxc4 5.e4 b5 6.e5 Nd5
23. 3.Bb5+      0.2%  1.d4 d5 2.e3 Nf6 3.Bb5+ Bd7 4.Bxd7+ Nbxd7 5.Nf3 c6 6.O-O e6
24. 4.Nc3       0.2%  1.d4 d5 2.e3 Nf6 3.Nf3 c6 4.Nc3 Bf5 5.Bd3 e6 6.Bxf5 exf5 7.O-O Nbd7 8.Ne5
```

The textbook lines are what Mitch pinned, and they are rarely met. Maia plays 2.c4 only about 5% of the time as
White, and 5.a4 about 1%; the full Slav main line is under 0.01% of games. A Queen's Gambit student meets
2...dxc4 far more than 2...e6 (about 40% against about 18%).

**Queen's Gambit stages**, in order, one per setup:

1. Exchange (textbook): `d4 d5 c4 e6 Nc3 Nf6 cxd5 exd5 Bg5 c6 e3 Be7 Bd3 Nbd7 Qc2 O-O Nf3 Re8 O-O Nf8 Rab1`
2. 2...dxc4 and ...b5 (40.3%): `d4 d5 c4 dxc4 e3 b5 a4 c6 axb5 cxb5 Qf3`. The trap: Qf3 hits the rook on a8 down the emptied diagonal. (Claude first pinned 6.b3 here; Stockfish rated it about 4 pawns worse than 6.Qf3 at 3 s, so the line now ends on Qf3.)
3. 2...Nf6 (21.7%): `d4 d5 c4 Nf6 Nf3 dxc4 Nc3 Nc6 e3 Bg4 Bxc4 e6 Qc2 Bxf3 gxf3`. Ends before 8...Bb4.
4. 2...c6 and ...e6 (7.5%): `d4 d5 c4 c6 Nf3 Nf6 Nc3 e6 e3 Bb4 Bd3`
5. 3...dxc4 (5.0%): `d4 d5 c4 e6 Nc3 dxc4 e4 Bb4 Bxc4 Bxc3+ bxc3 Nf6 e5 Ne4 Qg4`. Ends before 8...Nxc3.

Left out: 2...Nc6 (3.7%, the tree stops at move 3), 3...Nf6 in the QGA (2.8%), and the rest, which fall under 3%.

**Slav stages**, in order, one per setup:

1. Main line (textbook): `d4 d5 c4 c6 Nf3 Nf6 Nc3 dxc4 a4 Bf5 e3 e6 Bxc4 Bb4 O-O O-O Qe2 Nbd7`
2. 2.Nf3 and Bg5 (23.1%): `d4 d5 Nf3 c6 Nc3 Nf6 Bg5 Bf5 e3 e6 Bd3 Nbd7 Bxf5 exf5 O-O Bd6`
3. 2.Nc3 and e4 (22.1%): `d4 d5 Nc3 c6 e4 dxe4 Nxe4 Nf6 Nxf6+ exf6 Nf3 Bf5 Bd3 Bd6 Bxf5 Qa5+`
4. 2.e3 and Bd3 (20.2%): `d4 d5 e3 Nf6 Nf3 c6 Bd3 Bg4 Nbd2 e6 O-O Nbd7`
5. 2.Bf4, the London (13.4%): `d4 d5 Bf4 Nf6 e3 c6 Nf3 Bf5 Bd3 Bxd3 Qxd3 e6 Nbd2 Nbd7`. Ends before 8.O-O.

Left out: 2.e4, the Blackmar-Diemer (3.0%), and everything under 2%.

