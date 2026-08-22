#!/usr/bin/env node
/**
 * Whole-config autofix parity over the adversarial pattern corpus.
 *
 * `lint-adversarial-fix.mjs` enables ONE rule per pattern — the rule the
 * pattern's directory names — because resolving overlapping fixes across rules
 * is ESLint's driver policy rather than any rule's port. That is the right scope
 * for a rule comparison, and it leaves two things uncompared: what `--fix` does
 * with the whole rule universe enabled (which is what users run), and any rule
 * whose fixer touches a pattern filed under a *different* rule's directory.
 *
 * Comparison: for each pattern, with all 74 universe rules forced to `warn` on
 * both sides, run `--fix` and compare the resulting text byte-for-byte. Both
 * sides work on copies; the committed corpus is never mutated. The rsvelte copy
 * is a copy of the whole corpus tree, so `package.json` — which decides whether
 * the SvelteKit-gated rules run — travels with the sources.
 *
 * Two verdicts, kept apart in the key so a ratchet entry cannot suppress the
 * other class on the same file:
 *   `<id>`               the two fixed texts differ
 *   `oracle-crash:<id>`  ESLint threw while fixing (a rule crashing on text an
 *                        earlier pass produced), so there is nothing to compare
 *
 * Usage:
 *   node scripts/compat-corpus/lint-adversarial-fix-all.mjs           # verify (CI gate)
 *   node scripts/compat-corpus/lint-adversarial-fix-all.mjs --update  # rewrite ratchet
 *   node scripts/compat-corpus/lint-adversarial-fix-all.mjs --show N  # print up to N diffs
 *   node scripts/compat-corpus/lint-adversarial-fix-all.mjs --filter S
 */

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { ruleUniverse } from "./lint-universe.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../..");
const SOURCES = path.join(ROOT, "compatibility", "lint-adversarial");
const KNOWN = path.join(ROOT, "compatibility", "lint-adversarial-fix-all-known-failures.json");

const args = process.argv.slice(2);
const UPDATE = args.includes("--update");
const SHOW = args.includes("--show") ? Number(args[args.indexOf("--show") + 1] || 20) : 20;
const FILTER = args.includes("--filter") ? args[args.indexOf("--filter") + 1] : null;
const MIN_RULES_FOR_UPDATE = 50;
const MIN_PATTERNS_FOR_UPDATE = 1000;

function findBinary() {
  for (const profile of ["dist-lint", "release", "debug"]) {
    const p = path.join(ROOT, "target", profile, "rsvelte-lint");
    if (fs.existsSync(p)) return p;
  }
  console.error("[lint-adversarial-fix-all] rsvelte-lint binary not found; run `cargo build --bin rsvelte-lint`");
  process.exit(2);
}

function walk(dir) {
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...walk(p));
    else if (/\.(svelte|svelte\.js|svelte\.ts)$/.test(e.name)) out.push(p);
  }
  return out;
}

/** Fixed text per file, from the real plugin with the whole universe enabled. */
function oracleFixes(universe, files, tmp) {
  const rulesFile = path.join(tmp, "rules.json");
  fs.writeFileSync(rulesFile, JSON.stringify(universe));
  const out = execFileSync("node", ["fix-all.mjs", "--rules-file", rulesFile, "--stdin"], {
    cwd: path.join(__dirname, "lint-oracle"),
    input: files.join("\0"),
    encoding: "utf8",
    maxBuffer: 1 << 29,
  });
  const byFile = new Map();
  for (const e of JSON.parse(out)) byFile.set(path.resolve(e.file), e);
  return byFile;
}

/** Fixed text per file, from `rsvelte-lint --fix` over a copy of the corpus tree. */
function rsvelteFixes(universe, files, bin, tmp) {
  const dir = path.join(tmp, "tree");
  fs.cpSync(SOURCES, dir, { recursive: true });
  const cfgFile = path.join(dir, "rsvelte-lint-config.json");
  fs.writeFileSync(
    cfgFile,
    JSON.stringify({ extends: ["none"], rules: Object.fromEntries(universe.map((r) => [r, "warn"])) }),
  );
  const copies = new Map(files.map((f) => [f, path.join(dir, path.relative(SOURCES, f))]));
  try {
    execFileSync(bin, ["--fix", "--format", "sarif", "--config", cfgFile, ...copies.values()], {
      encoding: "utf8",
      maxBuffer: 1 << 29,
    });
  } catch {
    // A non-zero exit means findings remain after fixing, which is normal.
  }
  const byFile = new Map();
  for (const [orig, copy] of copies) byFile.set(orig, fs.readFileSync(copy, "utf8"));
  return byFile;
}

