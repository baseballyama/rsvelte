#!/usr/bin/env node
/**
 * Autofix parity gate over the adversarial pattern corpus.
 *
 * `lint-adversarial.mjs` compares findings keyed by (ruleId, line, column,
 * message) — a key that cannot see a fix at all. A rule can report at exactly
 * the right position and still write the wrong replacement text, or write a
 * correct replacement over the wrong range. That class is invisible to every
 * corpus gate; upstream fixtures gate it only for the shapes upstream ships
 * (`crates/rsvelte_lint/tests/eslint_plugin_oracle.rs`, `*-output.svelte`).
 *
 * Comparison: for each pattern, with ONLY the rule its directory names enabled,
 * run `--fix` on both sides and compare the resulting text byte-for-byte. Both
 * sides work on copies; the committed corpus is never mutated.
 *
 * Fixes are compared per rule rather than with the whole universe enabled,
 * because ESLint resolves overlapping fixes across rules by a scheduling policy
 * (multi-pass, first-wins on overlap) that is a property of ESLint's driver
 * rather than of any rule's port.
 *
 * Usage:
 *   node scripts/compat-corpus/lint-adversarial-fix.mjs           # verify (CI gate)
 *   node scripts/compat-corpus/lint-adversarial-fix.mjs --update  # rewrite ratchet
 *   node scripts/compat-corpus/lint-adversarial-fix.mjs --show N  # print up to N diffs
 *   node scripts/compat-corpus/lint-adversarial-fix.mjs --filter S
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
const KNOWN = path.join(ROOT, "compatibility", "lint-adversarial-fix-known-failures.json");

const args = process.argv.slice(2);
const UPDATE = args.includes("--update");
const SHOW = args.includes("--show") ? Number(args[args.indexOf("--show") + 1] || 20) : 20;
const FILTER = args.includes("--filter") ? args[args.indexOf("--filter") + 1] : null;
const MIN_RULES_FOR_UPDATE = 50;

function findBinary() {
  for (const profile of ["dist-lint", "release", "debug"]) {
    const p = path.join(ROOT, "target", profile, "rsvelte-lint");
    if (fs.existsSync(p)) return p;
  }
  console.error("[lint-adversarial-fix] rsvelte-lint binary not found; run `cargo build --bin rsvelte-lint`");
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

/** Fixed text per file, from the real plugin with only `rule` enabled. */
function oracleFixes(rule, files) {
  const out = execFileSync("node", ["lint-oracle/fix.mjs", "--rule", rule, "--stdin"], {
    cwd: __dirname,
    input: files.join("\0"),
    encoding: "utf8",
    maxBuffer: 1 << 28,
  });
  const byFile = new Map();
  for (const e of JSON.parse(out)) byFile.set(path.resolve(e.file), e);
  return byFile;
}

/** Fixed text per file, from `rsvelte-lint --fix` over a scratch copy. */
function rsvelteFixes(rule, files, bin, tmp) {
  const dir = fs.mkdtempSync(path.join(tmp, "fix-"));
  const copies = new Map();
  for (const f of files) {
    const dest = path.join(dir, path.relative(SOURCES, f));
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(f, dest);
    copies.set(f, dest);
  }
  const cfgFile = path.join(dir, "rsvelte-lint-config.json");
  fs.writeFileSync(cfgFile, JSON.stringify({ extends: ["none"], rules: { [rule]: "warn" } }));
  try {
    execFileSync(bin, ["--fix", "--format", "sarif", "--config", cfgFile, ...copies.values()], {
      encoding: "utf8",
      maxBuffer: 1 << 28,
    });
  } catch {
    // A non-zero exit means findings remain after fixing, which is normal.
  }
  const byFile = new Map();
  for (const [orig, copy] of copies) byFile.set(orig, fs.readFileSync(copy, "utf8"));
  fs.rmSync(dir, { recursive: true, force: true });
  return byFile;
}

