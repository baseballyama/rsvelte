#!/usr/bin/env node
/**
 * Test rsvelte against real-world Svelte projects.
 *
 * Clones immich and gradio, finds all .svelte files, and compiles them
 * with both the official Svelte compiler and rsvelte, comparing results.
 *
 * Usage: node scripts/ecosystem/test-real-world.mjs
 */

import { execSync } from "child_process";
import { createRequire } from "module";
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
const bindingPaths = [
  path.join(ROOT, "svelte/rsvelte.linux-x64-gnu.node"),
  path.join(ROOT, "svelte/rsvelte.darwin-arm64.node"),
];
for (const p of bindingPaths) {
  try {
    rsvelte = require(p);
    break;
  } catch {
    // try next
  }
}
if (!rsvelte) {
  console.error("Could not load rsvelte NAPI binding. Build it first:");
  console.error("  cargo build --release --features napi --lib");
  console.error("On Linux, use: LD_PRELOAD=<path> node scripts/ecosystem/test-real-world.mjs");
  process.exit(1);
}

const PROJECTS = [
  {
    name: "immich",
    repo: "https://github.com/immich-app/immich.git",
    sparse: ["web/src"],
    svelteDir: "web/src",
  },
  {
    name: "gradio",
    repo: "https://github.com/gradio-app/gradio.git",
    sparse: ["js"],
    svelteDir: "js",
  },
];

function findSvelteFiles(dir) {
  const files = [];
  if (!fs.existsSync(dir)) return files;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory() && entry.name !== "node_modules" && entry.name !== ".git") {
      files.push(...findSvelteFiles(full));
    } else if (entry.isFile() && entry.name.endsWith(".svelte")) {
      files.push(full);
    }
  }
  return files;
}

function sanitizeOptions(options) {
  const result = {};
  for (const [key, value] of Object.entries(options)) {
    if (typeof value !== "function") {
      result[key] = value;
    }
  }
  return result;
}

function compileSvelte(source, filename) {
  const options = {
    filename,
    generate: "client",
    css: "external",
    dev: false,
  };

  let jsResult, rsResult;
  let jsError = null,
    rsError = null;

  // Official Svelte compiler
  try {
    jsResult = svelte.compile(source, options);
  } catch (e) {
    jsError = e.message || String(e);
  }

  // rsvelte compiler
  try {
    rsResult = rsvelte.compile(source, sanitizeOptions(options));
  } catch (e) {
    rsError = e.message || String(e);
  }

  return { jsResult, rsResult, jsError, rsError };
}

function cloneProject(project) {
  const dir = path.join(REPOS_DIR, project.name);
  if (fs.existsSync(dir)) {
    console.log(`  ${project.name}: already cloned`);
    return dir;
  }

  console.log(`  ${project.name}: cloning (sparse)...`);
  fs.mkdirSync(dir, { recursive: true });

  // Remove LD_PRELOAD for child processes (it breaks git/sh on Linux)
  const cleanEnv = { ...process.env };
  delete cleanEnv.LD_PRELOAD;

  execSync(`git clone --filter=blob:none --sparse --depth=1 ${project.repo} ${dir}`, {
    stdio: "pipe",
    env: cleanEnv,
  });
  execSync(`git -C ${dir} sparse-checkout set ${project.sparse.join(" ")}`, {
    stdio: "pipe",
    env: cleanEnv,
  });

  return dir;
}

// Main
console.log("=== Real-World Svelte Project Test ===\n");

fs.mkdirSync(REPOS_DIR, { recursive: true });

let totalFiles = 0;
let totalPass = 0;
let totalJsError = 0;
let totalRsError = 0;
let totalBothError = 0;
let totalMismatch = 0;
const failures = [];

