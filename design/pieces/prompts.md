# Off Book piece material prompts

Generated 2026-10-21 with the built-in image generation tool. The tool exposes no separate quality or resolution selector; each prompt requested its highest available quality and maximum full-canvas resolution. All three saved source images are 2172 x 724. No existing chess artwork was supplied as a reference.

## Export and checks

The three full-canvas generations supplied all 36 pieces. Cut-out processing removed the magenta background, recovered antialiased edges, and removed remaining key-color contamination. Each piece was scaled uniformly, without stretching, and placed on a transparent 512 x 512 canvas. The bottom of each alpha bounding box is y=482; the visible last row is y=481. Horizontal bounding-box centers are within half a pixel of x=256.

Piece heights are K=450, Q=415, R=328, B=379, N=358, P=297 pixels. Kings occupy 87.9% of a square; pawns occupy 58.0%. Each final lineup was assembled from the twelve exported cut-outs in six 512-pixel columns and two rows, white above black, K Q R B N P. Its 3072 x 1024 size is an export layout, not the native generation resolution. The background is exactly #ff00ff.

Root performed the image and file checks directly: piece order and silhouettes, left-facing knights, material consistency, 44-pixel previews on #eceee3 and #5b8a5f, PNG decoding, dimensions, alpha channels, shared baselines, centering, edge contamination, and exact agreement between lineup tiles and cut-outs. No subagent was needed for this bounded generation and extraction pass. These are material proposals for Mitch's review, not accepted production art.

Only the three prompts below were submitted. No individual-piece generation or image-edit prompts were used. Extraction and export were mechanical processing of the generated lineups.

## plastic

### Lineup generation

```text
Create an ORIGINAL Staunton chess-piece sprite lineup for Off Book. Do not trace, copy, or imitate any existing digital or commercial piece set. Highest quality and maximum full-canvas resolution available. Landscape canvas, ideally 3072 x 1024 with six equal square columns and two equal square rows. Exactly 12 complete isolated pieces, no other objects, no text, no labels, no board. Top row WHITE from left to right KING, QUEEN, ROOK, BISHOP, KNIGHT, PAWN. Bottom row BLACK same order KING, QUEEN, ROOK, BISHOP, KNIGHT, PAWN. Each piece centered horizontally within its own cell with generous separation. Bottoms share a baseline 94% down each row. King height 88% of row height, queen 81%, rook 64%, bishop 74%, knight 70%, pawn 58%. Same family of broad stable stepped round bases, width about 51-59% of cell, pawn base 46%. Pair white and black geometry closely. Standard recognizable Staunton: king has a clear upright CROSS finial; queen has a pointed CORONET; rook a broad castellated tower with clear crenellations; bishop a tapered mitre with a bold diagonal slit; knight a HORSE HEAD facing LEFT in profile; pawn a round ball head and curved stem. Every piece viewed from the front with the SAME slight 15-degree downward camera angle, not overhead. Lighting from UPPER LEFT consistently. Tangible dimensional shading, clean silhouettes identifiable at 44 pixels. White has darker edge shading so it separates from #eceee3; black has restrained pale rim highlights so it separates from #5b8a5f. Flat perfectly uniform bright magenta #ff00ff backdrop for precise cutout, including all gaps. Background must be independent flat color, no magenta reflected light on pieces. NO ground shadow, cast shadow, reflection, surface, horizon, scenery, gradient background, surrounding glow, lettering or watermark. Pieces must not overlap or be cropped.

Material direction PLASTIC: original weighted scholastic tournament Staunton pieces in molded plastic. White is warm off-white ivory plastic; black is deep neutral black plastic. Subtle soft sheen and gently rounded molded edges, broad stable bases, clean unadorned forms. No wood grain, no metallic gloss, no tiny decorative details. Convincingly solid physical tournament plastic.
```

## wood

### Lineup generation

```text
Create an ORIGINAL Staunton chess-piece sprite lineup for Off Book. Do not trace, copy, or imitate any existing digital or commercial piece set. Highest quality and maximum full-canvas resolution available. Landscape canvas, ideally 3072 x 1024 with six equal square columns and two equal square rows. Exactly 12 complete isolated pieces, no other objects, no text, no labels, no board. Top row WHITE from left to right KING, QUEEN, ROOK, BISHOP, KNIGHT, PAWN. Bottom row BLACK same order KING, QUEEN, ROOK, BISHOP, KNIGHT, PAWN. Each piece centered horizontally within its own cell with generous separation. Bottoms share a baseline 94% down each row. King height 88% of row height, queen 81%, rook 64%, bishop 74%, knight 70%, pawn 58%. Same family of broad stable stepped round bases, width about 51-59% of cell, pawn base 46%. Pair white and black geometry closely. Standard recognizable Staunton: king has a clear upright CROSS finial; queen has a pointed CORONET; rook a broad castellated tower with clear crenellations; bishop a tapered mitre with a bold diagonal slit; knight a HORSE HEAD facing LEFT in profile; pawn a round ball head and curved stem. Every piece viewed from the front with the SAME slight 15-degree downward camera angle, not overhead. Lighting from UPPER LEFT consistently. Tangible dimensional shading, clean silhouettes identifiable at 44 pixels. White has darker edge shading so it separates from #eceee3; black has restrained pale rim highlights so it separates from #5b8a5f. Flat perfectly uniform bright magenta #ff00ff backdrop for precise cutout, including all gaps. Background must be independent flat color, no magenta reflected light on pieces. NO ground shadow, cast shadow, reflection, surface, horizon, scenery, gradient background, surrounding glow, lettering or watermark. Pieces must not overlap or be cropped.

Material direction WOOD: original classic Staunton pieces, white in warm pale BOXWOOD and black in rich dark EBONY. Subtle natural fine wood grain following the turned forms, satin finish, carefully carved left-facing horse, restrained turning details. Ebony should read black, not brown. No metallic gloss. Physical wooden pieces, not icons.
```

## stylized

### Lineup generation

```text
Create an ORIGINAL Staunton chess-piece sprite lineup for Off Book. Do not trace, copy, or imitate any existing digital or commercial piece set. Highest quality and maximum full-canvas resolution available. Landscape canvas, ideally 3072 x 1024 with six equal square columns and two equal square rows. Exactly 12 complete isolated pieces, no other objects, no text, no labels, no board. Top row WHITE from left to right KING, QUEEN, ROOK, BISHOP, KNIGHT, PAWN. Bottom row BLACK same order KING, QUEEN, ROOK, BISHOP, KNIGHT, PAWN. Each piece centered horizontally within its own cell with generous separation. Bottoms share a baseline 94% down each row. King height 88% of row height, queen 81%, rook 64%, bishop 74%, knight 70%, pawn 58%. Same family of broad stable stepped round bases, width about 51-59% of cell, pawn base 46%. Pair white and black geometry closely. Standard recognizable Staunton: king has a clear upright CROSS finial; queen has a pointed CORONET; rook a broad castellated tower with clear crenellations; bishop a tapered mitre with a bold diagonal slit; knight a HORSE HEAD facing LEFT in profile; pawn a round ball head and curved stem. Every piece viewed from the front with the SAME slight 15-degree downward camera angle, not overhead. Lighting from UPPER LEFT consistently. Tangible dimensional shading, clean silhouettes identifiable at 44 pixels. White has darker edge shading so it separates from #eceee3; black has restrained pale rim highlights so it separates from #5b8a5f. Flat perfectly uniform bright magenta #ff00ff backdrop for precise cutout, including all gaps. Background must be independent flat color, no magenta reflected light on pieces. NO ground shadow, cast shadow, reflection, surface, horizon, scenery, gradient background, surrounding glow, lettering or watermark. Pieces must not overlap or be cropped.

Material direction STYLIZED: original clean Staunton dimensional illustrations for chess app play, smooth controlled gradient shading and crisp darker outlines. White warm ivory with charcoal outline, black charcoal-black with a crisp near-black outline and upper-left light-gray contour highlights. Tangible sculpted volume, not flat icons, not photorealistic. Deliberately simplified bold details for 44px readability. No texture, no grain, no hatching.
```


## Round 2: top-down (2026-10-21)

Generated with the built-in image generation tool. All three prompts requested highest available quality and maximum full-canvas resolution. The tool exposes no separate quality or resolution setting. Each source generation was 2172 x 724 pixels. No existing chess artwork was used as a reference. The only image-generation calls for round 2 were the three full prompts recorded below.

### Round 2 export and verification

The source lineups were cut out mechanically, with magenta key removal, antialiased edge recovery and a final spill correction after resizing. Each piece was scaled uniformly from its source cut-out, without stretching, and placed on a transparent 512 x 512 RGBA canvas. Final sizing was tightened from the requested source layout: K/Q/R/B/N/P maximum extents are 435/430/420/425/422/369 pixels. King and queen remain largest; pawns remain smallest and exceed the 60% minimum.

Every visible bounding box ends at y=482 (last occupied row y=481), and its horizontal center is within half a pixel of x=256. Each final lineup is 3072 x 1024, assembled from the exported pieces on an exact #ff00ff background: white above black, K Q R B N P. This assembled size is not native generation resolution.

