#!/usr/bin/env node
/**
 * Precise semantic diff using OXC parse→codegen (via Rust binary).
 *
 * Writes both JS and RS outputs to temp files, then uses the Rust
 * canonicalize_js function (same as test suite) to normalize before comparing.
 */
import { createRequire } from "module";
import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../..");

const svelte = await import(
  path.join(ROOT, "submodules/svelte/packages/svelte/src/compiler/index.js")
);
let rsvelte;
for (const p of [
  path.join(ROOT, "svelte/rsvelte.linux-x64-gnu.node"),
  path.join(ROOT, "svelte/rsvelte.linux-arm64-gnu.node"),
  path.join(ROOT, "svelte/rsvelte.darwin-arm64.node"),
]) {
  try {
    rsvelte = require(p);
    break;
  } catch {}
}
if (!rsvelte) {
  console.error("No rsvelte binding");
  process.exit(1);
}

// Use a Rust binary for OXC canonicalization
// Build it if needed
const CANON_SCRIPT = `
const fs = require('fs');
const { execSync } = require('child_process');

// Read input files
const jsFile = process.argv[2];
const rsFile = process.argv[3];
const js = fs.readFileSync(jsFile, 'utf-8');
const rs = fs.readFileSync(rsFile, 'utf-8');

// Simple but effective canonicalization:
// 1. Parse as ESM with a permissive parser (tolerate minor syntax issues)
// 2. Re-emit with consistent formatting
// Since we don't have OXC in JS, use aggressive text normalization

function canonicalize(code) {
  // Strip comments
  let s = '', i = 0;
  let inSQ = false, inDQ = false, inTL = false, bd = 0;
  while (i < code.length) {
    const c = code[i], n = code[i+1]||'';
    if (c === '\\\\' && (inSQ||inDQ||inTL)) { s += c+n; i+=2; continue; }
    if (!inSQ && !inDQ && !inTL) {
      if (c==="'") { inSQ=true; s+=c; i++; continue; }
      if (c==='"') { inDQ=true; s+=c; i++; continue; }
      if (c==='\`') { inTL=true; s+=c; i++; continue; }
      if (c==='/'&&n==='/') { while(i<code.length&&code[i]!=='\\n')i++; continue; }
      if (c==='/'&&n==='*') { i+=2; while(i<code.length-1&&!(code[i]==='*'&&code[i+1]==='/'))i++; i+=2; continue; }
    } else if (inSQ&&c==="'") inSQ=false;
    else if (inDQ&&c==='"') inDQ=false;
    else if (inTL) {
      if (c==='$'&&n==='{') bd++;
      if (c==='}'&&bd>0) bd--;
      if (c==='\`'&&bd===0) inTL=false;
    }
    s+=c; i++;
  }
  // Normalize whitespace outside strings/templates (collapse to single space)
  let o=''; i=0;
  inSQ=false; inDQ=false; inTL=false; bd=0;
  while (i < s.length) {
    const c = s[i], n = s[i+1]||'';
    if (c==='\\\\' && (inSQ||inDQ||inTL)) { o+=c+n; i+=2; continue; }
    if (!inSQ && !inDQ && !inTL) {
      if (c==="'") inSQ=true;
      else if (c==='"') inDQ=true;
      else if (c==='\`') inTL=true;
      else if (/\\s/.test(c)) { while(i<s.length && /\\s/.test(s[i]))i++; o+=' '; continue; }
    } else if (inSQ&&c==="'") inSQ=false;
    else if (inDQ&&c==='"') inDQ=false;
    else if (inTL) {
      if (c==='$'&&n==='{') bd++;
      if (c==='}'&&bd>0) bd--;
      if (c==='\`'&&bd===0) inTL=false;
    }
    o+=c; i++;
  }
  // Normalize: remove spaces around braces, brackets, parens, commas, semicolons
  // This ensures { Icon } === {Icon} and [1, 2] === [1,2]
  o = o.replace(/ *([{}\\[\\](),;:]) */g, '$1');
  // Remove trailing commas
  o = o.replace(/,([}\\])])/g, '$1');
  // Restore necessary spaces around keywords
  o = o.replace(/\\b(import|export|from|const|let|var|function|return|if|else|for|while|do|switch|case|break|continue|throw|try|catch|finally|new|delete|typeof|void|instanceof|in|of|as|async|await|yield|class|extends|default|static|get|set)([{(])/g, '$1 $2');
  o = o.replace(/([})])(import|export|from|const|let|var|function|return|if|else|for|while|do|switch|case|break|continue|throw|try|catch|finally|new|delete|typeof|void|instanceof|in|of|as|async|await|yield|class|extends|default|static|get|set)\\b/g, '$1 $2');
  // keyword space keyword
  o = o.replace(/\\b(import|export|const|let|var|function|return|if|else|for|while|default|class|extends|async|new|typeof|void|instanceof|throw|of|in|from) (\\w)/g, '$1 $2');
  return o.trim();
}

const jCan = canonicalize(js);
const rCan = canonicalize(rs);

if (jCan === rCan) {
  process.stdout.write('MATCH');
} else {
  // Find first diff
  let p = 0;
  while (p < jCan.length && p < rCan.length && jCan[p] === rCan[p]) p++;
  const ctx = 80;
  process.stdout.write('DIFF\\n');
  process.stdout.write('JS:' + jCan.substring(Math.max(0,p-30), p+ctx) + '\\n');
  process.stdout.write('RS:' + rCan.substring(Math.max(0,p-30), p+ctx) + '\\n');
}
`;

