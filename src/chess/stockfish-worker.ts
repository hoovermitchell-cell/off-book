// Runs Stockfish (lite, single-threaded wasm) in a Web Worker and wraps it in an engine.
import { createEngine, type Engine } from './engine';

export const STOCKFISH_URL = '/vendor/stockfish/stockfish-19-lite-single.js';

export interface StockfishHandle {
  engine: Engine;
  terminate(): void;
}

/** Starts the worker and waits for "readyok". */
export async function createStockfish(url: string = STOCKFISH_URL): Promise<StockfishHandle> {
  const worker = new Worker(url);
  const engine = createEngine((cmd) => worker.postMessage(cmd));
  worker.onmessage = (e: MessageEvent) => engine.onLine(String(e.data));
  await engine.ready();
  return { engine, terminate: () => worker.terminate() };
}
