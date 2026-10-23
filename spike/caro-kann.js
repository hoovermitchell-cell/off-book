// Spike copy of the Caro-Kann tree. Reads LINES from src/data/caro-kann.ts and AUTO from
// src/data/caro-kann-auto.ts, so there is one copy of each. Black is the student.
import { readFileSync } from 'node:fs';

const read = (f) => readFileSync(new URL(`../src/data/${f}`, import.meta.url), 'utf8');
// ponytail: LINES are the quoted lines in caro-kann.ts; keep any other quoted line out of that file's margin.
export const LINES = [...read('caro-kann.ts').matchAll(/^\s*'([^']+)',/gm)].map((m) => m[1]);
export const AUTO = (() => {
  try {
    const t = read('caro-kann-auto.ts');
    return JSON.parse(t.slice(t.indexOf('= {') + 2, t.lastIndexOf('}') + 1));
  } catch { return {}; }
})();

export const posKey = (fen) => fen.split(' ').slice(0, 4).join(' ');

export function buildTree(Chess, { auto = true } = {}) {
  const tree = new Map();
  for (const line of LINES) {
    const chess = new Chess();
    for (const san of line.split(' ')) {
      const key = posKey(chess.fen());
      const m = chess.move(san); // throws on an illegal move
      if (m.color !== 'b') continue;
      const prev = tree.get(key);
      if (prev && prev.san !== m.san) throw new Error(`conflict at ${key}: ${prev.san} vs ${m.san}`);
      tree.set(key, { san: m.san, uci: m.from + m.to + (m.promotion ?? ''), pinned: true });
    }
  }
  if (auto) for (const [key, v] of Object.entries(AUTO)) if (!tree.has(key)) tree.set(key, v);
  return tree;
}
