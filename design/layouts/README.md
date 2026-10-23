# Drill layout studies

Open each HTML file directly, or serve the repo and visit its path.
Compare at **1366 × 768**, at 100% zoom. These are static studies:
buttons, tabs and move entry do not run the app. All assets load locally;
the source link navigates to the existing repository only when clicked.

**[Layout 1: Notes under the board](layout-1.html).** The instruction sits
above a 448px board; the last-move verdict and Kalam idea sit immediately
below it. Setup, scoresheet and progress share a narrow right rail. The
student still looks sideways to check the record or change settings, but
the information needed on every move stays with the board. In Review,
the lesson heading would replace the instruction, with its evaluation
and explanation below the board; the rail would hold the game's scoresheet
and navigation. Longer lessons would need an expandable continuation.

**[Layout 2: A pencil note on the board](layout-2.html).** The 480px board
carries a small paper note over empty f- through h-file squares, with a leader to d5.
The instruction and verdict sit above it; setup and records move to the
left. This puts the idea beside its destination, but hides empty squares
and interrupts scanning. Its placement works only for this position:
a live version would need collision handling and a way to dismiss it.
Review could attach a short lesson to the relevant square, though crowded
positions and longer explanations would make this treatment unreliable.

**[Layout 3: One column](layout-3.html).** Setup becomes a horizontal row,
followed by the instruction, a centered 384px board, then the verdict and
idea. A compact scoresheet and move entry share the bottom row; progress
sits in the header. There is no side panel, at the cost of a smaller board
and less space for notation. Review could use the same stack, replacing
setup with game selection and the bottom row with move navigation.
A full game's scoresheet would need a horizontally scrollable strip or
an expanded view, while retaining the current move beside the lesson.

I recommend **layout 1**. It keeps the full position unobstructed and puts
the next action and its explanation against the board's edges. The board
remains the main object, and the scoresheet still has room to grow.
Its 56px squares also leave more touch room than layout 3's 48px squares.
Layout 2 brings the note closest, but covering squares costs too much.

The CSS budgets all three for the laptop viewport, with 44px minimum
controls and 56/60/48px squares respectively. Static checks cover content,
piece placement, arrow geometry, asset paths and token references. Codex
ran those checks and the copy review; a native agent reviewed the HTML/CSS.
Browser rendering, font-wrap fit and visual/accessibility QA remain for
Claude Code, as assigned in the brief. This recommendation is provisional
until those renders are compared; no product direction is being recorded
as approved.