Root checked the generated top views, piece identities, left-facing knights, consistent upper-left lighting and material treatment, then inspected 44-pixel composites on both #eceee3 and #5b8a5f. Automated checks passed for all PNG decodes, dimensions, alpha channels, baseline, centering, fill, magenta contamination and pixel-exact agreement between lineup tiles and cut-outs. SHA-256 comparisons confirmed that the brief and all 39 round 1 images were unchanged. Root performed generation, extraction and verification directly; this bounded asset workflow stayed inline because a separate handoff would duplicate the same image inspection and export work. These are material proposals for Mitch's review, not production-art approval.

### Round 2 measured fill

Measurements below come from the exported files. All piece canvases are 512 x 512. Visible bbox includes all alpha > 0 pixels, including antialiasing. Extent fill is max(bbox width, bbox height) / 512; bbox area is width * height / 512^2, not the number of painted pixels. Fully opaque bbox uses alpha = 255 and is supplied separately so the threshold is explicit.

| File | Visible bbox px | Extent fill | Bbox area | Fully opaque bbox px |
|---|---:|---:|---:|---:|
| plastic-top/wK.png | 292 x 435 | 84.96% | 48.45% | 288 x 431 |
| plastic-top/wQ.png | 304 x 430 | 83.98% | 49.87% | 299 x 426 |
| plastic-top/wR.png | 293 x 420 | 82.03% | 46.94% | 289 x 415 |
| plastic-top/wB.png | 294 x 425 | 83.01% | 47.66% | 289 x 421 |
| plastic-top/wN.png | 312 x 422 | 82.42% | 50.23% | 308 x 418 |
| plastic-top/wP.png | 277 x 369 | 72.07% | 38.99% | 272 x 362 |
| plastic-top/bK.png | 291 x 435 | 84.96% | 48.29% | 287 x 433 |
| plastic-top/bQ.png | 300 x 430 | 83.98% | 49.21% | 295 x 425 |
| plastic-top/bR.png | 292 x 420 | 82.03% | 46.78% | 287 x 415 |
| plastic-top/bB.png | 293 x 425 | 83.01% | 47.50% | 287 x 420 |
| plastic-top/bN.png | 310 x 422 | 82.42% | 49.90% | 305 x 417 |
| plastic-top/bP.png | 276 x 369 | 72.07% | 38.85% | 271 x 363 |
| wood-top/wK.png | 308 x 435 | 84.96% | 51.11% | 303 x 429 |
| wood-top/wQ.png | 302 x 430 | 83.98% | 49.54% | 297 x 425 |
| wood-top/wR.png | 315 x 420 | 82.03% | 50.47% | 311 x 416 |
| wood-top/wB.png | 319 x 425 | 83.01% | 51.72% | 315 x 421 |
| wood-top/wN.png | 343 x 422 | 82.42% | 55.22% | 339 x 418 |
| wood-top/wP.png | 295 x 369 | 72.07% | 41.52% | 291 x 365 |
| wood-top/bK.png | 316 x 435 | 84.96% | 52.44% | 311 x 430 |
| wood-top/bQ.png | 311 x 430 | 83.98% | 51.01% | 307 x 426 |
| wood-top/bR.png | 320 x 420 | 82.03% | 51.27% | 314 x 416 |
| wood-top/bB.png | 321 x 425 | 83.01% | 52.04% | 316 x 420 |
| wood-top/bN.png | 343 x 422 | 82.42% | 55.22% | 338 x 418 |
| wood-top/bP.png | 297 x 369 | 72.07% | 41.81% | 293 x 364 |
| stylized-top/wK.png | 299 x 435 | 84.96% | 49.62% | 295 x 428 |
| stylized-top/wQ.png | 294 x 430 | 83.98% | 48.23% | 290 x 426 |
| stylized-top/wR.png | 312 x 420 | 82.03% | 49.99% | 307 x 415 |
| stylized-top/wB.png | 305 x 425 | 83.01% | 49.45% | 300 x 420 |
| stylized-top/wN.png | 333 x 422 | 82.42% | 53.61% | 328 x 417 |
| stylized-top/wP.png | 296 x 369 | 72.07% | 41.67% | 292 x 364 |
| stylized-top/bK.png | 306 x 435 | 84.96% | 50.78% | 301 x 430 |
| stylized-top/bQ.png | 301 x 430 | 83.98% | 49.37% | 297 x 425 |
| stylized-top/bR.png | 316 x 420 | 82.03% | 50.63% | 311 x 416 |
| stylized-top/bB.png | 311 x 425 | 83.01% | 50.42% | 307 x 421 |
| stylized-top/bN.png | 338 x 422 | 82.42% | 54.41% | 334 x 418 |
| stylized-top/bP.png | 296 x 369 | 72.07% | 41.67% | 292 x 363 |

### Round 2 plastic: lineup generation

```text
Create an ORIGINAL Staunton chess-piece sprite lineup for Off Book. Do not trace, copy or imitate any existing chess.com, Lichess or commercial piece set. Highest quality and maximum full-canvas resolution available. Wide landscape canvas, ideally 3072 x 1024, six equal square columns and two equal square rows. Exactly twelve complete isolated pieces. Top row WHITE, left to right KING QUEEN ROOK BISHOP KNIGHT PAWN. Bottom row BLACK, same order. No text, no labels, no board.
CAMERA IS CRITICAL: steep OVERHEAD perspective, camera elevated 55 degrees ABOVE THE HORIZONTAL, looking DOWN onto every upright piece. Same parallel/orthographic camera for all twelve. This is NOT a frontal/elevation view. See substantial TOP surfaces of crowns, collars and broad circular bases. Circular horizontal bases project as WIDE ellipses, ellipse depth approximately 82% of width. Tops appear above the center of the bases. Clearly foreshortened stems. No bottom or underside view.
Identity from above: king with bold unmistakable cross finial; queen with pointed coronet and visible crown interior; rook with distinct crenellations around its visible top; bishop with strong diagonal slit in the mitre; knight with clear horse head, ears and mane facing LEFT; pawn with smooth round ball. Standard original Staunton proportions with a consistent broad stepped base family. Match white and black geometry, camera and scale.
Each piece centered horizontally in its cell, all bottoms on shared baseline 94% down each row. King maximum extent 85% of cell, queen 83%, rook 78%, bishop 80%, knight 79%, pawn 68%. No wasted outer margin, no clipping, generous separation between pieces. All top identity details must remain readable reduced to 44px.
Consistent light from UPPER LEFT. White pieces need dark edge shading for separation from #eceee3; black pieces need restrained bright contour highlights for separation from #5b8a5f. NO ground shadow, cast shadow on backdrop, reflection, scenery, horizon, surrounding glow or watermark.
Flat perfectly uniform bright magenta #ff00ff backdrop everywhere, also inside gaps, easy to key out. No magenta reflected light or magenta contamination on the pieces.

MATERIAL PLASTIC: tangible weighted scholastic tournament molded plastic Staunton. White warm off-white plastic, black deep neutral black plastic. Soft sheen, smoothly rounded molded edges. Unadorned solid forms. No wood grain, no metallic gloss.
```

### Round 2 wood: lineup generation

```text
Create an ORIGINAL Staunton chess-piece sprite lineup for Off Book. Do not trace, copy or imitate any existing chess.com, Lichess or commercial piece set. Highest quality and maximum full-canvas resolution available. Wide landscape canvas, ideally 3072 x 1024, six equal square columns and two equal square rows. Exactly twelve complete isolated pieces. Top row WHITE, left to right KING QUEEN ROOK BISHOP KNIGHT PAWN. Bottom row BLACK, same order. No text, no labels, no board.
CAMERA IS CRITICAL: steep OVERHEAD perspective, camera elevated 55 degrees ABOVE THE HORIZONTAL, looking DOWN onto every upright piece. Same parallel/orthographic camera for all twelve. This is NOT a frontal/elevation view. See substantial TOP surfaces of crowns, collars and broad circular bases. Circular horizontal bases project as WIDE ellipses, ellipse depth approximately 82% of width. Tops appear above the center of the bases. Clearly foreshortened stems. No bottom or underside view.
Identity from above: king with bold unmistakable cross finial; queen with pointed coronet and visible crown interior; rook with distinct crenellations around its visible top; bishop with strong diagonal slit in the mitre; knight with clear horse head, ears and mane facing LEFT; pawn with smooth round ball. Standard original Staunton proportions with a consistent broad stepped base family. Match white and black geometry, camera and scale.
Each piece centered horizontally in its cell, all bottoms on shared baseline 94% down each row. King maximum extent 85% of cell, queen 83%, rook 78%, bishop 80%, knight 79%, pawn 68%. No wasted outer margin, no clipping, generous separation between pieces. All top identity details must remain readable reduced to 44px.
Consistent light from UPPER LEFT. White pieces need dark edge shading for separation from #eceee3; black pieces need restrained bright contour highlights for separation from #5b8a5f. NO ground shadow, cast shadow on backdrop, reflection, scenery, horizon, surrounding glow or watermark.
Flat perfectly uniform bright magenta #ff00ff backdrop everywhere, also inside gaps, easy to key out. No magenta reflected light or magenta contamination on the pieces.

MATERIAL WOOD: tangible classic boxwood white and ebony black Staunton. Warm pale boxwood with subtle fine visible wood grain, deep black ebony with restrained fine grain. Satin finish, neatly carved left-facing horse. No metallic gloss, ebony must read black rather than brown.
```

### Round 2 stylized: lineup generation

