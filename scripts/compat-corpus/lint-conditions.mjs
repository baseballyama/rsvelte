#!/usr/bin/env node
/**
 * Rule-condition parity gate.
 *
 * `eslint-plugin-svelte` decides whether a rule runs at all from `meta.conditions`
 * — an array of objects, satisfied if ANY of them matches the file's Svelte
 * version, runes mode, SvelteKit version and file type. rsvelte mirrors the runes
 * axis in `RuleMeta::conditions` (`RuleConditions { runes_only, legacy_only }`).
 *
 * Nothing compared the two. A wrong flag is invisible to every finding-level gate
 * unless the corpus happens to contain a file in the mode the flag wrongly
 * excludes — and for a rule whose patterns are all one mode, that is never. Three
 * wrong flags were found by hand before this gate existed (`no-inspect`,
 * `prefer-derived-over-derived-by`, `experimental-require-slot-types`), each of
 * which made rsvelte run a rule ESLint would have skipped.
 *
 * Compared unit: the pair (runs-in-runes-mode, runs-in-legacy-mode) per rule id.
 *
 * Upstream's side is derived, not transcribed: only condition objects whose
 * `svelteVersions` admits `'5'` are reachable, because rsvelte is a Svelte 5
 * compiler and upstream's own `getSvelteVersion()` reads the `svelte` package the
 * plugin resolves. Unioning across ALL objects instead — including ones gated on
 * `svelteVersions: ['3/4']`, which can never be satisfied here — makes six
 * correctly-gated rules look wrong, which is exactly what the first draft of this
 * comparison did.
 *
 * Usage:
 *   node scripts/compat-corpus/lint-conditions.mjs           # verify (CI gate)
 *   node scripts/compat-corpus/lint-conditions.mjs --update  # rewrite ratchet
 */

import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../..");
const RULES_DIR = path.join(ROOT, "crates", "rsvelte_lint", "src", "rules");
const KNOWN = path.join(ROOT, "compatibility", "lint-conditions-known-failures.json");
const ORACLE_DIR = path.join(__dirname, "lint-oracle");

const UPDATE = process.argv.includes("--update");

function findBinary() {
  for (const profile of ["dist-lint", "release", "debug"]) {
    const p = path.join(ROOT, "target", profile, "rsvelte-lint");
    if (fs.existsSync(p)) return p;
  }
  console.error("[lint-conditions] rsvelte-lint binary not found; run `cargo build --bin rsvelte-lint`");
  process.exit(2);
}

/** `meta.conditions` for every upstream rule, verbatim. */
function upstreamConditions() {
  const script = `
    import('eslint-plugin-svelte').then((m) => {
      const out = {};
      for (const [name, rule] of Object.entries(m.default.rules)) {
        out['svelte/' + name] = rule?.meta?.conditions ?? null;
      }
      process.stdout.write(JSON.stringify(out));
    });
  `;
  return JSON.parse(execFileSync("node", ["-e", script], { cwd: ORACLE_DIR, encoding: "utf8" }));
}

/**
 * Which runes states upstream would run this rule in, on Svelte 5.
 *
 * `shouldRun` is an OR over condition objects, and an object with no `runes` key
 * constrains nothing on that axis — so the union is over the objects that are
 * REACHABLE at Svelte 5, not over all of them.
 */
function upstreamGate(conditions) {
  if (!conditions) return { runesOnly: false, legacyOnly: false, reachable: true };
  const reachable = conditions.filter((o) => !o.svelteVersions || o.svelteVersions.includes("5"));
  if (reachable.length === 0) return { runesOnly: false, legacyOnly: false, reachable: false };
  const allowed = new Set();
  for (const o of reachable) {
    for (const v of o.runes ?? [true, false, "undetermined"]) allowed.add(String(v));
  }
  return { runesOnly: !allowed.has("false"), legacyOnly: !allowed.has("true"), reachable: true };
}

/**
 * Rules upstream will not run outside a SvelteKit project, at Svelte 5.
 *
 * `svelteKitFileType` is only computed once a version is known, so a
 * `svelteKitFileTypes` condition also requires SvelteKit — both keys count.
 */
function upstreamKitOnly(up) {
  return Object.entries(up)
    .filter(([, c]) => {
      if (!c) return false;
      const reachable = c.filter((o) => !o.svelteVersions || o.svelteVersions.includes("5"));
      return reachable.length > 0 && reachable.every((o) => o.svelteKitVersions || o.svelteKitFileTypes);
    })
    .map(([id]) => id)
    .sort();
}

/** The rule names `crates/rsvelte_lint/src/sveltekit.rs` hard-codes. */
function rsvelteKitOnly() {
  const src = fs.readFileSync(path.join(ROOT, "crates", "rsvelte_lint", "src", "sveltekit.rs"), "utf8");
  const block = /const SVELTEKIT_ONLY: &\[&str\] = &\[([\s\S]*?)\];/.exec(src);
  if (!block) {
    console.error("[lint-conditions] ❌ could not read SVELTEKIT_ONLY from sveltekit.rs");
    process.exit(2);
  }
  return [...block[1].matchAll(/"(svelte\/[a-z0-9-]+)"/g)].map((m) => m[1]).sort();
}

