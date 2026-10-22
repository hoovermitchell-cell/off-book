# Off Book — Design Brief
**Status:** Canonical. All design decisions defer to this document.
**Last updated:** 2026-10-21

Decided by Mitch in a design grill on 2026-10-21 (Claude Code session), one
topic at a time. Token values live in [design/tokens.css](design/tokens.css)
and are proposed until Mitch confirms them from
[design/proof.html](design/proof.html).

## North Star
> A prep binder: "Your prep, getting sharper every week."

It should feel like a serious player's well-used tournament binder. Tabs,
scoresheets, notes in the margin. The collection mechanics from decision 5 live
inside the binder. Leveling up shows as wear and records, never as confetti.

## Principles

**Board first.** The board is the biggest, calmest thing on screen; everything
else is a margin note around it. No panels, badges or decorative board themes
compete with the position.

**Earned, not awarded.** Progress is a record of real reps and real games:
tallies, wear, battle records. No confetti, streak guilt, fake urgency or
rewards nobody worked for.

**Show the work.** Every verdict ("Mistake", "Your prep ends here") sits next
to the number that produced it. No unexplained judgements and no "the AI says
so."

**Plain talk, chess words.** Copy uses real chess vocabulary (prep, book move,
deviation) and teaches it in context. No kiddie tone, and no jargon left
unexplained.

## Lineage
- [x] Editorial / print-derived. Borrowed from the binder's real materials:
  index tabs, ruled scoresheet lines, pen annotations, generous margins.
- [ ] Utility / dense
- [ ] Expressive / brand-forward

Print-derived pulls toward the stock AI look of cream paper, serif display and
terracotta. That look is rejected below by name.

## Color semantics
Scoresheet and ink: cool white paper, blue-black ballpoint, pale ruling, one
highlighter. Light theme only in v1; every color is a token so a dark theme
("carbon copy") can be added later without touching components.

| Token | Value | Role |
|---|---|---|
| `--paper` | `#f6f8fb` | Page ground, cool white with a blue bias |
| `--paper-sheet` | `#ffffff` | A sheet lifted off the page: move list, notes |
| `--rule` | `#cdd6e1` | Ruled lines and dividers. Decorative, never text or a control border |
| `--ink` | `#1a2740` | Body text |
| `--ink-soft` | `#4b5a72` | Secondary text, captions, engine labels |
| `--pen` | `#2447a8` | Anything you can click: links, buttons, focus ring |
| `--highlighter` | `#dcf26a` | "This is your prep." Background only, ink on top |
| `--mark-good` | `#1d7a3c` | `!` |
| `--mark-dubious` | `#876400` | `?!` |
| `--mark-mistake` | `#b04800` | `?` |
| `--mark-blunder` | `#b3261e` | `??` |
| `--board-light` / `--board-dark` | `#eceee3` / `#4f7d54` | Tournament vinyl board. Dark green darkened so white coordinates pass AA (4.8:1) |

**Move quality uses real annotation glyphs** (`!` `?!` `?` `??`, highlighter
for book moves). The glyph carries the meaning and the color backs it up, which
keeps the "never color alone" rule and teaches notation students see
everywhere.

**Board.** Green-and-white tournament vinyl: the board students play on over
the board. Mitch: "I want to make sure the actual playing experience feels like
chess.com or lichess, so more tangible pieces than icons." Chessground supplies
the Lichess feel (drag or click, legal-move dots, premove, slide). Pieces are a
custom set made for Off Book, because the shaded Lichess sets are licensed
non-commercial. Mitch chose the **stylized top-down** set: clean Staunton
shapes with gradient shading and a dark outline, seen from about 55 degrees
overhead like chess.com's 3D sets ("They should be shown from the top down").
Each piece is recognized by its top, so crowns, mitres and crenellations must
stay distinct at 44px. The **wood top-down** set (boxwood and ebony) is kept
for later, Mitch: "Keep the wood around though for later." A likely home is a
second piece set students can switch to. Its test art stays in
`design/pieces/wood-top/`. Brief and production spec:
[design/pieces/BRIEF.md](design/pieces/BRIEF.md). A highlighted square (last move, prep target)
always gets the highlighter fill plus an inset ink ring. The fill alone measures
1.04:1 on a light square and disappears.

