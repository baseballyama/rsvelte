#!/usr/bin/env node
/**
 * Normalize both output trees with oxfmt (formatting-only differences are
 * explicitly tolerated by the corpus contract), then require byte-identical
 * outputs between the official Svelte compiler (expected/) and rsvelte
 * (actual/) for every corpus entry and target (client = CSR, server = SSR).
 *
 * Verdicts per entry:
 *   - match           js (post-oxfmt) and css byte-identical for both targets
 *   - error-parity    official compiler rejected; rsvelte rejected too
 *   - js-mismatch / css-mismatch / error-mismatch (rsvelte errs where official
 *     compiles, or vice versa)
 *
 * Writes compat/corpus/report.json.
 *
 * Ratchet baseline: compat/corpus/known-failures.json (checked in) lists
 * entry ids that are known-divergent. Verification exits non-zero only when
 * an entry NOT in the baseline fails (a regression) — known failures are
 * tolerated and burned down over time (see docs/corpus-remaining-work.md).
 * When previously-known failures now pass, a reminder to shrink the baseline
 * is printed (use --update-baseline to rewrite it from current results).
 *
 * Usage: node scripts/compat-corpus/verify.mjs [--no-fmt] [--max-print <n>] [--update-baseline] [--strict]
 */

import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { flattenTemplateHoles, stripBlankLines, astEquivalent } from "./normalize.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../..");
const CORPUS = path.join(ROOT, "compat/corpus");
const EXPECTED = path.join(CORPUS, "expected");
const ACTUAL = path.join(CORPUS, "actual");

const args = process.argv.slice(2);
const NO_FMT = args.includes("--no-fmt");
const MAX_PRINT = Number(args[args.indexOf("--max-print") + 1] || 20);
const UPDATE_BASELINE = args.includes("--update-baseline");
const STRICT = args.includes("--strict"); // ignore the baseline: any failure fails
// --baseline <path> selects an alternate ratchet file (default
// known-failures.json). The corpus is a single unified set, so this is rarely
// needed — kept for ad-hoc scoped runs.
const BASELINE_PATH = path.resolve(
  CORPUS,
  args.indexOf("--baseline") !== -1 ? args[args.indexOf("--baseline") + 1] : "known-failures.json",
);

// ---- oxfmt normalization ---------------------------------------------------

function flattenTreeTemplateHoles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) flattenTreeTemplateHoles(p);
    else if (entry.name.endsWith(".js")) {
      const src = fs.readFileSync(p, "utf8");
      const flat = flattenTemplateHoles(src);
      if (flat !== src) fs.writeFileSync(p, flat);
    }
  }
}

