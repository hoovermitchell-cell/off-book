# Brief for Codex: independent review of the Off Book drill screen

You are reviewing, not building. Do not edit any file except the one report below. Do not commit.

Repo: `C:\Users\hoove\off-book` (a browser chess opening trainer; TypeScript + Vite; app at the repo root).
Read first: `AGENTS.md`, `DESIGN.md`, `docs/decisions.md`, `docs/plans/2026-10-21-real-build-drill.md`.

Review these files:
- `src/drill/drill.ts` (DOM-free state machine) and `src/drill/drill.test.ts`
- `src/ui/drill-view.ts`, `src/ui/app.css`
- `src/data/london.ts`, `src/data/london-ideas.ts`, `src/storage.ts`
- `src/chess/*.ts`

Look for, in priority order:
1. Correctness bugs: race conditions between async engine calls and user input, state that can get stuck (board locked, buttons wrong), chess rule edge cases (promotion, castling, checkmate, stalemate, draw), storage corruption.
2. Accessibility against DESIGN.md's quality floor (WCAG 2.1 AA, keyboard path, live regions, 44px targets, never color alone).
3. Places where the screen breaks DESIGN.md (tokens only, motion budget, copy rules).
4. Simplifications: dead code, duplication, needless complexity.

Do not report style nits or suggest new features.

Run `npm test` and `npx tsc --noEmit` (you may need `npm install` first) and include the result lines.

Write your findings to `docs/review/codex-review-2026-10-22.md`: one line per finding with severity (P0 critical, P1 a normal user hits it, P2 real downside, P3 minor), file:line, the failure scenario, and a suggested fix. End with the test and typecheck results. Keep it under 120 lines.