function main() {
  const bin = findBinary();
  const universe = ruleUniverse(bin);
  let files = walk(SOURCES).sort();
  if (FILTER) files = files.filter((f) => path.relative(SOURCES, f).includes(FILTER));
  if (files.length === 0) {
    console.error("[lint-adversarial-fix-all] no patterns matched");
    process.exit(2);
  }

  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "rsvelte-adv-fix-all-"));
  const oracle = oracleFixes(universe, files, tmp);
  const rsvelte = rsvelteFixes(universe, files, bin, tmp);

  const failures = [];
  const crashes = [];
  const diffs = [];
  let compared = 0;
  let changedO = 0;
  let changedR = 0;
  for (const f of files) {
    const id = path.relative(SOURCES, f);
    const o = oracle.get(f);
    if (!o) {
      console.error(`[lint-adversarial-fix-all] ❌ oracle returned no result for ${id}`);
      process.exit(2);
    }
    if (o.fatal) {
      failures.push(`oracle-crash:${id}`);
      crashes.push(`${id}: ${o.fatal.message.split("\n")[0]}`);
      continue;
    }
    const src = fs.readFileSync(f, "utf8");
    const r = rsvelte.get(f);
    compared++;
    if (o.output !== src) changedO++;
    if (r !== src) changedR++;
    if (o.output !== r) {
      failures.push(id);
      diffs.push({ id, src, oracle: o.output, rsvelte: r });
    }
  }
  fs.rmSync(tmp, { recursive: true, force: true });

  failures.sort();
  console.log(
    `[lint-adversarial-fix-all] compared ${compared} patterns with all ${universe.length} rules enabled ` +
      `(oracle rewrote ${changedO}, rsvelte rewrote ${changedR}), ` +
      `${diffs.length} divergence(s), ${crashes.length} oracle crash(es)`,
  );
  for (const c of crashes.slice(0, SHOW)) console.log(`  oracle crash: ${c}`);

  const known = fs.existsSync(KNOWN) ? JSON.parse(fs.readFileSync(KNOWN, "utf8")) : [];
  const knownSet = new Set(known);
  const current = new Set(failures);
  const added = failures.filter((d) => !knownSet.has(d));
  const removed = known.filter((d) => !current.has(d));

  if (UPDATE) {
    if (FILTER) {
      console.error("[lint-adversarial-fix-all] refusing --update under --filter (would delete unmeasured entries)");
      process.exit(2);
    }
    if (universe.length < MIN_RULES_FOR_UPDATE) {
      console.error(
        `[lint-adversarial-fix-all] refusing --update over ${universe.length} rules (< ${MIN_RULES_FOR_UPDATE}) — wrong checkout?`,
      );
      process.exit(2);
    }
    if (files.length < MIN_PATTERNS_FOR_UPDATE) {
      console.error(
        `[lint-adversarial-fix-all] refusing --update over ${files.length} patterns (< ${MIN_PATTERNS_FOR_UPDATE}) — wrong checkout?`,
      );
      process.exit(2);
    }
    fs.writeFileSync(KNOWN, JSON.stringify(failures, null, "\t") + "\n");
    console.log(`[lint-adversarial-fix-all] wrote ${failures.length} entries to ${path.relative(ROOT, KNOWN)}`);
    return;
  }

  if (added.length > 0) {
    console.error(`\n[lint-adversarial-fix-all] ❌ ${added.length} NEW whole-config autofix failure(s):`);
    for (const d of added.slice(0, SHOW)) {
      console.error("  " + d);
      const diff = diffs.find((x) => x.id === d);
      if (!diff) continue;
      console.error(`    oracle : ${JSON.stringify(diff.oracle).slice(0, 300)}`);
      console.error(`    rsvelte: ${JSON.stringify(diff.rsvelte).slice(0, 300)}`);
    }
    if (added.length > SHOW) console.error(`  … and ${added.length - SHOW} more`);
  }
  if (removed.length > 0 && !FILTER) {
    console.error(`\n[lint-adversarial-fix-all] ❌ ${removed.length} ratchet entries no longer fail (stale):`);
    for (const d of removed.slice(0, SHOW)) console.error("  " + d);
    console.error("\n  fix: node scripts/compat-corpus/lint-adversarial-fix-all.mjs --update");
  }
  if (added.length > 0 || (removed.length > 0 && !FILTER)) process.exit(1);
  console.log("[lint-adversarial-fix-all] ✅ whole-config autofix parity");
}

main();
