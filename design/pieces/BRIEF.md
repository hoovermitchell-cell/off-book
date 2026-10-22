# Art brief: Off Book piece set, material test

Canon: [../../DESIGN.md](../../DESIGN.md). Board colors: [../tokens.css](../tokens.css).

## Why

Mitch, 2026-10-21: "I want to make sure the actual playing experience feels
like chess.com or lichess, so more tangible pieces than icons." The shaded
Lichess sets are non-commercial licensed and chess.com's are proprietary, so
Off Book gets its own set. It must be original work. Do not trace, copy or
imitate any existing chess.com, Lichess or commercial piece set.

Mitch asked for three materials so he can choose: "Produce all 3 and I'll
choose." This run is that comparison. The full production set comes later,
for the winner only.

## The three materials

1. **plastic**: weighted tournament plastic Staunton, the set used on green
   vinyl boards at scholastic tournaments. White is a warm off-white plastic,
   black is a deep black plastic. Soft sheen, molded edges, no wood grain.
2. **wood**: classic boxwood (white) and ebony (black) Staunton with subtle
   visible grain and a satin finish.
3. **stylized**: not a real material. Clean Staunton shapes with smooth
   gradient shading and a crisp darker outline, built for readability at
   small sizes.

## Shared rules (all three)

- Standard Staunton shapes. King has a cross finial, queen a coronet, bishop a
  mitre with a slit, rook crenellations, knight a horse head facing left.
- Same view for every piece: front view with a slight downward angle (about
  15 degrees), the way pieces look on a chess app board.
- Light from the upper left on every piece.
- Every piece is centered and stands on one shared baseline. Relative heights:
  king tallest at about 88% of its square, pawn about 58%, the rest in
  proportion. Bases share one width family.
- No ground shadow, no reflection, no background scenery.
- Readable at 44 px. Each silhouette must be identifiable when shrunk to a
  44 px square.
- White pieces sit on light squares `#eceee3`, so they need an edge or shading
  darker than that square. Black pieces sit on dark squares `#5b8a5f`, so they
  need rim light or a highlight that separates them from it.

## Deliverables

For each material `<m>` in `plastic`, `wood`, `stylized`:

- `design/pieces/<m>/lineup.png`: one image with all 12 pieces, white on the
  top row and black on the bottom row, in the order K Q R B N P. Evenly spaced
  on a flat solid background that's easy to key out.
- `design/pieces/<m>/wK.png` ... `bP.png`: the 12 pieces cut out to
  individual transparent PNGs, each 512 x 512, piece centered on the shared
  baseline described above. Names follow chessground: `w`/`b` then
  `K Q R B N P`.

Generate each lineup on a full canvas at the highest quality available. If a
lineup gives inconsistent pieces (mismatched light, scale or style), generate
the pieces individually instead and assemble the lineup from them.

Record every prompt you used, per material, in `design/pieces/prompts.md`.

## Round 2: top-down (2026-10-21)

Mitch, after round 1: "They should be shown from the top down." Asked how
chess.com does it: its 3D piece sets view each piece from a steep angle, so you
see the top of the piece and its round base. Round 2 redoes all three materials
that way. These rules replace the round 1 view and size rules; everything else
above still applies.

- **View:** camera high above the piece, looking down at about 55 degrees, the
  way a seated player sees pieces on the board. The top of each piece faces
  the viewer (crown, coronet, mitre, crenellations, horse head and mane) and
  the circular base shows as a wide ellipse. Same angle for all 12 pieces.
- **Fill:** each piece fills about 85% of its 512 x 512 square at its widest
  or tallest. King and queen largest, pawn smallest, but even the pawn fills
  at least 60%. No wasted margin.
- **Readable from above:** each piece's identity must come from its top. The
  king's cross, the queen's coronet points, the bishop's mitre slit, the rook's
  crenellations and the knight's head and ears must stay clear at 44 px.
- **Knight** still faces left.
- **Output:** write to `design/pieces/<m>-top/` (`plastic-top`, `wood-top`,
  `stylized-top`), same file names as round 1. Leave the round 1 folders
  untouched for comparison. Append round 2 prompts to `prompts.md`.

## Production: stylized top-down (2026-10-21)

Mitch chose the round 2 **stylized** set: "Go with the stylized top-down set."
He also said "Keep the wood around though for later," so `wood-top/` stays as
it is. Do not delete or change any round 1 or round 2 folder.

This pass turns `stylized-top/` into the shipping set. Use
`stylized-top/lineup.png` and the 12 `stylized-top/*.png` files as the style
and angle reference. Same look, same 55 degree view, same outline, same
gradient shading. The fixes below come from reviewing round 2 on the board.

**Generate one piece per canvas**, each on its own full canvas at the highest
quality available, with the reference images attached. Do not crop pieces out
of a shared sheet for this pass.

Fixes, all at 44px:

- **Tell the black king, queen, bishop and pawn apart.** At 44px from above
  they blur into similar dark blobs. Make each top louder: a taller, bolder
  king's cross; queen coronet points and balls larger and spread wider; a
  deeper, wider bishop slit with a clear top knob; the pawn a plain ball,
  clearly the smallest piece.
- **Rook:** keep the bold open crenellated top.
- **Black pieces:** a cool rim highlight along the upper-left edges so each
  piece separates from the dark square `#5b8a5f`.
- **Outline:** one weight on every piece, heavy enough to survive scaling
  to 44px (about 2% of the canvas width).
- **Placement:** every piece horizontally centered, with the bottom of its
  base ellipse on the same line, about 94% down the canvas. Height fill as in
  round 2 (tall pieces about 85%, pawn at least 70%).

Deliverables, in `design/pieces/offbook/`:

- `master/wK.png` ... `master/bP.png`: 1024 x 1024 transparent masters.
- `wK.webp` ... `bP.webp`: 256 x 256 transparent runtime files, downscaled
  from the masters, lossless or quality 90 or above.
- `check-44.png`: a contact sheet of all 12 runtime pieces at 44px, each
  shown once on `#eceee3` and once on `#5b8a5f`, for Mitch's review.
- Append the prompts to `prompts.md`, and report each piece's fill and base
  line position as measured on the master.

The set is original work generated for Off Book and ships under the
project's license.

## Do not

- Commit anything. Art stays in the working tree for Mitch to review.
- Touch anything outside `design/pieces/`, in particular `spike/`.