## Mark
**Off the page**: an open scoresheet with a knight stepping off its edge, in
ink with one highlighter stroke. Mitch chose it after seeing the favicon at
real size: "Lock in off the page as the logo." The full mark serves
app icons (180px and up) and the lockup beside "Off Book" set in Atkinson
Hyperlegible Next Bold. It blurs below about 48px, so favicons use a
simplified hand-drawn version on a paper tile, which keeps it visible on dark
browser tab bars: `favicon.svg`, with `favicon-svg-16.png` and
`favicon-svg-32.png` as fallbacks. Files: [design/brand/off-the-page/](design/brand/off-the-page/).
The tab and highlighted-knight directions were not chosen; their files stay
in `design/brand/` for reference. Before going public, confirm the mark is distinct from Lichess's
knight logo (backlog: trademark check).

## Type
All OFL, all self-hosted from [design/fonts/](design/fonts/), with each
license file beside its font. `tokens.css` declares the `@font-face` rules.

- **UI and body:** Atkinson Hyperlegible Next. Built for legibility.
- **Notation:** Atkinson Hyperlegible Mono, tabular, so move columns line up.
- **Margin notes:** one handwritten face, used only for coach-style notes in
  the margin. **Kalam**, chosen by Mitch from the proof: "Use Kalam for
  margin notes." Patrick Hand read more like plain type; Caveat was the
  hardest to read at note size.

Scale is a 1.2 ratio from 16px (13, 14, 16, 19, 23, 28), sized so the board and
move list both fit a 1366x768 Chromebook screen.

## Motion
Each duration has one job; nothing else moves.

| Duration | When |
|---|---|
| ~150ms ease-out | A piece slides to its square |
| ~120ms | A glyph or highlight inks in |
| ~400ms, once | The level-up stamp. The only flourish in the app |

With reduced motion, everything is instant and the stamp shows already stamped.

## Quality floor
- WCAG 2.1 AA (ADA Title II).
- The board is fully keyboard-operable, and moves are announced in a live region.
- Never color alone.
- On a 1366x768 Chromebook, the board, move list and current feedback are all
  visible without scrolling.
- 44px minimum touch target for every control and every square. Many school
  Chromebooks are touchscreens.
- No third-party calls. Fonts, pieces and assets are self-hosted. The only
  outside requests from a student's browser are the Lichess and Chess.com
  imports the student starts.

Phone width (375px) was offered for the floor and left out. Phones aren't
required to work.

## Explicitly rejected
Turned down on 2026-10-21, with the trade-off that decided it.

- **Cream paper, serif display, terracotta accent.** The default AI look, and
  the nearest trap for a print-derived brief.
- **Confetti, streaks, celebratory gamification.** Breaks "Earned, not
  awarded."
- **Collection-album North Star.** The most motivating for younger students,
  but it reads babyish to high schoolers.
- **Tournament-hall North Star.** Credible but the least playful.
- **Utility/dense lineage.** Good for review screens, but loses the binder.
- **Expressive lineage.** Fights "Board first" and the Chromebook budget.
- **Manila folder palette.** Buff sits too close to the rejected cream.
- **Notebook paper palette.** Reads as homework.
- **Words-only move marks.** Doesn't teach notation and takes more room.
- **Ink-only move marks.** Weakest at a glance; contrast rides on shape alone.
- **Flat icon pieces (cburnett and similar).** Mitch wants pieces that feel
  solid, like chess.com or Lichess, not icons.
- **Lichess's shaded piece sets** (staunty, maestro, california, cardinal,
  tatiana). All CC BY-NC-SA, which an AGPL app can't use.
- **Front-on pieces** (round 1 of the custom set). Mitch: "They should be
  shown from the top down."
- **Plastic top-down set.** Mitch picked stylized. In review, plastic's white
  pieces faded into the light squares.
- **Lichess brown and ink blue-grey boards.** Brown clashes with the cool
  palette; blue-grey looks like no board students actually play on.
- **System fonts.** Fastest, but the least distinctive, and notation alignment
  depends on the OS.
- **Lively motion** (page transitions, hover lift, animated meters). Fights
  "Board first" and "Earned, not awarded."
- **Dark theme in v1, and light-only forever.** Light ships first; dark comes
  later on the same tokens.