```text
Create an ORIGINAL Staunton chess-piece sprite lineup for Off Book. Do not trace, copy or imitate any existing chess.com, Lichess or commercial piece set. Highest quality and maximum full-canvas resolution available. Wide landscape canvas, ideally 3072 x 1024, six equal square columns and two equal square rows. Exactly twelve complete isolated pieces. Top row WHITE, left to right KING QUEEN ROOK BISHOP KNIGHT PAWN. Bottom row BLACK, same order. No text, no labels, no board.
CAMERA IS CRITICAL: steep OVERHEAD perspective, camera elevated 55 degrees ABOVE THE HORIZONTAL, looking DOWN onto every upright piece. Same parallel/orthographic camera for all twelve. This is NOT a frontal/elevation view. See substantial TOP surfaces of crowns, collars and broad circular bases. Circular horizontal bases project as WIDE ellipses, ellipse depth approximately 82% of width. Tops appear above the center of the bases. Clearly foreshortened stems. No bottom or underside view.
Identity from above: king with bold unmistakable cross finial; queen with pointed coronet and visible crown interior; rook with distinct crenellations around its visible top; bishop with strong diagonal slit in the mitre; knight with clear horse head, ears and mane facing LEFT; pawn with smooth round ball. Standard original Staunton proportions with a consistent broad stepped base family. Match white and black geometry, camera and scale.
Each piece centered horizontally in its cell, all bottoms on shared baseline 94% down each row. King maximum extent 85% of cell, queen 83%, rook 78%, bishop 80%, knight 79%, pawn 68%. No wasted outer margin, no clipping, generous separation between pieces. All top identity details must remain readable reduced to 44px.
Consistent light from UPPER LEFT. White pieces need dark edge shading for separation from #eceee3; black pieces need restrained bright contour highlights for separation from #5b8a5f. NO ground shadow, cast shadow on backdrop, reflection, scenery, horizon, surrounding glow or watermark.
Flat perfectly uniform bright magenta #ff00ff backdrop everywhere, also inside gaps, easy to key out. No magenta reflected light or magenta contamination on the pieces.

MATERIAL STYLIZED: original clean dimensional Staunton illustrations, smooth controlled gradient shading and crisp darker outline. White warm ivory with charcoal edge; black charcoal-black with near-black outline and restrained upper-left pale contour highlights. Sculpted tangible volume and bold simplified overhead top details for 44px readability. No grain, texture or hatching, not flat icons.
```




## Production: stylized top-down (2026-10-21)

Built-in image generation, one piece per canvas, transparent background requested on every call. Highest available quality requested in each prompt; the built-in tool exposes no separate quality selector. The tool returned 1254 x 1254 RGBA images. An initial 44px review found thin outlines; all twelve pieces received the recorded outline correction. The corrected images were individually trimmed around their visible bounds, uniformly reduced to 1024px master canvases, centered, and aligned. The 256px runtime WebP files are lossless. No pieces were extracted from a lineup.

Measurements and export checks: `offbook/measurements.json`. The 44px check uses decoded runtime WebP files on both specified board colors. Art remains for Mitch's review.

### wK: individual generation

References (in order):

- `C:\Users\hoove\off-book\design\pieces\stylized-top\lineup.png`
- `C:\Users\hoove\off-book\design\pieces\stylized-top\wK.png`
- `C:\Users\hoove\.codex\generated_images\01a1610a-e706-7a83-8513-4a54b349ac0b\exec-5c0687f8-854f-4923-b90a-f332027a3358.png`

Generated source: `C:\Users\hoove\.codex\generated_images\01a1610a-e706-7a83-8513-4a54b349ac0b\exec-599b2af2-a90b-4e48-92ea-e5623f5aec33.png`

```text
Use case: stylized-concept. Generate exactly ONE original Off Book Staunton chess piece on its own full 1024 x 1024 canvas, at the highest quality available. Input image 1 is the Off Book stylized-top lineup STYLE AND CAMERA REFERENCE ONLY, input image 2 is the matching individual piece SHAPE AND MATERIAL REFERENCE. Do not reproduce the lineup or its magenta background. Preserve the original set's clean dimensional illustration, smooth controlled gradients, warm ivory white / charcoal-black black palette, simple sculpted Staunton form and broad stepped round base. No grain or texture. Do not imitate any third-party chess set.
CAMERA: same steep 55 degrees above horizontal, looking DOWN as the references; parallel orthographic, substantial visible top surfaces, round base projects as a broad ellipse with depth approximately 82% of width, foreshortened stem. Upper-left lighting. Crisp dark outline of consistent approximately 20px thickness on this 1024 canvas, also on the base, to survive 44px rendering. No cast ground shadow, reflection, floor, scenery, text, labels, watermark, glow or extra object. Fully transparent RGBA background, including all gaps; no checkerboard painted into pixels.
COMPOSITION: horizontally center the silhouette at x=512; bottom of base ellipse at y=962 (94% down). Keep entire piece inside canvas. Piece details must be clear at 44px. This is one shipping asset, not a sheet.
SUBJECT: WHITE KING. Warm ivory with dark charcoal edges for separation from light square #eceee3. Same geometry as black king: substantially taller bold CROSS finial, wide horizontal arms and thick upright, prominent top plane. Finial roughly 24% of piece height. Preserve king round top platform and tapered body. Height about 870px (85%), top around y=92.
Input image 3 is the newly generated BLACK counterpart. Match its exact silhouette, proportions, cross/crown/top geometry, base profile and camera, while rendering the WHITE ivory material from image 2. One white piece only.
```

### wK: outline correction

References (in order):

- `C:\Users\hoove\off-book\design\pieces\stylized-top\lineup.png`
- `C:\Users\hoove\off-book\design\pieces\stylized-top\wK.png`
- `C:\Users\hoove\.codex\generated_images\01a1610a-e706-7a83-8513-4a54b349ac0b\exec-599b2af2-a90b-4e48-92ea-e5623f5aec33.png`

Selected source: `C:\Users\hoove\.codex\generated_images\01a1610a-e706-7a83-8513-4a54b349ac0b\exec-75066b91-1b05-4fd5-b531-1d101bb945c5.png`

```text
Edit the isolated WHITE KING in input image 3 for the Off Book shipping chess set. Highest quality available, full square transparent canvas, ONE complete piece only. Input 1 and 2 are the original stylized-top lineup and matching king, for style and 55-degree overhead camera reference. PRESERVE image 3's exact shape, pose, camera, smooth ivory gradient rendering, cross proportions, base ellipse, light from upper left and composition. CHANGE ONLY line weight: give the entire silhouette a BOLD, UNIFORM, DARK CHARCOAL OUTER CONTOUR about 2% of the full canvas width, approximately 25 pixels thick at 1254x1254 or 20 pixels at 1024x1024. A conspicuously thicker ink contour, approximately THREE TIMES the thin existing outline. It must remain about one pixel thick when the whole canvas is reduced to 44px. Include the top cross, both sides of the body and the very bottom edge of the elliptical base. Make key interior structural lines proportionately bold but preserve gradient volume. No ground shadow, no floor, no reflection, no magenta, no text or extras. Preserve transparent alpha background; isolated piece on genuine transparency. Keep all the piece in frame.
```

### wQ: individual generation

References (in order):

- `C:\Users\hoove\off-book\design\pieces\stylized-top\lineup.png`
- `C:\Users\hoove\off-book\design\pieces\stylized-top\wQ.png`
- `C:\Users\hoove\.codex\generated_images\01a1610a-e706-7a83-8513-4a54b349ac0b\exec-a94c95db-b780-4f8d-88ae-09d5bfe92b4e.png`

Generated source: `C:\Users\hoove\.codex\generated_images\01a1610a-e706-7a83-8513-4a54b349ac0b\exec-09afb4cb-0055-4c61-a253-fb6310ce39a9.png`

```text
Use case: stylized-concept. Generate exactly ONE original Off Book Staunton chess piece on its own full 1024 x 1024 canvas, at the highest quality available. Input image 1 is the Off Book stylized-top lineup STYLE AND CAMERA REFERENCE ONLY, input image 2 is the matching individual piece SHAPE AND MATERIAL REFERENCE. Do not reproduce the lineup or its magenta background. Preserve the original set's clean dimensional illustration, smooth controlled gradients, warm ivory white / charcoal-black black palette, simple sculpted Staunton form and broad stepped round base. No grain or texture. Do not imitate any third-party chess set.
CAMERA: same steep 55 degrees above horizontal, looking DOWN as the references; parallel orthographic, substantial visible top surfaces, round base projects as a broad ellipse with depth approximately 82% of width, foreshortened stem. Upper-left lighting. Crisp dark outline of consistent approximately 20px thickness on this 1024 canvas, also on the base, to survive 44px rendering. No cast ground shadow, reflection, floor, scenery, text, labels, watermark, glow or extra object. Fully transparent RGBA background, including all gaps; no checkerboard painted into pixels.
COMPOSITION: horizontally center the silhouette at x=512; bottom of base ellipse at y=962 (94% down). Keep entire piece inside canvas. Piece details must be clear at 44px. This is one shipping asset, not a sheet.
SUBJECT: WHITE QUEEN. Warm ivory with dark charcoal outline. Queen CORONET points and terminal balls enlarged and spread widely, clearly separated with deep gaps. Broad open crown with visible interior and small central boss; do not let central ball dominate. Same geometry as black queen. Height about 850px (83%), top around y=112.
Input image 3 is the newly generated BLACK counterpart. Match its exact silhouette, proportions, cross/crown/top geometry, base profile and camera, while rendering the WHITE ivory material from image 2. One white piece only.
```

