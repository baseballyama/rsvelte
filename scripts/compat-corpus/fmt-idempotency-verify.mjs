#!/usr/bin/env node
/**
 * Assert that rsvelte-fmt is idempotent on every corpus component: formatting
 * its own output again must leave every byte in place.
 *
 * The parity gate (`fmt.mjs` + `fmt-verify.mjs`) compares ONE application of
 * each formatter, so a property of the second application has no place in it
 * at any corpus size (#4301). This script reads the first application the
 * parity gate already built (`compatibility/fmt/actual/<id>`), formats a staged
 * copy of that tree with one `rsvelte-fmt` directory invocation — the same
 * invocation `fmt.mjs` uses — and compares the two byte-for-byte.
 *
 * The oracle is not idempotent on every input either (`fmt.mjs` records it), so
 * a non-converging id is not on its own a parity claim. The ratchet lists
 * rsvelte's own property; the justification doc says which entries the oracle
 * shares. Ratchet: compatibility/fmt-idempotency-known-failures.json, two-sided
 * like every ratchet here — a new non-converging id fails, and a listed id that
 * now converges fails until `--update-baseline` retires it.
 *
 * Usage:
 *   node scripts/compat-corpus/fmt-idempotency-verify.mjs [--max-print <n>] [--update-baseline] [--strict]
 *
 * Env:
 *   RSVELTE_FMT_BIN    rsvelte-fmt binary (default: target/release/rsvelte-fmt)
 *   OXFMT_BIN          oxfmt binary for embedded script/style (default: node_modules/.bin/oxfmt)
 */

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { readIf, firstDiffLine } from "./normalize.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../..");
const CORPUS = path.join(ROOT, "compatibility");
const FMT = path.join(CORPUS, "fmt");
const ACTUAL = path.join(FMT, "actual");
const META_PATH = path.join(FMT, "meta.json");
const ACTUAL_META_PATH = path.join(FMT, "actual-meta.json");
const EXCLUDED_PATH = path.join(CORPUS, "fmt-oracle-excluded.json");
const BASELINE_PATH = path.join(CORPUS, "fmt-idempotency-known-failures.json");
const REPORT_PATH = path.join(CORPUS, "fmt-idempotency-report.json");
const OXFMT_CONFIG = path.join(ROOT, "scripts/fixtures/fmt-corpus.oxfmtrc.json");
const OXFMT_BIN = process.env.OXFMT_BIN || path.join(ROOT, "node_modules/.bin/oxfmt");
const RSVELTE_FMT_BIN =
  process.env.RSVELTE_FMT_BIN || path.join(ROOT, "target/release/rsvelte-fmt");

const args = process.argv.slice(2);
const MAX_PRINT = args.includes("--max-print")
  ? Number(args[args.indexOf("--max-print") + 1]) || 20
  : 20;
const UPDATE_BASELINE = args.includes("--update-baseline");
const STRICT = args.includes("--strict");

function fail(msg) {
  console.error(`[fmt-idempotency] ${msg}`);
  process.exit(1);
}

if (!fs.existsSync(META_PATH) || !fs.existsSync(ACTUAL_META_PATH)) {
  fail("fmt/meta.json or fmt/actual-meta.json missing — run `node scripts/compat-corpus/fmt.mjs` first");
}
if (!fs.existsSync(RSVELTE_FMT_BIN)) {
  fail(`rsvelte-fmt not found at ${RSVELTE_FMT_BIN} — run \`cargo build --release -p rsvelte_fmt\` or set RSVELTE_FMT_BIN`);
}
if (!fs.existsSync(OXFMT_BIN)) {
  fail(`oxfmt not found at ${OXFMT_BIN} — run \`pnpm install\` or set OXFMT_BIN`);
}

const meta = JSON.parse(fs.readFileSync(META_PATH, "utf8"));
const included = meta.included ?? [];
if (included.length < 1000) {
  fail(`only ${included.length} components in the parity set — the corpus looks incomplete; re-run collect.mjs + fmt.mjs`);
}
const excludedSet = new Set(
  (fs.existsSync(EXCLUDED_PATH) ? JSON.parse(fs.readFileSync(EXCLUDED_PATH, "utf8")) : []).map(
    (e) => e.id,
  ),
);

// The first application is the tree fmt.mjs copied out of its own stage: an id
// the formatter rejected is there as its unformatted source, so it is compared
// like any other and converges trivially — the parity gate already lists it.
const targets = [];
const missingActual = [];
let excluded = 0;
for (const id of included) {
  if (excludedSet.has(id)) {
    excluded++;
    continue;
  }
  if (!fs.existsSync(path.join(ACTUAL, id))) {
    missingActual.push(id);
    continue;
  }
  targets.push(id);
}
if (missingActual.length) {
  console.error(
    `[fmt-idempotency] ${missingActual.length} of ${included.length} components have no first application in fmt/actual`,
  );
  for (const id of missingActual.slice(0, MAX_PRINT)) console.error(`  - ${id}`);
  fail("the actual tree is incomplete; rebuild it with `node scripts/compat-corpus/fmt.mjs --actual`");
}

