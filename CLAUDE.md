# Off Book

This file is the Claude Code project loader shim. Keep it paired with `AGENTS.md`,
which carries the operating manual, the autonomous-loop kickoff, and the autonomy
mode. Read `AGENTS.md` first.

Durable project state — standards, decisions, current work, backlog items — lives in
the project's own files, never in this shim.

## Context

- Global: `~/.claude/CLAUDE.md` and `~/.claude/context/`
- This project: `AGENTS.md` (operating manual), GitHub Issues (queued work)

## Agent skills

### Issue tracker

GitHub Issues on hoovermitchell-cell/off-book via `gh`; `ready-for-agent` is the unattended trust boundary. See `docs/agents/issue-tracker.md`.

### Triage labels

Default five: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context; `docs/decisions.md` serves as the ADR record. See `docs/agents/domain.md`.
