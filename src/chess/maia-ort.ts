// The real Maia runner: onnxruntime-web, wasm backend. The model is served from public/models/.
import * as ort from 'onnxruntime-web/wasm';
import wasmUrl from 'onnxruntime-web/ort-wasm-simd-threaded.wasm?url';
import type { MaiaRunner } from './maia';

export const MODEL_URL = '/models/maia3-5m.fp16.onnx';

/** Downloads the model (about 11 MB), reporting progress from 0 to 1 when the size is known. */
async function fetchModel(url: string, onProgress?: (fraction: number) => void): Promise<Uint8Array> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Maia model download failed: HTTP ${res.status}`);
  // content-length may be the compressed size, so collect chunks rather than trusting it for allocation.
  const total = Number(res.headers.get('content-length')) || 0;
  if (!res.body || !total || !onProgress) return new Uint8Array(await res.arrayBuffer());
  const chunks: Uint8Array[] = [];
  const reader = res.body.getReader();
  let got = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    got += value.length;
    onProgress(Math.min(1, got / total));
  }
  const out = new Uint8Array(got);
  let at = 0;
  for (const c of chunks) { out.set(c, at); at += c.length; }
  return out;
}

export async function createMaiaRunner(modelUrl: string = MODEL_URL, onProgress?: (fraction: number) => void): Promise<MaiaRunner> {
  // Threads need cross-origin isolation (SharedArrayBuffer); static hosting may not provide it.
  ort.env.wasm.numThreads = globalThis.crossOriginIsolated ? Math.min(4, navigator.hardwareConcurrency || 1) : 1;
  // The bundle build has the JS glue inlined; only the .wasm is fetched. Vite serves it in dev and
  // copies it into dist on build, so it never goes through public/ (Vite refuses JS imports from there).
  ort.env.wasm.wasmPaths = { wasm: wasmUrl };
  const session = await ort.InferenceSession.create(await fetchModel(modelUrl, onProgress), {
    graphOptimizationLevel: 'basic',
    executionProviders: ['wasm'],
  });
  return async (tokens, eloSelf, eloOppo) => {
    const out = await session.run({
      tokens: new ort.Tensor('float32', tokens, [1, 64, 12]),
      elo_self: new ort.Tensor('float32', Float32Array.of(eloSelf), [1]),
      elo_oppo: new ort.Tensor('float32', Float32Array.of(eloOppo), [1]),
    });
    return out.logits_move.data as Float32Array;
  };
}
