// Run: node check-maia.mjs  (after npm install && npm run model)
import assert from 'node:assert';
import * as ort from 'onnxruntime-web';
import { Chess } from 'chess.js';
import { maiaMoves, moveIndex } from './maia.js';

// Vocabulary spot checks against upstream get_all_possible_moves().
assert.equal(moveIndex('a1a1', false), 0);
assert.equal(moveIndex('e2e4', false), 12 * 64 + 28);
assert.equal(moveIndex('e7e5', true), 12 * 64 + 28); // mirrored for Black
assert.equal(moveIndex('a7a8q', false), 4096);
assert.equal(moveIndex('h2h1n', true), 4096 + 255);

const session = await ort.InferenceSession.create('./maia3-5m.fp16.onnx', { graphOptimizationLevel: 'basic' });
const show = (ms) => ms.slice(0, 5).map((m) => `${m.san} ${(m.p * 100).toFixed(1)}%`).join(', ');

for (const [label, pgnMoves, elo] of [
  ['start, 1100', [], 1100],
  ['after 1.d4, Black 1000', ['d4'], 1000],
  ['London after 1.d4 d5 2.Bf4, Black 900', ['d4', 'd5', 'Bf4'], 900],
  ['London after 1.d4 d5 2.Bf4, Black 1800', ['d4', 'd5', 'Bf4'], 1800],
]) {
  const chess = new Chess();
  pgnMoves.forEach((m) => chess.move(m));
  const t = performance.now();
  const ms = await maiaMoves(ort, session, chess, elo, elo);
  console.log(`${label} (${(performance.now() - t).toFixed(0)} ms): ${show(ms)}`);
  assert(Math.abs(ms.reduce((s, m) => s + m.p, 0) - 1) < 1e-6);
}

const start = await maiaMoves(ort, session, new Chess(), 1100, 1100);
assert(['e4', 'd4', 'Nf3', 'c4'].includes(start[0].san), 'start position top move should be a normal first move');
const afterD4 = new Chess(); afterD4.move('d4');
const vsD4 = await maiaMoves(ort, session, afterD4, 1000, 1000);
assert(['d5', 'Nf6', 'e6'].includes(vsD4[0].san), 'Black reply to 1.d4 should be a normal one');
console.log('maia checks passed');
