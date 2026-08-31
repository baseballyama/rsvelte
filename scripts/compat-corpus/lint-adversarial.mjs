#!/usr/bin/env node
/**
 * Lint parity gate over the COMMITTED adversarial pattern corpus
 * (`compatibility/lint-adversarial/`). Same comparison as lint-verify.mjs —
 * every finding keyed by (ruleId, line, column, message), oracle =
 * eslint-plugin-svelte, subject = the native `rsvelte-lint` binary — but the
 * population is hand-constructed edge cases instead of collected real-world
 * sources, so:
 *
 *   - a source the oracle cannot parse is a HARD ERROR (a pattern that does
 *     not parse measures nothing; fix the pattern), where the collected
 *     corpus merely counts and skips it;
 *   - the ratchet (`compatibility/lint-adversarial-known-failures.json`)
 *     is expected to stay empty — an entry needs a documented reason in
 *     compatibility/KNOWN-FAILURES.md#lint-adversarial-known-failures (oracle-side bug or
 *     capability gap), never "we diverge here".
 *
 * Usage:
 *   node scripts/compat-corpus/lint-adversarial.mjs             # verify (CI gate)
 *   node scripts/compat-corpus/lint-adversarial.mjs --update    # rewrite ratchet
 *   node scripts/compat-corpus/lint-adversarial.mjs --show N    # print up to N diffs
 *   node scripts/compat-corpus/lint-adversarial.mjs --filter S  # only ids containing S
 */

import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { ruleUniverse } from "./lint-universe.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../..");
const SOURCES = path.join(ROOT, "compatibility", "lint-adversarial");
const KNOWN = path.join(ROOT, "compatibility", "lint-adversarial-known-failures.json");

const args = process.argv.slice(2);
const UPDATE = args.includes("--update");
const SHOW = args.includes("--show") ? Number(args[args.indexOf("--show") + 1] || 50) : 50;
const FILTER = args.includes("--filter") ? args[args.indexOf("--filter") + 1] : null;

// The committed tree IS the population; a near-empty walk means a wrong
// checkout, and `--update` over it would delete the rest of the ratchet.
const MIN_ENTRIES_FOR_UPDATE = 50;

function findBinary() {
  for (const profile of ["dist-lint", "release", "debug"]) {
    const p = path.join(ROOT, "target", profile, "rsvelte-lint");
    if (fs.existsSync(p)) return p;
  }
  console.error(
    "[lint-adversarial] rsvelte-lint binary not found; run `cargo build --bin rsvelte-lint`",
  );
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

const key = (ruleId, line, col, message) => `${ruleId}\t${line}:${col}\t${message}`;

function runOracle(files, universe) {
  const rulesFile = path.join(ROOT, "compatibility", ".lint-adversarial-rules.json");
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
    for (const m of entry.messages) {
      if (universeSet.has(m.ruleId)) set.add(key(m.ruleId, m.line, m.column, m.message));
    }
    byFile.set(path.resolve(entry.file), { set, fatal: entry.fatal, readError: entry.readError });
  }
  return byFile;
}

function runRsvelte(files, universe) {
  const cfg = { extends: ["none"], rules: Object.fromEntries(universe.map((id) => [id, "warn"])) };
  const cfgFile = path.join(ROOT, "compatibility", ".lint-adversarial-config.json");
  fs.writeFileSync(cfgFile, JSON.stringify(cfg));
  const bin = findBinary();
  let out;
  try {
    out = execFileSync(bin, ["--format", "sarif", "--config", cfgFile, ...files], {
      encoding: "utf8",
      maxBuffer: 1 << 28,
    });
  } catch (err) {
    out = err.stdout || "";
  }
  const byFile = new Map();
  const population = new Set(files.map((f) => path.resolve(f)));
  for (const abs of population) byFile.set(abs, new Set());
  const outside = new Set();
  let sarif;
  try {
    sarif = JSON.parse(out);
  } catch {
    console.error("[lint-adversarial] failed to parse rsvelte-lint SARIF output");
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
        // Under --filter the binary still lints the whole tree; findings on
        // unfiltered files are simply out of scope, not a population mismatch.
        if (!FILTER) outside.add(abs);
        continue;
      }
      byFile.get(abs).add(key(ruleId, line, col, message));
    }
  }
  if (outside.size > 0) {
    console.error(
      `[lint-adversarial] rsvelte-lint reported findings for ${outside.size} file(s) outside the walked population`,
    );
    for (const f of [...outside].slice(0, 10)) console.error(`  ${f}`);
    process.exit(2);
  }
  return byFile;
}

