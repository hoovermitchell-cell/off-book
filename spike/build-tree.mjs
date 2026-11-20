// Run: node build-tree.mjs [london|caro-kann|queens-gambit|slav]   (default london; takes several minutes; KEEP=1 reuses existing picks)
// Walks the opening from its start. At the student's turn: the pinned move if there is one, else the
// first system-style move Stockfish rates within SLACK of its best, else Stockfish's best. At the
// opponent's turn: every reply Maia plays at least MIN_REPLY often (max over RATINGS), while the path
// stays likely enough (MIN_PATH) and the move number is at most maxMove.
// ponytail: system preference is a fixed move list, not a plan model; good enough for one opening.
import { writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import * as ort from 'onnxruntime-web';
import { Chess } from 'chess.js';
import { createEngine } from './engine.js';
import { maiaMoves } from './maia.js';

const RATINGS = [800, 1200, 1600];
const MIN_REPLY = 0.08, MIN_PATH = 0.002, SLACK = 35;

// Per opening: the student's side, the moves before the first student move, how deep to go, and the
// "system" preference list (SAN, best first). `extra` adds candidates after the recaptures and check
// answers; `reject` drops a candidate. London's two hooks are exactly its old inline rules.
const OPENINGS = {
  london: {
    side: 'w', start: [], maxMove: 8, maxCands: 7,
    system: ['d4', 'Bf4', 'e3', 'Nf3', 'c3', 'Bd3', 'Nbd2', 'O-O', 'h3', 'Be2', 'Qc2', 'Qe2', 'Ngf3', 'Nd2', 'Re1', 'a4', 'Bh2', 'Qc1', 'b3'],
    blocks: ['c3', 'Nbd2', 'Nd2', 'Nc3', 'Bd2', 'Qd2'],
    extra: (c, legal) => (c.get('d6')?.type === 'b' && c.get('d6').color === 'b' && c.get('f4')?.type === 'b' ? [legal.find((m) => m.san === 'Bg3')] : []),
    reject: () => false,
    spikeCopy: true,
  },
  'caro-kann': {
    side: 'b', start: ['e4'], maxMove: 8, maxCands: 9,
    system: ['c6', 'd5', 'Bf5', 'Bg4', 'e6', 'Nd7', 'Nbd7', 'Ngf6', 'Nf6', 'Be7', 'Bd6', 'c5', 'O-O', 'Qb6', 'Qc7', 'h6', 'Nc6', 'Ne7', 'Qd7', 'b6', 'a6'],
    blocks: ['Nd7', 'Nbd7', 'Bd7', 'Qd7', 'Nc6', 'Nbc6', 'e6', 'Nf6'],
    extra: () => [],
    // ponytail: a piece that has already moved is not "system" again (no Bf5-g4 shuffles); pawns and the king are exempt.
    reject: (c, m, side) => !'pk'.includes(m.piece) && c.history({ verbose: true }).some((h) => h.color === side && h.to === m.from),
  },
  'queens-gambit': {
    side: 'w', start: ['d4', 'd5'], maxMove: 8, maxCands: 9,
    system: ['c4', 'Nc3', 'Nf3', 'e3', 'Bg5', 'Bd3', 'Qc2', 'cxd5', 'O-O', 'Rc1', 'Bxc4', 'a4', 'Be2', 'h3', 'Qb3', 'Rab1', 'b4'],
    blocks: ['Bd2', 'Nc3', 'Nbd2', 'Nd2', 'c3', 'Qd2'],
    extra: () => [],
    reject: (c, m, side) => !'pk'.includes(m.piece) && c.history({ verbose: true }).some((h) => h.color === side && h.to === m.from),
  },
  slav: {
    side: 'b', start: ['d4'], maxMove: 8, maxCands: 9,
    system: ['d5', 'c6', 'Nf6', 'Bf5', 'Bg4', 'e6', 'Nbd7', 'Bd6', 'Be7', 'Bb4', 'O-O', 'dxc4', 'Nc6', 'h6', 'Qb6', 'a6', 'c5'],
    blocks: ['Bd7', 'Nbd7', 'Nfd7', 'Qd7', 'c6', 'Nc6'],
    extra: () => [],
    reject: (c, m, side) => !'pk'.includes(m.piece) && c.history({ verbose: true }).some((h) => h.color === side && h.to === m.from),
  },
};
const name = process.argv[2] ?? 'london';
const cfg = OPENINGS[name];
if (!cfg) throw new Error(`unknown opening ${name}; try ${Object.keys(OPENINGS).join(', ')}`);
const { side, start, maxMove: MAX_MOVE, system: SYSTEM, blocks: BLOCKS } = cfg;
const { buildTree, posKey, AUTO: old } = await import(`./${name}.js`);
const sign = side === 'w' ? 1 : -1; // Stockfish scores are from White's point of view

const pinned = buildTree(Chess, { auto: false });
const keep = process.env.KEEP ? old ?? {} : {}; // KEEP=1: reuse the picks already generated, so new pins only redo the positions they change
const sf = createRequire(import.meta.url)('stockfish')('lite-single', (l) => engine.onLine(l));
const engine = createEngine((c) => sf.processCommand(c));
await engine.ready();
const session = await ort.InferenceSession.create('./maia3-5m.fp16.onnx', { graphOptimizationLevel: 'basic' });

function candidates(c) {
  const legal = c.moves({ verbose: true });
  const last = c.history({ verbose: true }).at(-1);
  const out = [];
  if (last?.captured) out.push(...legal.filter((m) => m.to === last.to).sort((a, b) => 'pnbrqk'.indexOf(a.piece) - 'pnbrqk'.indexOf(b.piece)));
  if (c.inCheck()) out.push(...BLOCKS.map((s) => legal.find((m) => m.san.replace('+', '') === s)).filter(Boolean));
  out.push(...cfg.extra(c, legal));
  out.push(...SYSTEM.map((s) => legal.find((m) => m.san.replace(/[+#]/, '') === s)).filter(Boolean));
  // Never "develop" a piece back to where it just came from (Bg3, then Bf4 again).
  const undoes = (m) => c.history({ verbose: true }).some((h) => h.color === side && h.from === m.to && h.to === m.from);
  return [...new Set(out.filter(Boolean))].filter((m) => !undoes(m) && !cfg.reject(c, m, side)).slice(0, cfg.maxCands);
}

async function pickMine(c) {
  const best = await engine.evaluate(c.fen(), 400);
  for (const m of candidates(c)) {
    const t = new Chess(c.fen()); t.move(m.san);
    const after = await engine.evaluate(t.fen(), 250);
    const loss = sign * (best.cp - after.cp);
    if (loss <= SLACK) return { san: m.san, uci: m.from + m.to + (m.promotion ?? ''), loss, how: 'system' };
  }
  const m = new Chess(c.fen()).move({ from: best.best.slice(0, 2), to: best.best.slice(2, 4), promotion: best.best[4] });
  return { san: m.san, uci: best.best, loss: 0, how: 'stockfish' };
}

async function replies(c) {
  const byMove = new Map();
  for (const r of RATINGS) for (const m of await maiaMoves(ort, session, c, r, r)) byMove.set(m.san, Math.max(byMove.get(m.san) ?? 0, m.p));
  return [...byMove].filter(([, p]) => p >= MIN_REPLY);
}

const auto = {}, seen = new Set();
const queue = [{ moves: start, p: 1 }];
while (queue.length) {
  const { moves, p } = queue.shift();
  const c = new Chess(); moves.forEach((m) => c.move(m));
  const key = posKey(c.fen());
  if (seen.has(key) || c.isGameOver()) continue;
  seen.add(key);
  const w = pinned.get(key) ?? (auto[key] = { ...(keep[key] ?? await pickMine(c)), p: +p.toFixed(3), line: moves.join(' ') });
  if (c.moveNumber() >= MAX_MOVE) continue;
  c.move(w.san);
  if (c.isGameOver()) continue;
  for (const [san, q] of await replies(c)) if (p * q >= MIN_PATH) queue.push({ moves: [...moves, w.san, san], p: p * q });
  process.stdout.write(`\r${seen.size} positions, ${Object.keys(auto).length} auto, queue ${queue.length}   `);
}
sf.terminate();

if (cfg.spikeCopy) writeFileSync(`${name}-auto.js`, `// Generated by build-tree.mjs. Do not edit by hand; pin lines in ${name}.js instead.
export const AUTO = ${JSON.stringify(auto, null, 1)};
`);
// The app's copy. ponytail: london.js's LINES must match src/data/london.ts by hand; every other opening's
// spike module (ts-opening.js) reads its LINES and AUTO straight from the TS files. Move this generator into
// the app when Node can import the app's extensionless TS modules.
const types = `import type { PrepMove } from './${name === 'london' ? 'london' : 'prep'}';`; // london.ts re-exports PrepMove; the rest import it from prep.ts
writeFileSync(`../src/data/${name}-auto.ts`, `// Generated by spike/build-tree.mjs. Do not edit by hand; pin lines in ${name}.ts instead.
${types}

export const AUTO: Record<string, PrepMove> = ${JSON.stringify(auto, null, 1)};
`);
const vals = Object.values(auto);
console.log(`\nwrote ${vals.length} auto positions (${vals.filter((v) => v.how === 'stockfish').length} fell back to Stockfish's move)`);