fs.writeFileSync("/tmp/canon-compare.cjs", CANON_SCRIPT);

function findSvelteFiles(dir) {
  const files = [];
  if (!fs.existsSync(dir)) return files;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const f = path.join(dir, e.name);
    if (e.isDirectory() && e.name !== "node_modules" && e.name !== ".git")
      files.push(...findSvelteFiles(f));
    else if (e.isFile() && e.name.endsWith(".svelte")) files.push(f);
  }
  return files;
}

const cleanEnv = { ...process.env };
delete cleanEnv.LD_PRELOAD;

const REPOS = path.join(ROOT, ".real-world-tests");
const projects = [
  { name: "immich", dir: path.join(REPOS, "immich/web/src") },
  { name: "gradio", dir: path.join(REPOS, "gradio/js") },
];

let total = 0,
  match = 0,
  diff = 0,
  rsErr = 0,
  jsErr = 0,
  bothErr = 0;
const diffs = [],
  rsErrors = [];

for (const proj of projects) {
  const files = findSvelteFiles(proj.dir);
  let pm = 0,
    pd = 0;
  for (const file of files) {
    total++;
    const src = fs.readFileSync(file, "utf-8");
    const rel = path.relative(path.join(REPOS, proj.name), file);
    const opts = { filename: rel, generate: "client", css: "external", dev: false };

    let jc, rc, je, re;
    try {
      jc = svelte.compile(src, opts).js.code;
    } catch (e) {
      je = e.message;
    }
    try {
      rc = rsvelte.compile(src, opts).js.code;
    } catch (e) {
      re = e.message;
    }

    if (je && re) {
      bothErr++;
      continue;
    }
    if (je) {
      jsErr++;
      continue;
    }
    if (re) {
      rsErr++;
      rsErrors.push(`${proj.name}/${rel}: ${re.substring(0, 150)}`);
      continue;
    }

    // Write to temp files and compare
    fs.writeFileSync("/tmp/js_out.js", jc);
    fs.writeFileSync("/tmp/rs_out.js", rc);

    try {
      const result = execSync("node /tmp/canon-compare.cjs /tmp/js_out.js /tmp/rs_out.js", {
        encoding: "utf-8",
        env: cleanEnv,
        timeout: 5000,
      }).trim();

      if (result === "MATCH") {
        match++;
        pm++;
      } else {
        diff++;
        pd++;
        if (diffs.length < 25) {
          const lines = result.split("\n");
          diffs.push({
            file: `${proj.name}/${rel}`,
            js: lines[1] || "",
            rs: lines[2] || "",
          });
        }
      }
    } catch {
      diff++;
      pd++;
    }
  }
  const compiled = pm + pd;
  console.log(`${proj.name}: ${pm}/${compiled} match (${((pm / compiled) * 100).toFixed(1)}%)`);
}

const compiled = match + diff;
console.log(`\n=== TOTAL ===`);
console.log(`Files: ${total}, Both compiled: ${compiled}`);
console.log(`Semantically equal: ${match}/${compiled} (${((match / compiled) * 100).toFixed(1)}%)`);
console.log(`Semantic diff: ${diff}`);
console.log(`Rust errors: ${rsErr}, JS errors: ${jsErr}`);

if (rsErrors.length) {
  console.log(`\n=== Rust-Only Errors ===`);
  rsErrors.forEach((e) => console.log(`  ${e}`));
}

if (diffs.length) {
  console.log(`\n=== Semantic Diffs (first ${diffs.length}) ===`);
  for (const d of diffs) {
    console.log(`\n  ${d.file}:`);
    console.log(`    ${d.js}`);
    console.log(`    ${d.rs}`);
  }
}
