#!/usr/bin/env node
/**
 * Lint output-parity verifier (design mirror of corpus verify.mjs, for the
 * native linter). For every `.svelte` / `.svelte.js` / `.svelte.ts` source
 * collected by lint-collect.mjs:
 *
 *   1. Lint it with the REAL eslint-plugin-svelte (scripts/compat-corpus/
 *      lint-oracle) — the ground truth.
 *   2. Lint it with the native `rsvelte-lint` binary.
 *   3. Diff the two finding sets (ruleId, line, column, message), scoped to the
 *      rule universe both linters implement (minus a small unsupported set).
 *
 * Any finding present on exactly one side is a *divergence*. The set of
 * currently-accepted divergences lives in `compatibility/lint-known-failures.json`
 * and may only SHRINK: a NEW divergence fails the run (CI gate); divergences
 * that disappear are pruned with `--update`.
 *
 * Usage:
 *   node scripts/compat-corpus/lint-verify.mjs            # verify (CI gate)
 *   node scripts/compat-corpus/lint-verify.mjs --update   # rewrite known-failures
 *   node scripts/compat-corpus/lint-verify.mjs --show N    # print up to N new diffs
 */

import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { CI_REPOS, ORACLE_DIR, ruleUniverse } from "./lint-universe.mjs";
import { refuseUnrepresentativeBaseline } from "./baseline-guard.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../..");
const CORPUS = path.join(ROOT, "compatibility");
const SOURCES = path.join(CORPUS, "lint-sources");
const KNOWN = path.join(CORPUS, "lint-known-failures.json");
const REPORT = path.join(CORPUS, "lint-report.json");

// A near-empty manifest (partial submodule checkout, failed collect) would make
// the comparison pass vacuously instead of catching a regression.
const MIN_MANIFEST_ENTRIES = 1000;
// `--update` DELETES every ratchet entry this run did not reproduce, so a run
// over a narrowed corpus silently shrinks the ratchet to whatever it happened to
// measure. The CI source list (corpus-compat.yml) yields ~6.7k entries; this
// floor is below that but above every proper subset of those repos.
const MIN_FULL_LINT_CORPUS_ENTRIES = 6000;
// The sources are regenerated from the submodules, so a manifest entry with no
// file on disk means the tree was cleaned or half-written under it.
const MIN_SOURCE_COVERAGE = 0.99;

const args = process.argv.slice(2);
const UPDATE = args.includes("--update");
const SHOW = args.includes("--show") ? Number(args[args.indexOf("--show") + 1] || 50) : 50;

// Individual findings excluded for a structural reason OUTSIDE rsvelte's
// control (a version skew in the oracle's tooling, or a capability rsvelte does
// not implement) — the finding-scoped analogue of the per-rule `EXCLUDE` in
// lint-universe.mjs, NOT a place to hide real divergences. Each entry is a full
// `<corpus-id>|<+|-><rule>\t<line>:<col>\t<message>` string and MUST carry a
// documented justification (see compatibility/lint-known-failures.md).
const MANUAL_EXCLUSIONS = new Set([
  // `comment-directive` reportUnusedDisableDirectives on a CORE ESLint rule.
  // The oracle reports an `eslint-disable-next-line no-undef` as unused because
  // it RAN `no-undef` and it produced no error. rsvelte implements only
  // `svelte/*` rules, so it cannot tell "no-undef ran and found nothing"
  // (→ unused) from "no-undef would have fired but we never ran it" (→ used) —
  // it deliberately stays silent for unimplemented targets to avoid the FP
  // (verified: removing that guard trades this FN for a real FP on the very
  // next directive in the same fixture, line 8 having an undefined variable).
  // Same class as the type-aware `EXCLUDE` rules: not comparable without a
  // capability rsvelte does not have. The svelte/* unused-directive behaviour
  // IS still compared (only this single core-rule finding is excluded).
  "eslint-plugin-svelte/docs/rules/comment-directive.md/4.svelte|-svelte/comment-directive\t11:31\tUnused eslint-disable-next-line directive (no problems were reported from 'no-undef').",
]);

