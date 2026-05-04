#!/usr/bin/env node
import { createRequire } from 'module';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const svelte = await import(path.join(ROOT, 'submodules/svelte/packages/svelte/src/compiler/index.js'));
let rsvelte;
for (const p of [
  path.join(ROOT, 'svelte/rsvelte.linux-x64-gnu.node'),
  path.join(ROOT, 'svelte/rsvelte.linux-arm64-gnu.node'),
  path.join(ROOT, 'svelte/rsvelte.darwin-arm64.node'),
]) { try { rsvelte = require(p); break; } catch {} }

function getFiles(dir) {
  let results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) results.push(...getFiles(full));
    else if (entry.name.endsWith('.svelte')) results.push(full);
  }
  return results;
}

const rwDir = path.join(ROOT, '.real-world-tests');
const files = getFiles(rwDir);

function canon(code) {
  return code.replace(/\s+/g, ' ').replace(/\s*([{}()[\],;:=+\-*/<>!&|?])\s*/g, '$1').trim();
}

let diffs = [];
let total = 0, rawMatch = 0, canonMatch = 0;

for (const file of files) {
  const src = fs.readFileSync(file, 'utf-8');
  const rel = path.relative(rwDir, file);
  const opts = { filename: path.basename(file), generate: 'server', css: 'external', dev: false };
  try {
    const jc = svelte.compile(src, opts).js.code;
    const rc = rsvelte.compile(src, opts).js.code;
    total++;
    if (jc === rc) { rawMatch++; canonMatch++; continue; }
    if (canon(jc) === canon(rc)) { canonMatch++; continue; }
    let pos = 0;
    while (pos < jc.length && pos < rc.length && jc[pos] === rc[pos]) pos++;
    diffs.push({ file: rel, js: jc, rs: rc, pos });
  } catch(e) {}
}

console.log(`Total: ${total}, Raw: ${rawMatch}, Canon: ${canonMatch}, Diffs: ${diffs.length}`);
console.log();

for (const d of diffs) {
  const jsCtx = d.js.substring(Math.max(0, d.pos-50), d.pos + 100);
  const rsCtx = d.rs.substring(Math.max(0, d.pos-50), d.pos + 100);
  console.log(`=== ${d.file} (pos ${d.pos}) ===`);
  console.log(`JS: ${JSON.stringify(jsCtx)}`);
  console.log(`RS: ${JSON.stringify(rsCtx)}`);
  console.log();
}
