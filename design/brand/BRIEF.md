# Art brief: Off Book mark, app icons and level-up stamp

Canon: [../../DESIGN.md](../../DESIGN.md). Colors: [../tokens.css](../tokens.css).
Piece style reference: `../pieces/stylized-top/` (the chosen set).

Off Book is a chess opening trainer for middle and high school students. The
design North Star is a prep binder: "Your prep, getting sharper every week."
Scoresheet paper, blue-black ballpoint ink, one highlighter that marks your
prep. "Off book" is the chess term for leaving your memorized opening.

All work is original. Do not imitate chess.com, Lichess, ChessKid or any
existing chess brand.

## 1. Logo mark: three directions for Mitch to choose from

A symbol only, no lettering. The wordmark is typeset separately in Atkinson
Hyperlegible Next, so never render text in the image.

- **tab**: a binder index tab, the kind that sticks out of a prep binder, with
  a knight's head on it. Pen blue `#2447a8` tab, paper-white knight.
- **highlighted-knight**: a knight from the chosen stylized top-down set,
  simplified, with one highlighter swipe `#dcf26a` behind it, the way you'd
  mark a move in your notes.
- **off-the-page**: an open book or scoresheet with a knight stepping off the
  edge of the page. Ink `#1a2740` line work with one highlighter accent.

Rules for all three:

- Flat or near-flat, at most one soft gradient. It must read at 16 px.
- Uses only token colors: `--ink`, `--pen`, `--highlighter`, `--paper`.
- Centered, transparent background, generous padding.

Deliverables per direction `<d>` in `design/brand/<d>/`:

- `mark.png`: 1024 x 1024 transparent master, generated on its own full
  canvas at the highest quality available.
- `icon-512.png`, `icon-192.png`: the mark on a `#f6f8fb` rounded-square
  ground, for the web app manifest.
- `icon-maskable-512.png`: same, with the mark inside the central 80% safe
  zone and the ground running to the edges.
- `apple-touch-icon.png`: 180 x 180, opaque.
- `favicon-32.png`: 32 x 32. Simplify the mark if needed so it still reads.

## 2. Level-up stamp texture

The level-up moment is a rubber stamp pressed into the binder. It's the only
flourish in the app, so it should look like real ink.

- `design/brand/stamp/stamp-frame.png`: 1024 x 512 transparent PNG. A
  rectangular rubber-stamp border with slightly rounded corners, uneven ink
  coverage, small gaps and speckle like a real stamp. No text inside: the page
  sets "LEVEL 3" and the line name in live type.
- One color only, pure black on transparent, so the page can recolor it with
  a CSS mask.
- `design/brand/stamp/stamp-texture.png`: 1024 x 512, the same ink grain alone,
  black on transparent, to mask the live text so it looks stamped too.

## 3. Small-size mark for off-the-page (2026-10-21)

Mitch picked off-the-page: "I like the off the page logo I think." At 16 and
32 px the open book and knight blur together, so it needs a simplified version
for favicons. Hand-write it as SVG code; do not use image generation.

- `design/brand/off-the-page/favicon.svg`: 32 x 32 viewBox, at most four
  shapes. Keep only what identifies the mark: one page edge or corner, the
  knight's head and neck crossing over that edge, and one short highlighter
  stroke `#dcf26a` on the page. Ink `#1a2740`, solid fills or strokes of at
  least 2 units, no detail thinner than 1.5 units. Transparent background.
  Knight faces the same way as in `off-the-page/mark.png`.
- It must read as the same mark as `off-the-page/mark.png` at a glance, and
  as a knight leaving a page at 16 px.
- No embedded styles, fonts or scripts.

Don't produce PNGs from it; Claude Code renders those. Leave every existing
file untouched.

## Record and report

Append every prompt to `design/brand/prompts.md`. When finished, list every
file with its pixel size.

## Do not

- Commit anything. Art stays in the working tree for Mitch to review.
- Write outside `design/brand/`. Another run is working in `design/pieces/`.
