#!/usr/bin/env node
import { createRequire } from 'module';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execFileSync } from 'child_process';

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const CANON_BIN = path.join(ROOT, 'target/release/canonicalize_and_compare');

const svelte = await import(path.join(ROOT, 'submodules/svelte/packages/svelte/src/compiler/index.js'));
let rsvelte;
for (const p of [
  path.join(ROOT, 'svelte/rsvelte.linux-x64-gnu.node'),
  path.join(ROOT, 'svelte/rsvelte.linux-arm64-gnu.node'),
  path.join(ROOT, 'svelte/rsvelte.darwin-arm64.node'),
]) { try { rsvelte = require(p); break; } catch {} }

const cleanEnv = { ...process.env };
delete cleanEnv.LD_PRELOAD;

function findSvelteFiles(dir) {
  const files = [];
  if (!fs.existsSync(dir)) return files;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const f = path.join(dir, e.name);
    if (e.isDirectory() && e.name !== 'node_modules' && e.name !== '.git') files.push(...findSvelteFiles(f));
    else if (e.isFile() && e.name.endsWith('.svelte')) files.push(f);
  }
  return files;
}

const REPOS = path.join(ROOT, '.real-world-tests');
const allFiles = [
  ...findSvelteFiles(path.join(REPOS, 'immich/web/src')),
  ...findSvelteFiles(path.join(REPOS, 'gradio/js')),
];

let rawMatch = 0, rawDiff = 0, canonMatch = 0, canonDiff = 0, jsErr = 0, rsErr = 0;
const canonDiffs = [];

let count = 0;
for (const file of allFiles) {
  count++;
  if (count % 200 === 0) process.stderr.write(`SSR: ${count}/${allFiles.length}\n`);
  const src = fs.readFileSync(file, 'utf-8');
  const rel = path.relative(REPOS, file);
  const opts = { filename: rel, generate: 'server', css: 'external', dev: false };

  let jc, rc;
  try { jc = svelte.compile(src, opts).js.code; } catch { jsErr++; continue; }
  try { rc = rsvelte.compile(src, opts).js.code; } catch(e) { rsErr++; continue; }
  if (!rc) { rsErr++; continue; }
  if (!rc) { rsErr++; continue; }

  if (jc === rc) {
    rawMatch++;
    canonMatch++;
  } else {
    rawDiff++;
    // Try canon compare
    try {
      fs.writeFileSync('/tmp/_ssrj.js', jc);
      fs.writeFileSync('/tmp/_ssrr.js', rc);
      const r = execFileSync(CANON_BIN, ['/tmp/_ssrj.js', '/tmp/_ssrr.js'], {
        encoding: 'utf-8', env: cleanEnv, timeout: 10000,
      }).trim();
      if (r === 'MATCH') {
        canonMatch++;
      } else {
        canonDiff++;
        if (canonDiffs.length < 20) {
          const lines = r.split('\n');
          canonDiffs.push({ rel, f1: lines[1] || '', f2: lines[2] || '' });
        }
      }
    } catch {
      canonDiff++;
      if (canonDiffs.length < 20) canonDiffs.push({ rel, f1: 'CANON_ERROR', f2: '' });
    }
  }
  // Write intermediate results after every 50 files
  if (count % 50 === 0 || count === allFiles.length) {
    const ct = canonMatch + canonDiff;
    try { fs.writeFileSync('/tmp/ssr_measure_result.txt', `Canon match: ${canonMatch}/${ct} (${ct ? (canonMatch/ct*100).toFixed(1) : 0}%)\nProcessed: ${count}/${allFiles.length}\n`); } catch {}
  }
}

const compiled = rawMatch + rawDiff;
const canonTotal = canonMatch + canonDiff;
console.log(`\n=== SSR ===`);
console.log(`Raw match:   ${rawMatch}/${compiled} (${compiled ? (rawMatch/compiled*100).toFixed(1) : 0}%)`);
console.log(`Canon match: ${canonMatch}/${canonTotal} (${canonTotal ? (canonMatch/canonTotal*100).toFixed(1) : 0}%)`);
console.log(`Canon diff:  ${canonDiff}`);
console.log(`JS err: ${jsErr}, RS err: ${rsErr}`);

if (canonDiffs.length) {
  console.log(`\n=== SSR Canon Diffs (first ${canonDiffs.length}) ===`);
  for (const d of canonDiffs) {
    console.log(`  ${d.rel}`);
    console.log(`    ${d.f1}`);
    console.log(`    ${d.f2}`);
  }
}

// Write results to file before potential segfault during cleanup
try {
  const canonTotal2 = canonMatch + canonDiff;
  fs.writeFileSync('/tmp/ssr_measure_result.txt', `Canon match: ${canonMatch}/${canonTotal2} (${canonTotal2 ? (canonMatch/canonTotal2*100).toFixed(1) : 0}%)\n`);
} catch {}
// Force flush output and use _exit to avoid NAPI cleanup segfault
try { process.stdout.write(''); } catch {}
try { process.stderr.write(''); } catch {}
setTimeout(() => process._exit(0), 100);
