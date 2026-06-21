#!/usr/bin/env node
import { createRequire } from 'module';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execFileSync } from 'child_process';

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');
const CANON_BIN = path.join(ROOT, 'target/release/canonicalize_and_compare');

const svelte = await import(path.join(ROOT, 'submodules/svelte/packages/svelte/src/compiler/index.js'));
let rsvelte;
for (const p of [
  path.join(ROOT, 'svelte/rsvelte.linux-x64-gnu.node'),
  path.join(ROOT, 'svelte/rsvelte.linux-arm64-gnu.node'),
  path.join(ROOT, 'svelte/rsvelte.darwin-arm64.node'),
]) { try { rsvelte = require(p); break; } catch {} }
if (!rsvelte) { console.error('No rsvelte binding'); process.exit(1); }

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

function canonCompare(jsCode, rsCode) {
  fs.writeFileSync('/tmp/_cj.js', jsCode);
  fs.writeFileSync('/tmp/_cr.js', rsCode);
  try {
    const r = execFileSync(CANON_BIN, ['/tmp/_cj.js', '/tmp/_cr.js'], {
      encoding: 'utf-8', env: cleanEnv, timeout: 10000,
    }).trim();
    return r === 'MATCH';
  } catch { return false; }
}

const results = {
  client: { rawMatch: 0, rawDiff: 0, canonMatch: 0, canonDiff: 0, jsErr: 0, rsErr: 0 },
  ssr:    { rawMatch: 0, rawDiff: 0, canonMatch: 0, canonDiff: 0, jsErr: 0, rsErr: 0 },
};
const ssrCanonDiffs = [];
const ssrRsErrors = [];
const clientRawDiffSamples = [];

// First pass: client only (known safe)
let count = 0;
for (const file of allFiles) {
  count++;
  if (count % 200 === 0) process.stderr.write(`Client: ${count}/${allFiles.length}\n`);
  const src = fs.readFileSync(file, 'utf-8');
  const rel = path.relative(REPOS, file);
  const opts = { filename: rel, generate: 'client', css: 'external', dev: false };
  let jc, rc;
  try { jc = svelte.compile(src, opts).js.code; } catch { results.client.jsErr++; continue; }
  try { rc = rsvelte.compile(src, opts).js.code; } catch { results.client.rsErr++; continue; }
  if (jc === rc) { results.client.rawMatch++; results.client.canonMatch++; }
  else {
    results.client.rawDiff++;
    if (canonCompare(jc, rc)) results.client.canonMatch++;
    else results.client.canonDiff++;
    if (clientRawDiffSamples.length < 5) {
      let pos = 0;
      while (pos < jc.length && pos < rc.length && jc[pos] === rc[pos]) pos++;
      clientRawDiffSamples.push({ rel, js: JSON.stringify(jc.substring(pos, pos+80)),
                                        rs: JSON.stringify(rc.substring(pos, pos+80)) });
    }
  }
}

// Print client results first (SSR may crash)
{
  const r = results.client;
  const compiled = r.rawMatch + r.rawDiff;
  const canonTotal = r.canonMatch + r.canonDiff;
  console.log(`\n=== CLIENT ===`);
  console.log(`Raw match:   ${r.rawMatch}/${compiled} (${compiled ? (r.rawMatch/compiled*100).toFixed(1) : 0}%)`);
  console.log(`Canon match: ${r.canonMatch}/${canonTotal} (${canonTotal ? (r.canonMatch/canonTotal*100).toFixed(1) : 0}%)`);
  console.log(`Canon diff:  ${r.canonDiff}`);
  console.log(`JS err: ${r.jsErr}, RS err: ${r.rsErr}`);
}
if (clientRawDiffSamples.length) {
  console.log('\n=== Client Raw Diff Samples ===');
  for (const d of clientRawDiffSamples) {
    console.log(`  ${d.rel}`);
    console.log(`    JS: ${d.js}`);
    console.log(`    RS: ${d.rs}`);
  }
}

// Second pass: SSR (may panic - wrap each in try)
count = 0;
for (const file of allFiles) {
  count++;
  if (count % 200 === 0) process.stderr.write(`SSR: ${count}/${allFiles.length}\n`);
  const src = fs.readFileSync(file, 'utf-8');
  const rel = path.relative(REPOS, file);
  const opts = { filename: rel, generate: 'server', css: 'external', dev: false };
  let jc, rc;
  try { jc = svelte.compile(src, opts).js.code; } catch { results.ssr.jsErr++; continue; }
  try { rc = rsvelte.compile(src, opts).js.code; } catch(e) {
    results.ssr.rsErr++;
    if (ssrRsErrors.length < 10) ssrRsErrors.push(`${rel}: ${String(e?.message || e).substring(0,150)}`);
    continue;
  }
  if (!rc) { results.ssr.rsErr++; continue; }
  if (jc === rc) { results.ssr.rawMatch++; results.ssr.canonMatch++; }
  else {
    results.ssr.rawDiff++;
    if (canonCompare(jc, rc)) results.ssr.canonMatch++;
    else {
      results.ssr.canonDiff++;
      if (ssrCanonDiffs.length < 15) {
        let pos = 0;
        while (pos < jc.length && pos < rc.length && jc[pos] === rc[pos]) pos++;
        ssrCanonDiffs.push({ rel, js: jc.substring(pos, pos+100), rs: rc.substring(pos, pos+100) });
      }
    }
  }
}

for (const [key, r] of Object.entries(results)) {
  const compiled = r.rawMatch + r.rawDiff;
  const canonTotal = r.canonMatch + r.canonDiff;
  console.log(`\n=== ${key.toUpperCase()} ===`);
  console.log(`Raw match:   ${r.rawMatch}/${compiled} (${compiled ? (r.rawMatch/compiled*100).toFixed(1) : 0}%)`);
  console.log(`Canon match: ${r.canonMatch}/${canonTotal} (${canonTotal ? (r.canonMatch/canonTotal*100).toFixed(1) : 0}%)`);
  console.log(`Canon diff:  ${r.canonDiff}`);
  console.log(`JS err: ${r.jsErr}, RS err: ${r.rsErr}`);
}

if (ssrRsErrors.length) {
  console.log('\n=== SSR RS-Only Errors ===');
  for (const e of ssrRsErrors) console.log(`  ${e}`);
}
if (ssrCanonDiffs.length) {
  console.log('\n=== SSR Canon Diffs ===');
  for (const d of ssrCanonDiffs) {
    console.log(`  ${d.rel}`);
    console.log(`    JS: ${d.js.substring(0, 120)}`);
    console.log(`    RS: ${d.rs.substring(0, 120)}`);
  }
}
if (clientRawDiffSamples.length) {
  console.log('\n=== Client Raw Diff Samples ===');
  for (const d of clientRawDiffSamples) {
    console.log(`  ${d.rel}`);
    console.log(`    JS: ${d.js}`);
    console.log(`    RS: ${d.rs}`);
  }
}
