#!/usr/bin/env node
/**
 * Default-configuration parity gate: what the two linters actually EMIT when a
 * user writes no configuration at all.
 *
 * Gate 33 (`lint-preset.mjs`) compares the two presets through `--list-rules`
 * and upstream's exported config object — the declared table, never a lint run
 * (gate-coverage blind spot 33b). Every other lint gate writes an explicit
 * all-rules-`"warn"` config on both sides, which makes three things constants
 * they cannot vary: each finding's SEVERITY, the process EXIT CODE, and whether
 * a rule the preset leaves `off` can still be turned on by an inline
 * `/* eslint … *\/` comment. This gate varies all three by running both tools
 * exactly as a user would.
 *
 * Compared per pattern under `compatibility/lint-adversarial/`:
 *
 *   1. `severity|` — a finding both sides report at the same position with the
 *      same message, at different levels. This is the reason the gate exists:
 *      severity decides the exit code in both tools, and gate 33 can only pin
 *      what the tables SAY, not what a run produces.
 *   2. `missing|` / `extra|` — findings on the rules both presets enable, so a
 *      preset-curation difference (gate 33's ratchet) cannot land here.
 *   3. `exit|` — the process exit code, with the error-severity rule ids /
 *      diagnostic codes of whichever side exits 1 in the key, so two different
 *      causes on one pattern cannot share an entry.
 *   4. `oracle-crash|` — a rule that THROWS in the oracle. Upstream reports it
 *      as a fatal message that counts toward `errorCount`, so it changes the
 *      exit code and is data, not a reason to abort.
 *
 * Oracle: `eslint-plugin-svelte`'s `flat/recommended`, verbatim, through
 * `lint-oracle/preset-run.mjs`. Subject: `rsvelte-lint --format sarif` with no
 * `--config`, ONE PROCESS PER PATTERN — the exit code is a property of a run,
 * so a batched run has no per-pattern answer to compare.
 *
 * Usage:
 *   node scripts/compat-corpus/lint-severity.mjs             # verify (CI gate)
 *   node scripts/compat-corpus/lint-severity.mjs --update    # rewrite ratchet
 *   node scripts/compat-corpus/lint-severity.mjs --show N    # print up to N diffs
 *   node scripts/compat-corpus/lint-severity.mjs --filter S  # only ids containing S
 */

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFile, execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { EXCLUDE } from "./lint-universe.mjs";
import { findBinary as findLintBinary, upstream, rsvelte } from "./lint-preset.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../..");
const SOURCES = path.join(ROOT, "compatibility", "lint-adversarial");
const KNOWN = path.join(ROOT, "compatibility", "lint-severity-known-failures.json");

const args = process.argv.slice(2);
const UPDATE = args.includes("--update");
const SHOW = args.includes("--show") ? Number(args[args.indexOf("--show") + 1] || 50) : 50;
const FILTER = args.includes("--filter") ? args[args.indexOf("--filter") + 1] : null;

// The committed tree IS the population; a near-empty walk means a wrong
// checkout, and `--update` over it would delete the rest of the ratchet.
const MIN_ENTRIES_FOR_UPDATE = 50;

const die = (msg) => {
  console.error(`[lint-severity] ❌ ${msg}`);
  process.exit(2);
};

function walk(dir) {
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...walk(p));
    else if (/\.(svelte|svelte\.js|svelte\.ts)$/.test(e.name)) out.push(p);
  }
  return out;
}

/**
 * `rsvelte-lint` with no `--config` walks UP from the working directory looking
 * for one. A config anywhere above the checkout would silently turn this gate
 * into a measurement of a configured run — green, and about a different product.
 */
function assertNoDiscoverableConfig() {
  const names = ["rsvelte-lint.json", ".rsvelte-lintrc.json"];
  for (let dir = ROOT; ; dir = path.dirname(dir)) {
    for (const name of names) {
      const candidate = path.join(dir, name);
      if (fs.existsSync(candidate)) {
        die(
          `${candidate} is discoverable from the repository root, so \`rsvelte-lint\` with no ` +
            `--config would resolve it instead of the \`recommended\` preset — this gate would ` +
            `measure a configured run`,
        );
      }
    }
    if (path.dirname(dir) === dir) return;
  }
}

function runOracle(files) {
  const out = execFileSync("node", ["lint-oracle/preset-run.mjs", "--stdin"], {
    cwd: __dirname,
    input: files.join("\0"),
    encoding: "utf8",
    maxBuffer: 1 << 28,
  });
  return new Map(JSON.parse(out).map((e) => [path.resolve(e.file), e]));
}

const SARIF_LEVEL = { error: "error", warning: "warn" };

