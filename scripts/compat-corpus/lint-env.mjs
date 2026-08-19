#!/usr/bin/env node
/**
 * Environment parity gate: the same sources, different project manifests.
 *
 * Every other lint gate compares a population that shares one ancestry, so
 * "is SvelteKit installed" is a constant it can never vary. eslint-plugin-svelte
 * resolves `@sveltejs/kit` from the LINTED FILE'S PATH and disables five rules
 * when it finds none, which makes that constant a blind spot rather than a
 * detail: rsvelte reported all five in a project without SvelteKit and no gate
 * could see it, because `compatibility/lint-adversarial/package.json` declares
 * `@sveltejs/kit` for the entire adversarial corpus.
 *
 * Each directory under `compatibility/lint-env/` is a self-contained project
 * whose sources are identical to its siblings' — the manifest is the only
 * variable, so a divergence is attributable to the environment.
 *
 * A finding is counted with a `project/` prefix, so the SAME source file
 * compared under two manifests yields two independently ratcheted keys.
 *
 * Usage:
 *   node scripts/compat-corpus/lint-env.mjs           # verify (CI gate)
 *   node scripts/compat-corpus/lint-env.mjs --update  # rewrite ratchet
 *   node scripts/compat-corpus/lint-env.mjs --show N
 */

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { ruleUniverse } from "./lint-universe.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../..");
const SOURCES = path.join(ROOT, "compatibility", "lint-env");
const KNOWN = path.join(ROOT, "compatibility", "lint-env-known-failures.json");

const args = process.argv.slice(2);
const UPDATE = args.includes("--update");
const SHOW = args.includes("--show") ? Number(args[args.indexOf("--show") + 1] || 40) : 40;

