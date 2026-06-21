#!/usr/bin/env node
/**
 * Verify formatter parity: every included corpus component must format
 * byte-for-byte identically under rsvelte-fmt (actual/) and the
 * oxfmt(`svelte: true`) oracle (oracle/). This is a HARD byte gate — rsvelte
 * is a formatter, so its output must match exactly; there is no AST-equivalence
 * fallback (that belongs to the compile-output corpus, not here).
 *
 * Ratchet: compat/corpus/fmt-known-failures.json (checked in) lists the ids
 * that still diverge. Verification exits non-zero only when an id NOT in the
 * baseline diverges (a regression). Known failures are tolerated and burned
 * down over time; when a known failure now passes, a reminder to shrink the
 * baseline is printed (use --update-baseline to rewrite it).
 *
 * Oracle exclusions: compat/corpus/fmt-oracle-excluded.json lists ids that are
 * permanently excluded from the parity set because either (a) the oracle output
 * is itself wrong/corrupt (oracle-bug), (b) the input is invalid and rsvelte
 * correctly rejects it (invalid-input), or (c) the fixture is from the
 * out-of-scope Svelte 4→5 migrator (migrate). Excluded ids are removed from the
 * comparison set entirely — they count as neither matched nor failed. A staleness
 * check warns if an excluded id is no longer in the run's parity set, or if it
 * would now match the oracle byte-for-byte (in which case it can be un-excluded).
 *
 * Usage:
 *   node scripts/compat-corpus/fmt-verify.mjs [--max-print <n>] [--update-baseline] [--strict]
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../..");
const CORPUS = path.join(ROOT, "compat/corpus");
const FMT = path.join(CORPUS, "fmt");
const ORACLE = path.join(FMT, "oracle");
const ACTUAL = path.join(FMT, "actual");
const META_PATH = path.join(FMT, "meta.json");
const REPORT_PATH = path.join(CORPUS, "fmt-report.json");
const EXCLUDED_PATH = path.join(CORPUS, "fmt-oracle-excluded.json");

const args = process.argv.slice(2);
// --baseline <path> selects an alternate ratchet file (see verify.mjs);
// rarely needed — the corpus is one unified set (default fmt-known-failures.json).
const BASELINE_PATH = path.resolve(
  CORPUS,
  args.indexOf("--baseline") !== -1
    ? args[args.indexOf("--baseline") + 1]
    : "fmt-known-failures.json",
);
const MAX_PRINT = args.includes("--max-print")
  ? Number(args[args.indexOf("--max-print") + 1]) || 20
  : 20;
const UPDATE_BASELINE = args.includes("--update-baseline");
const STRICT = args.includes("--strict");

function fail(msg) {
  console.error(`[fmt-verify] ${msg}`);
  process.exit(1);
}

function readIf(p) {
  return fs.existsSync(p) ? fs.readFileSync(p, "utf8") : null;
}

function firstDiffLine(a, b) {
  const al = a.split("\n");
  const bl = b.split("\n");
  for (let i = 0; i < Math.max(al.length, bl.length); i++) {
    if (al[i] !== bl[i]) {
      return {
        line: i + 1,
        expected: (al[i] ?? "<EOF>").slice(0, 120),
        actual: (bl[i] ?? "<EOF>").slice(0, 120),
      };
    }
  }
  return null;
}

if (!fs.existsSync(META_PATH)) {
  fail("fmt/meta.json missing — run `node scripts/compat-corpus/fmt.mjs` first");
}
const meta = JSON.parse(fs.readFileSync(META_PATH, "utf8"));
const included = meta.included ?? [];

// Guard against a silently-empty gate: if the oracle produced almost nothing
// (e.g. corpus not collected, or oxfmt rejected everything) the byte compare
// below would pass vacuously. The real corpus has thousands of components.
if (included.length < 1000) {
  fail(
    `only ${included.length} components in the parity set — the corpus looks incomplete; re-run collect.mjs + fmt.mjs`,
  );
}

// Load oracle exclusions (oracle-bug / invalid-input / migrate).
// These ids are removed from the comparison set entirely.
const excludedEntries = fs.existsSync(EXCLUDED_PATH)
  ? JSON.parse(fs.readFileSync(EXCLUDED_PATH, "utf8"))
  : [];
const excludedSet = new Set(excludedEntries.map((e) => e.id));

const includedSet = new Set(included);
const failures = [];
let matched = 0;
let excluded = 0;
for (const id of included) {
  // Skip oracle-excluded ids entirely — they count as neither matched nor failed.
  if (excludedSet.has(id)) {
    excluded++;
    continue;
  }
  const oracle = readIf(path.join(ORACLE, id));
  const actual = readIf(path.join(ACTUAL, id));
  if (oracle === null) continue; // not part of the parity set
  if (actual === null) {
    failures.push({ id, kind: "missing", detail: { line: 0 } });
    continue;
  }
  if (oracle === actual) {
    matched++;
    continue;
  }
  failures.push({ id, kind: "diff", detail: firstDiffLine(oracle, actual) });
}

// Staleness checks for excluded entries.
for (const entry of excludedEntries) {
  const { id } = entry;
  if (!includedSet.has(id)) {
    // Excluded id not present in this run's parity set — warn but don't fail.
    // (e.g. a file removed from the corpus, or an OS-specific oracle skip)
    console.warn(`[fmt-verify] WARNING: excluded id not in parity set (stale?): ${id}`);
    continue;
  }
  // Check if the excluded id would now match the oracle byte-for-byte.
  const oracle = readIf(path.join(ORACLE, id));
  const actual = readIf(path.join(ACTUAL, id));
  if (oracle !== null && actual !== null && oracle === actual) {
    console.log(
      `[fmt-verify] NOTICE: excluded id now matches oracle — consider un-excluding: ${id}`,
    );
  }
}

const report = {
  generatedAt: new Date().toISOString(),
  corpus: {
    svelteSha: meta.svelteSha,
    svelteDevSha: meta.svelteDevSha,
    oxfmtVersion: meta.oxfmtVersion,
  },
  included: included.length,
  excluded,
  skipped: (meta.skips ?? []).length,
  matched,
  failed: failures.length,
  failures,
};
fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, "\t") + "\n");

console.log("\n[fmt-verify] results:");
console.log(`  included  ${included.length}`);
console.log(
  `  excluded  ${excluded}  (oracle-bug / invalid-input / migrate — see compat/corpus/fmt-oracle-excluded.json)`,
);
console.log(`  matched   ${matched}`);
console.log(`  failed    ${failures.length}`);
console.log(`  report:   ${path.relative(ROOT, REPORT_PATH)}`);

if (UPDATE_BASELINE) {
  // Preserve any existing baseline id whose oracle is NOT present in this run's
  // parity set: those entries can't be checked locally (e.g. the loose
  // declaration-tag entries that Linux CI's oxfmt includes but macOS skips), so
  // dropping them here would silently break the CI gate. CI (Linux) regenerates
  // the full set, so re-running --update-baseline there collapses correctly.
  const localFailures = new Set(failures.map((f) => f.id));
  const existing = fs.existsSync(BASELINE_PATH)
    ? JSON.parse(fs.readFileSync(BASELINE_PATH, "utf8"))
    : [];
  const carriedOver = existing.filter(
    (id) => !localFailures.has(id) && !fs.existsSync(path.join(ORACLE, id)),
  );
  const baseline = [...new Set([...failures.map((f) => f.id), ...carriedOver])].sort();
  fs.writeFileSync(BASELINE_PATH, JSON.stringify(baseline, null, "\t") + "\n");
  console.log(
    `\n[fmt-verify] baseline updated: ${baseline.length} known failures ` +
      `(${carriedOver.length} carried over as not-locally-checkable) -> ${path.relative(ROOT, BASELINE_PATH)}`,
  );
  process.exit(0);
}

const baseline = new Set(
  !STRICT && fs.existsSync(BASELINE_PATH) ? JSON.parse(fs.readFileSync(BASELINE_PATH, "utf8")) : [],
);
const failingIds = new Set(failures.map((f) => f.id));
const regressions = failures.filter((f) => !baseline.has(f.id));
const fixedKnown = [...baseline].filter((id) => !failingIds.has(id));

if (fixedKnown.length) {
  console.log(
    `\n[fmt-verify] 🎉 ${fixedKnown.length} known failures now PASS — shrink the baseline:`,
  );
  console.log("  node scripts/compat-corpus/fmt-verify.mjs --update-baseline");
}

if (regressions.length) {
  console.log(
    `\n[fmt-verify] ❌ ${regressions.length} NEW failures (not in baseline); first ${Math.min(MAX_PRINT, regressions.length)}:`,
  );
  for (const f of regressions.slice(0, MAX_PRINT)) {
    console.log(`  - ${f.id} [${f.kind}] line ${f.detail?.line ?? ""}`);
    if (f.detail?.expected !== undefined) console.log(`      oracle: ${f.detail.expected}`);
    if (f.detail?.actual !== undefined) console.log(`      actual: ${f.detail.actual}`);
  }
  process.exit(1);
}

if (failures.length) {
  console.log(
    `\n[fmt-verify] ✅ no regressions (${failures.length} known failures remain — burn down then --update-baseline)`,
  );
} else {
  console.log("\n[fmt-verify] ✅ all corpus components format identically to the oracle");
}
