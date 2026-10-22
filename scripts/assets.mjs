// Copies engine files out of node_modules into public/ and fetches the Maia model.
// Node stdlib only. Idempotent: copies when sizes differ, downloads only when missing.
import { copyFileSync, existsSync, mkdirSync, renameSync, statSync, writeFileSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const nm = (...p) => join(root, 'node_modules', ...p);
const pub = (...p) => join(root, 'public', ...p);

function copy(from, toDir) {
  if (!existsSync(from)) throw new Error(`missing ${from}; run npm install first`);
  mkdirSync(toDir, { recursive: true });
  const to = join(toDir, basename(from));
  if (existsSync(to) && statSync(to).size === statSync(from).size) return;
  copyFileSync(from, to);
  console.log(`copied ${to}`);
}

for (const f of ['stockfish-19-lite-single.js', 'stockfish-19-lite-single.wasm']) {
  copy(nm('stockfish', 'bin', f), pub('vendor', 'stockfish'));
}

const MODEL_URL = 'https://huggingface.co/bqrio/maia3-onnx/resolve/main/maia3-5m.fp16.onnx';
const model = pub('models', 'maia3-5m.fp16.onnx');
if (!existsSync(model)) {
  mkdirSync(dirname(model), { recursive: true });
  console.log(`downloading ${MODEL_URL}`);
  const res = await fetch(MODEL_URL, { redirect: 'follow' });
  if (!res.ok) throw new Error(`model download failed: HTTP ${res.status}`);
  const tmp = `${model}.part`;
  writeFileSync(tmp, Buffer.from(await res.arrayBuffer()));
  renameSync(tmp, model);
  console.log(`saved ${model}`);
}
