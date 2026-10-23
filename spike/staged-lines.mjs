// Run: node staged-lines.mjs [london|caro-kann]  -- proposes the staged alternative lines for decision 14b.
// An alternative = the textbook line (or an earlier alternative) until the opponent deviates, then the
// opponent's most likely replies through the prep tree to move 8. Ranked by how often a club player
// meets the deviation: Maia's probability averaged over RATINGS, times the chance of reaching that position.
import * as ort from 'onnxruntime-web';
import { Chess } from 'chess.js';
import { maiaMoves } from './maia.js';

const RATINGS = [800, 1000, 1200, 1400];
// `side` is the student's colour; `skip` plies are taken as given (the Caro-Kann assumes 1.e4); the opponent is whoever deviates. ponytail: the Caro-Kann lowers
// MIN_REPLY so the rarer club tries (Fantasy, 2.d3) still show up with their percentage.
const OPENINGS = {
  london: { side: 'w', textbook: 'd4 d5 Bf4 Nf6 e3 e6 Nf3 c5 c3 Nc6 Nbd2 Bd6 Bg3 O-O Bd3', minReply: 0.08, show: 10, skip: 0 },
  'caro-kann': { side: 'b', textbook: 'e4 c6 d4 d5 Nc3 dxe4 Nxe4 Bf5 Ng3 Bg6 h4 h6 Nf3 Nd7 h5 Bh7 Bd3 Bxd3 Qxd3 e6 Bf4 Ngf6 O-O-O Be7 Kb1 O-O', minReply: 0.02, show: 24, skip: 1 },
};
const name = process.argv[2] ?? 'london';
const cfg = OPENINGS[name];
if (!cfg) throw new Error(`unknown opening ${name}; try ${Object.keys(OPENINGS).join(', ')}`);
const { side, minReply: MIN_REPLY, show: SHOW, skip: SKIP } = cfg;
const opp = side === 'w' ? 'b' : 'w';
const TEXTBOOK = cfg.textbook.split(' ');
const LAST_MOVE = 8;
const { buildTree, posKey } = await import(`./${name}.js`);

const tree = buildTree(Chess);
const session = await ort.InferenceSession.create('./maia3-5m.fp16.onnx', { graphOptimizationLevel: 'basic' });
const cache = new Map();
async function replies(c) {
  const key = posKey(c.fen());
  if (!cache.has(key)) {
    const sum = new Map();
    for (const r of RATINGS) for (const m of await maiaMoves(ort, session, c, r, r)) sum.set(m.san, (sum.get(m.san) ?? 0) + m.p / RATINGS.length);
    cache.set(key, [...sum].sort((a, b) => b[1] - a[1]));
  }
  return cache.get(key);
}

/** The opponent's most likely continuation through the tree from `moves`, to move LAST_MOVE. */
async function extend(moves) {
  const c = new Chess(); moves.forEach((m) => c.move(m));
  const out = [...moves];
  while (c.moveNumber() <= LAST_MOVE) {
    const prep = c.turn() === side && tree.get(posKey(c.fen()));
    if (c.turn() === side) { if (!prep) break; c.move(prep.san); out.push(prep.san); continue; }
    const [top] = await replies(c);
    const t = new Chess(c.fen()); t.move(top[0]);
    if (!tree.has(posKey(t.fen())) && c.moveNumber() < LAST_MOVE) break; // the prep would end here
    c.move(top[0]); out.push(top[0]);
  }
  return out;
}

const lines = [{ name: 'Textbook', moves: TEXTBOOK, p: 1 }];
// Deviations from every line found so far, best first; two rounds is enough to find the common ones.
for (let round = 0; round < 2; round++) {
  for (const base of [...lines]) {
    const c = new Chess(); let reach = base.p === 1 ? 1 : base.reachAtDeviation;
    for (let i = 0; i < base.moves.length; i++) {
      if (c.turn() === opp && i >= SKIP) { // the first SKIP plies are given (1.e4), not a deviation
        for (const [san, p] of await replies(c)) {
          if (san === base.moves[i] || p < MIN_REPLY) continue;
          const t = new Chess(c.fen()); t.move(san);
          if (!tree.has(posKey(t.fen()))) continue;
          const moves = await extend([...base.moves.slice(0, i), san]);
          if (lines.some((l) => l.moves.join(' ') === moves.join(' '))) continue;
          lines.push({ name: `${Math.floor(i / 2) + 1}${side === 'w' ? '...' : '.'}${san}`, moves, p: reach * p, reachAtDeviation: reach * p });
        }
        reach *= (await replies(c)).find(([s]) => s === base.moves[i])?.[1] ?? 0;
      }
      c.move(base.moves[i]);
    }
  }
}

const num = (ms) => ms.map((m, i) => (i % 2 ? m : `${i / 2 + 1}.${m}`)).join(' ');
const [main, ...alts] = lines;
console.log(`Textbook: ${num(main.moves)}`);
alts.sort((a, b) => b.p - a.p).slice(0, SHOW).forEach((l, i) => console.log(`${String(i + 1).padStart(2)}. ${l.name.padEnd(9)} ${(l.p * 100).toFixed(1).padStart(5)}%  ${num(l.moves)}`));
