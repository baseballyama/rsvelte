#!/usr/bin/env node
/**
 * Precise semantic diff check between official Svelte and rsvelte.
 * Strips ALL comments and normalizes ALL whitespace (outside strings/templates)
 * to isolate true semantic differences from formatting-only changes.
 */
import { createRequire } from 'module';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');

const svelte = await import(path.join(ROOT, 'submodules/svelte/packages/svelte/src/compiler/index.js'));
let rsvelte;
for (const p of [
  path.join(ROOT, 'svelte/rsvelte.linux-x64-gnu.node'),
  path.join(ROOT, 'svelte/rsvelte.darwin-arm64.node'),
]) { try { rsvelte = require(p); break; } catch {} }
if (!rsvelte) { console.error('No rsvelte binding'); process.exit(1); }

function canonicalize(code) {
  // Pass 1: Strip comments (respecting strings and template literals)
  let stripped = '';
  let i = 0;
  let inSQ = false, inDQ = false, inTL = false, tlBraceDepth = 0;
  while (i < code.length) {
    const c = code[i], n = code[i + 1] || '';
    // Escape sequences inside strings
    if (c === '\\' && (inSQ || inDQ || inTL)) {
      stripped += c + n; i += 2; continue;
    }
    if (!inSQ && !inDQ && !inTL) {
      if (c === "'") { inSQ = true; stripped += c; i++; continue; }
      if (c === '"') { inDQ = true; stripped += c; i++; continue; }
      if (c === '`') { inTL = true; stripped += c; i++; continue; }
      // Line comment
      if (c === '/' && n === '/') { while (i < code.length && code[i] !== '\n') i++; continue; }
      // Block comment
      if (c === '/' && n === '*') {
        i += 2;
        while (i < code.length - 1 && !(code[i] === '*' && code[i + 1] === '/')) i++;
        i += 2; continue;
      }
    } else if (inSQ && c === "'") { inSQ = false; }
    else if (inDQ && c === '"') { inDQ = false; }
    else if (inTL) {
      if (c === '$' && n === '{') { tlBraceDepth++; }
      if (c === '}' && tlBraceDepth > 0) { tlBraceDepth--; }
      if (c === '`' && tlBraceDepth === 0) { inTL = false; }
    }
    stripped += c; i++;
  }

  // Pass 2: Normalize whitespace outside strings/templates
  let out = '', j = 0;
  inSQ = false; inDQ = false; inTL = false; tlBraceDepth = 0;
  while (j < stripped.length) {
    const c = stripped[j], n = stripped[j + 1] || '';
    if (c === '\\' && (inSQ || inDQ || inTL)) { out += c + n; j += 2; continue; }
    if (!inSQ && !inDQ && !inTL) {
      if (c === "'") { inSQ = true; out += c; j++; continue; }
      if (c === '"') { inDQ = true; out += c; j++; continue; }
      if (c === '`') { inTL = true; out += c; j++; continue; }
      if (/\s/.test(c)) { while (j < stripped.length && /\s/.test(stripped[j])) j++; out += ' '; continue; }
    } else if (inSQ && c === "'") { inSQ = false; }
    else if (inDQ && c === '"') { inDQ = false; }
    else if (inTL) {
      if (c === '$' && n === '{') { tlBraceDepth++; }
      if (c === '}' && tlBraceDepth > 0) { tlBraceDepth--; }
      if (c === '`' && tlBraceDepth === 0) { inTL = false; }
    }
    out += c; j++;
  }
  // Normalize trailing commas in function args, arrays, objects
  out = out.replace(/,\s*\)/g, ')').replace(/,\s*\]/g, ']').replace(/,\s*\}/g, '}');
  return out.trim();
}

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
const projects = [
  { name: 'immich', dir: path.join(REPOS, 'immich/web/src') },
  { name: 'gradio', dir: path.join(REPOS, 'gradio/js') },
];

let total = 0, semEqual = 0, semDiff = 0, rsErr = 0, jsErr = 0, bothErr = 0;
const diffs = [], rsErrors = [], jsErrors = [];

for (const proj of projects) {
  const files = findSvelteFiles(proj.dir);
  let projEqual = 0, projDiff = 0, projRsErr = 0;
  for (const file of files) {
    total++;
    const src = fs.readFileSync(file, 'utf-8');
    const rel = path.relative(path.join(REPOS, proj.name), file);
    const opts = { filename: rel, generate: 'client', css: 'external', dev: false };

    let jc, rc, je, re;
    try { jc = svelte.compile(src, opts).js.code; } catch (e) { je = e.message; }
    try { rc = rsvelte.compile(src, opts).js.code; } catch (e) { re = e.message; }

    if (je && re) { bothErr++; continue; }
    if (je) { jsErr++; jsErrors.push(`${proj.name}/${rel}: ${je.substring(0, 150)}`); continue; }
    if (re) { rsErr++; projRsErr++; rsErrors.push(`${proj.name}/${rel}: ${re.substring(0, 150)}`); continue; }

    const jCan = canonicalize(jc);
    const rCan = canonicalize(rc);
    if (jCan === rCan) { semEqual++; projEqual++; }
    else {
      semDiff++; projDiff++;
      if (diffs.length < 30) {
        let pos = 0;
        while (pos < jCan.length && pos < rCan.length && jCan[pos] === rCan[pos]) pos++;
        diffs.push({
          file: `${proj.name}/${rel}`,
          jsCtx: jCan.substring(Math.max(0, pos - 30), pos + 80),
          rsCtx: rCan.substring(Math.max(0, pos - 30), pos + 80),
        });
      }
    }
  }
  const compiled = projEqual + projDiff;
  console.log(`${proj.name}: ${projEqual}/${compiled} semantic match (${(projEqual/compiled*100).toFixed(1)}%), ${projRsErr} errors`);
}

const compiled = semEqual + semDiff;
console.log(`\n=== TOTAL ===`);
console.log(`Files: ${total}`);
console.log(`Both compiled: ${compiled}`);
console.log(`Semantically equal: ${semEqual}/${compiled} (${(semEqual/compiled*100).toFixed(1)}%)`);
console.log(`Semantic diff: ${semDiff}`);
console.log(`Rust-only errors: ${rsErr}`);
console.log(`JS-only errors: ${jsErr}`);
console.log(`Both errors: ${bothErr}`);

if (rsErrors.length) { console.log(`\n=== Rust-Only Errors ===`); rsErrors.forEach(e => console.log(`  ${e}`)); }
if (jsErrors.length) { console.log(`\n=== JS-Only Errors ===`); jsErrors.forEach(e => console.log(`  ${e}`)); }
if (diffs.length) {
  console.log(`\n=== Semantic Diffs (first ${diffs.length}) ===`);
  diffs.forEach(d => {
    console.log(`\n  ${d.file}:`);
    console.log(`    JS: ...${d.jsCtx}...`);
    console.log(`    RS: ...${d.rsCtx}...`);
  });
}
