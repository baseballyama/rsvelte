#!/usr/bin/env node
/**
 * Default-preset parity gate.
 *
 * Every other lint gate in this project configures all 74 shared rules to
 * `"warn"` explicitly on both sides, so what a user gets with NO config is a
 * variable none of them holds. That is not a detail: `rsvelte-lint` with no
 * config file resolves the `recommended` preset, and a drop-in replacement for
 * `eslint-plugin-svelte` whose default rule set differs reports a different set
 * of problems on the very first run — a difference no rule port can be blamed
 * for and no finding-level comparison can observe.
 *
 * Compared unit: the DEFAULT SEVERITY (`off` / `warn` / `error`), per rule id,
 * over the intersection of rsvelte's rule list with eslint-plugin-svelte's
 * rules. Upstream's default is its `flat/recommended` config; rsvelte's is each
 * rule's declared `default_severity` as printed by `--list-rules`.
 *
 * Severity is in the key rather than folded into on/off, because it decides the
 * CLI's exit code and because a membership-only key hid 21 rules that upstream
 * defaults to `error` and rsvelte to `warn`.
 *
 * Shared rule defaults are expected to match. Set membership is recorded as a
 * separate key class because rsvelte also carries standalone rules that ESLint
 * normally supplies outside eslint-plugin-svelte, while two upstream entries
 * need facilities the native engine does not yet expose. Any remaining
 * divergence must be recorded and justified in the paired `.md`.
 *
 * Usage:
 *   node scripts/compat-corpus/lint-preset.mjs           # verify (CI gate)
 *   node scripts/compat-corpus/lint-preset.mjs --update  # rewrite ratchet
 */

import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../..");
const KNOWN = path.join(ROOT, "compatibility", "lint-preset-known-failures.json");
const ORACLE_DIR = path.join(__dirname, "lint-oracle");

const UPDATE = process.argv.includes("--update");

export function findBinary() {
  for (const profile of ["dist-lint", "release", "debug"]) {
    const p = path.join(ROOT, "target", profile, "rsvelte-lint");
    if (fs.existsSync(p)) return p;
  }
  console.error("[lint-preset] rsvelte-lint binary not found; run `cargo build --bin rsvelte-lint`");
  process.exit(2);
}

const SEVERITIES = ["off", "warn", "error"];

/** Upstream's rule universe and the severity its `flat/recommended` gives each. */
export function upstream() {
  const script = `
    import('eslint-plugin-svelte').then((m) => {
      const p = m.default;
      const sev = {};
      const norm = { 0: 'off', 1: 'warn', 2: 'error' };
      for (const c of p.configs['flat/recommended']) {
        for (const [id, s] of Object.entries(c.rules || {})) {
          sev[id] = norm[s] ?? (Array.isArray(s) ? (norm[s[0]] ?? String(s[0])) : String(s));
        }
      }
      process.stdout.write(JSON.stringify({
        all: Object.keys(p.rules).map((r) => 'svelte/' + r).sort(),
        sev,
      }));
    });
  `;
  return JSON.parse(execFileSync("node", ["-e", script], { cwd: ORACLE_DIR, encoding: "utf8" }));
}

/** rsvelte's rule list and the severity its `recommended` preset gives each. */
export function rsvelte(bin) {
  const out = execFileSync(bin, ["--list-rules"], { encoding: "utf8" });
  const all = [];
  const sev = {};
  for (const line of out.split("\n")) {
    const m = /^(svelte\/[a-z0-9-]+)\s+\[([^\]]+)\]/.exec(line);
    if (!m) continue;
    all.push(m[1]);
    const fields = m[2].split(",").map((s) => s.trim());
    const found = SEVERITIES.filter((s) => fields.includes(s));
    if (found.length !== 1) {
      console.error(
        `[lint-preset] ❌ cannot read a severity for ${m[1]} from "[${m[2]}]" — ` +
          `--list-rules changed shape, and a silently unparsed line would drop the rule from the comparison`,
      );
      process.exit(2);
    }
    sev[m[1]] = found[0];
  }
  return { all: all.sort(), sev };
}

