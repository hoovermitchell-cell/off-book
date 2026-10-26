// Run: node line-reach.mjs <london|caro-kann|...> "<SAN moves>" ["<SAN moves>" ...]  -- how often Maia reaches each line (risk 4).
// Two numbers per opponent move along each line:
//  - path: Maia's probability of that move averaged over 800/1000/1200/1400, and the cumulative product along this one move order
//    (what staged-lines.mjs and extend-line.mjs report);
//  - reach: the chance a game of student-follows-prep versus Maia passes through the position after it, over EVERY move order that
//    transposes into it (probability mass pushed through the position graph, each rating on its own, then the mean of the four).
// The student plays the tree's prep move; a line's own student moves are added to the tree for this run if the tree lacks them.
// Mass under MIN_MASS is dropped, so a reach of 0 means "under 1 game in 300,000".
import * as ort from 'onnxruntime-web';
import { Chess } from 'chess.js';
import { maiaMoves } from './maia.js';
import { OPENINGS } from './build-tree.mjs';

const RATINGS = [800, 1000, 1200, 1400];
const MIN_MASS = 3e-6, MIN_REPLY = 0.004, MAX_PLY = 44;
const [name, ...lines] = process.argv.slice(2);
const cfg = OPENINGS[name];
if (!cfg || !(lines.length || process.env.EXITS)) throw new Error(`usage: node line-reach.mjs <${Object.keys(OPENINGS).join('|')}> "<moves>" ... (got ${name})`);
const { side } = cfg;
const { buildTree, posKey } = await import(`./${name}.js`);
const tree = buildTree(Chess);
const session = await ort.InferenceSession.create('./maia3-5m.fp16.onnx', { graphOptimizationLevel: 'basic' });
const pct = (p) => (p === 0 ? '0%' : `${(p * 100).toPrecision(2)}%`);

// The lines' own student moves join the tree for this run.
for (const line of lines) {
  const c = new Chess();
  for (const san of line.split(' ')) {
    const key = posKey(c.fen());
    if (c.turn() === side) {
      const prev = tree.get(key);
      if (prev && prev.san !== san) console.warn(`warning: ${line} plays ${san} where the tree has ${prev.san}`);
      if (!prev) tree.set(key, { san });
    }
    c.move(san);
  }
}

const cache = new Map();
async function replies(c) {
  const key = posKey(c.fen());
  if (!cache.has(key)) cache.set(key, await Promise.all(RATINGS.map(async (r) => new Map((await maiaMoves(ort, session, c, r, r)).map((m) => [m.san, m.p])))));
  return cache.get(key);
}

// Mass at each position (key) where the opponent is to move, after the student's prep move.
const mass = new Map(); // key -> number[4]
const exits = new Map(); // key -> { line, m }: where mass leaves the book (EXITS=n lists the biggest)
let layer = new Map();
{
  const c = new Chess(); cfg.start.forEach((m) => c.move(m));
  const add = (map, c0, line = '') => { const k = posKey(c0.fen()); if (!map.has(k)) map.set(k, { fen: c0.fen(), line, m: RATINGS.map(() => 0) }); return map.get(k); };
  const step = (c0) => { // student to move: play the prep move, or stop
    if (c0.turn() !== side) return c0;
    const prep = tree.get(posKey(c0.fen()));
    if (!prep) return null;
    const t = new Chess(c0.fen()); t.move(prep.san); return t;
  };
  const first = step(c);
  if (first) { const n = add(layer, first, [...cfg.start, tree.get(posKey(c.fen())).san].join(' ')); n.m = RATINGS.map(() => 1); }
  for (let ply = 0; ply < MAX_PLY && layer.size; ply++) {
    const next = new Map();
    for (const [k, node] of layer) {
      const total = node.m.reduce((a, b) => a + b, 0) / RATINGS.length;
      if (total < MIN_MASS) continue;
      mass.set(k, node.m);
      const c0 = new Chess(node.fen);
      if (c0.isGameOver()) continue;
      const rs = await replies(c0);
      for (const san of rs[0].keys()) {
        if (!rs.some((r) => r.get(san) >= MIN_REPLY)) continue;
        const t = new Chess(node.fen); t.move(san);
        if (t.isGameOver()) continue;
        const s = step(t);
        if (!s) { const x = add(exits, t, `${node.line} ${san}`); RATINGS.forEach((_, i) => { x.m[i] += node.m[i] * rs[i].get(san); }); continue; } // the prep ends: this mass leaves the book
        const n = add(next, s, `${node.line} ${san} ${tree.get(posKey(t.fen()))?.san ?? ''}`.trim());
        RATINGS.forEach((_, i) => { n.m[i] += node.m[i] * rs[i].get(san); });
      }
    }
    layer = next;
  }
}

for (const line of lines) {
  const moves = line.split(' ');
  const c = new Chess();
  let cum = 1;
  const detail = [];
  for (const [i, san] of moves.entries()) {
    if (c.turn() !== side && i >= cfg.start.length) {
      const rs = await replies(c);
      const p = RATINGS.reduce((a, _, k) => a + (rs[k].get(san) ?? 0), 0) / RATINGS.length;
      cum *= p;
      c.move(san);
      // the position after the opponent's move: the student answers with the prep move, and the mass sits after that
      const t = new Chess(c.fen());
      const prep = tree.get(posKey(t.fen()));
      if (prep) t.move(prep.san);
      const m = mass.get(posKey(t.fen()));
      const reach = m ? m.reduce((a, b) => a + b, 0) / RATINGS.length : 0;
      detail.push(`${Math.floor(i / 2) + 1}${i % 2 ? '...' : '.'}${san}: path ${pct(p)} (cum ${pct(cum)}), reach ${pct(reach)}${m ? ` [${m.map((x) => pct(x)).join(' / ')}]` : ''}`);
    } else c.move(san);
  }
  console.log(`${line}\n  ${detail.join('\n  ')}`);
}
if (process.env.EXITS) [...exits.values()].map((x) => [x.m.reduce((a, b) => a + b, 0) / 4, x]).sort((a, b) => b[0] - a[0]).slice(0, +process.env.EXITS).forEach(([p, x]) => console.log(`${pct(p).padStart(7)}  ${x.line}`));
console.log(`(reach by rating: ${RATINGS.join(' / ')})`);
