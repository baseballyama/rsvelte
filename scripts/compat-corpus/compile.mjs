#!/usr/bin/env node
/**
 * Compile every corpus entry (see collect.mjs) with BOTH the official Svelte
 * compiler (from submodules/svelte) and rsvelte (NAPI binding), for both
 * generate targets (client = CSR, server = SSR), writing the outputs to:
 *
 *   compat/corpus/expected/<id>/{client.js,server.js,client.css,error.json}
 *   compat/corpus/actual/<id>/{...same...}
 *
 * Files the OFFICIAL compiler rejects are error cases: rsvelte must reject
 * them too (error parity), tracked via error.json on both sides.
 *
 * Runs as a parent process that shards the manifest across worker child
 * processes. If a worker crashes (e.g. a Rust panic aborts the process), the
 * parent records the offending entry as a `panic` error on the rsvelte side
 * and resumes from the next entry, so one panic cannot kill the whole run.
 *
 * Usage: node scripts/compat-corpus/compile.mjs [--binding <path>] [--filter <substr>] [--jobs <n>]
 */

import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../..");
const CORPUS = path.join(ROOT, "compat/corpus");
const EXPECTED = path.join(CORPUS, "expected");
const ACTUAL = path.join(CORPUS, "actual");

const args = process.argv.slice(2);
function argValue(name, fallback) {
  const i = args.indexOf(name);
  return i !== -1 && args[i + 1] ? args[i + 1] : fallback;
}
const FILTER = argValue("--filter", null);
const BINDING = path.resolve(ROOT, argValue("--binding", ".corpus-cache/rsvelte.node"));

const manifest = JSON.parse(fs.readFileSync(path.join(CORPUS, "manifest.json"), "utf8")).filter(
  (e) => !FILTER || e.id.includes(FILTER),
);

// ---------------------------------------------------------------------------
// worker mode: compile manifest[start..end) and print `IDX <i>` before each
// entry so the parent can pinpoint a crash.
// ---------------------------------------------------------------------------

if (args.includes("--worker")) {
  const start = Number(argValue("--start", "0"));
  const end = Number(argValue("--end", String(manifest.length)));

  const require = createRequire(import.meta.url);
  const svelte = await import(
    path.join(ROOT, "submodules/svelte/packages/svelte/src/compiler/index.js")
  );
  const rsvelte = require(BINDING);
  const esbuild = require("esbuild");

  // In production (Vite / SvelteKit), `.svelte.ts` modules are TS-stripped
  // by esbuild BEFORE the Svelte compiler sees them — `compileModule`
  // itself only parses plain JS. Mirror that pipeline so the corpus
  // exercises the real compile output instead of recording js_parse_error
  // parity for every TS module. Falls back to the raw source when esbuild
  // rejects the file (both compilers then see identical input).
  function prepareSource(id, source) {
    if (!id.endsWith(".svelte.ts")) return source;
    try {
      return esbuild.transformSync(source, { loader: "ts" }).code;
    } catch {
      return source;
    }
  }

  const errorInfo = (e) => {
    const message = String(e?.message ?? e);
    // rsvelte NAPI errors carry a generic `code` ("GenericFailure"); the
    // real svelte error code is embedded in the message — extract it so
    // error-code parity can be compared against the official compiler.
    let code = e?.code ?? null;
    if (!code || code === "GenericFailure") {
      const m =
        message.match(/svelte\.dev\/e\/([a-z0-9_]+)/) ?? message.match(/code: "([a-z0-9_]+)"/);
      if (m) code = m[1];
    }
    return { code, message: message.split("\n")[0] };
  };

  function compileOne(compiler, kind, source, id, generate) {
    const options = { generate, dev: false, filename: id };
    if (kind === "component") options.css = "external";
    try {
      const result =
        kind === "component"
          ? compiler.compile(source, options)
          : compiler.compileModule(source, options);
      return { js: result.js?.code ?? "", css: result.css?.code ?? null };
    } catch (e) {
      return { error: errorInfo(e) };
    }
  }

  function writeOutputs(baseDir, id, results) {
    const dir = path.join(baseDir, id);
    fs.mkdirSync(dir, { recursive: true });
    const errors = {};
    for (const target of ["client", "server"]) {
      const r = results[target];
      if (r.error) {
        errors[target] = r.error;
        continue;
      }
      fs.writeFileSync(path.join(dir, `${target}.js`), r.js);
      if (target === "client" && r.css != null) {
        fs.writeFileSync(path.join(dir, "client.css"), r.css);
      }
    }
    if (Object.keys(errors).length) {
      fs.writeFileSync(path.join(dir, "error.json"), JSON.stringify(errors, null, "\t") + "\n");
    }
  }

  for (let i = start; i < end; i++) {
    const { id, kind } = manifest[i];
    console.log(`IDX ${i}`);
    const source = prepareSource(id, fs.readFileSync(path.join(CORPUS, "sources", id), "utf8"));
    writeOutputs(EXPECTED, id, {
      client: compileOne(svelte, kind, source, id, "client"),
      server: compileOne(svelte, kind, source, id, "server"),
    });
    writeOutputs(ACTUAL, id, {
      client: compileOne(rsvelte, kind, source, id, "client"),
      server: compileOne(rsvelte, kind, source, id, "server"),
    });
  }
  process.exit(0);
}

