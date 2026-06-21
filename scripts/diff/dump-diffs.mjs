#!/usr/bin/env node
// Dump full canonicalized diffs for all diffing files.
import { createRequire } from "module";
import { execFileSync } from "child_process";
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

const OUT = path.join(ROOT, ".diff-dump");
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

const limit = parseInt(process.argv[2] || "30");
let count = 0;
const summary = [];

outer: for (const proj of projects) {
  const files = findSvelteFiles(proj.dir);
  for (const file of files) {
    if (count >= limit) break outer;
    const src = fs.readFileSync(file, "utf-8");
    const rel = path.relative(path.join(REPOS, proj.name), file);
    const opts = { filename: rel, generate: "client", css: "external", dev: false };
    let jc, rc;
    try {
      jc = svelte.compile(src, opts).js.code;
    } catch {
      continue;
    }
    try {
      rc = rsvelte.compile(src, opts).js.code;
    } catch {
      continue;
    }
    fs.writeFileSync("/tmp/_js.js", jc);
    fs.writeFileSync("/tmp/_rs.js", rc);
    let result;
    try {
      result = execFileSync(CANON_BIN, ["/tmp/_js.js", "/tmp/_rs.js"], {
        encoding: "utf-8",
        env: cleanEnv,
        timeout: 10000,
      }).trim();
    } catch {
      continue;
    }
    if (result === "MATCH") continue;

    // Dump canonicalized versions
    let canonJs, canonRs;
    try {
      canonJs = execFileSync(CANON_BIN, ["/tmp/_js.js", "/tmp/_rs.js", "--dump1"], {
        encoding: "utf-8",
        env: cleanEnv,
      });
    } catch {}
    try {
      canonRs = execFileSync(CANON_BIN, ["/tmp/_js.js", "/tmp/_rs.js", "--dump2"], {
        encoding: "utf-8",
        env: cleanEnv,
      });
    } catch {}
    const base = `${proj.name}__${rel.replace(/[\/\\]/g, "_")}`;
    fs.writeFileSync(path.join(OUT, base + ".js.canon.js"), canonJs || "");
    fs.writeFileSync(path.join(OUT, base + ".rs.canon.js"), canonRs || "");
    fs.writeFileSync(path.join(OUT, base + ".src.svelte"), src);
    summary.push(`${proj.name}/${rel}`);
    count++;
  }
}

fs.writeFileSync(path.join(OUT, "_summary.txt"), summary.join("\n"));
console.log(`Dumped ${count} diffs to ${OUT}`);