### wQ: outline correction

References (in order):

- `C:\Users\hoove\off-book\design\pieces\stylized-top\lineup.png`
- `C:\Users\hoove\off-book\design\pieces\stylized-top\wQ.png`
- `C:\Users\hoove\.codex\generated_images\01a1610a-e706-7a83-8513-4a54b349ac0b\exec-09afb4cb-0055-4c61-a253-fb6310ce39a9.png`
- `C:\Users\hoove\.codex\generated_images\01a1610a-e706-7a83-8513-4a54b349ac0b\exec-75066b91-1b05-4fd5-b531-1d101bb945c5.png`

Selected source: `C:\Users\hoove\.codex\generated_images\01a1610a-e706-7a83-8513-4a54b349ac0b\exec-7a62f436-0966-42f9-acc5-b4aa87ed6b47.png`

```text
Edit the isolated WHITE QUEEN in input image 3 for the Off Book shipping chess set. Highest quality available, full square transparent canvas, ONE complete piece only. Input 1 and 2 are the original stylized-top lineup and matching individual piece, for style and 55-degree overhead camera reference. Input 4 is the white king with the CORRECT HEAVY OUTLINE; use it ONLY as line-weight reference, never change subject to a king. PRESERVE image 3's exact shape, pose, camera, smooth ivory gradient rendering, identifying top proportions, base ellipse, upper-left lighting and composition. CHANGE ONLY line weight: give the entire silhouette a BOLD, UNIFORM, DARK CHARCOAL OUTER CONTOUR about 2% of full canvas width, approximately 25 pixels thick at 1254x1254 or 20 pixels at 1024x1024. A conspicuously thicker ink contour, approximately THREE TIMES the existing thin outline. It must remain about one pixel thick when the whole canvas is reduced to 44px. Include the identifying top, both sides of the body and the very bottom edge of the elliptical base. Make key interior structural lines proportionately bold but preserve gradient volume. Preserve ivory tones and dark charcoal edge contrast on light squares. No ground shadow, floor, reflection, magenta, text or extras. Preserve transparent alpha background. Keep all the piece in frame.
```

### wR: individual generation

References (in order):

- `C:\Users\hoove\off-book\design\pieces\stylized-top\lineup.png`
- `C:\Users\hoove\off-book\design\pieces\stylized-top\wR.png`
- `C:\Users\hoove\.codex\generated_images\01a1610a-e706-7a83-8513-4a54b349ac0b\exec-747a0ba2-327e-419d-a4a5-8d1b00321de6.png`

Generated source: `C:\Users\hoove\.codex\generated_images\01a1610a-e706-7a83-8513-4a54b349ac0b\exec-0244e65a-838c-4a92-93ff-9b2b914da8c5.png`

```text
Use case: stylized-concept. Generate exactly ONE original Off Book Staunton chess piece on its own full 1024 x 1024 canvas, at the highest quality available. Input image 1 is the Off Book stylized-top lineup STYLE AND CAMERA REFERENCE ONLY, input image 2 is the matching individual piece SHAPE AND MATERIAL REFERENCE. Do not reproduce the lineup or its magenta background. Preserve the original set's clean dimensional illustration, smooth controlled gradients, warm ivory white / charcoal-black black palette, simple sculpted Staunton form and broad stepped round base. No grain or texture. Do not imitate any third-party chess set.
CAMERA: same steep 55 degrees above horizontal, looking DOWN as the references; parallel orthographic, substantial visible top surfaces, round base projects as a broad ellipse with depth approximately 82% of width, foreshortened stem. Upper-left lighting. Crisp dark outline of consistent approximately 20px thickness on this 1024 canvas, also on the base, to survive 44px rendering. No cast ground shadow, reflection, floor, scenery, text, labels, watermark, glow or extra object. Fully transparent RGBA background, including all gaps; no checkerboard painted into pixels.
COMPOSITION: horizontally center the silhouette at x=512; bottom of base ellipse at y=962 (94% down). Keep entire piece inside canvas. Piece details must be clear at 44px. This is one shipping asset, not a sheet.
SUBJECT: WHITE ROOK. Warm ivory with dark charcoal outline. Preserve bold OPEN CRENELLATED TOP of reference, broad hollow top with six chunky battlements and deep readable gaps. Visible interior. Same geometry as black rook. Height about 799px (78%), top around y=163.
Input image 3 is the newly generated BLACK counterpart. Match its exact silhouette, proportions, cross/crown/top geometry, base profile and camera, while rendering the WHITE ivory material from image 2. One white piece only.
```

### wR: outline correction

References (in order):

- `C:\Users\hoove\off-book\design\pieces\stylized-top\lineup.png`
- `C:\Users\hoove\off-book\design\pieces\stylized-top\wR.png`
- `C:\Users\hoove\.codex\generated_images\01a1610a-e706-7a83-8513-4a54b349ac0b\exec-0244e65a-838c-4a92-93ff-9b2b914da8c5.png`
- `C:\Users\hoove\.codex\generated_images\01a1610a-e706-7a83-8513-4a54b349ac0b\exec-75066b91-1b05-4fd5-b531-1d101bb945c5.png`

Selected source: `C:\Users\hoove\.codex\generated_images\01a1610a-e706-7a83-8513-4a54b349ac0b\exec-36e64ae5-d3b8-4807-8a9c-448ad30bc999.png`

```text
Edit the isolated WHITE ROOK in input image 3 for the Off Book shipping chess set. Highest quality available, full square transparent canvas, ONE complete piece only. Input 1 and 2 are the original stylized-top lineup and matching individual piece, for style and 55-degree overhead camera reference. Input 4 is the white king with the CORRECT HEAVY OUTLINE; use it ONLY as line-weight reference, never change subject to a king. PRESERVE image 3's exact shape, pose, camera, smooth ivory gradient rendering, identifying top proportions, base ellipse, upper-left lighting and composition. CHANGE ONLY line weight: give the entire silhouette a BOLD, UNIFORM, DARK CHARCOAL OUTER CONTOUR about 2% of full canvas width, approximately 25 pixels thick at 1254x1254 or 20 pixels at 1024x1024. A conspicuously thicker ink contour, approximately THREE TIMES the existing thin outline. It must remain about one pixel thick when the whole canvas is reduced to 44px. Include the identifying top, both sides of the body and the very bottom edge of the elliptical base. Make key interior structural lines proportionately bold but preserve gradient volume. Preserve ivory tones and dark charcoal edge contrast on light squares. No ground shadow, floor, reflection, magenta, text or extras. Preserve transparent alpha background. Keep all the piece in frame.
```

### wB: individual generation

References (in order):

- `C:\Users\hoove\off-book\design\pieces\stylized-top\lineup.png`
- `C:\Users\hoove\off-book\design\pieces\stylized-top\wB.png`
- `C:\Users\hoove\.codex\generated_images\01a1610a-e706-7a83-8513-4a54b349ac0b\exec-f11b99e5-9320-4477-807c-837eb5f97feb.png`

Generated source: `C:\Users\hoove\.codex\generated_images\01a1610a-e706-7a83-8513-4a54b349ac0b\exec-afd53a27-e666-4cae-a162-2e788ed62a80.png`

```text
Use case: stylized-concept. Generate exactly ONE original Off Book Staunton chess piece on its own full 1024 x 1024 canvas, at the highest quality available. Input image 1 is the Off Book stylized-top lineup STYLE AND CAMERA REFERENCE ONLY, input image 2 is the matching individual piece SHAPE AND MATERIAL REFERENCE. Do not reproduce the lineup or its magenta background. Preserve the original set's clean dimensional illustration, smooth controlled gradients, warm ivory white / charcoal-black black palette, simple sculpted Staunton form and broad stepped round base. No grain or texture. Do not imitate any third-party chess set.
CAMERA: same steep 55 degrees above horizontal, looking DOWN as the references; parallel orthographic, substantial visible top surfaces, round base projects as a broad ellipse with depth approximately 82% of width, foreshortened stem. Upper-left lighting. Crisp dark outline of consistent approximately 20px thickness on this 1024 canvas, also on the base, to survive 44px rendering. No cast ground shadow, reflection, floor, scenery, text, labels, watermark, glow or extra object. Fully transparent RGBA background, including all gaps; no checkerboard painted into pixels.
COMPOSITION: horizontally center the silhouette at x=512; bottom of base ellipse at y=962 (94% down). Keep entire piece inside canvas. Piece details must be clear at 44px. This is one shipping asset, not a sheet.
SUBJECT: WHITE BISHOP. Warm ivory with dark charcoal outline. Large pointed mitre, a significantly DEEPER WIDER DIAGONAL SLIT through mitre, dark recessed opening with clear beveled edges. Distinct small spherical TOP KNOB above mitre. Same geometry as black bishop; slit about 50px wide. Height about 819px (80%), top around y=143.
Input image 3 is the newly generated BLACK counterpart. Match its exact silhouette, proportions, cross/crown/top geometry, base profile and camera, while rendering the WHITE ivory material from image 2. One white piece only.
```

