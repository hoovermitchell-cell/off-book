// Run: node check-engine.mjs
import assert from 'node:assert';
import { createRequire } from 'node:module';
import { createEngine } from './engine.js';

const sf = createRequire(import.meta.url)('stockfish')('lite-single', (line) => engine.onLine(line));
const engine = createEngine((cmd) => sf.processCommand(cmd));
await engine.ready();

// Scholar's mate setup, White to move: Qxf7# should be found as mate in 1.
const r = await engine.evaluate('r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 4 4', 300);
assert.equal(r.best, 'h5f7');
assert.equal(r.mate, 1);
assert(r.cp > 90000);

// Same score sign from Black's side: Black to move after a White blunder still reads as White's view.
const b = await engine.evaluate('rnbqkbnr/pppp1ppp/8/4p3/6P1/5P2/PPPPP2P/RNBQKBNR b KQkq - 0 2', 300);
assert.equal(b.best, 'd8h4');
assert(b.cp < -90000);
console.log('engine checks passed', r, b);
sf.terminate();
