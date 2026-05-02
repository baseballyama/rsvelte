#!/usr/bin/env node
// Compile every .svelte file in a target repo with both the official Svelte
// compiler and the rsvelte NAPI binding, then compare results.
//
// Usage:
//   node compare-app.mjs --target <target-path> --rsvelte-binding <abs-path-to-.node> --output <json-path>

import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';

const require = createRequire(import.meta.url);

const args = (() => {
  const out = {};
  for (let i = 2; i < process.argv.length; i++) {
    const k = process.argv[i];
    if (k.startsWith('--')) out[k.slice(2)] = process.argv[++i];
  }
  return out;
})();

const target = args.target;
const bindingPath = args['rsvelte-binding'];
const outputPath = args.output;
if (!target || !bindingPath || !outputPath) {
  console.error('usage: compare-app.mjs --target <path> --rsvelte-binding <abs.node> --output <json>');
  process.exit(64);
}

const targetAbs = path.resolve(target);
const ROOT = path.resolve(import.meta.dirname, '../../../..');

// Load compilers
const svelte = await import(path.join(ROOT, 'svelte/packages/svelte/src/compiler/index.js'));
const rsvelte = require(path.resolve(bindingPath));

function findSvelteFiles(dir, depth = 0) {
  if (depth > 12) return [];
  const out = [];
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const e of entries) {
    if (
      e.name === 'node_modules' ||
      e.name === '.git' ||
      e.name === 'dist' ||
      e.name === 'build' ||
      e.name === 'target' ||
      e.name === '.svelte-kit' ||
      e.name.startsWith('.')
    )
      continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...findSvelteFiles(full, depth + 1));
    else if (e.isFile() && e.name.endsWith('.svelte')) out.push(full);
  }
  return out;
}

// Canonicalize via OXC parse → codegen if the canonicalize_js binary exists.
const CANON = path.join(ROOT, 'target/release/canonicalize_js');
const hasCanon = fs.existsSync(CANON);

function canonicalize(code) {
  if (hasCanon) {
    try {
      return execFileSync(CANON, [], { input: code, encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 });
    } catch {
      /* fall through */
    }
  }
  // Naive fallback: strip comments + collapse whitespace outside string literals.
  return code
    .replace(/\/\/[^\n]*/g, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .split(/(`[^`]*`|'[^']*'|"[^"]*")/g)
    .map((part, i) => (i % 2 === 1 ? part : part.replace(/\s+/g, ' ')))
    .join('')
    .trim();
}

const MODES = ['client', 'server'];
const files = findSvelteFiles(targetAbs);

const summary = {
  totalFiles: files.length,
  bothCompiled: 0,
  semanticEqual: 0,
  semanticDiff: 0,
  rsvelteError: 0,
  officialError: 0,
  bothError: 0,
  details: [],
};

for (const file of files) {
  const rel = path.relative(targetAbs, file);
  const source = fs.readFileSync(file, 'utf8');
  for (const mode of MODES) {
    const opts = { filename: rel, generate: mode, css: 'external', dev: false };

    let jsResult, jsError, rsResult, rsError;
    try { jsResult = svelte.compile(source, opts); } catch (e) { jsError = String(e?.message || e); }
    try { rsResult = rsvelte.compile(source, opts); } catch (e) { rsError = String(e?.message || e); }

    if (jsError && rsError) {
      summary.bothError++;
      continue;
    }
    if (jsError) {
      summary.officialError++;
      summary.details.push({ file: rel, mode, category: 'official-error', message: jsError.slice(0, 400) });
      continue;
    }
    if (rsError) {
      summary.rsvelteError++;
      summary.details.push({ file: rel, mode, category: 'rsvelte-error', message: rsError.slice(0, 400) });
      continue;
    }

    summary.bothCompiled++;
    const jsCanon = canonicalize(jsResult.js.code);
    const rsCanon = canonicalize(rsResult.js.code);
    if (jsCanon === rsCanon) {
      summary.semanticEqual++;
    } else {
      summary.semanticDiff++;
      summary.details.push({
        file: rel,
        mode,
        category: 'semantic-diff',
        jsLen: jsCanon.length,
        rsLen: rsCanon.length,
      });
    }
  }
}

fs.mkdirSync(path.dirname(path.resolve(outputPath)), { recursive: true });
fs.writeFileSync(outputPath, JSON.stringify(summary, null, 2));

console.log(
  `[compare-app] files=${summary.totalFiles} bothCompiled=${summary.bothCompiled} semEq=${summary.semanticEqual} semDiff=${summary.semanticDiff} rsErr=${summary.rsvelteError} jsErr=${summary.officialError} bothErr=${summary.bothError}`,
);

if (summary.semanticDiff > 0 || summary.rsvelteError > 0) process.exit(2);