### wB: outline correction

References (in order):

- `C:\Users\hoove\off-book\design\pieces\stylized-top\lineup.png`
- `C:\Users\hoove\off-book\design\pieces\stylized-top\wB.png`
- `C:\Users\hoove\.codex\generated_images\01a1610a-e706-7a83-8513-4a54b349ac0b\exec-afd53a27-e666-4cae-a162-2e788ed62a80.png`
- `C:\Users\hoove\.codex\generated_images\01a1610a-e706-7a83-8513-4a54b349ac0b\exec-75066b91-1b05-4fd5-b531-1d101bb945c5.png`

Selected source: `C:\Users\hoove\.codex\generated_images\01a1610a-e706-7a83-8513-4a54b349ac0b\exec-b9393bf2-3c88-4b04-af82-85aeed05391c.png`

```text
Edit the isolated WHITE BISHOP in input image 3 for the Off Book shipping chess set. Highest quality available, full square transparent canvas, ONE complete piece only. Input 1 and 2 are the original stylized-top lineup and matching individual piece, for style and 55-degree overhead camera reference. Input 4 is the white king with the CORRECT HEAVY OUTLINE; use it ONLY as line-weight reference, never change subject to a king. PRESERVE image 3's exact shape, pose, camera, smooth ivory gradient rendering, identifying top proportions, base ellipse, upper-left lighting and composition. CHANGE ONLY line weight: give the entire silhouette a BOLD, UNIFORM, DARK CHARCOAL OUTER CONTOUR about 2% of full canvas width, approximately 25 pixels thick at 1254x1254 or 20 pixels at 1024x1024. A conspicuously thicker ink contour, approximately THREE TIMES the existing thin outline. It must remain about one pixel thick when the whole canvas is reduced to 44px. Include the identifying top, both sides of the body and the very bottom edge of the elliptical base. Make key interior structural lines proportionately bold but preserve gradient volume. Preserve ivory tones, the deep wide diagonal mitre slit and distinct top knob. No ground shadow, floor, reflection, magenta, text or extras. Preserve transparent alpha background. Keep all the piece in frame.
```

### wN: individual generation

References (in order):

- `C:\Users\hoove\off-book\design\pieces\stylized-top\lineup.png`
- `C:\Users\hoove\off-book\design\pieces\stylized-top\wN.png`
- `C:\Users\hoove\.codex\generated_images\01a1610a-e706-7a83-8513-4a54b349ac0b\exec-0d8a1534-b0bd-493b-a2d9-8a0acfd1a464.png`

Generated source: `C:\Users\hoove\.codex\generated_images\01a1610a-e706-7a83-8513-4a54b349ac0b\exec-61d7bce0-94b3-46de-9e70-9bf43dadb5e6.png`

```text
Use case: stylized-concept. Generate exactly ONE original Off Book Staunton chess piece on its own full 1024 x 1024 canvas, at the highest quality available. Input image 1 is the Off Book stylized-top lineup STYLE AND CAMERA REFERENCE ONLY, input image 2 is the matching individual piece SHAPE AND MATERIAL REFERENCE. Do not reproduce the lineup or its magenta background. Preserve the original set's clean dimensional illustration, smooth controlled gradients, warm ivory white / charcoal-black black palette, simple sculpted Staunton form and broad stepped round base. No grain or texture. Do not imitate any third-party chess set.
CAMERA: same steep 55 degrees above horizontal, looking DOWN as the references; parallel orthographic, substantial visible top surfaces, round base projects as a broad ellipse with depth approximately 82% of width, foreshortened stem. Upper-left lighting. Crisp dark outline of consistent approximately 20px thickness on this 1024 canvas, also on the base, to survive 44px rendering. No cast ground shadow, reflection, floor, scenery, text, labels, watermark, glow or extra object. Fully transparent RGBA background, including all gaps; no checkerboard painted into pixels.
COMPOSITION: horizontally center the silhouette at x=512; bottom of base ellipse at y=962 (94% down). Keep entire piece inside canvas. Piece details must be clear at 44px. This is one shipping asset, not a sheet.
SUBJECT: WHITE KNIGHT. Warm ivory with dark charcoal outline. Horse head facing LEFT with clearly sculpted muzzle, ears and simple segmented mane, seen from same high camera. Preserve reference horse character, simplified bold details readable at 44px. Same geometry as black knight. Height about 809px (79%), top around y=153.
Input image 3 is the newly generated BLACK counterpart. Match its exact silhouette, proportions, cross/crown/top geometry, base profile and camera, while rendering the WHITE ivory material from image 2. One white piece only.
```

### wN: outline correction

References (in order):

- `C:\Users\hoove\off-book\design\pieces\stylized-top\lineup.png`
- `C:\Users\hoove\off-book\design\pieces\stylized-top\wN.png`
- `C:\Users\hoove\.codex\generated_images\01a1610a-e706-7a83-8513-4a54b349ac0b\exec-61d7bce0-94b3-46de-9e70-9bf43dadb5e6.png`
- `C:\Users\hoove\.codex\generated_images\01a1610a-e706-7a83-8513-4a54b349ac0b\exec-75066b91-1b05-4fd5-b531-1d101bb945c5.png`

Selected source: `C:\Users\hoove\.codex\generated_images\01a1610a-e706-7a83-8513-4a54b349ac0b\exec-f285b7d7-727e-4817-89a7-c84db8c100ad.png`

```text
Edit the isolated WHITE KNIGHT in input image 3 for the Off Book shipping chess set. Highest quality available, full square transparent canvas, ONE complete piece only. Input 1 and 2 are the original stylized-top lineup and matching individual piece, for style and 55-degree overhead camera reference. Input 4 is the white king with the CORRECT HEAVY OUTLINE; use it ONLY as line-weight reference, never change subject to a king. PRESERVE image 3's exact shape, pose, camera, smooth ivory gradient rendering, identifying top proportions, base ellipse, upper-left lighting and composition. CHANGE ONLY line weight: give the entire silhouette a BOLD, UNIFORM, DARK CHARCOAL OUTER CONTOUR about 2% of full canvas width, approximately 25 pixels thick at 1254x1254 or 20 pixels at 1024x1024. A conspicuously thicker ink contour, approximately THREE TIMES the existing thin outline. It must remain about one pixel thick when the whole canvas is reduced to 44px. Include the identifying top, both sides of the body and the very bottom edge of the elliptical base. Make key interior structural lines proportionately bold but preserve gradient volume. Preserve ivory tones, horse head facing LEFT, ears and mane. No ground shadow, floor, reflection, magenta, text or extras. Preserve transparent alpha background. Keep all the piece in frame.
```

### wP: individual generation

References (in order):

- `C:\Users\hoove\off-book\design\pieces\stylized-top\lineup.png`
- `C:\Users\hoove\off-book\design\pieces\stylized-top\wP.png`
- `C:\Users\hoove\.codex\generated_images\01a1610a-e706-7a83-8513-4a54b349ac0b\exec-abb5559f-3e1e-40a3-bc46-e20408f4294a.png`

Generated source: `C:\Users\hoove\.codex\generated_images\01a1610a-e706-7a83-8513-4a54b349ac0b\exec-400dfec1-b110-4de3-b54b-6aa0492a4e00.png`

```text
Use case: stylized-concept. Generate exactly ONE original Off Book Staunton chess piece on its own full 1024 x 1024 canvas, at the highest quality available. Input image 1 is the Off Book stylized-top lineup STYLE AND CAMERA REFERENCE ONLY, input image 2 is the matching individual piece SHAPE AND MATERIAL REFERENCE. Do not reproduce the lineup or its magenta background. Preserve the original set's clean dimensional illustration, smooth controlled gradients, warm ivory white / charcoal-black black palette, simple sculpted Staunton form and broad stepped round base. No grain or texture. Do not imitate any third-party chess set.
CAMERA: same steep 55 degrees above horizontal, looking DOWN as the references; parallel orthographic, substantial visible top surfaces, round base projects as a broad ellipse with depth approximately 82% of width, foreshortened stem. Upper-left lighting. Crisp dark outline of consistent approximately 20px thickness on this 1024 canvas, also on the base, to survive 44px rendering. No cast ground shadow, reflection, floor, scenery, text, labels, watermark, glow or extra object. Fully transparent RGBA background, including all gaps; no checkerboard painted into pixels.
COMPOSITION: horizontally center the silhouette at x=512; bottom of base ellipse at y=962 (94% down). Keep entire piece inside canvas. Piece details must be clear at 44px. This is one shipping asset, not a sheet.
SUBJECT: WHITE PAWN. Warm ivory with dark charcoal outline. PLAIN ROUND BALL head, short simple neck and broad base. No finial, slit, coronet or ornament. Clearly smallest member of set. Same geometry as black pawn. Height at least 70%, target 727px (71%), top around y=235; base smaller than major pieces within same width family.
Input image 3 is the newly generated BLACK counterpart. Match its exact silhouette, proportions, cross/crown/top geometry, base profile and camera, while rendering the WHITE ivory material from image 2. One white piece only.
```

### wP: outline correction

References (in order):