// ---------------------------------------------------------------------------
// parent mode
// ---------------------------------------------------------------------------

if (!fs.existsSync(BINDING)) {
  console.error(`[compile] rsvelte NAPI binding missing at ${BINDING}`);
  console.error("  build: cargo build --release --features napi --lib");
  console.error("  stage: cp target/release/librsvelte_core.{dylib,so} .corpus-cache/rsvelte.node");
  process.exit(1);
}

if (!FILTER) {
  fs.rmSync(EXPECTED, { recursive: true, force: true });
  fs.rmSync(ACTUAL, { recursive: true, force: true });
}

const JOBS = Number(argValue("--jobs", String(Math.max(2, Math.min(8, os.cpus().length - 2)))));
const startedAt = Date.now();
const panics = [];

function recordPanic(i) {
  const { id } = manifest[i];
  panics.push(id);
  // Official side may not have been written either — compile it in-process.
  const dir = path.join(ACTUAL, id);
  fs.mkdirSync(dir, { recursive: true });
  const err = { code: "rust_panic", message: "rsvelte compiler panicked (process aborted)" };
  fs.writeFileSync(
    path.join(dir, "error.json"),
    JSON.stringify({ client: err, server: err }, null, "\t") + "\n",
  );
}

function runRange(start, end) {
  return new Promise((resolve, reject) => {
    if (start >= end) return resolve();
    const child = spawn(
      process.execPath,
      [
        fileURLToPath(import.meta.url),
        "--worker",
        "--start",
        String(start),
        "--end",
        String(end),
        "--binding",
        BINDING,
        ...(FILTER ? ["--filter", FILTER] : []),
      ],
      { stdio: ["ignore", "pipe", "inherit"] },
    );
    let last = start - 1;
    let buf = "";
    child.stdout.on("data", (d) => {
      buf += d;
      let nl;
      while ((nl = buf.indexOf("\n")) !== -1) {
        const line = buf.slice(0, nl);
        buf = buf.slice(nl + 1);
        if (line.startsWith("IDX ")) last = Number(line.slice(4));
      }
    });
    child.on("exit", (code, signal) => {
      if (code === 0) return resolve();
      // crashed while compiling manifest[last] — record + resume after it
      console.error(`[compile] worker crashed (${signal ?? code}) on ${manifest[last]?.id}`);
      recordPanic(last);
      runRange(last + 1, end).then(resolve, reject);
    });
    child.on("error", reject);
  });
}

const shard = Math.ceil(manifest.length / JOBS);
const ranges = [];
for (let s = 0; s < manifest.length; s += shard)
  ranges.push([s, Math.min(s + shard, manifest.length)]);

console.log(`[compile] ${manifest.length} entries across ${ranges.length} workers…`);
await Promise.all(ranges.map(([s, e]) => runRange(s, e)));

if (panics.length) {
  console.error(`[compile] ${panics.length} entries PANICKED in rsvelte:`);
  for (const id of panics.slice(0, 20)) console.error(`  - ${id}`);
}
console.log(`[compile] done in ${((Date.now() - startedAt) / 1000).toFixed(1)}s`);
