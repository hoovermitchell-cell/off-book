# London: masters-book recheck of the Stockfish fallbacks (#41)

Checked 2026-11-20 against the Lichess masters explorer, every position where
`london-auto.ts` takes the student's move from Stockfish (`how: "stockfish"`).

**Result: no changes.** Decision 17 swaps in the book move only where the masters
book has at least 20 games. None of these positions comes close. The most-played
one has 7 games. Most have none, because masters never reach them: they follow
early ...Nc6 and ...e5 replies that only club players choose. The database itself
is not empty: `1.d4 Nf6 2.Bf4 d6 3.e3` has 161 masters games, and
`1.d4 d5 2.Bf4 Nf6 3.e3 Bf5 4.Bd3` has 45.

The issue counted 38 fallbacks. The tree regenerated in #20 has 40.

Columns: the position before the student's move, the move Stockfish chose, the
masters book's move where any game exists, the masters game count, the loss in
centipawns against Stockfish's best, and how often Maia reaches the position.

| # | Position | Stockfish move | Book move | Masters games | Loss (cp) | Reach |
|---|---|---|---|---|---|---|
| 1 | d4 Nc6 Bf4 e5 | 3.dxe5 | — | 0 | 0 | 1.5% |
| 2 | d4 d5 Bf4 Nc6 e3 e5 | 4.dxe5 | — | 0 | 0 | 1.3% |
| 3 | d4 d5 Bf4 Nc6 e3 Bf5 Nf3 Nb4 | 5.Bb5+ | Na3 | 7 (Na3 7) | 0 | 1.2% |
| 4 | d4 d5 Bf4 Nc6 e3 Bf5 Nf3 Nb4 Bb5+ c6 | 6.Ba4 | — | 0 | 0 | 1.2% |
| 5 | d4 Nc6 Bf4 d6 Nf3 e5 | 4.dxe5 | — | 0 | 0 | 0.8% |
| 6 | d4 d5 Bf4 Nc6 e3 f6 Nf3 e5 | 5.dxe5 | — | 0 | 0 | 0.8% |
| 7 | d4 Nf6 Bf4 d6 e3 e5 | 4.dxe5 | — | 0 | 0 | 0.7% |
| 8 | d4 d5 Bf4 Nc6 e3 Bf5 Nf3 Nb4 Bb5+ c6 Ba4 b5 | 7.a3 | — | 0 | 0 | 0.7% |
| 9 | d4 Nc6 Bf4 d6 Nf3 Bg4 | 4.d5 | Nbd2 | 7 (Nbd2 4, d5 2, Bg3 1) | 0 | 0.5% |
| 10 | d4 d5 Bf4 Nc6 e3 Nf6 Nf3 e5 | 5.dxe5 | — | 0 | 0 | 0.5% |
| 11 | d4 Nc6 Bf4 d6 Nf3 e5 dxe5 dxe5 | 5.Qxd8+ | — | 0 | 0 | 0.5% |
| 12 | d4 Nf6 Bf4 d6 e3 e5 dxe5 dxe5 | 5.Qxd8+ | — | 0 | 0 | 0.5% |
| 13 | d4 Nf6 Bf4 d6 e3 e5 dxe5 dxe5 Qxd8+ Kxd8 | 6.Bxe5 | — | 0 | 0 | 0.5% |
| 14 | d4 Nc6 Bf4 Nxd4 Qxd4 d6 | 4.Qd2 | — | 0 | 0 | 0.4% |
| 15 | d4 d5 Bf4 Nc6 e3 e5 dxe5 f6 | 5.Bb5 | — | 0 | 0 | 0.4% |
| 16 | d4 Nc6 Bf4 d6 Nf3 e5 dxe5 dxe5 Qxd8+ Nxd8 | 6.Bxe5 | — | 0 | 0 | 0.4% |
| 17 | d4 Nc6 Bf4 Nf6 e3 e5 | 4.dxe5 | — | 0 | 0 | 0.3% |
| 18 | d4 Nc6 Bf4 d6 Nf3 f6 | 4.e4 | — | 0 | 0 | 0.3% |
| 19 | d4 d5 Bf4 Nc6 e3 f6 Nf3 g5 | 5.Bg3 | Bg3 | 1 | 0 | 0.3% |
| 20 | d4 d5 Bf4 Nf6 e3 Bf5 Bd3 Nc6 | 5.Bxf5 | — | 0 | 0 | 0.3% |
| 21 | d4 Nc6 Bf4 Nf6 e3 d6 Nf3 e5 | 5.dxe5 | — | 0 | 0 | 0.3% |
| 22 | d4 d5 Bf4 Nc6 e3 Bf5 Nf3 f6 Be2 e5 | 6.dxe5 | — | 0 | 0 | 0.3% |
| 23 | d4 d5 Bf4 Nc6 e3 e5 dxe5 f6 Bb5 fxe5 | 6.Qh5+ | — | 0 | 0 | 0.3% |
| 24 | d4 d5 Bf4 Nc6 e3 Bf5 Nf3 Nb4 Bb5+ c6 Ba4 Qa5 | 7.Nc3 | — | 0 | 0 | 0.3% |
| 25 | d4 d5 Bf4 Nc6 e3 e5 dxe5 f6 Bb5 fxe5 Qh5+ g6 | 7.Qxe5+ | — | 0 | 0 | 0.3% |
| 26 | d4 Nc6 Bf4 e5 dxe5 Qe7 Nf3 Qb4+ Bd2 Qxb2 Nc3 Bb4 | 7.Rb1 | — | 0 | 0 | 0.3% |
| 27 | d4 d5 Bf4 Nc6 e3 Bf5 Nf3 Nb4 Bb5+ c6 Ba4 b5 a3 bxa4 | 8.axb4 | — | 0 | 0 | 0.3% |
| 28 | d4 d5 Bf4 Nc6 e3 Bf5 Nf3 Nb4 Bb5+ c6 Ba4 b5 a3 Na6 | 8.Bb3 | — | 0 | 0 | 0.3% |
| 29 | d4 Nc6 Bf4 e5 dxe5 Qe7 Nf3 Qb4+ Bd2 Qxb2 Nc3 Bb4 Rb1 Qa3 | 8.Nd5 | — | 0 | 0 | 0.3% |
| 30 | d4 e6 Bf4 d6 e3 e5 | 4.dxe5 | — | 0 | 0 | 0.2% |
| 31 | d4 Nc6 Bf4 Nxd4 Qxd4 Nf6 Nd2 d6 | 5.Bg5 | — | 0 | 0 | 0.2% |
| 32 | d4 Nf6 Bf4 d6 e3 Nbd7 Nf3 e5 | 5.dxe5 | — | 0 | 0 | 0.2% |
| 33 | d4 d5 Bf4 Nc6 e3 Nf6 Nf3 Bf5 Nbd2 Nb4 | 6.Bb5+ | Bb5+ | 1 | 0 | 0.2% |
| 34 | d4 Nc6 Bf4 Nf6 e3 d6 Nf3 e5 dxe5 dxe5 | 6.Qxd8+ | — | 0 | 0 | 0.2% |
| 35 | d4 Nc6 Bf4 d6 Nf3 e5 dxe5 dxe5 Qxd8+ Kxd8 | 6.Nxe5 | — | 0 | 0 | 0.2% |
| 36 | d4 d5 Bf4 Nc6 e3 Nf6 Nf3 Bf5 Nbd2 Nb4 Bb5+ c6 | 7.Ba4 | — | 1 at most (its parent has 1) | 0 | 0.2% |
| 37 | d4 d5 Bf4 Nc6 e3 f6 Nf3 Bg4 h3 Bxf3 gxf3 e5 | 7.dxe5 | — | 0 | 0 | 0.2% |
| 38 | d4 Nc6 Bf4 e5 dxe5 Qe7 Nf3 Qb4+ Bd2 Qxb2 Nc3 Nb4 | 7.Nd4 | — | 0 | 0 | 0.2% |
| 39 | d4 d5 Bf4 Nc6 e3 Bf5 Nf3 Nb4 Bb5+ c6 Ba4 Qa5 Nc3 b5 | 8.Bb3 | — | 0 | 0 | 0.2% |
| 40 | d4 d5 Bf4 Nc6 e3 f6 Nf3 Bg4 h3 Bxf3 gxf3 e5 dxe5 fxe5 | 8.Bg3 | — | 0 | 0 | 0.2% |

## Worth a look in #34

Two positions have masters games that disagree with Stockfish. Both are under the
20-game bar, so both stay on Stockfish, but they are where a human reviewer might
prefer the book:

- **Row 3**, `...Bf5 Nf3 Nb4`: masters play 5.Na3 (7 of 7) to cover c2. Stockfish
  plays 5.Bb5+, which leads to rows 4, 8, 24, 27, 28 and 39.
- **Row 9**, `...d6 Nf3 Bg4`: masters lean 4.Nbd2 (4 of 7). Stockfish plays 4.d5,
  which the masters also play twice.
