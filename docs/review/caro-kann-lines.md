# Caro-Kann: proposed repertoire and staged lines, for Mitch's review

Decision 8 puts the Caro-Kann in v1 for Black. You haven't set a repertoire policy for it, so
this proposes one, then the staged lines under decision 14b (textbook line first, then the
likely alternatives, Maia takes over at the end). Nothing here is decided. The draft data is in
`src/data/caro-kann.ts`, `caro-kann-auto.ts` and `caro-kann-ideas.ts`; none of it is wired into
the app or the drill.

## Proposed policy

One mainstream answer to each White try, sound and teachable at club level. Black plays ...c6
and ...d5, then gets the light-squared bishop out before ...e6 can lock it in. The tree only
covers 1.e4. After any other first move the student is out of book on move one.

| White tries | Black's answer |
|---|---|
| 3.Nc3 or 3.Nd2 (Classical) | ...dxe4, ...Bf5, ...Bg6, ...h6, ...Nd7, trade bishops on d3, ...e6, ...Ngf6 |
| 3.e5 (Advance) | ...Bf5, ...e6, ...c5, then ...Ne7 and ...Nbc6 (short variation) |
| 3.exd5 (Exchange) | ...cxd5, ...Nc6, ...Nf6, ...Bg4 against 4.Bd3; ...Nf6, ...e6, ...Be7 against the Panov (4.c4) |
| 3.f3 (Fantasy) | ...dxe4, ...e5, and 5.dxe5?? loses a rook to Qh4+ |
| 2.Nc3 and 3.Nf3 (Two Knights) | ...Bg4, trade it for the knight, ...e6, ...Nf6 |
| 2.d3, 2.c4, 2.Nf3 | The same setup. Most of these transpose into the lines above |

Pinned lines (`LINES`, 16 of them, 62 positions) cover one answer per row. The generator fills
in the likelier White deviations, 291 more positions, 353 in all. Every Black move in the tree
is within 60 centipawns of Stockfish's best (checked with `spike/check-caro-kann.mjs`, Stockfish
lite at 400 ms a position). That is a short search. It is not a check against opening theory.

Two traps are worth their own notes:

- **Classical, 4.Nxe4.** Black plays 4...Bf5. The trap is for Black if you play 4...Nd7 first:
  5.Qe2 Ngf6?? loses to 6.Nd6#. The idea text says so.
- **Fantasy, 4.fxe4 e5.** 5.dxe5?? Qh4+ 6.g3 Qxe4+ 7.Qe2 Qxh1 wins a rook. Against the
  sound 5.Nf3, ...Bg4 and after Bc4 play ...Nd7; trading on f3 first lets Bxf7+ in.

One more the engine found: after 5.Bd3 in the Classical, White's bishop blocks the queen's guard
of d4, so 5...Qxd4 wins a pawn. Maia's White plays 5.Bd3 about 2% of the time.

## How often White tries what

Maia 800 to 1400, averaged, after 1.e4 c6: 2.d4 29%, 2.Nf3 24%, 2.Bc4 16%, 2.Nc3 15%, 2.d3 4%.
Then almost every club White plays 3.exd5 against ...d5, whatever the second move was. The
Classical needs 2.d4 and 3.Nc3 (31%) and 4.Nxe4: about 8% of games. That is far less than the
Exchange family, the same pattern as the London's textbook line.

## Staged lines, in order

Made with `spike/staged-lines.mjs caro-kann`: each point where White most often leaves the
textbook line, then White's most likely replies and Black's prep through move 8. The percentage
is Maia's probability averaged over 800, 1000, 1200 and 1400, given 1.e4 c6. As with the
London, different move orders reach the same position, which I checked: the 2.Nf3 line and the
3.exd5 4.Nf3 line end on identical positions, as do the two Advance lines.