function main() {
  const bin = findBinary();
  const universe = new Set(ruleUniverse(bin));
  let files = walk(SOURCES).sort();
  if (FILTER) files = files.filter((f) => path.relative(SOURCES, f).includes(FILTER));

  // Group by the rule the pattern's directory names; a pattern outside a
  // universe-rule directory has no rule to fix with and is skipped.
  const byRule = new Map();
  for (const f of files) {
    const rule = `svelte/${path.relative(SOURCES, f).split(path.sep)[0]}`;
    if (!universe.has(rule)) continue;
    if (!byRule.has(rule)) byRule.set(rule, []);
    byRule.get(rule).push(f);
  }
  if (byRule.size === 0) {
    console.error("[lint-adversarial-fix] no patterns matched a universe rule");
    process.exit(2);
  }

  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "rsvelte-adv-fix-"));
  const diffs = [];
  const fatal = [];
  let compared = 0;
  let changedO = 0;
  let changedR = 0;
  // Fixed text the oracle's own next pass could not parse. Upstream behaviour,
  // reproduced byte-for-byte like any other fix — counted so it stays visible.
  let unparseableFix = 0;
  for (const [rule, ruleFiles] of [...byRule].sort()) {
    const oracle = oracleFixes(rule, ruleFiles);
    const rsvelte = rsvelteFixes(rule, ruleFiles, bin, tmp);
    for (const f of ruleFiles) {
      const id = path.relative(SOURCES, f);
      const o = oracle.get(f);
      if (!o) {
        fatal.push(`${id} (oracle returned no result)`);
        continue;
      }
      if (o.fatal) {
        fatal.push(`${id} (oracle parse error: ${o.fatal.message})`);
        continue;
      }
      const src = fs.readFileSync(f, "utf8");
      const r = rsvelte.get(f);
      compared++;
      if (o.output !== src) changedO++;
      if (r !== src) changedR++;
      if (o.output === src && !o.fixedParses) unparseableFix++;
      if (o.output !== r) diffs.push(`${id}|${rule}`);
    }
  }
  fs.rmSync(tmp, { recursive: true, force: true });

  if (fatal.length > 0) {
    console.error(`[lint-adversarial-fix] ❌ ${fatal.length} pattern(s) the oracle could not measure:`);
    for (const f of fatal.slice(0, 20)) console.error(`  ${f}`);
    process.exit(2);
  }
  diffs.sort();
  console.log(
    `[lint-adversarial-fix] compared ${compared} pattern/rule pairs across ${byRule.size} rules ` +
      `(oracle rewrote ${changedO}, rsvelte rewrote ${changedR}, ${unparseableFix} oracle fixes do not re-parse), ` +
      `${diffs.length} divergence(s)`,
  );

  const known = fs.existsSync(KNOWN) ? JSON.parse(fs.readFileSync(KNOWN, "utf8")) : [];
  const knownSet = new Set(known);
  const current = new Set(diffs);
  const added = diffs.filter((d) => !knownSet.has(d));
  const removed = known.filter((d) => !current.has(d));

  if (UPDATE) {
    if (FILTER) {
      console.error("[lint-adversarial-fix] refusing --update under --filter (would delete unmeasured entries)");
      process.exit(2);
    }
    if (byRule.size < MIN_RULES_FOR_UPDATE) {
      console.error(
        `[lint-adversarial-fix] refusing --update over ${byRule.size} rules (< ${MIN_RULES_FOR_UPDATE}) — wrong checkout?`,
      );
      process.exit(2);
    }
    fs.writeFileSync(KNOWN, JSON.stringify(diffs, null, "\t") + "\n");
    console.log(`[lint-adversarial-fix] wrote ${diffs.length} entries to ${path.relative(ROOT, KNOWN)}`);
    return;
  }

  if (added.length > 0) {
    console.error(`\n[lint-adversarial-fix] ❌ ${added.length} NEW autofix divergence(s):`);
    for (const d of added.slice(0, SHOW)) console.error("  " + d);
    if (added.length > SHOW) console.error(`  … and ${added.length - SHOW} more`);
  }
  if (removed.length > 0 && !FILTER) {
    console.error(`\n[lint-adversarial-fix] ❌ ${removed.length} ratchet entries no longer diverge (stale):`);
    for (const d of removed.slice(0, SHOW)) console.error("  " + d);
    console.error("\n  fix: node scripts/compat-corpus/lint-adversarial-fix.mjs --update");
  }
  if (added.length > 0 || (removed.length > 0 && !FILTER)) process.exit(1);
  console.log("[lint-adversarial-fix] ✅ autofix parity");
}

main();
