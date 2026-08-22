#!/usr/bin/env node
/**
 * End-position parity gate over the adversarial pattern corpus.
 *
 * `lint-adversarial.mjs` and `lint-verify.mjs` key a finding on
 * `(ruleId, line, column, message)` — its START only. A rule that reports at the
 * right place with the right text and underlines the wrong region is invisible
 * to both, and to the autofix and suggestion gates as well (a report's range is
 * not its fix's range). This is the same split the compiler-error gates already
 * make, where `end` is ratcheted apart from `start` and 17 ids diverge on `end`
 * while `start` agrees.
 *
 * Comparison: for every finding whose full start key matches on both sides, the
 * `(endLine, endColumn)` pair. Findings without a counterpart are NOT reported
 * here — that disagreement is gate 28's, and restating it would make this
 * ratchet a copy of that one. A finding upstream reports with no end at all
 * (`endLine: null`, from a bare-position report) is compared as `null`, so
 * inventing an end is a divergence too.
 *
 * Usage:
 *   node scripts/compat-corpus/lint-adversarial-end.mjs           # verify (CI gate)
 *   node scripts/compat-corpus/lint-adversarial-end.mjs --update  # rewrite ratchet
 *   node scripts/compat-corpus/lint-adversarial-end.mjs --show N
 *   node scripts/compat-corpus/lint-adversarial-end.mjs --filter S
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
const KNOWN = path.join(ROOT, "compatibility", "lint-adversarial-end-known-failures.json");

const args = process.argv.slice(2);
const UPDATE = args.includes("--update");
const SHOW = args.includes("--show") ? Number(args[args.indexOf("--show") + 1] || 40) : 40;
const FILTER = args.includes("--filter") ? args[args.indexOf("--filter") + 1] : null;
const MIN_FILES_FOR_UPDATE = 800;

function findBinary() {
  for (const profile of ["dist-lint", "release", "debug"]) {
    const p = path.join(ROOT, "target", profile, "rsvelte-lint");
    if (fs.existsSync(p)) return p;
  }
  console.error("[lint-adversarial-end] rsvelte-lint binary not found; run `cargo build --bin rsvelte-lint`");
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

const startKey = (ruleId, line, column, message) => `${ruleId}\t${line}:${column}\t${message}`;
const endValue = (line, column) => (line === null || line === undefined ? "null" : `${line}:${column}`);

function main() {
  const bin = findBinary();
  const universe = ruleUniverse(bin);
  const uni = new Set(universe);
  let files = walk(SOURCES).sort();
  if (FILTER) files = files.filter((f) => path.relative(SOURCES, f).includes(FILTER));
  if (files.length === 0) {
    console.error("[lint-adversarial-end] no patterns matched");
    process.exit(2);
  }

  const rulesFile = path.join(os.tmpdir(), `rsvelte-end-rules-${process.pid}.json`);
  fs.writeFileSync(rulesFile, JSON.stringify(universe));
  let raw;
  try {
    raw = execFileSync("node", ["lint-oracle/run.mjs", "--rules", rulesFile, "--stdin"], {
      cwd: path.join(ROOT, "scripts", "compat-corpus"),
      input: files.join("\0"),
      encoding: "utf8",
      maxBuffer: 1 << 29,
    });
  } finally {
    fs.rmSync(rulesFile, { force: true });
  }
  const oracle = new Map();
  const fatal = [];
  for (const entry of JSON.parse(raw)) {
    const abs = path.resolve(entry.file);
    if (entry.fatal) {
      fatal.push(`${path.relative(SOURCES, abs)} (oracle parse error: ${entry.fatal})`);
      continue;
    }
    const map = new Map();
    for (const m of entry.messages) {
      if (!uni.has(m.ruleId)) continue;
      map.set(startKey(m.ruleId, m.line, m.column, m.message), endValue(m.endLine, m.endColumn));
    }
    oracle.set(abs, map);
  }
  if (fatal.length > 0) {
    console.error(`[lint-adversarial-end] ❌ ${fatal.length} pattern(s) the oracle could not measure:`);
    for (const f of fatal.slice(0, 20)) console.error(`  ${f}`);
    process.exit(2);
  }

  const cfgFile = path.join(os.tmpdir(), `rsvelte-end-config-${process.pid}.json`);
  fs.writeFileSync(
    cfgFile,
    JSON.stringify({ extends: ["none"], rules: Object.fromEntries(universe.map((id) => [id, "warn"])) }),
  );
  let out;
  try {
    out = execFileSync(bin, ["--format", "sarif", "--config", cfgFile, ...files], {
      encoding: "utf8",
      maxBuffer: 1 << 29,
    });
  } catch (err) {
    out = err.stdout || "";
  } finally {
    fs.rmSync(cfgFile, { force: true });
  }
  const rsvelte = new Map(files.map((f) => [f, new Map()]));
  for (const run of JSON.parse(out).runs || []) {
    for (const r of run.results || []) {
      if (!uni.has(r.ruleId)) continue;
      const loc = r.locations?.[0]?.physicalLocation;
      const abs = path.resolve(loc.artifactLocation.uri.replace(/^file:\/\//, ""));
      if (!rsvelte.has(abs)) continue;
      const region = loc.region ?? {};
      rsvelte
        .get(abs)
        .set(
          startKey(r.ruleId, region.startLine ?? 1, region.startColumn ?? 1, r.message.text),
          endValue(region.endLine ?? null, region.endColumn ?? null),
        );
    }
  }

  const diffs = [];
  let compared = 0;
  let oracleNullEnds = 0;
  for (const f of files) {
    const id = path.relative(SOURCES, f);
    const o = oracle.get(f);
    if (!o) continue;
    const r = rsvelte.get(f) ?? new Map();
    for (const [key, oEnd] of o) {
      if (!r.has(key)) continue; // start-side disagreement — gate 28 owns it
      compared++;
      if (oEnd === "null") oracleNullEnds++;
      const rEnd = r.get(key);
      if (oEnd !== rEnd) diffs.push(`${id}|${key.split("\t").slice(0, 2).join(" ")}\t${oEnd}\t${rEnd}`);
    }
  }

  diffs.sort();
  console.log(
    `[lint-adversarial-end] compared ${compared} findings whose start already matches over ${files.length} patterns ` +
      `(${oracleNullEnds} with no upstream end), ${diffs.length} divergence(s)`,
  );

  const known = fs.existsSync(KNOWN) ? JSON.parse(fs.readFileSync(KNOWN, "utf8")) : [];
  const knownSet = new Set(known);
  const current = new Set(diffs);
  const added = diffs.filter((d) => !knownSet.has(d));
  const removed = known.filter((d) => !current.has(d));

  if (UPDATE) {
    if (FILTER) {
      console.error("[lint-adversarial-end] refusing --update under --filter (would delete unmeasured entries)");
      process.exit(2);
    }
    if (files.length < MIN_FILES_FOR_UPDATE) {
      console.error(
        `[lint-adversarial-end] refusing --update over ${files.length} patterns (< ${MIN_FILES_FOR_UPDATE}) — wrong checkout?`,
      );
      process.exit(2);
    }
    fs.writeFileSync(KNOWN, JSON.stringify(diffs, null, "\t") + "\n");
    console.log(`[lint-adversarial-end] wrote ${diffs.length} entries to ${path.relative(ROOT, KNOWN)}`);
    return;
  }

  if (added.length > 0) {
    console.error(`\n[lint-adversarial-end] ❌ ${added.length} NEW end-position divergence(s) (oracle vs rsvelte):`);
    for (const d of added.slice(0, SHOW)) console.error("  " + d.replace(/\t/g, "  "));
    if (added.length > SHOW) console.error(`  … and ${added.length - SHOW} more`);
  }
  if (removed.length > 0 && !FILTER) {
    console.error(`\n[lint-adversarial-end] ❌ ${removed.length} ratchet entries no longer diverge (stale):`);
    for (const d of removed.slice(0, SHOW)) console.error("  " + d.replace(/\t/g, "  "));
    console.error("\n  fix: node scripts/compat-corpus/lint-adversarial-end.mjs --update");
  }
  if (added.length > 0 || (removed.length > 0 && !FILTER)) process.exit(1);
  console.log("[lint-adversarial-end] ✅ end-position parity");
}

main();
