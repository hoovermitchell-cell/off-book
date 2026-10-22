// Run: node check-coverage.mjs  -- simulate drill rounds against Maia and report how long prep lasts.
import * as ort from 'onnxruntime-web';
import { Chess } from 'chess.js';
import { buildTree, posKey } from './london.js';
import { maiaMoves, sample } from './maia.js';

const ROUNDS = 150, TARGET = 8;
const tree = buildTree(Chess);
const session = await ort.InferenceSession.create('./maia3-5m.fp16.onnx', { graphOptimizationLevel: 'basic' });
let seed = 42;
const rand = () => ((seed = (seed * 1103515245 + 12345) % 2 ** 31) / 2 ** 31); // seeded, so runs repeat

for (const rating of [800, 1000, 1400]) {
  const ends = [];
  for (let i = 0; i < ROUNDS; i++) {
    const c = new Chess();
    while (tree.has(posKey(c.fen())) && c.moveNumber() <= TARGET && !c.isGameOver()) {
      c.move(tree.get(posKey(c.fen())).san);
      if (c.isGameOver()) break;
      c.move(sample(await maiaMoves(ort, session, c, rating, rating), rand).san);
    }
    ends.push(c.moveNumber() - 1); // White moves played from prep
  }
  ends.sort((a, b) => a - b);
  const reached = ends.filter((n) => n >= TARGET).length / ROUNDS;
  console.log(`Maia ${rating}: median ${ends[ROUNDS >> 1]} prep moves, ${Math.round(reached * 100)}% of rounds reach move ${TARGET}, ${Math.round(ends.filter((n) => n <= 2).length / ROUNDS * 100)}% end by move 2`);
}
console.log(`tree: ${tree.size} positions`);
