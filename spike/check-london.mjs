// Run: node check-london.mjs  -- every prep move is legal, conflict-free, and close to Stockfish's best.
import { createRequire } from 'node:module';
import { Chess } from 'chess.js';
import { buildTree } from './london.js';
import { createEngine } from './engine.js';

const tree = buildTree(Chess);
const sf = createRequire(import.meta.url)('stockfish')('lite-single', (l) => engine.onLine(l));
const engine = createEngine((c) => sf.processCommand(c));
await engine.ready();

const LIMIT = 60; // cp a prep move may trail Stockfish's best
let bad = 0;
for (const [key, prep] of tree) {
  const fen = `${key} 0 1`;
  const best = await engine.evaluate(fen, 400);
  const c = new Chess(fen); c.move(prep.san);
  const after = await engine.evaluate(c.fen(), 400);
  const loss = best.cp - after.cp;
  if (loss > LIMIT) { bad++; console.log(`TRAILS ${loss}cp: ${prep.san} (best ${best.best}) at ${key}`); }
}
console.log(`${tree.size} prep positions, ${bad} trailing by more than ${LIMIT}cp`);
sf.terminate();
process.exitCode = bad ? 1 : 0;
