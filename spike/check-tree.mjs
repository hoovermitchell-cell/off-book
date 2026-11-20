// Run: node check-tree.mjs <london|caro-kann|queens-gambit|slav|italian|french|scotch|qgd>  -- every prep move is legal, conflict-free, and close to Stockfish's best.
import { createRequire } from 'node:module';
import { Chess } from 'chess.js';
import { createEngine } from './engine.js';

const name = process.argv[2];
const mod = await import(`./${name}.js`).catch(() => { throw new Error(`usage: node check-tree.mjs <london|caro-kann|queens-gambit|slav|italian|french|scotch|qgd> (got ${name})`); });
const tree = mod.buildTree(Chess);
// The student's colour is the side to move in every prep position; Stockfish scores are White's view.
const sign = [...tree.keys()][0].split(' ')[1] === 'w' ? 1 : -1;
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
  const loss = prep.uci === best.best ? 0 : sign * (best.cp - after.cp); // a mating prep move leaves nothing to score
  if (loss > LIMIT) { bad++; console.log(`TRAILS ${loss}cp: ${prep.san} (best ${best.best}) at ${key} [${prep.pinned ? 'pinned' : prep.line}]`); }
}
console.log(`${name}: ${tree.size} prep positions, ${bad} trailing by more than ${LIMIT}cp`);
sf.terminate();
process.exitCode = bad ? 1 : 0;
