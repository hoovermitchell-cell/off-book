# Off Book — operating manual

A browser chess trainer for a middle and high school chess program, useful to
any adult improver too. The core loop: learn an opening, play it in real games,
review how it held up. Every product decision so far is in
[docs/decisions.md](docs/decisions.md); read it before building anything.
Research behind those decisions: [docs/research/](docs/research/).
Visual and interface canon: [DESIGN.md](DESIGN.md), tokens in
[design/tokens.css](design/tokens.css). Read it before building any UI.

## Hard constraints (from decisions.md)

- **License: AGPL-3.0, public source.** Stockfish, chessground and chessops are
  GPL; the browser Maia build is AGPL. Any dependency must be compatible.
- **No student data on any server in v1.** Progress lives in the browser, with a
  backup/restore file. Lichess and Chess.com are called straight from the
  browser, anonymously. Never put an API token in client code.
- **Deterministic first.** Engine plus detector code produce facts; explanations
  are templates or pre-written text Mitch has reviewed. No live LLM in v1.
- **Stockfish judges, Maia predicts.** Stockfish for evaluation and blunders;
  Maia for human-like replies at a given rating.
- Run it: `npm install`, then `npm run dev` (fetches engine files and the Maia model
  into `public/` first), `npm test`, `npm run build`. The app is the repo root; `spike/`
  is the throwaway reference.
- Deploy (Cloudflare Pages): Mitch runs `npx wrangler login` once, then `npm run deploy:setup`
  once, then `npm run deploy` for each preview at `preview.off-book.pages.dev`. Test URL only:
  before students get the link, the source must be public (AGPL), per decision 6.
- Stack default: TypeScript + Vite, static hosting (Cloudflare Pages). Spikes may
  be a single `index.html`.

## Autonomous loop

Work is queued as GitHub issues (see `docs/agents/issue-tracker.md`). The
`ready-for-agent` label is the trust boundary: an issue carrying it runs
**unattended**, and applying it is the approval. Everything else waits for a
human. `ready-for-human` is Mitch's queue of reviews and decisions. Start the
hands-off loop with:

    /loop List open issues labelled ready-for-agent that carry neither polish nor enhancement (those belong to the refinement loop), oldest first. Take the first. If one exists: invoke the `cycle` skill with that issue's title and body and run the loop to VERIFY, including the done gate below; then commit on a branch, push, and open a PR whose body says `Closes #<n>`; watch CI and fix failures until it is green. When the PR is open and green, continue to the next issue. If none exists: do NOT invent work — stop, and if open needs-triage issues exist, list them and offer a quick shaping pass to promote one to ready-for-agent; otherwise say the queue is dry. End the loop.

Omit an interval so the loop self-paces. It opens PRs and pushes branches but
never merges — the human's merge is the final gate even in full auto.

**Done gate** (Mitch, 2026-11-19): green CI plus a browser smoke check for any change
the app shows (UI, opening data, texts). Before opening the PR, run the app, play a few
drill moves in the line that changed, open one review, and check the console has no
errors. List what was played in the PR body and share a screenshot with Mitch where the
harness allows. Docs-only and test-only changes skip it.

## Refinement loop

Mitch, 2026-10-25. Each iteration runs one slot, then the pointer moves on:
opening → polish → feature → opening … The pointer, the rolling polish PR, and
the next queued opening live in the pinned **Refinement loop pointer** issue
(label `loop`); update its body when a slot finishes. First, each tick: check
open loop PRs' CI and fix any red ones.

- **Opening.** The next step in decision 16's order: plumbing (step 0), batch 1
  (QG + Slav), the tier pilot, batch 2 (re-picked by decision 16's rule), batch 3.
  Full autonomy: write the coverage matrix yourself into the plan doc and keep
  going; Mitch reviews the texts and matrix at the PR. A step too big for one
  iteration keeps the pointer on "opening" with a note on where it stopped. Own
  branch and PR per step. If the pointer issue says no opening is queued, stop
  the loop and ask. Engine check: re-test a trailing move at about 3 s before
  pinning (400 ms is noisy at ±60cp), and regenerate with `KEEP=1` so a pin
  doesn't re-roll the rest of the tree (batch 1 took six rounds without).
- **Polish.** Run the app, find the most valuable rough edge, or take the oldest
  open `polish` + `ready-for-agent` issue. Small (a few lines, no behaviour change
  worth a review): commit to the rolling branch `refine/polish`, one PR kept open.
  Larger: its own branch and PR. A rough edge found but not fixed becomes a
  `polish` issue.
- **Feature.** Fewer than 5 open `enhancement` issues: brainstorm and file some,
  each body opening with `Feature rank N`. Otherwise build the lowest-ranked open
  `enhancement` + `ready-for-agent` issue, sized like polish. `needs-info` features
  wait for Mitch.

Every slot: work in a worktree under `.claude/worktrees/`, keep this checkout on
`main`, base on `main`. Run `cycle`, green CI, never merge (`propose`). The PR body
says `Closes #<n>` for the issue it finishes. Removing a worktree: delete its
`node_modules` junction first. A new worktree run with vite directly skips
`predev`, so copy `public/vendor` and `public/models` in from another one or the
engines won't load.

## Autonomy mode — `propose`

The ceiling on **unattended** work here (cron routines, `/loop`, dispatched
subagents). At `propose`, a run may read, analyze, build artifacts, commit on a
branch, and open a PR. It may not merge, send, post, submit, or take any other
outward-facing or irreversible step — those queue for the human.

To go further, see `~/.claude/CLAUDE.md` → Autonomy Mode. `act` is never
scaffolded: it requires enumerating each permitted action, its gates, and a
numeric cap by hand. A mode with no enumeration grants nothing.
