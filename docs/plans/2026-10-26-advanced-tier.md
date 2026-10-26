# Advanced tier: London and Caro-Kann (decision 16)

Branch `feat/advanced-london-caro`, built on batch 3. Mitch queued it on 2026-10-26 as the next step after the
Intermediate pilot ([2026-10-25-tier-pilot.md](2026-10-25-tier-pilot.md)). Everything here is uncommitted for his review.
The theory notes and idea texts are drafts, like the pilot's.

## What Advanced means here

Decision 16: Advanced "adds the critical continuations and tactical exceptions, with why the plausible alternatives
fail". Each line gets a theory note behind "More on this line" (the plan, the structure, the usual mistake, and why the
tempting move fails). The content rule is hard: a deeper tier adds positions and stages with new IDs, never changes a
prep move already in the tree, and never lengthens a Cleared or Proven line. Advanced lines unlock after the
Intermediate lines under 14c, with no extra gate.

Eight lines, four per opening. They were picked with three tests, in this order:

1. **Maia meets it.** Risk 4 (below).
2. **There is something to calculate.** Stockfish shows a punished mistake, an only move, or a recapture that has to be
   right. Quiet positions where every sensible move scores the same were left out, however often they come up.
3. **Not a duplicate.** The pilot's Intermediate lines already teach the Ne5/dxe5 fork in the textbook line; the two
   Advanced lines that reuse it (`bb4-ba5`, `bxg3`) say what is new about it in their notes.

## Risk 4: how often Maia reaches each line

