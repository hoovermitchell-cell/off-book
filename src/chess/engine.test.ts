import { createRequire } from 'node:module';
import { afterAll, describe, expect, it } from 'vitest';
import { createEngine } from './engine';

// The stockfish npm package runs in node: factory(name, onLine) returns { processCommand, terminate }.
interface Sf {
  processCommand(cmd: string): void;
  terminate(): void;
}
const factory = createRequire(import.meta.url)('stockfish') as (name: string, onLine: (l: string) => void) => Sf;
const sf = factory('lite-single', (line) => engine.onLine(line));
const engine = createEngine((cmd) => sf.processCommand(cmd));

afterAll(() => sf.terminate());

describe('engine (real Stockfish)', () => {
  it('finds Qxf7# as mate in 1', { timeout: 60_000 }, async () => {
    await engine.ready();
    // Scholar mate setup, White to move.
    const r = await engine.evaluate('r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 4 4', 300);
    expect(r.best).toBe('h5f7');
    expect(r.mate).toBe(1);
    expect(r.cp).toBeGreaterThan(90000);
  });

  it('reports scores from White view when Black is to move', { timeout: 60_000 }, async () => {
    // Black to move after a White blunder: Qh4# is mate, and it still reads as a White-view loss.
    const b = await engine.evaluate('rnbqkbnr/pppp1ppp/8/4p3/6P1/5P2/PPPPP2P/RNBQKBNR b KQkq - 0 2', 300);
    expect(b.best).toBe('d8h4');
    expect(b.cp).toBeLessThan(-90000);
  });
});