/** One `rsvelte-lint` process per pattern, so each pattern has a real exit code. */
async function runRsvelte(bin, files) {
  const results = new Array(files.length);
  const one = (file) =>
    new Promise((resolve) => {
      execFile(
        bin,
        ["--format", "sarif", file],
        { cwd: ROOT, encoding: "utf8", maxBuffer: 1 << 26 },
        (err, stdout) => resolve({ code: err ? (err.code ?? 1) : 0, stdout }),
      );
    });
  let next = 0;
  await Promise.all(
    Array.from({ length: Math.max(2, os.cpus().length) }, async () => {
      for (;;) {
        const i = next++;
        if (i >= files.length) return;
        results[i] = await one(files[i]);
      }
    }),
  );

  const byFile = new Map();
  for (let i = 0; i < files.length; i++) {
    const { code, stdout } = results[i];
    let sarif;
    try {
      sarif = JSON.parse(stdout);
    } catch {
      die(`failed to parse rsvelte-lint SARIF output for ${path.relative(SOURCES, files[i])}`);
    }
    const messages = [];
    for (const run of sarif.runs || []) {
      for (const r of run.results || []) {
        const loc = r.locations?.[0]?.physicalLocation;
        messages.push({
          ruleId: r.ruleId ?? "unknown",
          line: loc?.region?.startLine ?? 1,
          column: loc?.region?.startColumn ?? 1,
          severity: SARIF_LEVEL[r.level] ?? r.level,
          message: r.message?.text ?? "",
        });
      }
    }
    byFile.set(path.resolve(files[i]), {
      code,
      messages,
      errorRules: [...new Set(messages.filter((m) => m.severity === "error").map((m) => m.ruleId))].sort(),
    });
  }
  return byFile;
}

const posKey = (m) => `${m.ruleId}\t${m.line}:${m.column}\t${m.message}`;

