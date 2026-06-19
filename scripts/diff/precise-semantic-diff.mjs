#!/usr/bin/env node
/**
 * Precise semantic diff using the Rust OXC canonicalize_and_compare binary.
 * This uses exactly the same OXC parse→codegen as the test suite.
 */
import { createRequire } from "module";
import { execFileSync, execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../..");
const CANON_BIN = path.join(ROOT, "target/release/canonicalize_and_compare");

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

const cleanEnv = { ...process.env };
delete cleanEnv.LD_PRELOAD;

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
      rsErrors.push(`${proj.name}/${rel}: ${re.substring(0, 200)}`);
      continue;
    }

    // Write to temp and compare using Rust OXC binary
    fs.writeFileSync("/tmp/_js.js", jc);
    fs.writeFileSync("/tmp/_rs.js", rc);

    try {
      const result = execFileSync(CANON_BIN, ["/tmp/_js.js", "/tmp/_rs.js"], {
        encoding: "utf-8",
        env: cleanEnv,
        timeout: 10000,
      }).trim();

      if (result === "MATCH") {
        match++;
        pm++;
      } else {
        diff++;
        pd++;
        if (diffs.length < 30) {
          const lines = result.split("\n");
          diffs.push({ file: `${proj.name}/${rel}`, f1: lines[1] || "", f2: lines[2] || "" });
        }
      }
    } catch (e) {
      diff++;
      pd++;
      if (diffs.length < 30)
        diffs.push({
          file: `${proj.name}/${rel}`,
          f1: "CANON_ERROR",
          f2: String(e.message).substring(0, 100),
        });
    }
  }
  const compiled = pm + pd;
  console.log(`${proj.name}: ${pm}/${compiled} match (${((pm / compiled) * 100).toFixed(1)}%)`);
}

const compiled = match + diff;
console.log(`\n=== TOTAL (OXC canonicalized) ===`);
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
    console.log(`    JS: ${d.f1}`);
    console.log(`    RS: ${d.f2}`);
  }
}
