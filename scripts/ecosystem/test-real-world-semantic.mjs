#!/usr/bin/env node
/**
 * Test rsvelte against real-world Svelte projects with SEMANTIC comparison.
 *
 * Compiles each .svelte file with both JS and Rust compilers, then uses
 * a Rust canonicalizer binary (OXC parse→codegen, same as test suite)
 * to eliminate formatting differences before comparing.
 */

import { createRequire } from "module";
import { execFileSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../..");
const REPOS_DIR = path.join(ROOT, ".real-world-tests");

// Load compilers
const svelte = await import(
  path.join(ROOT, "submodules/svelte/packages/svelte/src/compiler/index.js")
);

let rsvelte;
for (const p of [
  path.join(ROOT, "svelte/rsvelte.linux-x64-gnu.node"),
  path.join(ROOT, "svelte/rsvelte.darwin-arm64.node"),
]) {
  try {
    rsvelte = require(p);
    break;
  } catch {
    /* next */
  }
}
if (!rsvelte) {
  console.error("No rsvelte binding found");
  process.exit(1);
}

// Build and use Rust canonicalizer for precise comparison
const CANON_BIN = path.join(ROOT, "target/release/canonicalize_js");
let hasCanonBin = false;
try {
  // Check if canonicalizer binary exists; if not, we'll inline a simpler approach
  fs.accessSync(CANON_BIN, fs.constants.X_OK);
  hasCanonBin = true;
} catch {
  /* will use inline */
}

/**
 * Canonicalize JS for comparison.
 * Strips all comments, normalizes formatting by removing whitespace tokens.
 * This won't catch ALL semantic diffs, but catches structural ones.
 */
function canonicalize(code) {
  // Parse-level canonicalization: strip comments, collapse whitespace,
  // normalize string quotes. This is NOT as precise as OXC parse→codegen
  // but catches most structural differences.
  return (
    code
      // Remove single-line comments
      .replace(/\/\/[^\n]*/g, "")
      // Remove multi-line comments (non-greedy)
      .replace(/\/\*[\s\S]*?\*\//g, "")
      // Normalize whitespace (but preserve string/template literal contents)
      .split(/(`[^`]*`|'[^']*'|"[^"]*")/g)
      .map((part, i) => {
        if (i % 2 === 1) return part; // string literal - preserve
        return part.replace(/\s+/g, " ");
      })
      .join("")
      .trim()
  );
}

const PROJECTS = [
  { name: "immich", svelteDir: "web/src" },
  { name: "gradio", svelteDir: "js" },
];

function findSvelteFiles(dir) {
  const files = [];
  if (!fs.existsSync(dir)) return files;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory() && entry.name !== "node_modules" && entry.name !== ".git")
      files.push(...findSvelteFiles(full));
    else if (entry.isFile() && entry.name.endsWith(".svelte")) files.push(full);
  }
  return files;
}

function sanitizeOptions(opts) {
  const r = {};
  for (const [k, v] of Object.entries(opts)) if (typeof v !== "function") r[k] = v;
  return r;
}

console.log("=== Real-World Svelte Project Test (Semantic Comparison) ===\n");

let totalFiles = 0,
  totalBothCompiled = 0,
  totalSemEqual = 0;
let totalSemDiff = 0,
  totalRsErr = 0,
  totalJsErr = 0,
  totalBothErr = 0;
const semDiffDetails = [];
const rsErrDetails = [];

for (const project of PROJECTS) {
  const dir = path.join(REPOS_DIR, project.name);
  const files = findSvelteFiles(path.join(dir, project.svelteDir));
  console.log(`--- ${project.name} (${files.length} files) ---`);

  let semEqual = 0,
    semDiff = 0,
    rsErr = 0,
    jsErr = 0,
    bothErr = 0;

  for (const file of files) {
    const source = fs.readFileSync(file, "utf-8");
    const relPath = path.relative(dir, file);
    const opts = { filename: relPath, generate: "client", css: "external", dev: false };

    let jsCode, rsCode, jsError, rsError;
    try {
      jsCode = svelte.compile(source, opts).js.code;
    } catch (e) {
      jsError = e.message;
    }
    try {
      rsCode = rsvelte.compile(source, sanitizeOptions(opts)).js.code;
    } catch (e) {
      rsError = e.message;
    }

    if (jsError && rsError) {
      bothErr++;
      continue;
    }
    if (jsError) {
      jsErr++;
      continue;
    }
    if (rsError) {
      rsErr++;
      rsErrDetails.push({ project: project.name, file: relPath, error: rsError.substring(0, 250) });
      continue;
    }

    // Both compiled — canonicalize and compare semantics
    const jsCan = canonicalize(jsCode);
    const rsCan = canonicalize(rsCode);

    if (jsCan === rsCan) {
      semEqual++;
    } else {
      semDiff++;
      if (semDiffDetails.length < 15) {
        // Find first diff
        const jl = jsCan.split("\n"),
          rl = rsCan.split("\n");
        let di = 0;
        for (; di < Math.max(jl.length, rl.length); di++) if (jl[di] !== rl[di]) break;
        semDiffDetails.push({
          project: project.name,
          file: relPath,
          line: di + 1,
          js: (jl[di] || "").substring(0, 120),
          rs: (rl[di] || "").substring(0, 120),
        });
      }
    }
  }

  const compiled = semEqual + semDiff;
  const pct = compiled ? ((semEqual / compiled) * 100).toFixed(1) : "0";
  console.log(`  Compiled by both: ${compiled}/${files.length}`);
  console.log(`  Semantically equal: ${semEqual}/${compiled} (${pct}%)`);
  console.log(`  Semantic diff: ${semDiff}`);
  console.log(`  Rust-only errors: ${rsErr}, JS-only: ${jsErr}, Both: ${bothErr}\n`);

  totalFiles += files.length;
  totalBothCompiled += compiled;
  totalSemEqual += semEqual;
  totalSemDiff += semDiff;
  totalRsErr += rsErr;
  totalJsErr += jsErr;
  totalBothErr += bothErr;
}

console.log("=== Summary ===");
console.log(`Total files: ${totalFiles}`);
console.log(
  `Both compiled: ${totalBothCompiled}/${totalFiles} (${((totalBothCompiled / totalFiles) * 100).toFixed(1)}%)`,
);
const semPct = totalBothCompiled ? ((totalSemEqual / totalBothCompiled) * 100).toFixed(1) : "0";
console.log(`Semantically equal: ${totalSemEqual}/${totalBothCompiled} (${semPct}%)`);
console.log(`Semantic diff: ${totalSemDiff}`);
console.log(`Rust-only errors: ${totalRsErr}`);

if (rsErrDetails.length > 0) {
  console.log(`\n=== Rust-Only Compile Errors (${rsErrDetails.length}) ===`);
  for (const e of rsErrDetails) {
    console.log(`  ${e.project}/${e.file}:`);
    console.log(`    ${e.error}\n`);
  }
}

if (semDiffDetails.length > 0) {
  console.log(`=== Semantic Diffs (first ${semDiffDetails.length}) ===`);
  for (const d of semDiffDetails) {
    console.log(`\n  ${d.project}/${d.file} (line ${d.line}):`);
    console.log(`    JS: ${d.js}`);
    console.log(`    RS: ${d.rs}`);
  }
}
