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

const file = process.argv[2];
const src = fs.readFileSync(file, 'utf-8');
const opts = { filename: path.basename(file), generate: 'server', css: 'external', dev: false };
const jc = svelte.compile(src, opts).js.code;
const rc = rsvelte.compile(src, opts).js.code;

fs.writeFileSync('/tmp/ssr_js.js', jc);
fs.writeFileSync('/tmp/ssr_rs.js', rc);

if (jc === rc) {
  console.log('RAW MATCH');
} else {
  let pos = 0;
  while (pos < jc.length && pos < rc.length && jc[pos] === rc[pos]) pos++;
  console.log(`DIFF at pos ${pos}/${jc.length}`);
  console.log('JS:', JSON.stringify(jc.substring(Math.max(0, pos-30), pos + 150)));
  console.log('RS:', JSON.stringify(rc.substring(Math.max(0, pos-30), pos + 150)));
}
