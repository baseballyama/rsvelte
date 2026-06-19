#!/usr/bin/env node
/**
 * Find files where rsvelte produces output that fails OXC parsing.
 * These represent actual compilation bugs — invalid JS.
 */
import { createRequire } from "module";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { execFileSync } from "child_process";

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../..");

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
  } catch {}
}
if (!rsvelte) {
  process.exit(1);
}

const CANON = path.join(ROOT, "target/release/canon_dump");
const cleanEnv = { ...process.env };
delete cleanEnv.LD_PRELOAD;

function find(dir) {
  const files = [];
  if (!fs.existsSync(dir)) return files;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory() && e.name !== "node_modules" && e.name !== ".git") files.push(...find(p));
    else if (e.isFile() && e.name.endsWith(".svelte")) files.push(p);
  }
  return files;
}

const REPOS = path.join(ROOT, ".real-world-tests");
const all = [...find(path.join(REPOS, "immich/web/src")), ...find(path.join(REPOS, "gradio/js"))];

let jsParseFails = 0,
  rsParseFails = 0,
  bothParse = 0;
const rsFailFiles = [];

for (const f of all) {
  const src = fs.readFileSync(f, "utf-8");
  const rel = f.split("real-world-tests/")[1];
  const opts = { filename: rel.split("/").pop(), generate: "client", css: "external", dev: false };

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

  fs.writeFileSync("/tmp/_j.js", jc);
  fs.writeFileSync("/tmp/_r.js", rc);

  // Use node to parse each
  let jsParseOk = false,
    rsParseOk = false;
  try {
    // Use a simple parse check via Function constructor won't catch syntax errors for modules
    // Instead, write a parse script
    execFileSync(
      "node",
      [
        "--input-type=module",
        "-e",
        `import('data:text/javascript;base64,${Buffer.from(jc).toString("base64")}').catch(e => { if (e.message.includes('Unexpected') || e.message.includes('parsing')) process.exit(1); });`,
      ],
      { env: cleanEnv, timeout: 5000, stdio: "pipe" },
    );
    jsParseOk = true;
  } catch {}

  try {
    execFileSync("node", ["--check", "/tmp/_r.js"], {
      env: cleanEnv,
      timeout: 5000,
      stdio: "pipe",
    });
    rsParseOk = true;
  } catch {}

  if (!rsParseOk && jsParseOk) {
    rsParseFails++;
    if (rsFailFiles.length < 20) rsFailFiles.push(rel);
  } else if (!rsParseOk && !jsParseOk) {
    bothParse++;
  } else if (!jsParseOk) {
    jsParseFails++;
  }
}

console.log(`rsvelte parse failures (valid expected): ${rsParseFails}`);
console.log(`Both parse failures: ${bothParse}`);
console.log(`js only failures: ${jsParseFails}`);
if (rsFailFiles.length) {
  console.log("\nFiles where rsvelte produces unparseable JS:");
  rsFailFiles.forEach((f) => console.log("  " + f));
}
