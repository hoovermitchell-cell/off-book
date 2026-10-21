# Off Book — operating manual

A browser chess trainer for a middle and high school chess program, useful to
any adult improver too. The core loop: learn an opening, play it in real games,
review how it held up. Every product decision so far is in
[docs/decisions.md](docs/decisions.md); read it before building anything.
Research behind those decisions: [docs/research/](docs/research/).

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
- Stack default: TypeScript + Vite, static hosting (Cloudflare Pages). Spikes may
  be a single `index.html`.

## Autonomous loop

Work is queued in `backlog.md`. Start the hands-off loop with:

    /loop Read backlog.md. Take the first `- [ ]` under `## Ready`. If one exists: invoke the `cycle` skill with that item's text and run the loop to VERIFY; then commit on a branch, push, and open a PR; watch CI and fix failures until it is green. When the PR is open and green, move the item to `## Done` and continue to the next item. If `## Ready` is empty: do NOT invent work — stop, and if `## Needs shaping` has items, list them and offer a quick shaping pass to promote one into `## Ready`; otherwise say the queue is dry. End the loop.

Omit an interval so the loop self-paces. It opens PRs and pushes branches but
never merges — the human's merge is the final gate even in full auto.

## Autonomy mode — `propose`

The ceiling on **unattended** work here (cron routines, `/loop`, dispatched
subagents). At `propose`, a run may read, analyze, build artifacts, commit on a
branch, and open a PR. It may not merge, send, post, submit, or take any other
outward-facing or irreversible step — those queue for the human.

To go further, see `~/.claude/CLAUDE.md` → Autonomy Mode. `act` is never
scaffolded: it requires enumerating each permitted action, its gates, and a
numeric cap by hand. A mode with no enumeration grants nothing.