- `C:\Users\hoove\off-book\design\pieces\stylized-top\lineup.png`
- `C:\Users\hoove\off-book\design\pieces\stylized-top\wP.png`
- `C:\Users\hoove\.codex\generated_images\01a1610a-e706-7a83-8513-4a54b349ac0b\exec-400dfec1-b110-4de3-b54b-6aa0492a4e00.png`
- `C:\Users\hoove\.codex\generated_images\01a1610a-e706-7a83-8513-4a54b349ac0b\exec-75066b91-1b05-4fd5-b531-1d101bb945c5.png`

Selected source: `C:\Users\hoove\.codex\generated_images\01a1610a-e706-7a83-8513-4a54b349ac0b\exec-f8039719-4104-4f4a-be34-3d08d8b60dd1.png`

```text
Edit the isolated WHITE PAWN in input image 3 for the Off Book shipping chess set. Highest quality available, full square transparent canvas, ONE complete piece only. Input 1 and 2 are the original stylized-top lineup and matching individual piece, for style and 55-degree overhead camera reference. Input 4 is the white king with the CORRECT HEAVY OUTLINE; use it ONLY as line-weight reference, never change subject to a king. PRESERVE image 3's exact shape, pose, camera, smooth ivory gradient rendering, identifying top proportions, base ellipse, upper-left lighting and composition. CHANGE ONLY line weight: give the entire silhouette a BOLD, UNIFORM, DARK CHARCOAL OUTER CONTOUR about 2% of full canvas width, approximately 25 pixels thick at 1254x1254 or 20 pixels at 1024x1024. A conspicuously thicker ink contour, approximately THREE TIMES the existing thin outline. It must remain about one pixel thick when the whole canvas is reduced to 44px. Include the identifying top, both sides of the body and the very bottom edge of the elliptical base. Make key interior structural lines proportionately bold but preserve gradient volume. Preserve ivory tones, plain round ball head and short simple pawn form. No ground shadow, floor, reflection, magenta, text or extras. Preserve transparent alpha background. Keep all the piece in frame.
```

### bK: individual generation

References (in order):

- `C:\Users\hoove\off-book\design\pieces\stylized-top\lineup.png`
- `C:\Users\hoove\off-book\design\pieces\stylized-top\bK.png`

Generated source: `C:\Users\hoove\.codex\generated_images\01a1610a-e706-7a83-8513-4a54b349ac0b\exec-5c0687f8-854f-4923-b90a-f332027a3358.png`

```text
Use case: stylized-concept. Generate exactly ONE original Off Book Staunton chess piece on its own full 1024 x 1024 canvas, at the highest quality available. Input image 1 is the Off Book stylized-top lineup STYLE AND CAMERA REFERENCE ONLY, input image 2 is the matching individual piece SHAPE AND MATERIAL REFERENCE. Do not reproduce the lineup or its magenta background. Preserve the original set's clean dimensional illustration, smooth controlled gradients, warm ivory white / charcoal-black black palette, simple sculpted Staunton form and broad stepped round base. No grain or texture. Do not imitate any third-party chess set.
CAMERA: same steep 55 degrees above horizontal, looking DOWN as the references; parallel orthographic, substantial visible top surfaces, round base projects as a broad ellipse with depth approximately 82% of width, foreshortened stem. Upper-left lighting. Crisp dark outline of consistent approximately 20px thickness on this 1024 canvas, also on the base, to survive 44px rendering. No cast ground shadow, reflection, floor, scenery, text, labels, watermark, glow or extra object. Fully transparent RGBA background, including all gaps; no checkerboard painted into pixels.
COMPOSITION: horizontally center the silhouette at x=512; bottom of base ellipse at y=962 (94% down). Keep entire piece inside canvas. Piece details must be clear at 44px. This is one shipping asset, not a sheet.
SUBJECT: BLACK KING. Charcoal-black with cool pale blue-grey rim highlight along all upper-left edges, enough separation on dark green #5b8a5f. A substantially taller, bolder unmistakable CROSS finial than the reference, wide horizontal arms and thick upright, prominent top plane, not a ball or crown. Finial accounts for roughly 24% of piece height. Preserve king's round top platform and tapered body. Total silhouette height about 870px (85%), top around y=92.
```

### bK: outline correction

References (in order):

- `C:\Users\hoove\off-book\design\pieces\stylized-top\lineup.png`
- `C:\Users\hoove\off-book\design\pieces\stylized-top\bK.png`
- `C:\Users\hoove\.codex\generated_images\01a1610a-e706-7a83-8513-4a54b349ac0b\exec-5c0687f8-854f-4923-b90a-f332027a3358.png`
- `C:\Users\hoove\.codex\generated_images\01a1610a-e706-7a83-8513-4a54b349ac0b\exec-75066b91-1b05-4fd5-b531-1d101bb945c5.png`

Selected source: `C:\Users\hoove\.codex\generated_images\01a1610a-e706-7a83-8513-4a54b349ac0b\exec-3e65d64a-ec6d-49fa-afec-fd28992383d8.png`

```text
Edit the isolated BLACK KING in input image 3 for the Off Book shipping chess set. Highest quality available, full square transparent canvas, ONE complete piece only. Input 1 and 2 are the original stylized-top lineup and matching individual piece, for style and 55-degree overhead camera reference. Input 4 is the white king with the CORRECT HEAVY OUTLINE; use it ONLY as line-weight reference, never change subject to a king. PRESERVE image 3's exact shape, pose, camera, smooth charcoal-black gradient rendering, identifying top proportions, base ellipse, upper-left lighting and composition. CHANGE ONLY line weight: give the entire silhouette a BOLD, UNIFORM, DARK CHARCOAL OUTER CONTOUR about 2% of full canvas width, approximately 25 pixels thick at 1254x1254 or 20 pixels at 1024x1024. A conspicuously thicker ink contour, approximately THREE TIMES the existing thin outline. It must remain about one pixel thick when the whole canvas is reduced to 44px. Include the identifying top, both sides of the body and the very bottom edge of the elliptical base. Make key interior structural lines proportionately bold but preserve gradient volume. Preserve and strengthen COOL BLUE-GREY RIM HIGHLIGHTS just inside the dark outer contour on all UPPER-LEFT edges, so black piece separates from #5b8a5f green squares. Preserve the tall bold cross. No ground shadow, floor, reflection, magenta, text or extras. Preserve transparent alpha background. Keep all the piece in frame.
```

### bQ: individual generation

References (in order):

- `C:\Users\hoove\off-book\design\pieces\stylized-top\lineup.png`
- `C:\Users\hoove\off-book\design\pieces\stylized-top\bQ.png`

Generated source: `C:\Users\hoove\.codex\generated_images\01a1610a-e706-7a83-8513-4a54b349ac0b\exec-a94c95db-b780-4f8d-88ae-09d5bfe92b4e.png`

```text
Use case: stylized-concept. Generate exactly ONE original Off Book Staunton chess piece on its own full 1024 x 1024 canvas, at the highest quality available. Input image 1 is the Off Book stylized-top lineup STYLE AND CAMERA REFERENCE ONLY, input image 2 is the matching individual piece SHAPE AND MATERIAL REFERENCE. Do not reproduce the lineup or its magenta background. Preserve the original set's clean dimensional illustration, smooth controlled gradients, warm ivory white / charcoal-black black palette, simple sculpted Staunton form and broad stepped round base. No grain or texture. Do not imitate any third-party chess set.
CAMERA: same steep 55 degrees above horizontal, looking DOWN as the references; parallel orthographic, substantial visible top surfaces, round base projects as a broad ellipse with depth approximately 82% of width, foreshortened stem. Upper-left lighting. Crisp dark outline of consistent approximately 20px thickness on this 1024 canvas, also on the base, to survive 44px rendering. No cast ground shadow, reflection, floor, scenery, text, labels, watermark, glow or extra object. Fully transparent RGBA background, including all gaps; no checkerboard painted into pixels.
COMPOSITION: horizontally center the silhouette at x=512; bottom of base ellipse at y=962 (94% down). Keep entire piece inside canvas. Piece details must be clear at 44px. This is one shipping asset, not a sheet.
SUBJECT: BLACK QUEEN. Charcoal-black with cool pale blue-grey upper-left rim highlight. Queen CORONET points and terminal balls enlarged and spread widely, clearly separated with deep gaps. Broad open crown with visible interior and small central boss; do not let central ball dominate. Unmistakable multi-point queen silhouette at 44px, distinct from cross, mitre or pawn. Height about 850px (83%), top around y=112.
```

### bQ: outline correction

References (in order):

- `C:\Users\hoove\off-book\design\pieces\stylized-top\lineup.png`
- `C:\Users\hoove\off-book\design\pieces\stylized-top\bQ.png`
- `C:\Users\hoove\.codex\generated_images\01a1610a-e706-7a83-8513-4a54b349ac0b\exec-a94c95db-b780-4f8d-88ae-09d5bfe92b4e.png`
- `C:\Users\hoove\.codex\generated_images\01a1610a-e706-7a83-8513-4a54b349ac0b\exec-75066b91-1b05-4fd5-b531-1d101bb945c5.png`

Selected source: `C:\Users\hoove\.codex\generated_images\01a1610a-e706-7a83-8513-4a54b349ac0b\exec-0b89f34e-ad93-4798-a108-1d07a5a12b45.png`

