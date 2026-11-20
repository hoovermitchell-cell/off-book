// Run: node tree-snapshot.mjs <out.json>  -- dumps every opening's prep tree (position key -> move), to compare before and after a tier change.
// Compare with: node tree-snapshot.mjs --diff before.json after.json  -- fails if any position that had a prep move now has a different one.
import { readFileSync, writeFileSync } from 'node:fs';
import { Chess } from 'chess.js';

const [a, b, c] = process.argv.slice(2);
if (a === '--diff') {
  const before = JSON.parse(readFileSync(b, 'utf8')), after = JSON.parse(readFileSync(c, 'utf8'));
  let bad = 0;
  for (const name of Object.keys(before)) {
    const x = before[name], y = after[name] ?? {};
    const changed = Object.keys(x).filter((k) => y[k] && y[k] !== x[k]);
    const gone = Object.keys(x).filter((k) => !y[k]);
    const added = Object.keys(y).filter((k) => !x[k]);
    console.log(`${name}: ${Object.keys(x).length} before, ${Object.keys(y).length} after; ${added.length} added, ${gone.length} removed, ${changed.length} changed`);
    for (const k of changed) { bad++; console.log(`  CHANGED ${k}: ${x[k]} -> ${y[k]}`); }
    for (const k of gone) console.log(`  REMOVED ${k}: ${x[k]}`);
  }
  process.exitCode = bad ? 1 : 0;
} else {
  const names = ['london', 'caro-kann', 'queens-gambit', 'slav', 'italian', 'french', 'scotch', 'qgd'];
  const out = {};
  for (const n of names) {
    const { buildTree } = await import(`./${n}.js`);
    out[n] = Object.fromEntries([...buildTree(Chess)].map(([k, v]) => [k, v.san + ':' + v.uci]));
  }
  writeFileSync(a, JSON.stringify(out));
  console.log(Object.entries(out).map(([n, t]) => `${n} ${Object.keys(t).length}`).join(', '));
}