function findBinary() {
  for (const profile of ["dist-lint", "release", "debug"]) {
    const p = path.join(ROOT, "target", profile, "rsvelte-lint");
    if (fs.existsSync(p)) return p;
  }
  console.error(
    "[lint-verify] rsvelte-lint binary not found; run `cargo build --bin rsvelte-lint`",
  );
  process.exit(2);
}

// `.svelte.js` / `.svelte.ts` entries (`kind === 'module'`) are compared too:
// both linters read them, and excluding them left that surface ungated.
function corpusEntries() {
  const manifestPath = path.join(CORPUS, "lint-manifest.json");
  if (!fs.existsSync(manifestPath)) {
    console.error(
      "[lint-verify] no lint-manifest.json; run `node scripts/compat-corpus/lint-collect.mjs` first",
    );
    process.exit(2);
  }
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  if (manifest.length < MIN_MANIFEST_ENTRIES) {
    console.error(
      `[lint-verify] only ${manifest.length} entries in lint-manifest.json (expected >= ${MIN_MANIFEST_ENTRIES}); run \`node scripts/compat-corpus/lint-collect.mjs\` first`,
    );
    process.exit(2);
  }
  const present = manifest
    .map((e) => ({ id: e.id, kind: e.kind, file: path.join(SOURCES, e.id) }))
    .filter((e) => fs.existsSync(e.file));
  const coverage = present.length / manifest.length;
  if (coverage < MIN_SOURCE_COVERAGE) {
    console.error(
      `[lint-verify] only ${present.length}/${manifest.length} manifest entries have a source on disk (expected >= ${(MIN_SOURCE_COVERAGE * 100).toFixed(0)}%); re-run lint-collect.mjs`,
    );
    process.exit(2);
  }
  return { total: manifest.length, entries: present };
}

// finding -> stable string key. Columns are 1-based on both sides.
const key = (ruleId, line, col, message) => `${ruleId}\t${line}:${col}\t${message}`;

function runOracle(files, universe) {
  const rulesFile = path.join(CORPUS, ".lint-rules.json");
  fs.writeFileSync(rulesFile, JSON.stringify(universe));
  const out = execFileSync("node", ["lint-oracle/run.mjs", "--rules", rulesFile, "--stdin"], {
    cwd: __dirname,
    input: files.join("\0"),
    encoding: "utf8",
    maxBuffer: 1 << 28,
  });
  const data = JSON.parse(out);
  const universeSet = new Set(universe);
  const byFile = new Map();
  for (const entry of data) {
    const set = new Set();
    // Inline `/* eslint svelte/<rule>: … */` comments in fixtures can enable
    // rules outside the parity universe (incl. excluded ones); scope the
    // oracle findings to the universe just like the rsvelte side.
    for (const m of entry.messages) {
      if (universeSet.has(m.ruleId)) set.add(key(m.ruleId, m.line, m.column, m.message));
    }
    byFile.set(path.resolve(entry.file), { set, fatal: entry.fatal, readError: entry.readError });
  }
  return byFile;
}