```text
Edit the isolated BLACK QUEEN in input image 3 for the Off Book shipping chess set. Highest quality available, full square transparent canvas, ONE complete piece only. Input 1 and 2 are the original stylized-top lineup and matching individual piece, for style and 55-degree overhead camera reference. Input 4 is the white king with the CORRECT HEAVY OUTLINE; use it ONLY as line-weight reference, never change subject to a king. PRESERVE image 3's exact shape, pose, camera, smooth charcoal-black gradient rendering, identifying top proportions, base ellipse, upper-left lighting and composition. CHANGE ONLY line weight: give the entire silhouette a BOLD, UNIFORM, DARK CHARCOAL OUTER CONTOUR about 2% of full canvas width, approximately 25 pixels thick at 1254x1254 or 20 pixels at 1024x1024. A conspicuously thicker ink contour, approximately THREE TIMES the existing thin outline. It must remain about one pixel thick when the whole canvas is reduced to 44px. Include the identifying top, both sides of the body and the very bottom edge of the elliptical base. Make key interior structural lines proportionately bold but preserve gradient volume. Preserve and strengthen COOL BLUE-GREY RIM HIGHLIGHTS just inside the dark outer contour on all UPPER-LEFT edges, so black piece separates from #5b8a5f green squares. Preserve widely spread coronet points and enlarged balls with deep clear gaps. No ground shadow, floor, reflection, magenta, text or extras. Preserve transparent alpha background. Keep all the piece in frame.
```

### bR: individual generation

References (in order):

- `C:\Users\hoove\off-book\design\pieces\stylized-top\lineup.png`
- `C:\Users\hoove\off-book\design\pieces\stylized-top\bR.png`

Generated source: `C:\Users\hoove\.codex\generated_images\01a1610a-e706-7a83-8513-4a54b349ac0b\exec-747a0ba2-327e-419d-a4a5-8d1b00321de6.png`

```text
Use case: stylized-concept. Generate exactly ONE original Off Book Staunton chess piece on its own full 1024 x 1024 canvas, at the highest quality available. Input image 1 is the Off Book stylized-top lineup STYLE AND CAMERA REFERENCE ONLY, input image 2 is the matching individual piece SHAPE AND MATERIAL REFERENCE. Do not reproduce the lineup or its magenta background. Preserve the original set's clean dimensional illustration, smooth controlled gradients, warm ivory white / charcoal-black black palette, simple sculpted Staunton form and broad stepped round base. No grain or texture. Do not imitate any third-party chess set.
CAMERA: same steep 55 degrees above horizontal, looking DOWN as the references; parallel orthographic, substantial visible top surfaces, round base projects as a broad ellipse with depth approximately 82% of width, foreshortened stem. Upper-left lighting. Crisp dark outline of consistent approximately 20px thickness on this 1024 canvas, also on the base, to survive 44px rendering. No cast ground shadow, reflection, floor, scenery, text, labels, watermark, glow or extra object. Fully transparent RGBA background, including all gaps; no checkerboard painted into pixels.
COMPOSITION: horizontally center the silhouette at x=512; bottom of base ellipse at y=962 (94% down). Keep entire piece inside canvas. Piece details must be clear at 44px. This is one shipping asset, not a sheet.
SUBJECT: BLACK ROOK. Charcoal-black with cool pale blue-grey upper-left rim highlight. Preserve the bold OPEN CRENELLATED TOP of reference, broad hollow top with six chunky battlements and deep readable gaps. Visible interior. Height about 799px (78%), top around y=163.
```

### bR: outline correction

References (in order):

- `C:\Users\hoove\off-book\design\pieces\stylized-top\lineup.png`
- `C:\Users\hoove\off-book\design\pieces\stylized-top\bR.png`
- `C:\Users\hoove\.codex\generated_images\01a1610a-e706-7a83-8513-4a54b349ac0b\exec-747a0ba2-327e-419d-a4a5-8d1b00321de6.png`
- `C:\Users\hoove\.codex\generated_images\01a1610a-e706-7a83-8513-4a54b349ac0b\exec-75066b91-1b05-4fd5-b531-1d101bb945c5.png`

Selected source: `C:\Users\hoove\.codex\generated_images\01a1610a-e706-7a83-8513-4a54b349ac0b\exec-07b9eb9d-3ad1-4396-894f-b12b5b051d62.png`

```text
Edit the isolated BLACK ROOK in input image 3 for the Off Book shipping chess set. Highest quality available, full square transparent canvas, ONE complete piece only. Input 1 and 2 are the original stylized-top lineup and matching individual piece, for style and 55-degree overhead camera reference. Input 4 is the white king with the CORRECT HEAVY OUTLINE; use it ONLY as line-weight reference, never change subject to a king. PRESERVE image 3's exact shape, pose, camera, smooth charcoal-black gradient rendering, identifying top proportions, base ellipse, upper-left lighting and composition. CHANGE ONLY line weight: give the entire silhouette a BOLD, UNIFORM, DARK CHARCOAL OUTER CONTOUR about 2% of full canvas width, approximately 25 pixels thick at 1254x1254 or 20 pixels at 1024x1024. A conspicuously thicker ink contour, approximately THREE TIMES the existing thin outline. It must remain about one pixel thick when the whole canvas is reduced to 44px. Include the identifying top, both sides of the body and the very bottom edge of the elliptical base. Make key interior structural lines proportionately bold but preserve gradient volume. Preserve and strengthen COOL BLUE-GREY RIM HIGHLIGHTS just inside the dark outer contour on all UPPER-LEFT edges, so black piece separates from #5b8a5f green squares. Preserve bold open crenellated top with six battlements and clear gaps. No ground shadow, floor, reflection, magenta, text or extras. Preserve transparent alpha background. Keep all the piece in frame.
```

### bB: individual generation

References (in order):

- `C:\Users\hoove\off-book\design\pieces\stylized-top\lineup.png`
- `C:\Users\hoove\off-book\design\pieces\stylized-top\bB.png`

Generated source: `C:\Users\hoove\.codex\generated_images\01a1610a-e706-7a83-8513-4a54b349ac0b\exec-f11b99e5-9320-4477-807c-837eb5f97feb.png`

```text
Use case: stylized-concept. Generate exactly ONE original Off Book Staunton chess piece on its own full 1024 x 1024 canvas, at the highest quality available. Input image 1 is the Off Book stylized-top lineup STYLE AND CAMERA REFERENCE ONLY, input image 2 is the matching individual piece SHAPE AND MATERIAL REFERENCE. Do not reproduce the lineup or its magenta background. Preserve the original set's clean dimensional illustration, smooth controlled gradients, warm ivory white / charcoal-black black palette, simple sculpted Staunton form and broad stepped round base. No grain or texture. Do not imitate any third-party chess set.
CAMERA: same steep 55 degrees above horizontal, looking DOWN as the references; parallel orthographic, substantial visible top surfaces, round base projects as a broad ellipse with depth approximately 82% of width, foreshortened stem. Upper-left lighting. Crisp dark outline of consistent approximately 20px thickness on this 1024 canvas, also on the base, to survive 44px rendering. No cast ground shadow, reflection, floor, scenery, text, labels, watermark, glow or extra object. Fully transparent RGBA background, including all gaps; no checkerboard painted into pixels.
COMPOSITION: horizontally center the silhouette at x=512; bottom of base ellipse at y=962 (94% down). Keep entire piece inside canvas. Piece details must be clear at 44px. This is one shipping asset, not a sheet.
SUBJECT: BLACK BISHOP. Charcoal-black with cool pale blue-grey upper-left rim highlight. Large pointed mitre, a significantly DEEPER WIDER DIAGONAL SLIT through the mitre, clearly readable contrasting bevel and deep dark opening. A distinct small spherical TOP KNOB clearly separated above mitre. Slit must not disappear at 44px; use about 50px wide opening. Unmistakable bishop, not pawn or queen. Height about 819px (80%), top around y=143.
```

### bB: outline correction

References (in order):

- `C:\Users\hoove\off-book\design\pieces\stylized-top\lineup.png`
- `C:\Users\hoove\off-book\design\pieces\stylized-top\bB.png`
- `C:\Users\hoove\.codex\generated_images\01a1610a-e706-7a83-8513-4a54b349ac0b\exec-f11b99e5-9320-4477-807c-837eb5f97feb.png`
- `C:\Users\hoove\.codex\generated_images\01a1610a-e706-7a83-8513-4a54b349ac0b\exec-75066b91-1b05-4fd5-b531-1d101bb945c5.png`

Selected source: `C:\Users\hoove\.codex\generated_images\01a1610a-e706-7a83-8513-4a54b349ac0b\exec-c4991879-a964-4902-af11-f4d26b6749a8.png`

```text
Edit the isolated BLACK BISHOP in input image 3 for the Off Book shipping chess set. Highest quality available, full square transparent canvas, ONE complete piece only. Input 1 and 2 are the original stylized-top lineup and matching individual piece, for style and 55-degree overhead camera reference. Input 4 is the white king with the CORRECT HEAVY OUTLINE; use it ONLY as line-weight reference, never change subject to a king. PRESERVE image 3's exact shape, pose, camera, smooth charcoal-black gradient rendering, identifying top proportions, base ellipse, upper-left lighting and composition. CHANGE ONLY line weight: give the entire silhouette a BOLD, UNIFORM, DARK CHARCOAL OUTER CONTOUR about 2% of full canvas width, approximately 25 pixels thick at 1254x1254 or 20 pixels at 1024x1024. A conspicuously thicker ink contour, approximately THREE TIMES the existing thin outline. It must remain about one pixel thick when the whole canvas is reduced to 44px. Include the identifying top, both sides of the body and the very bottom edge of the elliptical base. Make key interior structural lines proportionately bold but preserve gradient volume. Preserve and strengthen COOL BLUE-GREY RIM HIGHLIGHTS just inside the dark outer contour on all UPPER-LEFT edges, so black piece separates from #5b8a5f green squares. Preserve the deep wide diagonal mitre slit and distinct top knob; keep slit clear. No ground shadow, floor, reflection, magenta, text or extras. Preserve transparent alpha background. Keep all the piece in frame.
```