if (!NO_FMT) {
  const emptyIgnore = path.join(CORPUS, ".oxfmt-ignore-nothing");
  fs.writeFileSync(emptyIgnore, "");
  for (const tree of [EXPECTED, ACTUAL]) {
    // esrap wraps long expressions inside `${}` template holes; oxfmt
    // preserves hole multiline-ness from its input, so flatten holes
    // BEFORE formatting to make both trees converge (see normalize.mjs).
    console.log(`[verify] flatten template holes ${path.relative(ROOT, tree)}…`);
    flattenTreeTemplateHoles(tree);
    console.log(`[verify] oxfmt ${path.relative(ROOT, tree)}…`);
    try {
      execFileSync(
        "npx",
        [
          "oxfmt",
          "-c",
          path.join(CORPUS, ".oxfmtrc.json"),
          "--ignore-path",
          emptyIgnore,
          "--no-error-on-unmatched-pattern",
          ".",
        ],
        {
          cwd: tree,
          stdio: ["ignore", "ignore", "pipe"],
          maxBuffer: 1024 * 1024 * 64,
        },
      );
    } catch (e) {
      // oxfmt exits non-zero when some files cannot be parsed (e.g. the
      // official compiler emits `await` inside non-async component
      // functions for async components). Those files are left unformatted
      // in BOTH trees and compared byte-for-byte instead.
      const stderr = e.stderr?.toString() ?? "";
      const unparsable = (stderr.match(/x `|x Expected|x Unexpected/g) ?? []).length;
      console.log(`[verify]   oxfmt skipped unparsable files (${unparsable} parse diagnostics)`);
    }
  }
}

// ---- comparison --------------------------------------------------------------

const manifest = JSON.parse(fs.readFileSync(path.join(CORPUS, "manifest.json"), "utf8"));

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

const counts = {
  match: 0,
  "error-parity": 0,
  "js-mismatch": 0,
  "css-mismatch": 0,
  "error-mismatch": 0,
};
const failures = [];

for (const { id } of manifest) {
  const expDir = path.join(EXPECTED, id);
  const actDir = path.join(ACTUAL, id);
  const expErr = JSON.parse(readIf(path.join(expDir, "error.json")) ?? "{}");
  const actErr = JSON.parse(readIf(path.join(actDir, "error.json")) ?? "{}");

  let verdict = "match";
  const details = [];

  for (const target of ["client", "server"]) {
    const e = expErr[target];
    const a = actErr[target];
    if (e && a) {
      if (e.code && a.code && e.code !== a.code) {
        verdict = "error-mismatch";
        details.push({ target, kind: "error-code", expected: e.code, actual: a.code });
      } else if (verdict === "match") {
        verdict = "error-parity";
      }
      continue;
    }
    if (e || a) {
      verdict = "error-mismatch";
      details.push({
        target,
        kind: "error-presence",
        expected: e ? `error: ${e.code ?? e.message}` : "compiles",
        actual: a ? `error: ${a.code ?? a.message}` : "compiles",
      });
      continue;
    }
    const expRaw = readIf(path.join(expDir, `${target}.js`)) ?? "";
    const actRaw = readIf(path.join(actDir, `${target}.js`)) ?? "";
    const expJs = stripBlankLines(expRaw);
    const actJs = stripBlankLines(actRaw);
    // Byte comparison first (cheap). If it differs, fall back to AST
    // structural equivalence (acorn, not regex): the same code differing
    // only in comment placement / line-wrapping / redundant parens is
    // accepted, while genuinely-different code — and output acorn can't
    // parse — still fails.
    if (expJs !== actJs && !astEquivalent(expRaw, actRaw)) {
      verdict = "js-mismatch";
      details.push({ target, kind: "js", ...firstDiffLine(expJs, actJs) });
    }
    if (target === "client") {
      const expCss = readIf(path.join(expDir, "client.css"));
      const actCss = readIf(path.join(actDir, "client.css"));
      if ((expCss ?? "") !== (actCss ?? "")) {
        if (verdict === "match") verdict = "css-mismatch";
        details.push({ target, kind: "css", ...firstDiffLine(expCss ?? "", actCss ?? "") });
      }
    }
  }

  counts[verdict]++;
  if (verdict !== "match" && verdict !== "error-parity") {
    failures.push({ id, verdict, details });
  }
}

const report = {
  generatedAt: new Date().toISOString(),
  total: manifest.length,
  counts,
  failures,
};
fs.writeFileSync(path.join(CORPUS, "report.json"), JSON.stringify(report, null, "\t") + "\n");

console.log("\n[verify] results:");
for (const [k, v] of Object.entries(counts)) console.log(`  ${k.padEnd(16)} ${v}`);
console.log(`  report: ${path.relative(ROOT, path.join(CORPUS, "report.json"))}`);

if (UPDATE_BASELINE) {
  const baseline = failures.map((f) => f.id).sort();
  fs.writeFileSync(BASELINE_PATH, JSON.stringify(baseline, null, "\t") + "\n");
  console.log(
    `\n[verify] baseline updated: ${baseline.length} known failures -> ${path.relative(ROOT, BASELINE_PATH)}`,
  );
  process.exit(0);
}

const baseline = new Set(
  !STRICT && fs.existsSync(BASELINE_PATH) ? JSON.parse(fs.readFileSync(BASELINE_PATH, "utf8")) : [],
);
const regressions = failures.filter((f) => !baseline.has(f.id));
const failingIds = new Set(failures.map((f) => f.id));
const fixedKnown = [...baseline].filter((id) => !failingIds.has(id));

if (fixedKnown.length) {
  console.log(`\n[verify] 🎉 ${fixedKnown.length} known failures now PASS — shrink the baseline:`);
  console.log("  node scripts/compat-corpus/verify.mjs --no-fmt --update-baseline");
}

if (regressions.length) {
  console.log(
    `\n[verify] ❌ ${regressions.length} NEW failures (not in baseline); first ${Math.min(MAX_PRINT, regressions.length)}:`,
  );
  for (const f of regressions.slice(0, MAX_PRINT)) {
    console.log(`  - ${f.id} [${f.verdict}]`);
    for (const d of f.details.slice(0, 2)) {
      console.log(`      ${d.target}/${d.kind} line ${d.line ?? ""}`);
      if (d.expected !== undefined) console.log(`        expected: ${d.expected}`);
      if (d.actual !== undefined) console.log(`        actual:   ${d.actual}`);
    }
  }
  process.exit(1);
}

if (failures.length) {
  console.log(
    `\n[verify] ✅ no regressions (${failures.length} known failures remain — see docs/corpus-remaining-work.md)`,
  );
} else {
  console.log("\n[verify] ✅ all corpus outputs identical after normalization");
}