function runRsvelte(files, universe) {
  const cfg = { extends: ["none"], rules: Object.fromEntries(universe.map((id) => [id, "warn"])) };
  const cfgFile = path.join(CORPUS, ".lint-rsvelte-lint.json");
  fs.writeFileSync(cfgFile, JSON.stringify(cfg));
  const bin = findBinary();
  let out;
  try {
    out = execFileSync(bin, ["--format", "sarif", "--config", cfgFile, SOURCES], {
      encoding: "utf8",
      maxBuffer: 1 << 28,
    });
  } catch (err) {
    // rsvelte-lint exits non-zero when it finds warnings/errors; stdout is on err.
    out = err.stdout || "";
  }
  const byFile = new Map();
  const population = new Set(files.map((f) => path.resolve(f)));
  for (const abs of population) byFile.set(abs, new Set());
  // rsvelte-lint is pointed at the whole SOURCES tree while the oracle gets an
  // explicit list, so the two sides can only be compared while the tree and the
  // list are the same set.
  const outside = new Set();
  let sarif;
  try {
    sarif = JSON.parse(out);
  } catch {
    console.error("[lint-verify] failed to parse rsvelte-lint SARIF output");
    process.exit(2);
  }
  const universeSet = new Set(universe);
  for (const run of sarif.runs || []) {
    for (const r of run.results || []) {
      const ruleId = r.ruleId;
      if (!ruleId || !universeSet.has(ruleId)) continue;
      const loc = r.locations?.[0]?.physicalLocation;
      const uri = loc?.artifactLocation?.uri;
      if (!uri) continue;
      const abs = path.resolve(uri.replace(/^file:\/\//, ""));
      const line = loc?.region?.startLine ?? 1;
      const col = loc?.region?.startColumn ?? 1;
      const message = r.message?.text ?? "";
      if (!population.has(abs)) {
        outside.add(abs);
        continue;
      }
      byFile.get(abs).add(key(ruleId, line, col, message));
    }
  }
  if (outside.size > 0) {
    console.error(
      `[lint-verify] rsvelte-lint reported findings for ${outside.size} file(s) the oracle was never given — the two sides linted different populations`,
    );
    for (const f of [...outside].slice(0, 10)) console.error(`  ${path.relative(SOURCES, f)}`);
    process.exit(2);
  }
  return byFile;
}

function main() {
  const bin = findBinary();
  const { total, entries } = corpusEntries();
  if (entries.length === 0) {
    console.error(
      "[lint-verify] no corpus sources; run `node scripts/compat-corpus/lint-collect.mjs` first",
    );
    process.exit(2);
  }
  const byKind = { component: 0, module: 0 };
  for (const e of entries) byKind[e.kind] = (byKind[e.kind] ?? 0) + 1;
  const repos = [...new Set(entries.map((e) => e.id.split("/")[0]))].sort();
  if (UPDATE) {
    // The entry-count floor is a lower bound, so it cannot see the loss of one
    // small repo, nor a SUPERSET run whose extra entries CI can never
    // reproduce. The repo set is exact and answers both.
    const missing = CI_REPOS.filter((r) => !repos.includes(r));
    const extra = repos.filter((r) => !CI_REPOS.includes(r));
    refuseUnrepresentativeBaseline(
      "lint-verify",
      [
        entries.length < MIN_FULL_LINT_CORPUS_ENTRIES &&
          `only ${entries.length} of the expected >= ${MIN_FULL_LINT_CORPUS_ENTRIES} corpus sources were measured — every ratchet entry this run did not reproduce would be deleted`,
        missing.length > 0 &&
          `the run measured no source from ${missing.join(", ")} — every ratchet entry under those repos would be deleted (re-run \`lint-collect.mjs --ci\`)`,
        extra.length > 0 &&
          `the run measured ${extra.join(", ")}, which the CI job does not collect — the entries it contributes would fail every later run as stale (re-run \`lint-collect.mjs --ci\`)`,
      ],
      "--update",
    );
  }
  const files = entries.map((e) => e.file);
  const universe = ruleUniverse(bin);
  console.log(
    `[lint-verify] ${files.length}/${total} sources (${byKind.component} component, ${byKind.module} module) from ${repos.length} repos [${repos.join(", ")}], ${universe.length} rules in parity universe`,
  );

  console.log("[lint-verify] running oracle (eslint-plugin-svelte)…");
  const oracle = runOracle(files, universe);
  console.log("[lint-verify] running rsvelte-lint…");
  const rsvelte = runRsvelte(files, universe);

  // Compute divergences as `<corpus-id>|<+|-><finding>` strings.
  const diffs = [];
  let oracleFatal = 0;
  // Per-kind hit counters: a comparison whose population is silently empty
  // scores every entry as a match, so the module surface reports its own
  // denominator rather than being inferred from the filter's absence.
  const compared = { component: 0, module: 0 };
  const findings = { component: [0, 0], module: [0, 0] };
  // An entry the oracle never answered for is a MISSING measurement, and
  // `o?.set ?? new Set()` reads it as "the oracle found nothing" — every
  // rsvelte finding on that file then becomes a false positive, and a file
  // where rsvelte is also silent scores as a match. The population floors
  // above are checked before the oracle runs, so only this covers a source
  // that disappeared underneath it.
  const unmeasured = [];
  for (const entry of entries) {
    const abs = path.resolve(entry.file);
    const id = entry.id;
    const o = oracle.get(abs);
    if (!o || o.readError) {
      unmeasured.push(id);
      continue;
    }
    if (o.fatal) {
      // Oracle couldn't parse — not a rule divergence; skip (both sides
      // effectively produce nothing comparable).
      oracleFatal++;
      continue;
    }
    const oset = o.set;
    const rset = rsvelte.get(abs) ?? new Set();
    compared[entry.kind]++;
    findings[entry.kind][0] += oset.size;
    findings[entry.kind][1] += rset.size;
    for (const k of rset) if (!oset.has(k)) diffs.push(`${id}|+${k}`); // false positive
    for (const k of oset) if (!rset.has(k)) diffs.push(`${id}|-${k}`); // false negative
  }
  console.log(
    `[lint-verify] compared: ${compared.component} component (oracle ${findings.component[0]} / rsvelte ${findings.component[1]} findings), ` +
      `${compared.module} module (oracle ${findings.module[0]} / rsvelte ${findings.module[1]} findings), ` +
      `${oracleFatal} oracle-unparseable, ${unmeasured.length} unmeasured of ${entries.length}`,
  );
  if (unmeasured.length > 0) {
    console.error(
      `[lint-verify] the oracle returned no result for ${unmeasured.length}/${entries.length} sources — those would score as "oracle silent", not as unmeasured`,
    );
    for (const id of unmeasured.slice(0, 10)) console.error(`  ${id}`);
    process.exit(2);
  }
  // Zero compared modules means the module surface is back outside the gate —
  // which is exactly the state that reads as a clean run.
  if (compared.module === 0) {
    console.error(
      `[lint-verify] no .svelte.(js|ts) entry was compared (${byKind.module} in the manifest) — the module surface is ungated`,
    );
    process.exit(2);
  }
  // Drop documented finding-level exclusions (version skew / capability gap).
  const filtered = diffs.filter((d) => !MANUAL_EXCLUSIONS.has(d));
  diffs.length = 0;
  diffs.push(...filtered);
  diffs.sort();
  const divergentFiles = new Set(diffs.map((entry) => entry.split("|")[0])).size;
  fs.writeFileSync(
    REPORT,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        total: entries.length,
        compared: compared.component + compared.module,
        matchedFiles: compared.component + compared.module - divergentFiles,
        divergentFiles,
        differences: diffs.length,
        oracleFatal,
        rules: universe.length,
      },
      null,
      "\t",
    ) + "\n",
  );

  const known = fs.existsSync(KNOWN) ? JSON.parse(fs.readFileSync(KNOWN, "utf8")) : [];
  const knownSet = new Set(known);
  const current = new Set(diffs);
  const added = diffs.filter((d) => !knownSet.has(d));
  const removed = known.filter((d) => !current.has(d));

  console.log(
    `[lint-verify] divergences: ${diffs.length} current, ${known.length} known (${added.length} new, ${removed.length} fixed), oracle-unparseable: ${oracleFatal}`,
  );

  if (UPDATE) {
    fs.writeFileSync(KNOWN, JSON.stringify(diffs, null, "\t") + "\n");
    console.log(`[lint-verify] wrote ${diffs.length} entries to ${path.relative(ROOT, KNOWN)}`);
    return;
  }

  if (added.length > 0) {
    console.error(
      `\n[lint-verify] ❌ ${added.length} NEW divergence(s) from eslint-plugin-svelte:`,
    );
    for (const d of added.slice(0, SHOW)) console.error("  " + d.replace(/\t/g, " "));
    if (added.length > SHOW) console.error(`  … and ${added.length - SHOW} more`);
  }
  // Staleness is fatal: a large "already fixed" delta on a later PR reads as
  // normal noise, so a real regression can hide inside it.
  if (removed.length > 0) {
    console.error(
      `\n[lint-verify] ❌ ${removed.length} ratchet entries no longer diverge — the ratchet is stale.`,
    );
    for (const d of removed.slice(0, SHOW)) console.error("  " + d.replace(/\t/g, " "));
    if (removed.length > SHOW) console.error(`  … and ${removed.length - SHOW} more`);
    console.error("\n  fix: node scripts/compat-corpus/lint-verify.mjs --update");
  }
  if (added.length > 0 || removed.length > 0) process.exit(1);
  console.log("[lint-verify] ✅ no new divergences");
}

main();
