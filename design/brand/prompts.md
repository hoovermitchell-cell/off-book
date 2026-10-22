# Brand asset prompts

## Export and verification

All artwork was produced with the built-in image generator, one source asset per canvas. App icon variants use the corresponding generated master without regenerating its identity. Native raster export resized and centered the artwork, mapped master RGB values to the specified token palette, added the requested paper grounds, and encoded stamp pigment as pure black while preserving its generated alpha grain. No Python or API image-generation fallback was used.

Masters: 1024 x 1024, artwork fitted to 72% of the canvas. Standard icons: paper rounded-square ground. Apple icons: opaque paper ground. Maskable icons: opaque paper ground to all edges, artwork fitted to 55% of the canvas and verified inside the central circle with radius 40% of the canvas width. Favicons: artwork fitted to 90% of the canvas for small-size readability.

Root performed production and verification. No application code or interactive UI changed. Checks passed for all 20 PNG dimensions, master token palettes, transparent and opaque variants, maskable safe circles, black-only stamp RGB, and the empty frame center. Texture mean alpha coverage is 88.1%. Visual checks covered the three directions at 192, 32 and 16 pixels, plus the stamp assets composited on white. Art remains for Mitch's review; no direction is recorded as selected.

Generated source receipts:

- Tab: `exec-4bf4fe73-1027-4f71-b7ea-ed89270559f0.png`
- Highlighted knight: `exec-cea043f8-fe71-4118-b8d5-c960646f2803.png`
- Off the page: `exec-416d871f-270d-4a3b-be4a-4bad153c8ccd.png`
- Texture: `exec-97f2faf4-79dd-4f6c-a7c4-874670632562.png`
- Frame: `exec-e728b835-c11c-402e-b4b1-a29b32691062.png`

## Frame from texture reference

Both standalone frame generations failed the tool's output moderation. This edit uses the generated texture as its material reference.

Using the supplied black rubber-stamp ink texture as a material reference, create one empty rectangular rubber-stamp border for the Off Book chess trainer. Full 1024 x 512 canvas with transparent background, highest quality available. Keep the same fine porous ink texture only along a bold rectangular outline with softly rounded corners and 45px outer padding. Remove ink from the large center so the interior is fully transparent. Pure black pigment with transparent pores. No text, no symbols, no page background. Only one empty frame.

## Frame retry

The initial frame request was rejected by the image tool. This simpler request retains the same harmless stationery asset specification.

Create a single empty rubber stamp frame for a school chess practice app. Transparent PNG, wide 2:1 canvas, 1024 by 512 pixels, highest available quality. One black rectangular outline with slightly rounded corners and generous clear margins. Make the ink naturally uneven with tiny transparent speckles and a few small gaps, like a rubber stamp on paper. Leave the entire interior transparent and empty for separately typeset text. Use pure black ink only. No paper background, no text, no symbols. One frame on the full canvas.

Built-in image generation, 2026-10-21. Each source asset is generated on its own full canvas. Highest available quality requested; the built-in interface exposes no separate quality parameter.

## tab

Use case: logo-brand. Create ONE original symbol-only logo master for Off Book, a chess-opening trainer whose visual theme is a tournament prep binder. One asset on its own full 1024 x 1024 canvas, highest available quality. Genuine transparent background, generous transparent margins. A bold pen-blue #2447a8 binder index tab, the recognizable protruding index-tab shape with a stepped shoulder, containing a paper-white #f6f8fb chess knight head. Flat crisp vector-like shapes, distinctive broad muzzle and upright ears, clean strong silhouette readable at 16 pixels. The knight is a solid paper-white cut-in shape with minimal blue negative-space details. Use only #2447a8 and #f6f8fb. Center the whole mark within roughly the middle 66% of the canvas. No lettering, no words, no numbers, no shadows, no extraneous border, no checkerboard drawn into the art, no mockup, no multiple versions, no existing chess-brand imitation.

## highlighted