1. **Textbook, Classical.** 1.e4 c6 2.d4 d5 3.Nc3 dxe4 4.Nxe4 Bf5 5.Ng3 Bg6 6.h4 h6 7.Nf3 Nd7 8.h5 Bh7 9.Bd3 Bxd3 10.Qxd3 e6 11.Bf4 Ngf6 12.O-O-O Be7 13.Kb1 O-O
2. **Setup A, Exchange with Nf3.** About 31%. Reached by 2.Nf3 (24%) and by 2.d4 d5 3.exd5 cxd5 4.Nf3 (8%).
   1.e4 c6 2.Nf3 d5 3.exd5 cxd5 4.d4 Nc6 5.Bb5 Bf5 6.Ne5 Rc8 7.Qf3 e6 8.g4
3. **Setup B, 2.Bc4.** About 16%. 1.e4 c6 2.Bc4 d5 3.exd5 cxd5 4.Bb3 Bf5 5.Nf3 e6 6.O-O Nd7 7.d4 Ngf6 8.Bg5
4. **Setup C, 2.Nc3 and exd5.** About 15%. 1.e4 c6 2.Nc3 d5 3.exd5 cxd5 4.d4 Bf5 5.Nf3 e6 6.Bb5+ Nc6 7.Ne5 Ne7 8.O-O
5. **Advance.** About 9% (3.e5 after 2.d4 is 8%, 2.Nf3 d5 3.e5 adds 1%). 1.e4 c6 2.d4 d5 3.e5 Bf5 4.Nf3 e6 5.Bd3 Ne7 6.O-O Nd7
6. **Classical sideline, 5.Bd3.** About 2%, with the Qxd4 point. 1.e4 c6 2.d4 d5 3.Nc3 dxe4 4.Nxe4 Bf5 5.Bd3 Qxd4 6.Nf3 Qd8 7.O-O Bxe4 8.Bxe4 Qxd1
7. **2.d3.** About 4%. The generator stops at 2.d3 d5: 3.exd5 is 35% of the replies, but the path
   falls under its cutoff. The pinned answer is 3.Nd2 e5 4.Ngf3 Bd6 5.g3 Nf6, which Maia's White rarely plays.

Pinned in the tree but too rare to stage by frequency (1% or less each): the Fantasy (1.0%),
the Two Knights (about 1% counting both move orders), 5.f3 in the Classical (1.2%), 6.Nf3 (1.0%),
5.Nc5 (0.8%). Say if you want any of them staged anyway; the Fantasy has a trap and the others
are cheap.

## Questions for you

1. **Which line is the textbook?** The Classical is the theory main line and has the clearest
   plan, but it is about 8% of what a club student meets. The Exchange with Nf3 is about 31%.
   London's textbook was its theory line, so I kept the Classical first. Switch it?
2. **Is this the repertoire?** The calls most open to taste: ...Bf5 and ...e6 against the Advance
   (rather than ...Nd7 or ...c5 first), ...Nc6 and ...Bf5 against the Exchange (rather than
   ...Nf6 and ...e6), and 3...dxe4 against the Fantasy (a pawn back at once, rather than the
   quiet 3...e6).
3. **Advance: stage Maia's line or the pinned one?** Maia's White plays 5.Bd3, and the generator
   answers ...Ne7 (the stage-5 line above). The pinned line is the textbook 5.Be2 c5 6.Be3 cxd4
   7.Nxd4 Ne7. Which should the student drill first?
4. **Moves to check by eye.** These come from the generator, not a hand-pinned line: 6...Rc8
   in setup A (guards c6 against Nxc6), 5.Bd3 Ne7 rather than ...Bxd3 in the Advance, and
   5...Qxd4 in the Classical sideline. All three pass the 60 centipawn check.
5. **How deep for the rarer tries?** 2.d3, 2.Bc4 and the 2.Nf3 setups reach move 8 only through
   the generator, and 2.d3 stops at move 2. Hand-pin them further, or let Maia's stage cover them?