function findBinary() {
  for (const profile of ["dist-lint", "release", "debug"]) {
    const p = path.join(ROOT, "target", profile, "rsvelte-lint");
    if (fs.existsSync(p)) return p;
  }
  console.error("[lint-env] rsvelte-lint binary not found; run `cargo build --bin rsvelte-lint`");
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

const key = (r, l, c, m) => `${r}\t${l}:${c}\t${m}`;

function main() {
  const bin = findBinary();
  const universe = ruleUniverse(bin);
  const uni = new Set(universe);

  const projects = fs
    .readdirSync(SOURCES, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .sort();
  if (projects.length < 2) {
    console.error("[lint-env] fewer than two projects — the gate's whole point is comparing manifests");
    process.exit(2);
  }

  // The identical-sources invariant is what makes a divergence attributable to
  // the manifest, so it is asserted rather than assumed.
  const shape = new Map();
  for (const p of projects) {
    for (const f of walk(path.join(SOURCES, p))) {
      const rel = path.relative(path.join(SOURCES, p), f);
      const text = fs.readFileSync(f, "utf8");
      if (!shape.has(rel)) shape.set(rel, { text, from: p });
      else if (shape.get(rel).text !== text) {
        console.error(
          `[lint-env] ${p}/${rel} differs from ${shape.get(rel).from}/${rel} — ` +
            `sources must be identical across projects or the gate measures the sources, not the environment`,
        );
        process.exit(2);
      }
    }
  }

  const rulesFile = path.join(os.tmpdir(), `rsvelte-env-rules-${process.pid}.json`);
  fs.writeFileSync(rulesFile, JSON.stringify(universe));
  const cfgFile = path.join(os.tmpdir(), `rsvelte-env-config-${process.pid}.json`);
  fs.writeFileSync(
    cfgFile,
    JSON.stringify({ extends: ["none"], rules: Object.fromEntries(universe.map((id) => [id, "warn"])) }),
  );

  const diffs = [];
  const perProject = new Map();
  let compared = 0;
  let oCount = 0;
  let rCount = 0;
  try {
    for (const project of projects) {
      const dir = path.join(SOURCES, project);
      const files = walk(dir).sort();
      if (files.length === 0) continue;

      const oracle = new Map();
      for (const entry of JSON.parse(
        execFileSync("node", ["lint-oracle/run.mjs", "--rules", rulesFile, "--stdin"], {
          cwd: path.join(ROOT, "scripts", "compat-corpus"),
          input: files.join("\0"),
          encoding: "utf8",
          maxBuffer: 1 << 28,
        }),
      )) {
        if (entry.fatal) {
          console.error(`[lint-env] ❌ ${project}/${path.relative(dir, entry.file)} (oracle: ${entry.fatal})`);
          process.exit(2);
        }
        oracle.set(
          path.resolve(entry.file),
          new Set(
            entry.messages.filter((m) => uni.has(m.ruleId)).map((m) => key(m.ruleId, m.line, m.column, m.message)),
          ),
        );
      }

      let out;
      try {
        out = execFileSync(bin, ["--format", "sarif", "--config", cfgFile, ...files], {
          encoding: "utf8",
          maxBuffer: 1 << 28,
        });
      } catch (err) {
        out = err.stdout || "";
      }
      const rsvelte = new Map(files.map((f) => [f, new Set()]));
      for (const run of JSON.parse(out).runs || []) {
        for (const r of run.results || []) {
          if (!uni.has(r.ruleId)) continue;
          const loc = r.locations?.[0]?.physicalLocation;
          const abs = path.resolve(loc.artifactLocation.uri.replace(/^file:\/\//, ""));
          if (!rsvelte.has(abs)) continue;
          rsvelte
            .get(abs)
            .add(key(r.ruleId, loc.region?.startLine ?? 1, loc.region?.startColumn ?? 1, r.message.text));
        }
      }

      for (const f of files) {
        const id = `${project}/${path.relative(dir, f).split(path.sep).join("/")}`;
        const o = oracle.get(f) ?? new Set();
        const r = rsvelte.get(f) ?? new Set();
        compared++;
        oCount += o.size;
        rCount += r.size;
        const tally = perProject.get(project) ?? { oracle: 0, rsvelte: 0 };
        tally.oracle += o.size;
        tally.rsvelte += r.size;
        perProject.set(project, tally);
        for (const k of o) if (!r.has(k)) diffs.push(`${id}|-${k}`);
        for (const k of r) if (!o.has(k)) diffs.push(`${id}|+${k}`);
      }
    }
  } finally {
    fs.rmSync(rulesFile, { force: true });
    fs.rmSync(cfgFile, { force: true });
  }

  diffs.sort();
  console.log(
    `[lint-env] compared ${compared} file/project pairs across ${projects.length} projects ` +
      `(oracle ${oCount}, rsvelte ${rCount}), ${diffs.length} divergence(s)`,
  );
  for (const [p, t] of perProject) console.log(`    ${p}: oracle ${t.oracle}, rsvelte ${t.rsvelte}`);
  // Two guards against a gate that is green for the wrong reason. An oracle
  // that reports nothing has not exercised the axis at all; and if every
  // project's oracle count is equal, the manifests are indistinguishable to
  // upstream, so agreeing with it proves nothing about the environment.
  if (oCount === 0) {
    console.error("[lint-env] ❌ the oracle produced no findings at all — the projects measure nothing");
    process.exit(2);
  }
  const counts = new Set([...perProject.values()].map((t) => t.oracle));
  if (counts.size < 2) {
    console.error(
      "[lint-env] ❌ every project yields the same oracle finding count — the manifests do not " +
        "separate any rule, so this gate cannot observe the environment",
    );
    process.exit(2);
  }

  const known = fs.existsSync(KNOWN) ? JSON.parse(fs.readFileSync(KNOWN, "utf8")) : [];
  const knownSet = new Set(known);
  const current = new Set(diffs);
  const added = diffs.filter((d) => !knownSet.has(d));
  const removed = known.filter((d) => !current.has(d));

  if (UPDATE) {
    fs.writeFileSync(KNOWN, JSON.stringify(diffs, null, "\t") + "\n");
    console.log(`[lint-env] wrote ${diffs.length} entries to ${path.relative(ROOT, KNOWN)}`);
    return;
  }
  if (added.length > 0) {
    console.error(`\n[lint-env] ❌ ${added.length} NEW divergence(s):`);
    for (const d of added.slice(0, SHOW)) console.error("  " + d.replace(/\t/g, " "));
    if (added.length > SHOW) console.error(`  … and ${added.length - SHOW} more`);
  }
  if (removed.length > 0) {
    console.error(`\n[lint-env] ❌ ${removed.length} ratchet entries no longer diverge (stale):`);
    for (const d of removed.slice(0, SHOW)) console.error("  " + d.replace(/\t/g, " "));
    console.error("\n  fix: node scripts/compat-corpus/lint-env.mjs --update");
  }
  if (added.length > 0 || removed.length > 0) process.exit(1);
  console.log("[lint-env] ✅ environment parity");
}

main();