`spike/line-reach.mjs` (new). It pushes probability through the position graph, so every move order that transposes
into a position counts, with the student playing the tree's prep move. Each rating (800, 1000, 1200, 1400) is run on its
own, then averaged. The pilot's `staged-lines.mjs` multiplies the averaged probabilities along one move order, which
undercounts any position with more than one route (the London textbook's 7...O-O is 0.027% that way and 0.21% here). At
move 2 or 3 the two agree (the pilot's King's Indian setup is 2.0% both ways); deeper they diverge. Mass under 0.0003% is
dropped.

**The cut:** a line goes in only if the opponent's critical move, the one that takes the game off the earlier tiers, is
reached in at least about 0.4% of games (1 in 250). The pilot's lowest was the Panov at 0.7%. All eight chosen lines
clear it.

**What the numbers say, plainly.** Maia at 800 to 1400 is diffuse: past move 5, no exit from the tree has more than about
0.5% of games. The eight entries here run from 0.45% to 1.5%. The *stopping position* of each line is much rarer (1 game in
1,500 to 1 in 17,000), because the line fixes Black's likeliest reply at every move. So the value of an Advanced line is
the branch point and the tactic at it, not the full sequence; Maia takes over wherever Black leaves the line, as at the
end of any stage.

## Coverage: London (White)

The four London lines, in unlock order (by reach of the entry, per 14b):

| Line | Why it is critical | Maia reach of the entry (800 / 1400) | Stops after | Teaching point |
|---|---|---|---|---|
| `bb4-ba5` ...Bb4+ and ...Ba5 | In the ...Nc6 setup 19% of the players who get there play ...Bb4+ on move 5 (29% at 800). Stockfish rates it about half a pawn worse than ...Bd6. | **0.88%** (1.4% / 0.41%); 0.57% after ...Ba5 | 10.dxe5 | c3 costs White nothing and the bishop ends up on the edge. Qc2 behind Bd3 aims at h7. Ne5, and after ...Nxe5 dxe5 the f6 knight has no good square (every Black move leaves White at +3.5 or more). |
| `bxg3` ...Bxg3 and hxg3 | In the ...Bd6 setups 12% of Black players trade on g3. The recapture decides the structure. | **0.65%** (0.30% / 0.90%) | 10.Nxe4 | hxg3 keeps f2 guarding e3 and opens the h-file; fxg3? leaves e3 unguarded and Stockfish prefers Black (about 1.0 pawn worse than hxg3). Then Nc3, Ne5, and the rook swings to h4 against a pawn on e4. |
| `f6-g5` ...f6 and ...g5 | The Intro's ...f6 trap has a second try: 26% of players on 2...f6 follow with ...g5 at the bishop. | **0.55%** (0.81% / 0.22%) | 8.Rxh4 | Do not take on g5 (Bxg5? fxg5 and Black is better). Qh5+ is check, Kd7 is the only reply, Bg3, then h4 against a king that cannot castle. Stockfish: +3.0 for White. |
| `ne4-f3` ...Ne4 and f3 | 3...Ne4 comes in 3.8% of 3.e3 games. | **0.47%** (0.82% / 0.15%) | 8.Qxd3 | Bd3 hits the knight. After ...Bf5, f3! wins against every Black move except ...Nd6 (Stockfish +3.5 or more). Bxe4 only trades (equal). Bxd6 Bxd3 Bxe7! Qxe7 Qxd3 wins a pawn. |

Reach at the stopping position, for scale: 0.028%, 0.029%, 0.0058%, 0.036%.

## Coverage: Caro-Kann (Black)

| Line | Why it is critical | Maia reach of the entry (800 / 1400) | Stops after | Teaching point |
|---|---|---|---|---|
| `nf3-dxe4` 3.Nf3 and 4.Ne5 | 3.Nf3 comes in 2.2% of 3rd moves and the tree had no answer to it: the biggest hole found. Stockfish puts White about 0.7 pawns down after 3.Nf3. | **1.5%** (1.8% / 1.2%); 0.79% at 4.Ne5 | 7...Qxe5 | The knight does not guard e4, so take the pawn. Ne5 eyes f7: ...Nd7. After Bc4 only ...Nxe5 is clearly best (the other fifth moves give back about 1.5 pawns). dxe5 Qa5+ checks and hits e5, and the pawn falls. |
| `qh5` 2.Qh5 | 1.5% of second moves (3.6% at 800). | **1.5%** (3.6% / 0.29%) | 8...Bd6 | ...Nf6 hits the queen. After Qf3, ...e5 and ...d5 take the center and hit the bishop twice. After Bb5+ Nc6 Bxc6+ only ...bxc6 works; ...Bd7?? and ...Ke7?? lose (White +4.9 and +4.8). |
| `f3-d4` 2.Nc3 and 3.f3 | 3.f3 is 3.7% of 2.Nc3 d5 games. | **0.54%** (0.76% / 0.32%) | 6...g6 | ...d4! puts the knight on e2, shutting in its own bishop. 5.c3? d3!: nothing of White's attacks the pawn (queen blocked by d2, bishop by the knight) and Black is up 3.3 pawns or more. 5.f4 or 5.d3 are only about -0.5 to -0.7. |
| `ne5-qd4` 2.Nf3 and 3.Ne5 | 3.Ne5 comes in 2.0% of 2.Nf3 d5 games. | **0.45%** (0.75% / 0.22%) | 6...g6 | Take the pawn, answer Bc4 with ...e6 (blocks the f7 diagonal), and after O-O the queen jumps to d4: nothing guards the knight on e5. Against Qh5, ...g6 hits the queen and kills Qxf7+. |

Reach at the stopping position: 0.067%, 0.0075%, 0.11%, 0.011%.

## Left out, and why

| Line | Maia reach | Why it is out |
|---|---|---|
| London: ...Qb6 against the ...c5 setups (4.Nc3!) | 0.0025% to 0.012% | Nobody meets it. Maia at these ratings almost never plays ...Qb6 here. |
| London textbook, 8...c4 / 8...cxd4 / 8...Bxg3 | 0.044% / 0.030% / 0.020% | The textbook position itself is a 0.21% position, and the three alternatives are 13 to 19% of it. |
| London: 1.d4 e6 2.Bf4 Qf6 | 0.49% | Bxc7 is only about +0.85 and Qxb2 follows. Not a clean refutation. |
| London: ...Bg4, ...Ne4, h3 Bxf3 | 0.32% | Equal, no tactic. |
| London: 3.e3 Nh5?? Qxh5 | 0.16% | Under the cut, and one move long (a free piece). Cheap to add as a bare pin if wanted. |
| Caro: 2.Qf3 (2.4%), 2.e5 (1.9%), 2.f4 (1.6%) | 1.6% to 2.4% | The most-reached holes left, but they are setups with no tactic (Black is simply fine), so Intermediate material, not Advanced. See "Found on the way". |
| Caro: 2.Nf3 d5 3.Ng5 h6 | 0.37% | Under the cut. |
| Caro: 4.Nxe4 Bf5 5.Qf3 / 5.Ng5 | 0.35% / 0.34% | Under the cut; 5.Qf3 e6 6.Bd3? Qxd4 repeats the Intro's Bd3 Qxd4 motif. |
| Caro: Advance 5.Nc3 ... Bxf5 Nxf5 | 0.21% | Under the cut, quiet. |
| Caro: 2.Bc4 line to move 9 | 0.31% | Under the cut, quiet. |

## Engine check

`spike/check-tree.mjs` (400 ms, all prep positions): London 244 positions, Caro-Kann 389, none of the new moves
trails by 60 cp. Three older entries do (the pinned 4.Qc1 in the c5/Qb6 line at 65 cp, 1.d4 c5 2.c3 at 64 cp, and one
Caro AUTO 7...e6 at 65 cp). They are not mine; at 3 s they measure 59, 53 and 49 cp. The Qc1 one is the Intro
correction already on Mitch's list from the pilot.

Advanced lines are tactical, so every new student move was also run at 3 s with `spike/check-line.mjs` (new). Loss is
how far the move's score falls below Stockfish's best, in centipawns, at 400 ms / 3 s:

| Line | Moves | Worst loss |
|---|---|---|
| `bb4-ba5` | 8.Qc2 0/6, 9.Ne5 0/6, 10.dxe5 0/0 | 0 / 6 |
| `bxg3` | 6.hxg3 0/0, 7.Nc3 3/0, 8.Ne5 0/0, 9.dxe5 0/0, 10.Nxe4 0/0 | 3 / 0 |
| `f6-g5` | 4.Qh5+, 5.Bg3, 6.Qf3, 7.h4, 8.Rxh4: all 0/0 | 0 / 0 |
| `ne4-f3` | 4.Bd3, 5.f3, 6.Bxd6, 7.Bxe7, 8.Qxd3: all 0/0 | 0 / 0 |
| `nf3-dxe4` | 3...dxe4, 4...Nd7, 5...Nxe5, 6...Qa5+, 7...Qxe5: all 0/0 | 0 / 0 |
| `qh5` | 2...Nf6, 3...e5, 4...d5, 5...cxd5, 6...Nc6, 7...bxc6, 8...Bd6: all 0/0 | 0 / 0 |
| `f3-d4` | 3...d4, 4...e5, 5...d3, 6...g6: all 0/0 | 0 / 0 |
| `ne5-qd4` | 3...dxe4, 4...e6, 5...Qd4, 6...g6: all 0/0 | 0 / 0 |

In `bb4-ba5` Stockfish's first choice at moves 8 and 9 is a4 (or g4 at 400 ms); Qc2 and Ne5 are within 6 cp of it and are the
ones that keep the h7 diagonal the note is about.

What the notes say about the tempting alternatives was checked the same way, at 0.7 to 3 s, and played out in chess.js
(`src/data/advanced.test.ts`):

- 4.Bxg5? fxg5: Black is better (-1.15 to -1.29). 4.Qh5+ is +3.0. After Qh5+ Kd7, 5.Qg4+? e6 is -2.3.
- 5...Bb4+ 6.c3 is +0.74 against +0.19 after 5...Bd6 (3 s). After 10.dxe5 the best Black move (Nh5) still leaves +3.5.
- 5.f3: Black's other moves are +3.5 or more for White; 5...Nd6 is +1.1. 5.Bxe4 is +0.15.
- 6.hxg3 +0.44, 6.fxg3 -0.55 (3 s).
- 5.Bc4: 5...Nxe5 -1.66 for White's side, 5...e6 -0.16, 5...Nh6 -0.14. 5...Qa5+? is +4.9 for White.
- 7.Bxc6+: ...bxc6 -2.6 (Black better), ...Bd7 +4.9, ...Ke7 +4.8, ...Nd7 +6.1.
- 5.c3? d3: Black is +3.3 or more whatever White does at move 6; White has no attacker on d3. 5.f4 is -0.46.
- 6.Qh5: ...g6 Black +4.35, ...Nf6 +2.75.

## Tree

Only pins; the new lines add positions and no prep move changes. London +18 positions (226 to 244), Caro-Kann +20
(369 to 389). `spike/tree-snapshot.mjs` (new) dumps every opening's tree and diffs two dumps:

```
london: 226 before, 244 after; 18 added, 0 removed, 0 changed
caro-kann: 369 before, 389 after; 20 added, 0 removed, 0 changed
queens-gambit, slav, italian, french, scotch, qgd: no difference
```

**Regeneration, one round.** `KEEP=1 node build-tree.mjs` for each. Caro-Kann came back identical (the generator only follows
replies Maia plays at least 8% of the time, and none of the new branches is that common). London dropped 4 AUTO entries that are now
pinned with the same move, and changed nothing else; the diff above is taken after it. `KEEP=1` had been doing nothing for
the London: `spike/london.js` did not export `AUTO`, so the generator started from nothing and moved 11 prep moves. It
exports it now. Without the fix the same command breaks the content rule.

The existing content-rule test (no pinned line overrides an AUTO entry) passes, and a new one rebuilds each tree without the
Advanced lines and checks every position keeps its move.

## Product changes

- Three tiers in the rail. The rail already grouped by tier, so nothing new was needed for Advanced to fold ("Advanced: 4
  more lines open after the Intermediate lines.") and to take a heading once it opens. The grouping moved out of
  `drill-view.ts` into `tierRuns()` in `levels.ts` so it can be tested; the rendering is unchanged.
- `critical(...)` in `openings.ts`, next to `deeper(...)`: the same stage with `tier: 'advanced'` and a note.
- Idea texts: 15 for the London and 17 for the Caro-Kann, as `ADVANCED_MOMENTS` in each ideas file, for the positions where
  the generic text would be wrong or silent (a check, a trap, the knight that attacks instead of develops). Every other new
  position takes a generic text that is true there ("Take on h4.").
- Browser check at 800 px: Intro, Intermediate and Advanced headings; a note opens; a London with the Intro and
  Intermediate lines learned opens `bb4-ba5` and plays it through to 10.dxe5; a Caro-Kann with only Intro learned shows the
  Advanced fold line.

## Found on the way (not built)

- **Holes in the Intro,** by what Maia reaches: 1.d4 c6 (1.6%) and 1.d4 b6 (1.5%) for the London; 2.Qf3 (2.4%), 2.e5 (1.9%)
  and 2.f4 (1.6%) for the Caro-Kann. All have no prep move. They are setups, so Intermediate material.
- **`nf3-dxe4` may belong lower.** 3.Nf3 is the most-reached gap in the Caro-Kann's third move and has no Intro or
  Intermediate cover. It is in Advanced because it carries a tactic, but if Mitch wants it earlier it is a one-line move
  within `openings.ts` (stage order only; its ladder entries are its own).
- The three older trailing entries above.
- `spike/london.js` keeps its `LINES` by hand-copy from `london.ts` (the pilot's note). It still does; the two match.
