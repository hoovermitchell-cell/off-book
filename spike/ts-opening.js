// Spike copy of an opening tree. Reads LINES from src/data/<name>.ts and AUTO from src/data/<name>-auto.ts,
// so there is one copy of each. `side` is the student's colour.
import { readFileSync } from 'node:fs';

const read = (f) => readFileSync(new URL(`../src/data/${f}`, import.meta.url), 'utf8');
export const posKey = (fen) => fen.split(' ').slice(0, 4).join(' ');

export function tsOpening(name, side) {
  // ponytail: LINES are the quoted lines in <name>.ts; keep any other quoted line out of that file's margin.
  const LINES = [...read(`${name}.ts`).matchAll(/^\s*'([^']+)',/gm)].map((m) => m[1]);
  const AUTO = (() => {
    try {
      const t = read(`${name}-auto.ts`);
      return JSON.parse(t.slice(t.indexOf('= {') + 2, t.lastIndexOf('}') + 1));
    } catch { return {}; }
  })();

  function buildTree(Chess, { auto = true } = {}) {
    const tree = new Map();
    for (const line of LINES) {
      const chess = new Chess();
      for (const san of line.split(' ')) {
        const key = posKey(chess.fen());
        const m = chess.move(san); // throws on an illegal move
        if (m.color !== side) continue;
        const prev = tree.get(key);
        if (prev && prev.san !== m.san) throw new Error(`conflict at ${key}: ${prev.san} vs ${m.san}`);
        tree.set(key, { san: m.san, uci: m.from + m.to + (m.promotion ?? ''), pinned: true });
      }
    }
    if (auto) for (const [key, v] of Object.entries(AUTO)) if (!tree.has(key)) tree.set(key, v);
    return tree;
  }
  return { LINES, AUTO, posKey, buildTree };
}
