#!/usr/bin/env node
import { createRequire } from "module";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../..");

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
const allFiles = [
  ...findSvelteFiles(path.join(REPOS, "immich/web/src")),
  ...findSvelteFiles(path.join(REPOS, "gradio/js")),
];

let count = 0;
let ok = 0,
  err = 0;
for (const file of allFiles) {
  count++;
  const src = fs.readFileSync(file, "utf-8");
  const rel = path.relative(REPOS, file);
  try {
    process.stderr.write(`TRYING: ${count} ${rel}\n`);
    rsvelte.compile(src, { filename: rel, generate: "server", css: "external", dev: false });
    ok++;
  } catch (e) {
    err++;
    // Print so we can see which file causes the crash next
    process.stderr.write(`ERR ${count}: ${rel}: ${String(e?.message || e).substring(0, 100)}\n`);
  }
  if (count % 200 === 0) process.stderr.write(`OK: ${ok}, ERR: ${err} / ${count}\n`);
}
// If we get here without panic:
console.log(`Done. OK: ${ok}, ERR: ${err} / ${count}`);