async function main() {
  const bin = findLintBinary();
  assertNoDiscoverableConfig();
  if (!fs.existsSync(SOURCES)) die(`${SOURCES} does not exist`);
  let files = walk(SOURCES).sort();
  if (FILTER) files = files.filter((f) => path.relative(SOURCES, f).includes(FILTER));
  if (files.length === 0) die("no pattern sources found");

  // The comparison population: rules BOTH presets enable by default, minus the
  // rules `lint-universe.mjs` excludes for a structural reason (type-aware,
  // option-required, compiler meta-rules). Restricting to the shared default-on
  // set is what keeps this gate from restating gate 33's ratchet as thousands of
  // finding-level entries — a preset-curation difference cannot land here.
  const u = upstream();
  const r = rsvelte(bin);
  const rAll = new Set(r.all);
  const shared = u.all.filter((id) => rAll.has(id));
  const uOn = (id) => (u.sev[id] ?? "off") !== "off";
  const rOn = (id) => (r.sev[id] ?? "off") !== "off";
  const compared = new Set(shared.filter((id) => uOn(id) && rOn(id) && !EXCLUDE.has(id)));
  // Rules OFF in both presets are the ones only an inline `/* eslint … */`
  // comment can reach, which is the third axis this gate holds (guard below).
  const offInBoth = new Set(shared.filter((id) => !uOn(id) && !rOn(id)));

  if (compared.size === 0) die("no rule is enabled by default on both sides — empty comparison population");
  if (compared.size === shared.length) {
    die(
      `every one of the ${shared.length} shared rules is default-on on both sides — the presets ` +
        `no longer differ, so restricting to the shared set measures nothing gate 28 does not`,
    );
  }
  if (offInBoth.size === 0) {
    die("no rule is off in both presets — the inline-enable axis has no population");
  }

  console.log(
    `[lint-severity] ${files.length} patterns; ${compared.size} rules default-on in both presets ` +
      `(${shared.length} shared, ${offInBoth.size} off in both)`,
  );

  const oracle = runOracle(files);
  const subject = await runRsvelte(bin, files);

  const diffs = [];
  let findingsO = 0;
  let findingsR = 0;
  let inlineEnabled = 0;
  let crashedPatterns = 0;
  const sevSeen = { oracle: new Set(), rsvelte: new Set() };

  for (const file of files) {
    const abs = path.resolve(file);
    const id = path.relative(SOURCES, abs);
    const o = oracle.get(abs);
    const s = subject.get(abs);
    if (!o || o.readError) die(`the oracle returned no result for ${id}`);

    // A crashed oracle produced no report at all, so this pattern has no
    // findings and no exit code to compare — the crash IS the entry.
    if (o.crashed.length > 0) {
      for (const c of o.crashed) diffs.push(`oracle-crash|${id}|${c.rule ?? "unknown"}`);
      crashedPatterns++;
      continue;
    }

    const oIn = o.messages.filter((m) => compared.has(m.ruleId));
    const sIn = s.messages.filter((m) => compared.has(m.ruleId));
    findingsO += oIn.length;
    findingsR += sIn.length;
    for (const m of oIn) sevSeen.oracle.add(m.severity);
    for (const m of sIn) sevSeen.rsvelte.add(m.severity);

    // A rule off in BOTH presets that still reports on both sides can only have
    // been enabled by an inline configuration comment in the pattern itself.
    for (const m of o.messages) if (offInBoth.has(m.ruleId)) inlineEnabled++;

    const oByPos = new Map(oIn.map((m) => [posKey(m), m]));
    const sByPos = new Map(sIn.map((m) => [posKey(m), m]));
    for (const [k, om] of oByPos) {
      const sm = sByPos.get(k);
      if (!sm) diffs.push(`missing|${id}|${k}`);
      else if (sm.severity !== om.severity)
        diffs.push(`severity|${id}|${om.ruleId} ${om.line}:${om.column}|${om.severity}->${sm.severity}`);
    }
    for (const [k] of sByPos) if (!oByPos.has(k)) diffs.push(`extra|${id}|${k}`);

    const oExit = o.errorCount > 0 ? 1 : 0;
    if (oExit !== s.code) {
      const cause = (oExit === 1 ? o.errorRules : s.errorRules).join(",");
      diffs.push(`exit|${id}|${oExit}->${s.code}|${cause}`);
    }
  }

  // Positive controls. Severity is the point of this gate, and a run in which
  // every finding on one side carries the same level cannot tell a severity
  // divergence from agreement — the comparison would be green because the
  // measurand is constant, not because the two tools agree.
  // Skipped under `--filter`, which is a triage flag: a subset can legitimately
  // hold one severity, and a filtered run already cannot move the baseline.
  for (const side of FILTER ? [] : ["oracle", "rsvelte"]) {
    if (sevSeen[side].size < 2) {
      die(
        `every ${side} finding is "${[...sevSeen[side]][0] ?? "(none)"}" — severity is a constant in ` +
          `this run, so a severity divergence could not be observed`,
      );
    }
  }
  if (inlineEnabled === 0 && !FILTER) {
    die(
      "no pattern reports a rule both presets leave off — nothing here exercises an inline " +
        "`/* eslint … */` comment enabling a preset-off rule, and that axis would be untested",
    );
  }

  diffs.sort();
  const byClass = {};
  for (const d of diffs) byClass[d.split("|")[0]] = (byClass[d.split("|")[0]] ?? 0) + 1;
  console.log(
    `[lint-severity] compared ${files.length - crashedPatterns} of ${files.length} patterns ` +
      `(oracle ${findingsO} / rsvelte ${findingsR} ` +
      `findings on the shared default-on set; ${inlineEnabled} inline-enabled), ` +
      `${diffs.length} divergence(s): ${JSON.stringify(byClass)}`,
  );

  const known = fs.existsSync(KNOWN) ? JSON.parse(fs.readFileSync(KNOWN, "utf8")) : [];
  const knownSet = new Set(known);
  const current = new Set(diffs);
  const added = diffs.filter((d) => !knownSet.has(d));
  const removed = known.filter((d) => !current.has(d));

  if (UPDATE) {
    if (FILTER) die("refusing --update under --filter (would delete unmeasured entries)");
    if (files.length < MIN_ENTRIES_FOR_UPDATE) {
      die(`refusing --update over ${files.length} patterns (< ${MIN_ENTRIES_FOR_UPDATE}) — wrong checkout?`);
    }
    fs.writeFileSync(KNOWN, JSON.stringify(diffs, null, "\t") + "\n");
    console.log(`[lint-severity] wrote ${diffs.length} entries to ${path.relative(ROOT, KNOWN)}`);
    return;
  }

  if (added.length > 0) {
    console.error(`\n[lint-severity] ❌ ${added.length} NEW divergence(s):`);
    for (const d of added.slice(0, SHOW)) console.error("  " + d.replace(/\t/g, " "));
    if (added.length > SHOW) console.error(`  … and ${added.length - SHOW} more`);
  }
  if (removed.length > 0 && !FILTER) {
    console.error(`\n[lint-severity] ❌ ${removed.length} ratchet entries no longer diverge (stale):`);
    for (const d of removed.slice(0, SHOW)) console.error("  " + d.replace(/\t/g, " "));
    console.error("\n  fix: node scripts/compat-corpus/lint-severity.mjs --update");
  }
  if (added.length > 0 || (removed.length > 0 && !FILTER)) process.exit(1);
  console.log("[lint-severity] ✅ default-configuration parity");
}

await main();