Use case: logo-brand. Create ONE original symbol-only logo master for Off Book, a chess-opening trainer themed as a tournament prep binder. One asset alone on its full 1024 x 1024 canvas, highest available quality, genuine transparent background and generous padding. Reference image is a STYLE/SHAPE REFERENCE ONLY: simplify its chess knight, preserving the broad muzzle pointing left, two upright ears, stepped mane, arched neck, rounded Staunton base, and elevated about-55-degrees overhead view. Render the knight as bold near-flat ink #1a2740 and paper #f6f8fb shapes, very few internal lines. ONE broad highlighter swipe #dcf26a horizontally behind the knight, with restrained chisel-tip ends, like highlighting a move in prep notes. Use only #1a2740, #f6f8fb and #dcf26a, no beige from the reference. Centered, whole mark within middle 66% of canvas. Must remain legible at 16px: big silhouette, no fine hatching, no photorealistic shading. No text, no letters, no numbers, no other objects, no mockup, no multiple variants, no existing chess-brand imitation.

Reference: `../pieces/stylized-top/wN.png` (read only).

## page

Use case: logo-brand. Create ONE original symbol-only logo master for Off Book, a chess-opening trainer themed as a tournament prep binder. One asset alone on its full 1024 x 1024 canvas, highest available quality. Genuine transparent background and generous padding. An open scoresheet/book with a bold chess knight piece stepping off the outer upper-right edge of its page, a clear unified compact symbol for leaving memorized opening preparation. Ink #1a2740 thick simple line work, paper #f6f8fb page fill, ONE highlighter #dcf26a accent swipe on the left-hand page. Knight silhouette with broad muzzle facing outward, upright ear, curved neck and simple base; visibly overlaps and extends beyond the right page edge. Keep book geometry extremely simple: two open page shapes and center crease, no tiny ruled lines. Flat, no shadows, no gradients, no 3D lighting, strong silhouette readable at 16px. Whole unified mark centered in middle 66% of canvas. Only those three token colors. No text, lettering, numbers, watermark, mockup, multiple versions, or existing chess-brand imitation.

## frame

Create ONE production rubber-stamp border asset on its own full 1024 x 512 landscape canvas, exactly 2:1 aspect ratio, highest available quality. Genuine transparent background. A single rectangular rubber-stamp border with slightly rounded corners, centered with about 45px clear padding from canvas edges. Bold approximately 18px-thick ink stroke; believable imperfect rubber impression pressed into scoresheet paper: uneven ink coverage, tiny missing flecks, short occasional gaps, organic porous ink grain and a few minute edge speckles. Only pure black #000000 pigment with variable transparency; absolutely no grey RGB pigment, colored pigment, paper fill, shadow, white background or checkerboard artwork. Large completely transparent EMPTY interior reserved for live text. No text, no letters, no numbers, no symbols inside, no second border, no mockup. Border straight and horizontal, not rotated. The effect must feel like actual stamped ink, not decorative distressed grunge.

## texture

Create ONE production rubber-stamp INK TEXTURE ONLY asset on its own full 1024 x 512 landscape canvas, exactly 2:1 aspect ratio, highest available quality. Genuine transparency. A flat full-canvas field of black ink coverage from a real rubber stamp: mostly contiguous pure black #000000 pigment, with fine irregular transparent pinholes, tiny dry gaps, subtle density variation, organic porous speckle. This is an alpha mask to distress live type: approximately 85 to 90 percent ink coverage with tiny irregular transparent pores so masked text remains readable. Grain distributed evenly to all four edges with no margin or vignette; same fine rubber-stamp grain as a naturally uneven rubber border pressed onto scoresheet paper. One pigment only pure black RGB, all other variation in alpha. No paper, grey RGB, white background, checkerboard art, border, frame, shapes, text, letters, numbers, shadow or mockup. Show ONLY the ink grain.

## Small-size off-the-page SVG — 2026-10-21

Requested: hand-write `off-the-page/favicon.svg` to BRIEF.md section 3, matching `off-the-page/mark.png`; no image generation, PNG rendering, or commit. Created a transparent 32 x 32 SVG with three paths: a page corner, a right-facing knight crossing its edge, and one highlighter stroke. Source structure checked; rendered 16 px readability remains for the Claude Code render pass.