function main() {
  const bin = findBinary();
  if (!fs.existsSync(SOURCES)) {
    console.error(`[lint-adversarial] ${SOURCES} does not exist`);
    process.exit(2);
  }
  let files = walk(SOURCES).sort();
  if (FILTER) files = files.filter((f) => path.relative(SOURCES, f).includes(FILTER));
  if (files.length === 0) {
    console.error("[lint-adversarial] no pattern sources found");
    process.exit(2);
  }
  const universe = ruleUniverse(bin);
  console.log(
    `[lint-adversarial] ${files.length} patterns, ${universe.length} rules in parity universe`,
  );
  const oracle = runOracle(files, universe);
  const rsvelte = runRsvelte(files, universe);

  const diffs = [];
  const fatal = [];
  let findingsO = 0;
  let findingsR = 0;
  for (const file of files) {
    const abs = path.resolve(file);
    const id = path.relative(SOURCES, abs);
    const o = oracle.get(abs);
    if (!o || o.readError) {
      fatal.push(`${id} (oracle returned no result)`);
      continue;
    }
    if (o.fatal) {
      fatal.push(`${id} (oracle parse error: ${o.fatal.message ?? JSON.stringify(o.fatal)})`);
      continue;
    }
    const rset = rsvelte.get(abs) ?? new Set();
    findingsO += o.set.size;
    findingsR += rset.size;
    for (const k of rset) if (!o.set.has(k)) diffs.push(`${id}|+${k}`);
    for (const k of o.set) if (!rset.has(k)) diffs.push(`${id}|-${k}`);
  }
  if (fatal.length > 0) {
    console.error(
      `[lint-adversarial] ❌ ${fatal.length} pattern(s) the oracle could not measure — a pattern that does not parse measures nothing; fix the pattern:`,
    );
    for (const f of fatal.slice(0, 20)) console.error(`  ${f}`);
    process.exit(2);
  }
  diffs.sort();
  console.log(
    `[lint-adversarial] compared ${files.length} patterns (oracle ${findingsO} / rsvelte ${findingsR} findings), ${diffs.length} divergence(s)`,
  );

  const known = fs.existsSync(KNOWN) ? JSON.parse(fs.readFileSync(KNOWN, "utf8")) : [];
  const knownSet = new Set(known);
  const current = new Set(diffs);
  const added = diffs.filter((d) => !knownSet.has(d));
  const removed = known.filter((d) => !current.has(d));

  if (UPDATE) {
    if (files.length < MIN_ENTRIES_FOR_UPDATE && !FILTER) {
      console.error(
        `[lint-adversarial] refusing --update over ${files.length} patterns (< ${MIN_ENTRIES_FOR_UPDATE}) — wrong checkout?`,
      );
      process.exit(2);
    }
    if (FILTER) {
      console.error("[lint-adversarial] refusing --update under --filter (would delete unmeasured entries)");
      process.exit(2);
    }
    fs.writeFileSync(KNOWN, JSON.stringify(diffs, null, "\t") + "\n");
    console.log(`[lint-adversarial] wrote ${diffs.length} entries to ${path.relative(ROOT, KNOWN)}`);
    return;
  }

  if (added.length > 0) {
    console.error(`\n[lint-adversarial] ❌ ${added.length} NEW divergence(s):`);
    for (const d of added.slice(0, SHOW)) console.error("  " + d.replace(/\t/g, " "));
    if (added.length > SHOW) console.error(`  … and ${added.length - SHOW} more`);
  }
  if (removed.length > 0 && !FILTER) {
    console.error(`\n[lint-adversarial] ❌ ${removed.length} ratchet entries no longer diverge (stale):`);
    for (const d of removed.slice(0, SHOW)) console.error("  " + d.replace(/\t/g, " "));
    console.error("\n  fix: node scripts/compat-corpus/lint-adversarial.mjs --update");
  }
  if (added.length > 0 || (removed.length > 0 && !FILTER)) process.exit(1);
  console.log("[lint-adversarial] ✅ parity");
}

main();
