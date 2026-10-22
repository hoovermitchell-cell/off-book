// Runs Stockfish (lite, single-threaded wasm) in a Web Worker and wraps it in an engine.
import { createEngine, type Engine } from './engine';

export const STOCKFISH_URL = '/vendor/stockfish/stockfish-19-lite-single.js';
/** A school Chromebook on slow Wi-Fi can take a while; past this, report a failure instead of spinning. */
export const READY_TIMEOUT_MS = 60_000;

export interface StockfishHandle {
  engine: Engine;
  terminate(): void;
}

/** Starts the worker and waits for "readyok". Rejects if the worker fails to load or never answers;
 *  a crash later rejects the pending search, so the drill can end the round instead of hanging. */
export async function createStockfish(url: string = STOCKFISH_URL): Promise<StockfishHandle> {
  const worker = new Worker(url);
  const engine = createEngine((cmd) => worker.postMessage(cmd));
  worker.onmessage = (e: MessageEvent) => engine.onLine(String(e.data));
  worker.onerror = (e) => engine.fail(new Error(`Stockfish stopped: ${e.message || 'worker error'}`));
  const timer = setTimeout(() => engine.fail(new Error('Stockfish did not start in time')), READY_TIMEOUT_MS);
  try {
    await engine.ready();
  } catch (err) {
    worker.terminate();
    throw err;
  } finally {
    clearTimeout(timer);
  }
  return { engine, terminate: () => worker.terminate() };
}