for (const project of PROJECTS) {
  console.log(`\n--- ${project.name} ---`);

  const dir = cloneProject(project);
  const svelteDir = path.join(dir, project.svelteDir);
  const files = findSvelteFiles(svelteDir);
  console.log(`  Found ${files.length} .svelte files`);

  let pass = 0,
    jsErr = 0,
    rsErr = 0,
    bothErr = 0,
    mismatch = 0;

  for (const file of files) {
    const source = fs.readFileSync(file, "utf-8");
    const relPath = path.relative(dir, file);

    const { jsResult, rsResult, jsError, rsError } = compileSvelte(source, relPath);

    if (jsError && rsError) {
      // Both failed - OK (file may have syntax errors or need preprocessing)
      bothErr++;
    } else if (jsError && !rsError) {
      // JS failed but Rust succeeded - interesting but OK
      jsErr++;
    } else if (!jsError && rsError) {
      // Rust failed but JS succeeded - this is a problem
      rsErr++;
      failures.push({
        project: project.name,
        file: relPath,
        error: rsError.substring(0, 200),
      });
    } else {
      // Both succeeded - check if output is similar
      const jsCode = jsResult.js.code;
      const rsCode = rsResult.js.code;

      if (jsCode === rsCode) {
        pass++;
      } else {
        // Check if they're semantically similar (just formatting differences)
        // Normalize by removing whitespace
        const jsNorm = jsCode.replace(/\s+/g, " ").trim();
        const rsNorm = rsCode.replace(/\s+/g, " ").trim();
        if (jsNorm === rsNorm) {
          pass++;
        } else {
          // Try OXC canonicalization for semantic comparison
          mismatch++;
          if (mismatch <= 3) {
            // Find first differing line
            const jsLines = jsCode.split("\n");
            const rsLines = rsCode.split("\n");
            let diffLine = -1;
            for (let i = 0; i < Math.max(jsLines.length, rsLines.length); i++) {
              if (jsLines[i] !== rsLines[i]) {
                diffLine = i;
                break;
              }
            }
            failures.push({
              project: project.name,
              file: relPath,
              error: `Output mismatch at line ${diffLine + 1}: JS="${(jsLines[diffLine] || "").trim().substring(0, 80)}" RS="${(rsLines[diffLine] || "").trim().substring(0, 80)}"`,
            });
          }
        }
      }
    }
  }

  const total = files.length;
  const compiled = pass + mismatch;
  console.log(`  Results:`);
  console.log(`    Compiled successfully: ${compiled}/${total}`);
  console.log(`    Exact/whitespace match: ${pass}/${compiled}`);
  console.log(`    Output mismatch: ${mismatch}`);
  console.log(`    Rust-only errors: ${rsErr}`);
  console.log(`    JS-only errors: ${jsErr}`);
  console.log(`    Both errored: ${bothErr}`);

  totalFiles += total;
  totalPass += pass;
  totalJsError += jsErr;
  totalRsError += rsErr;
  totalBothError += bothErr;
  totalMismatch += mismatch;
}

console.log(`\n=== Summary ===`);
console.log(`Total .svelte files: ${totalFiles}`);
console.log(`Compiled (both): ${totalPass + totalMismatch}`);
console.log(`Exact/whitespace match: ${totalPass}`);
console.log(`Output mismatch: ${totalMismatch}`);
console.log(`Rust-only errors: ${totalRsError}`);
console.log(`JS-only errors: ${totalJsError}`);
console.log(`Both errored: ${totalBothError}`);

if (failures.length > 0) {
  console.log(`\n=== Failure Details (first ${Math.min(failures.length, 20)}) ===`);
  for (const f of failures.slice(0, 20)) {
    console.log(`\n  ${f.project}/${f.file}:`);
    console.log(`    ${f.error}`);
  }
}

const successRate =
  totalFiles > 0
    ? (((totalPass + totalMismatch + totalBothError + totalJsError) / totalFiles) * 100).toFixed(1)
    : "0";
console.log(`\nCompile success rate (non-crash): ${successRate}%`);