function main() {
  const bin = findBinary();
  const u = upstream();
  const r = rsvelte(bin);

  const uAll = new Set(u.all);
  const rAll = new Set(r.all);
  const shared = r.all.filter((id) => uAll.has(id));
  // A rule upstream ships but its recommended preset omits is `off`, not absent.
  const uSev = (id) => u.sev[id] ?? "off";
  const rSev = (id) => r.sev[id] ?? "off";

  // A gate that compares nothing is a green gate. Both sides must have ported
  // rules in common, and each side must actually turn some of them off — a
  // preset that enables everything would make membership a constant.
  if (shared.length === 0) {
    console.error("[lint-preset] ❌ no rule ids in common — the comparison has an empty population");
    process.exit(2);
  }
  const uOffShared = shared.filter((id) => uSev(id) === "off").length;
  const rOffShared = shared.filter((id) => rSev(id) === "off").length;
  if (uOffShared === 0 || rOffShared === 0) {
    console.error(
      `[lint-preset] ❌ one side's preset enables every shared rule (upstream off ${uOffShared}, ` +
        `rsvelte off ${rOffShared}) — default membership is a constant and this gate measures nothing`,
    );
    process.exit(2);
  }

  // The severity is IN the key, not folded into on/off. A ratchet entry
  // suppresses everything its key cannot tell apart, and `error` vs `warn`
  // decides the CLI's exit code — 21 rules diverged that way underneath a
  // membership-only key that reported them as agreeing.
  const diffs = [];
  for (const id of shared) {
    if (uSev(id) !== rSev(id)) diffs.push(`${uSev(id)}->${rSev(id)}|${id}`);
  }
  // A rule only one side has is not a preset divergence, but it IS a coverage
  // fact that should not move silently, so it gets its own key class.
  for (const id of u.all) if (!rAll.has(id)) diffs.push(`not-ported|${id}`);
  for (const id of r.all) if (!uAll.has(id)) diffs.push(`rsvelte-only|${id}`);
  diffs.sort();

  const tally = (sev, side) => shared.filter((id) => side(id) === sev).length;
  console.log(
    `[lint-preset] ${shared.length} shared rules; ` +
      `upstream off/warn/error ${tally("off", uSev)}/${tally("warn", uSev)}/${tally("error", uSev)}, ` +
      `rsvelte ${tally("off", rSev)}/${tally("warn", rSev)}/${tally("error", rSev)}; ` +
      `${diffs.length} recorded difference(s)`,
  );

  const known = fs.existsSync(KNOWN) ? JSON.parse(fs.readFileSync(KNOWN, "utf8")) : [];
  const knownSet = new Set(known);
  const current = new Set(diffs);
  const added = diffs.filter((d) => !knownSet.has(d));
  const removed = known.filter((d) => !current.has(d));

  if (UPDATE) {
    fs.writeFileSync(KNOWN, JSON.stringify(diffs, null, "\t") + "\n");
    console.log(`[lint-preset] wrote ${diffs.length} entries to ${path.relative(ROOT, KNOWN)}`);
    return;
  }
  if (added.length > 0) {
    console.error(`\n[lint-preset] ❌ ${added.length} NEW difference(s) — decide and justify each in the paired .md:`);
    for (const d of added) console.error("  " + d);
  }
  if (removed.length > 0) {
    console.error(`\n[lint-preset] ❌ ${removed.length} recorded difference(s) no longer hold (stale):`);
    for (const d of removed) console.error("  " + d);
    console.error("\n  fix: node scripts/compat-corpus/lint-preset.mjs --update");
  }
  if (added.length > 0 || removed.length > 0) process.exit(1);
  console.log("[lint-preset] ✅ default preset matches the recorded compatibility state");
}

// `lint-severity.mjs` imports the two preset readers above; importing must not
// run the gate, or that gate's `process.exit(1)` would fire during the import.
if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) main();
