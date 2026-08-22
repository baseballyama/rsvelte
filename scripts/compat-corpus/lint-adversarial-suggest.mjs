#!/usr/bin/env node
/**
 * Suggestion parity gate over the adversarial pattern corpus.
 *
 * A suggestion is an editor-offered code action that `--fix` never applies, so
 * it appears in NO other comparison this project runs: `lint-adversarial.mjs`
 * and `lint-verify.mjs` key on (ruleId, line, column, message), and
 * `lint-adversarial-fix.mjs` compares the text `--fix` produces — which by
 * definition excludes every suggestion. Upstream's own RuleTester fixtures do
 * compare `{desc, output}` pairs, but only for the shapes upstream ships and
 * only for the fixtures `eslint_plugin_oracle.rs` does not skip.
 *
 * Comparison, per finding position: the ordered list of
 * `{desc, output-after-applying-that-one-suggestion}`. Comparing the resulting
 * TEXT rather than the edit range is deliberate — ESLint's ranges are UTF-16
 * code units into a JS string and rsvelte's are UTF-8 byte offsets, so equal
 * edits have unequal coordinates, and a coordinate comparison would report a
 * divergence on every non-ASCII file.
 *
 * Usage:
 *   node scripts/compat-corpus/lint-adversarial-suggest.mjs           # verify (CI gate)
 *   node scripts/compat-corpus/lint-adversarial-suggest.mjs --update  # rewrite ratchet
 *   node scripts/compat-corpus/lint-adversarial-suggest.mjs --show N
 *   node scripts/compat-corpus/lint-adversarial-suggest.mjs --filter S
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
const KNOWN = path.join(ROOT, "compatibility", "lint-adversarial-suggest-known-failures.json");

const args = process.argv.slice(2);
const UPDATE = args.includes("--update");
const SHOW = args.includes("--show") ? Number(args[args.indexOf("--show") + 1] || 40) : 40;
const FILTER = args.includes("--filter") ? args[args.indexOf("--filter") + 1] : null;
// The corpus holds ~1000 patterns; a run over a fraction of that is a wrong
// checkout or a bad filter, and `--update` deletes every entry it did not measure.
const MIN_FILES_FOR_UPDATE = 800;

function findBinary() {
  for (const profile of ["dist-lint", "release", "debug"]) {
    const p = path.join(ROOT, "target", profile, "rsvelte-lint");
    if (fs.existsSync(p)) return p;
  }
  console.error("[lint-adversarial-suggest] rsvelte-lint binary not found; run `cargo build --bin rsvelte-lint`");
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

/** Apply one edit list to `source`, right-to-left so earlier offsets stay valid. */
function applyEdits(source, edits) {
  let out = source;
  for (const e of [...edits].sort((a, b) => b.start - a.start)) {
    out = out.slice(0, e.start) + e.text + out.slice(e.end);
  }
  return out;
}

/** The same, over a Buffer, for rsvelte's UTF-8 byte offsets. */
function applyByteEdits(buf, edits) {
  let out = buf;
  for (const e of [...edits].sort((a, b) => b.start - a.start)) {
    out = Buffer.concat([out.subarray(0, e.start), Buffer.from(e.text, "utf8"), out.subarray(e.end)]);
  }
  return out.toString("utf8");
}

function oracleSuggestions(files, universe) {
  const rulesFile = path.join(os.tmpdir(), `rsvelte-suggest-rules-${process.pid}.json`);
  fs.writeFileSync(rulesFile, JSON.stringify(universe));
  let raw;
  try {
    raw = execFileSync("node", ["lint-oracle/run.mjs", "--rules", rulesFile, "--suggestions", "--stdin"], {
      cwd: path.join(ROOT, "scripts", "compat-corpus"),
      input: files.join("\0"),
      encoding: "utf8",
      maxBuffer: 1 << 29,
    });
  } finally {
    fs.rmSync(rulesFile, { force: true });
  }
  const byFile = new Map();
  for (const entry of JSON.parse(raw)) {
    const abs = path.resolve(entry.file);
    if (entry.fatal) {
      byFile.set(abs, { fatal: entry.fatal });
      continue;
    }
    const source = fs.readFileSync(abs, "utf8");
    const map = new Map();
    for (const m of entry.messages) {
      if (!m.suggestions || m.suggestions.length === 0) continue;
      map.set(`${m.ruleId} ${m.line}:${m.column}`, {
        rendered: m.suggestions.map((sg) => ({
          desc: sg.desc,
          output: applyEdits(source, [{ start: sg.range[0], end: sg.range[1], text: sg.text }]),
        })),
      });
    }
    byFile.set(abs, { map });
  }
  return byFile;
}