// Stage outside the repository: compatibility/fmt is gitignored and rsvelte-fmt
// honours gitignore during directory walks.
const stage = fs.mkdtempSync(path.join(os.tmpdir(), "rsvelte-fmt-idempotency-"));
const failures = [];
let converged = 0;
try {
  for (const id of targets) {
    const to = path.join(stage, id);
    fs.mkdirSync(path.dirname(to), { recursive: true });
    fs.copyFileSync(path.join(ACTUAL, id), to);
  }
  console.log(`[fmt-idempotency] second application: rsvelte-fmt over ${targets.length} components`);
  const res = spawnSync(RSVELTE_FMT_BIN, [".", "-c", OXFMT_CONFIG, "--oxfmt-bin", OXFMT_BIN], {
    cwd: stage,
    encoding: "utf8",
    maxBuffer: 1 << 28,
  });
  if (res.error) fail(`rsvelte-fmt failed to start: ${res.error.message}`);
  // A per-file error leaves that staged file unchanged, so it reads as
  // converged here; it is a parity failure already, and the error is printed so
  // the count is never a silent one.
  if (res.status !== 0) {
    const diagnostics = (res.stderr || "")
      .split("\n")
      .filter((line) => line.startsWith("rsvelte-fmt: ") && !line.includes(" formatted "));
    console.log(`[fmt-idempotency] rsvelte-fmt reported ${diagnostics.length} error(s) on the second application:`);
    for (const line of diagnostics.slice(0, MAX_PRINT)) {
      console.log(`  ${line.replaceAll(`${stage}${path.sep}`, "").slice(0, 200)}`);
    }
  }
  for (const id of targets) {
    const once = readIf(path.join(ACTUAL, id));
    const twice = readIf(path.join(stage, id));
    if (twice === null) {
      failures.push({ id, kind: "missing", detail: { line: 0 } });
      continue;
    }
    if (once === twice) {
      converged++;
      continue;
    }
    failures.push({
      id,
      kind: "diff",
      lineDelta: twice.split("\n").length - once.split("\n").length,
      detail: firstDiffLine(once, twice),
    });
  }
} finally {
  fs.rmSync(stage, { recursive: true, force: true });
}

const accounted = converged + failures.length + excluded;
if (accounted !== included.length) {
  fail(
    `accounting mismatch: ${accounted} ids accounted for (converged ${converged} + failed ${failures.length} + excluded ${excluded}) but the parity set has ${included.length}`,
  );
}

const actualMeta = JSON.parse(fs.readFileSync(ACTUAL_META_PATH, "utf8"));
const report = {
  generatedAt: new Date().toISOString(),
  corpus: { svelteSha: meta.svelteSha, svelteDevSha: meta.svelteDevSha },
  rsvelteFmtSha256: actualMeta.rsvelteFmtSha256,
  included: included.length,
  excluded,
  converged,
  failed: failures.length,
  failures,
};
fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, "\t") + "\n");

console.log("\n[fmt-idempotency] results:");
console.log(`  included   ${included.length}`);
console.log(`  excluded   ${excluded}  (oracle-bug / invalid-input / migrate — see compatibility/fmt-oracle-excluded.json)`);
console.log(`  converged  ${converged}`);
console.log(`  failed     ${failures.length}`);
console.log(`  report:    ${path.relative(ROOT, REPORT_PATH)}`);

if (UPDATE_BASELINE) {
  const baseline = failures.map((f) => f.id).sort();
  fs.writeFileSync(BASELINE_PATH, JSON.stringify(baseline, null, "\t") + "\n");
  console.log(`\n[fmt-idempotency] baseline updated: ${baseline.length} known failures -> ${path.relative(ROOT, BASELINE_PATH)}`);
  process.exit(0);
}

const baseline = new Set(
  !STRICT && fs.existsSync(BASELINE_PATH) ? JSON.parse(fs.readFileSync(BASELINE_PATH, "utf8")) : [],
);
const failingIds = new Set(failures.map((f) => f.id));
const regressions = failures.filter((f) => !baseline.has(f.id));
const fixedKnown = [...baseline].filter((id) => !failingIds.has(id));

if (fixedKnown.length) {
  console.log(`\n[fmt-idempotency] ❌ ${fixedKnown.length} baseline entries already converge — the ratchet is stale.`);
  for (const id of fixedKnown.slice(0, MAX_PRINT)) console.log(`  - ${id}`);
  if (fixedKnown.length > MAX_PRINT) console.log(`  … and ${fixedKnown.length - MAX_PRINT} more`);
  console.log("\n  fix: node scripts/compat-corpus/fmt-idempotency-verify.mjs --update-baseline");
}
if (regressions.length) {
  console.log(
    `\n[fmt-idempotency] ❌ ${regressions.length} NEW non-converging components (not in baseline); first ${Math.min(MAX_PRINT, regressions.length)}:`,
  );
  for (const f of regressions.slice(0, MAX_PRINT)) {
    console.log(`  - ${f.id} [${f.kind}] line ${f.detail?.line ?? ""} (${f.lineDelta >= 0 ? "+" : ""}${f.lineDelta ?? "?"} lines)`);
    if (f.detail?.expected !== undefined) console.log(`      once:  ${f.detail.expected}`);
    if (f.detail?.actual !== undefined) console.log(`      twice: ${f.detail.actual}`);
  }
  if (regressions.length > MAX_PRINT) console.log(`  … and ${regressions.length - MAX_PRINT} more`);
}
if (regressions.length || fixedKnown.length) process.exit(1);

if (failures.length) {
  console.log(`\n[fmt-idempotency] ✅ no regressions (${failures.length} known non-converging components remain)`);
} else {
  console.log(`\n[fmt-idempotency] ✅ rsvelte-fmt is idempotent on all ${converged} compared components`);
}
