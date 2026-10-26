// Run: node extend-line.mjs <london|caro-kann|queens-gambit|slav|italian|french> "<SAN moves>" [toMove=12]  -- plays a line on to move toMove.
// Opponent's turn: Maia's likeliest reply, averaged over RATINGS as staged-lines.mjs does. Student's turn: the tree's
// prep move if the position is in the tree, else build-tree.mjs's pick (first system move within SLACK of Stockfish's
// best, else Stockfish's best). Ends on a student move. Prints the line, how each student move was chosen, and the
// chance of reaching the end: from the prefix (the extension's opponent replies) and from move 1 (the whole line).
// ponytail: the prefix is trusted, not checked against the tree; run check-tree.mjs after pinning.
import { createRequire } from 'node:module';
import * as ort from 'onnxruntime-web';
import { Chess } from 'chess.js';
import { createEngine } from './engine.js';
import { maiaMoves } from './maia.js';
import { OPENINGS, makePicker } from './build-tree.mjs';

const RATINGS = [800, 1000, 1200, 1400];
const [name, prefix, to = '12'] = process.argv.slice(2);
const cfg = OPENINGS[name];
if (!cfg || !prefix) throw new Error(`usage: node extend-line.mjs <${Object.keys(OPENINGS).join('|')}> "<moves>" [toMove] (got ${name})`);
const { side } = cfg, toMove = +to;
const { buildTree, posKey } = await import(`./${name}.js`);

const tree = buildTree(Chess);
const sf = createRequire(import.meta.url)('stockfish')('lite-single', (l) => engine.onLine(l));
const engine = createEngine((c) => sf.processCommand(c));
await engine.ready();
const session = await ort.InferenceSession.create('./maia3-5m.fp16.onnx', { graphOptimizationLevel: 'basic' });
const { pickMine } = makePicker(name, engine);

async function replies(c) {
  const sum = new Map();
  for (const r of RATINGS) for (const m of await maiaMoves(ort, session, c, r, r)) sum.set(m.san, (sum.get(m.san) ?? 0) + m.p / RATINGS.length);
  return [...sum].sort((a, b) => b[1] - a[1]);
}

const c = new Chess();
const moves = prefix.split(' '), prefixPlies = moves.length;
const how = []; // [ply, label] for each student move played after the prefix
let reach = 1, fromPrefix = 1; // products of the opponent's averaged reply probabilities, from move 1 and from the prefix
const reachAt = []; // cumulative reach after each opponent ply, to read a deviation's frequency off
for (const [i, san] of moves.entries()) {
  if (c.turn() !== side && i >= cfg.start.length) { // the first start.length plies are given (1.e4), not chosen
    reach *= (await replies(c)).find(([s]) => s === san)?.[1] ?? 0;
    reachAt[i] = reach;
  }
  c.move(san);
}
while (!c.isGameOver()) {
  const n = c.moveNumber();
  if (c.turn() === side) {
    const prep = tree.get(posKey(c.fen()));
    const pick = prep ? { san: prep.san, label: prep.pinned ? 'tree (pinned)' : 'tree (AUTO)' } : await pickMine(c);
    c.move(pick.san); moves.push(pick.san);
    how.push([moves.length - 1, pick.label ?? `${pick.how}, ${pick.loss.toFixed(0)}cp loss`]);
    if (n >= toMove) break;
  } else {
    const [[san, p]] = await replies(c);
    reach *= p; fromPrefix *= p; reachAt[moves.length] = reach;
    c.move(san); moves.push(san);
  }
}
sf.terminate();

const pct = (p) => `${(p * 100).toPrecision(3)}%`;
const num = (ms) => ms.map((m, i) => (i % 2 ? m : `${i / 2 + 1}.${m}`)).join(' ');
console.log(`${name}: ${num(moves)}`);
console.log(`prefix: ${prefixPlies} plies; extension: ${moves.length - prefixPlies} plies`);
for (const [i, label] of how) console.log(`  ${Math.floor(i / 2) + 1}${side === 'w' ? '.' : '...'}${moves[i]}: ${label}`);
console.log(`P(end | prefix) = ${pct(fromPrefix)}   P(end | move 1) = ${pct(reach)}`);
console.log(`cumulative P by opponent ply: ${reachAt.map((p, i) => (p === undefined ? '' : `${Math.floor(i / 2) + 1}${i % 2 ? '...' : '.'}${moves[i]} ${pct(p)}`)).filter(Boolean).join(', ')}`);