function rsvelteSuggestions(files, bin, universe) {
  const cfgFile = path.join(os.tmpdir(), `rsvelte-suggest-config-${process.pid}.json`);
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
    // A non-zero exit means findings were reported, which is the normal case.
    out = err.stdout || "";
  } finally {
    fs.rmSync(cfgFile, { force: true });
  }
  const byFile = new Map(files.map((f) => [f, new Map()]));
  const buffers = new Map();
  for (const run of JSON.parse(out).runs || []) {
    for (const r of run.results || []) {
      const sgs = r.properties?.suggestions;
      if (!sgs || sgs.length === 0) continue;
      const loc = r.locations?.[0]?.physicalLocation;
      const abs = path.resolve(loc.artifactLocation.uri.replace(/^file:\/\//, ""));
      if (!byFile.has(abs)) continue;
      if (!buffers.has(abs)) buffers.set(abs, fs.readFileSync(abs));
      const line = loc.region?.startLine ?? 1;
      const col = loc.region?.startColumn ?? 1;
      byFile.get(abs).set(`${r.ruleId} ${line}:${col}`, {
        rendered: sgs.map((sg) => ({ desc: sg.desc, output: applyByteEdits(buffers.get(abs), sg.edits) })),
      });
    }
  }
  return byFile;
}

function main() {
  const bin = findBinary();
  const universe = ruleUniverse(bin);
  let files = walk(SOURCES).sort();
  if (FILTER) files = files.filter((f) => path.relative(SOURCES, f).includes(FILTER));
  if (files.length === 0) {
    console.error("[lint-adversarial-suggest] no patterns matched");
    process.exit(2);
  }

  const oracle = oracleSuggestions(files, universe);
  const rsvelte = rsvelteSuggestions(files, bin, universe);

  const diffs = [];
  const fatal = [];
  let positions = 0;
  let oracleSugs = 0;
  let rsvelteSugs = 0;
  for (const f of files) {
    const id = path.relative(SOURCES, f);
    const o = oracle.get(f);
    if (!o) {
      fatal.push(`${id} (oracle returned no result)`);
      continue;
    }
    if (o.fatal) {
      fatal.push(`${id} (oracle parse error: ${o.fatal})`);
      continue;
    }
    const r = rsvelte.get(f) ?? new Map();
    for (const v of o.map.values()) oracleSugs += v.rendered.length;
    for (const v of r.values()) rsvelteSugs += v.rendered.length;
    for (const key of new Set([...o.map.keys(), ...r.keys()])) {
      positions++;
      const a = JSON.stringify(o.map.get(key)?.rendered ?? []);
      const b = JSON.stringify(r.get(key)?.rendered ?? []);
      if (a !== b) diffs.push(`${id}|${key}`);
    }
  }

  if (fatal.length > 0) {
    console.error(`[lint-adversarial-suggest] ❌ ${fatal.length} pattern(s) the oracle could not measure:`);
    for (const f of fatal.slice(0, 20)) console.error(`  ${f}`);
    process.exit(2);
  }
  diffs.sort();
  console.log(
    `[lint-adversarial-suggest] compared ${positions} suggestion-bearing positions over ${files.length} patterns ` +
      `(oracle ${oracleSugs} suggestions, rsvelte ${rsvelteSugs}), ${diffs.length} divergence(s)`,
  );

  const known = fs.existsSync(KNOWN) ? JSON.parse(fs.readFileSync(KNOWN, "utf8")) : [];
  const knownSet = new Set(known);
  const current = new Set(diffs);
  const added = diffs.filter((d) => !knownSet.has(d));
  const removed = known.filter((d) => !current.has(d));

  if (UPDATE) {
    if (FILTER) {
      console.error("[lint-adversarial-suggest] refusing --update under --filter (would delete unmeasured entries)");
      process.exit(2);
    }
    if (files.length < MIN_FILES_FOR_UPDATE) {
      console.error(
        `[lint-adversarial-suggest] refusing --update over ${files.length} patterns (< ${MIN_FILES_FOR_UPDATE}) — wrong checkout?`,
      );
      process.exit(2);
    }
    fs.writeFileSync(KNOWN, JSON.stringify(diffs, null, "\t") + "\n");
    console.log(`[lint-adversarial-suggest] wrote ${diffs.length} entries to ${path.relative(ROOT, KNOWN)}`);
    return;
  }

  if (added.length > 0) {
    console.error(`\n[lint-adversarial-suggest] ❌ ${added.length} NEW suggestion divergence(s):`);
    for (const d of added.slice(0, SHOW)) console.error("  " + d);
    if (added.length > SHOW) console.error(`  … and ${added.length - SHOW} more`);
  }
  if (removed.length > 0 && !FILTER) {
    console.error(`\n[lint-adversarial-suggest] ❌ ${removed.length} ratchet entries no longer diverge (stale):`);
    for (const d of removed.slice(0, SHOW)) console.error("  " + d);
    console.error("\n  fix: node scripts/compat-corpus/lint-adversarial-suggest.mjs --update");
  }
  if (added.length > 0 || (removed.length > 0 && !FILTER)) process.exit(1);
  console.log("[lint-adversarial-suggest] ✅ suggestion parity");
}

main();
