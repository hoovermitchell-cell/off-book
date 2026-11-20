// Run: node check-line.mjs <london|caro-kann|...> "<SAN moves>" [ms=3000] [firstPly=0]  -- engine-checks every student move of a line.
// For each of the student's moves: Stockfish's best move and score before it, the score after the move played, and the loss
// in centipawns (student's view). Use it at 3 s on tactical lines, where 400 ms is noisy at +-60cp (check-tree.mjs).
import { createRequire } from 'node:module';
import { Chess } from 'chess.js';
import { createEngine } from './engine.js';
import { OPENINGS } from './build-tree.mjs';

const [name, line, ms = '3000', from = '0'] = process.argv.slice(2);
const cfg = OPENINGS[name];
if (!cfg || !line) throw new Error(`usage: node check-line.mjs <${Object.keys(OPENINGS).join('|')}> "<moves>" [ms] [firstPly]`);
const sf = createRequire(import.meta.url)('stockfish')('lite-single', (l) => engine.onLine(l));
const engine = createEngine((c) => sf.processCommand(c));
await engine.ready();
const sign = cfg.side === 'w' ? 1 : -1; // scores come back from White's view
const c = new Chess();
let worst = 0;
for (const [i, san] of line.split(' ').entries()) {
  if (c.turn() === cfg.side && i >= +from && !c.isGameOver()) {
    const before = await engine.evaluate(c.fen(), +ms);
    const t = new Chess(c.fen()); t.move(san);
    const after = t.isGameOver() ? { cp: before.cp } : await engine.evaluate(t.fen(), +ms);
    const best = new Chess(c.fen()).move({ from: before.best.slice(0, 2), to: before.best.slice(2, 4), promotion: before.best[4] }).san;
    const loss = best === san ? 0 : Math.max(0, sign * (before.cp - after.cp));
    worst = Math.max(worst, loss);
    console.log(`${Math.floor(i / 2) + 1}${cfg.side === 'w' ? '.' : '...'}${san}: ${loss}cp loss (best ${best}, score ${sign * before.cp} -> ${sign * after.cp})`);
  }
  c.move(san);
}
console.log(`worst ${worst}cp`);
sf.terminate();
