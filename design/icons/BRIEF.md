# Brief: Off Book UI icons and move-quality badges

Canon: [../../DESIGN.md](../../DESIGN.md). Colors: [../tokens.css](../tokens.css).

Hand-write these as SVG code. Do not use image generation; icons must be crisp
vectors.

Generic icons (settings, sound, flip board, download, upload, close, menu)
come from Lucide (ISC license) and are **not** part of this job. The custom
icons below sit next to Lucide icons, so they must match Lucide's metrics
exactly.

## 1. Custom icons

Style: 24 x 24 viewBox, 2 px stroke, round caps and joins, no fills except
where noted, `stroke="currentColor"`, `fill="none"`. Readable at 20 px. Each
file is one standalone `.svg` with no embedded styles, fonts or scripts.

Write each to `design/icons/<name>.svg`:

| Name | Meaning in the app | Idea |
|---|---|---|
| `drill` | Drill a line from your repertoire | A board square with a circular repeat arrow |
| `spar` | Play a practice game against Maia | Two knight heads facing each other |
| `review` | Review a real game | A magnifier over a scoresheet with ruled lines |
| `collection` | Your repertoire as a collection | A binder with two index tabs |
| `puzzles` | Puzzles from your openings | A single board square with a target mark |
| `weekly-goal` | This week's goal | A calendar page with a check |
| `battle-record` | A line's record in real games | Tally marks (four strokes and a slash) |
| `how-did-it-know` | Open the "How did it know?" panel | An evaluation bar beside a small question mark |
| `prep-ends` | "Your prep ends here" | An open book with an arrow leaving the right page |
| `import-games` | Import games from Lichess or Chess.com | A scoresheet with an arrow coming in |
| `backup` | Save a backup file of your progress | A sheet with a down arrow into a tray |

Ideas are starting points; clarity at 20 px wins over the idea.

## 2. Move-quality badges

Small round badges that sit on the top-right corner of a board square, the
way chess.com marks moves in review. The glyph carries the meaning, color
backs it up (DESIGN.md "never color alone").

32 x 32 viewBox, a filled circle with a 2 px `#1a2740` outline and the glyph
centered in bold, drawn as **paths, not text** so no font is needed. Write each
to `design/icons/badges/<name>.svg`:

| Name | Glyph | Circle fill | Glyph color |
|---|---|---|---|
| `book` | a small open book | `#dcf26a` | `#1a2740` |
| `good` | `!` | `#1d7a3c` | `#ffffff` |
| `interesting` | `!?` | `#2447a8` | `#ffffff` |
| `dubious` | `?!` | `#876400` | `#ffffff` |
| `mistake` | `?` | `#b04800` | `#ffffff` |
| `blunder` | `??` | `#b3261e` | `#ffffff` |

## 3. Contact sheet

`design/icons/sheet.html`: a static page showing every custom icon at 20 px
and 48 px in `#1a2740` on `#f6f8fb`, and every badge at 20 px and 32 px on
both board colors `#eceee3` and `#5b8a5f`. No external requests.

## Do not

- Commit anything.
- Write outside `design/icons/`. Other runs are working in `design/pieces/`
  and `design/brand/`.