/** rsvelte's declared `RuleConditions`, read from each rule module's `META`. */
function rsvelteConditions(bin) {
  const out = {};
  for (const f of fs.readdirSync(RULES_DIR)) {
    if (!f.endsWith(".rs")) continue;
    const text = fs.readFileSync(path.join(RULES_DIR, f), "utf8");
    const name = /name:\s*"(svelte\/[a-z0-9-]+)"/.exec(text);
    if (!name) continue;
    const ro = /runes_only:\s*(true|false)/.exec(text);
    const lo = /legacy_only:\s*(true|false)/.exec(text);
    if (!ro || !lo) {
      console.error(
        `[lint-conditions] ❌ ${f} declares ${name[1]} but no runes_only/legacy_only pair could be read — ` +
          `a rule this parse misses would silently drop out of the comparison`,
      );
      process.exit(2);
    }
    out[name[1]] = { file: f, runesOnly: ro[1] === "true", legacyOnly: lo[1] === "true" };
  }

  // The source parse above is a regex over Rust, so it is guarded by the CLI's
  // own rule list: a rule the binary reports and the parse missed is a hole in
  // the comparison, not a rule without conditions.
  const listed = execFileSync(bin, ["--list-rules"], { encoding: "utf8", maxBuffer: 1 << 24 })
    .split("\n")
    .map((l) => /^(svelte\/[a-z0-9-]+)/.exec(l))
    .filter(Boolean)
    .map((m) => m[1]);
  const missed = listed.filter((id) => !(id in out));
  if (missed.length > 0) {
    console.error(
      `[lint-conditions] ❌ ${missed.length} rule(s) the binary lists were not found by the source parse: ` +
        `${missed.join(", ")}`,
    );
    process.exit(2);
  }
  return out;
}

function main() {
  const bin = findBinary();
  const up = upstreamConditions();
  const mine = rsvelteConditions(bin);

  const shared = Object.keys(mine).filter((id) => id in up);
  if (shared.length === 0) {
    console.error("[lint-conditions] ❌ no rule ids in common — the comparison has an empty population");
    process.exit(2);
  }

  const diffs = [];
  let gated = 0;
  for (const id of shared.sort()) {
    const u = upstreamGate(up[id]);
    const m = mine[id];
    if (u.runesOnly || u.legacyOnly || !u.reachable) gated++;
    if (!u.reachable) {
      // Upstream cannot run this rule on Svelte 5 in ANY mode. rsvelte has no
      // way to express that, so it is a class of its own rather than a flag
      // mismatch — see the paired .md.
      diffs.push(`svelte-3-4-only|${id}`);
      continue;
    }
    if (u.runesOnly !== m.runesOnly || u.legacyOnly !== m.legacyOnly) {
      diffs.push(
        `gate|${id}|upstream runes_only=${u.runesOnly} legacy_only=${u.legacyOnly}` +
          ` rsvelte runes_only=${m.runesOnly} legacy_only=${m.legacyOnly}`,
      );
    }
  }
  // The SvelteKit axis lives in a hard-coded list rather than in RuleConditions,
  // so it needs its own comparison or a rule joining/leaving upstream's gated set
  // would go unnoticed.
  const upKit = upstreamKitOnly(up);
  const myKit = rsvelteKitOnly();
  for (const id of upKit) if (!myKit.includes(id)) diffs.push(`kit-gate-missing|${id}`);
  for (const id of myKit) if (!upKit.includes(id)) diffs.push(`kit-gate-extra|${id}`);
  if (upKit.length === 0) {
    console.error(
      "[lint-conditions] ❌ upstream gates no rule on SvelteKit — the kit comparison is vacuous, " +
        "which means the conditions were not read, not that the lists agree",
    );
    process.exit(2);
  }

  diffs.sort();

  // A comparison where no rule is gated at all would pass trivially: every rule
  // would be {false,false} on both sides and agree by construction.
  if (gated === 0) {
    console.error(
      "[lint-conditions] ❌ upstream gates none of the shared rules — the comparison is vacuous, " +
        "which means the conditions were not read, not that they agree",
    );
    process.exit(2);
  }

  console.log(
    `[lint-conditions] ${shared.length} shared rules, ${gated} runes-gated by upstream on Svelte 5, ` +
      `${upKit.length} SvelteKit-gated; ${diffs.length} divergence(s)`,
  );

  const known = fs.existsSync(KNOWN) ? JSON.parse(fs.readFileSync(KNOWN, "utf8")) : [];
  const knownSet = new Set(known);
  const current = new Set(diffs);
  const added = diffs.filter((d) => !knownSet.has(d));
  const removed = known.filter((d) => !current.has(d));

  if (UPDATE) {
    fs.writeFileSync(KNOWN, JSON.stringify(diffs, null, "\t") + "\n");
    console.log(`[lint-conditions] wrote ${diffs.length} entries to ${path.relative(ROOT, KNOWN)}`);
    return;
  }
  if (added.length > 0) {
    console.error(`\n[lint-conditions] ❌ ${added.length} NEW divergence(s):`);
    for (const d of added) console.error("  " + d);
  }
  if (removed.length > 0) {
    console.error(`\n[lint-conditions] ❌ ${removed.length} entries no longer diverge (stale):`);
    for (const d of removed) console.error("  " + d);
    console.error("\n  fix: node scripts/compat-corpus/lint-conditions.mjs --update");
  }
  if (added.length > 0 || removed.length > 0) process.exit(1);
  console.log("[lint-conditions] ✅ rule conditions match upstream");
}

main();