### bN: individual generation

References (in order):

- `C:\Users\hoove\off-book\design\pieces\stylized-top\lineup.png`
- `C:\Users\hoove\off-book\design\pieces\stylized-top\bN.png`

Generated source: `C:\Users\hoove\.codex\generated_images\01a1610a-e706-7a83-8513-4a54b349ac0b\exec-0d8a1534-b0bd-493b-a2d9-8a0acfd1a464.png`

```text
Use case: stylized-concept. Generate exactly ONE original Off Book Staunton chess piece on its own full 1024 x 1024 canvas, at the highest quality available. Input image 1 is the Off Book stylized-top lineup STYLE AND CAMERA REFERENCE ONLY, input image 2 is the matching individual piece SHAPE AND MATERIAL REFERENCE. Do not reproduce the lineup or its magenta background. Preserve the original set's clean dimensional illustration, smooth controlled gradients, warm ivory white / charcoal-black black palette, simple sculpted Staunton form and broad stepped round base. No grain or texture. Do not imitate any third-party chess set.
CAMERA: same steep 55 degrees above horizontal, looking DOWN as the references; parallel orthographic, substantial visible top surfaces, round base projects as a broad ellipse with depth approximately 82% of width, foreshortened stem. Upper-left lighting. Crisp dark outline of consistent approximately 20px thickness on this 1024 canvas, also on the base, to survive 44px rendering. No cast ground shadow, reflection, floor, scenery, text, labels, watermark, glow or extra object. Fully transparent RGBA background, including all gaps; no checkerboard painted into pixels.
COMPOSITION: horizontally center the silhouette at x=512; bottom of base ellipse at y=962 (94% down). Keep entire piece inside canvas. Piece details must be clear at 44px. This is one shipping asset, not a sheet.
SUBJECT: BLACK KNIGHT. Charcoal-black with cool pale blue-grey upper-left rim highlight. Horse head facing LEFT with clearly sculpted muzzle, ears and simple segmented mane, seen from the same high camera. Preserve reference horse character, simplified bold details readable at 44px. Height about 809px (79%), top around y=153.
```

### bN: outline correction

References (in order):

- `C:\Users\hoove\off-book\design\pieces\stylized-top\lineup.png`
- `C:\Users\hoove\off-book\design\pieces\stylized-top\bN.png`
- `C:\Users\hoove\.codex\generated_images\01a1610a-e706-7a83-8513-4a54b349ac0b\exec-0d8a1534-b0bd-493b-a2d9-8a0acfd1a464.png`
- `C:\Users\hoove\.codex\generated_images\01a1610a-e706-7a83-8513-4a54b349ac0b\exec-75066b91-1b05-4fd5-b531-1d101bb945c5.png`

Selected source: `C:\Users\hoove\.codex\generated_images\01a1610a-e706-7a83-8513-4a54b349ac0b\exec-e26a3aab-b9b3-4cbb-9782-d23181f2d0ec.png`

```text
Edit the isolated BLACK KNIGHT in input image 3 for the Off Book shipping chess set. Highest quality available, full square transparent canvas, ONE complete piece only. Input 1 and 2 are the original stylized-top lineup and matching individual piece, for style and 55-degree overhead camera reference. Input 4 is the white king with the CORRECT HEAVY OUTLINE; use it ONLY as line-weight reference, never change subject to a king. PRESERVE image 3's exact shape, pose, camera, smooth charcoal-black gradient rendering, identifying top proportions, base ellipse, upper-left lighting and composition. CHANGE ONLY line weight: give the entire silhouette a BOLD, UNIFORM, DARK CHARCOAL OUTER CONTOUR about 2% of full canvas width, approximately 25 pixels thick at 1254x1254 or 20 pixels at 1024x1024. A conspicuously thicker ink contour, approximately THREE TIMES the existing thin outline. It must remain about one pixel thick when the whole canvas is reduced to 44px. Include the identifying top, both sides of the body and the very bottom edge of the elliptical base. Make key interior structural lines proportionately bold but preserve gradient volume. Preserve and strengthen COOL BLUE-GREY RIM HIGHLIGHTS just inside the dark outer contour on all UPPER-LEFT edges, so black piece separates from #5b8a5f green squares. Preserve horse head facing LEFT, ears and mane. No ground shadow, floor, reflection, magenta, text or extras. Preserve transparent alpha background. Keep all the piece in frame.
```

### bP: individual generation

References (in order):

- `C:\Users\hoove\off-book\design\pieces\stylized-top\lineup.png`
- `C:\Users\hoove\off-book\design\pieces\stylized-top\bP.png`

Generated source: `C:\Users\hoove\.codex\generated_images\01a1610a-e706-7a83-8513-4a54b349ac0b\exec-abb5559f-3e1e-40a3-bc46-e20408f4294a.png`

```text
Use case: stylized-concept. Generate exactly ONE original Off Book Staunton chess piece on its own full 1024 x 1024 canvas, at the highest quality available. Input image 1 is the Off Book stylized-top lineup STYLE AND CAMERA REFERENCE ONLY, input image 2 is the matching individual piece SHAPE AND MATERIAL REFERENCE. Do not reproduce the lineup or its magenta background. Preserve the original set's clean dimensional illustration, smooth controlled gradients, warm ivory white / charcoal-black black palette, simple sculpted Staunton form and broad stepped round base. No grain or texture. Do not imitate any third-party chess set.
CAMERA: same steep 55 degrees above horizontal, looking DOWN as the references; parallel orthographic, substantial visible top surfaces, round base projects as a broad ellipse with depth approximately 82% of width, foreshortened stem. Upper-left lighting. Crisp dark outline of consistent approximately 20px thickness on this 1024 canvas, also on the base, to survive 44px rendering. No cast ground shadow, reflection, floor, scenery, text, labels, watermark, glow or extra object. Fully transparent RGBA background, including all gaps; no checkerboard painted into pixels.
COMPOSITION: horizontally center the silhouette at x=512; bottom of base ellipse at y=962 (94% down). Keep entire piece inside canvas. Piece details must be clear at 44px. This is one shipping asset, not a sheet.
SUBJECT: BLACK PAWN. Charcoal-black with cool pale blue-grey upper-left rim highlight. PLAIN ROUND BALL head, short simple neck and broad base. No finial, slit, coronet or ornament. Clearly smallest member of set. Total height at least 70%, target 727px (71%), top around y=235; base smaller than major pieces while within same width family.
```

### bP: outline correction

References (in order):

- `C:\Users\hoove\off-book\design\pieces\stylized-top\lineup.png`
- `C:\Users\hoove\off-book\design\pieces\stylized-top\bP.png`
- `C:\Users\hoove\.codex\generated_images\01a1610a-e706-7a83-8513-4a54b349ac0b\exec-abb5559f-3e1e-40a3-bc46-e20408f4294a.png`
- `C:\Users\hoove\.codex\generated_images\01a1610a-e706-7a83-8513-4a54b349ac0b\exec-75066b91-1b05-4fd5-b531-1d101bb945c5.png`

Selected source: `C:\Users\hoove\.codex\generated_images\01a1610a-e706-7a83-8513-4a54b349ac0b\exec-254d4d19-7dd8-4858-879b-0f0425a58136.png`

```text
Edit the isolated BLACK PAWN in input image 3 for the Off Book shipping chess set. Highest quality available, full square transparent canvas, ONE complete piece only. Input 1 and 2 are the original stylized-top lineup and matching individual piece, for style and 55-degree overhead camera reference. Input 4 is the white king with the CORRECT HEAVY OUTLINE; use it ONLY as line-weight reference, never change subject to a king. PRESERVE image 3's exact shape, pose, camera, smooth charcoal-black gradient rendering, identifying top proportions, base ellipse, upper-left lighting and composition. CHANGE ONLY line weight: give the entire silhouette a BOLD, UNIFORM, DARK CHARCOAL OUTER CONTOUR about 2% of full canvas width, approximately 25 pixels thick at 1254x1254 or 20 pixels at 1024x1024. A conspicuously thicker ink contour, approximately THREE TIMES the existing thin outline. It must remain about one pixel thick when the whole canvas is reduced to 44px. Include the identifying top, both sides of the body and the very bottom edge of the elliptical base. Make key interior structural lines proportionately bold but preserve gradient volume. Preserve and strengthen COOL BLUE-GREY RIM HIGHLIGHTS just inside the dark outer contour on all UPPER-LEFT edges, so black piece separates from #5b8a5f green squares. Preserve plain round ball head and short simple pawn form. No ground shadow, floor, reflection, magenta, text or extras. Preserve transparent alpha background. Keep all the piece in frame.
```

