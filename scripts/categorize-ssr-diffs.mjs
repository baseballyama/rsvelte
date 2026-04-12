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

const svelte = await import(path.join(ROOT, 'svelte/packages/svelte/src/compiler/index.js'));
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

const categories = {};

for (const file of allFiles) {
  const src = fs.readFileSync(file, 'utf-8');
  const rel = path.relative(REPOS, file);
  const opts = { filename: rel, generate: 'server', css: 'external', dev: false };

  let jc, rc;
  try { jc = svelte.compile(src, opts).js.code; } catch { continue; }
  try { rc = rsvelte.compile(src, opts).js.code; } catch { continue; }
  if (!rc || jc === rc) continue;

  // Canon compare
  fs.writeFileSync('/tmp/_ssrj.js', jc);
  fs.writeFileSync('/tmp/_ssrr.js', rc);
  let isCanonMatch = false;
  try {
    const r = execFileSync(CANON_BIN, ['/tmp/_ssrj.js', '/tmp/_ssrr.js'], {
      encoding: 'utf-8', env: cleanEnv, timeout: 10000,
    }).trim();
    isCanonMatch = r === 'MATCH';
  } catch {}

  if (isCanonMatch) continue; // Only care about canon diffs

  // Categorize the diff
  let pos = 0;
  while (pos < jc.length && pos < rc.length && jc[pos] === rc[pos]) pos++;
  const jsCtx = jc.substring(Math.max(0, pos-50), pos+100);
  const rsCtx = rc.substring(Math.max(0, pos-50), pos+100);

  let cat = 'unknown';
  if (jsCtx.includes('store_get') && !rsCtx.includes('store_get') ||
      !jsCtx.includes('store_get') && rsCtx.includes('store_get')) {
    cat = 'store_get mismatch';
  } else if (jsCtx.includes('$$store_subs') !== rsCtx.includes('$$store_subs')) {
    cat = 'store_subs mismatch';
  } else if (/,\s*\}/.test(jsCtx) !== /,\s*\}/.test(rsCtx)) {
    cat = 'trailing comma';
  } else if (jsCtx.includes('$$renderer') || rsCtx.includes('$$renderer')) {
    cat = 'renderer output';
  } else if (jsCtx.includes('import ') || rsCtx.includes('import ')) {
    cat = 'import formatting';
  } else if (jsCtx.includes('$.attr') || rsCtx.includes('$.attr')) {
    cat = 'attribute handling';
  } else if (jsCtx.includes('snippet') || rsCtx.includes('snippet')) {
    cat = 'snippet';
  }

  if (!categories[cat]) categories[cat] = [];
  categories[cat].push({ rel, jsCtx: jsCtx.substring(50, 150), rsCtx: rsCtx.substring(50, 150) });
}

// Sort by count
const sorted = Object.entries(categories).sort((a, b) => b[1].length - a[1].length);
console.log('=== SSR Canon Diff Categories ===');
let total = 0;
for (const [cat, items] of sorted) {
  total += items.length;
  console.log(`\n${cat}: ${items.length} files`);
  for (const item of items.slice(0, 3)) {
    console.log(`  ${item.rel}`);
    console.log(`    JS: ${item.jsCtx.substring(0, 100)}`);
    console.log(`    RS: ${item.rsCtx.substring(0, 100)}`);
  }
  if (items.length > 3) console.log(`  ... and ${items.length - 3} more`);
}
console.log(`\nTotal: ${total}`);
