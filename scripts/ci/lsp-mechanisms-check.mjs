#!/usr/bin/env node
// DoD companion to `attribution-check.mjs` for `lsp-known-failures.json`, whose
// entries cannot be attributed one row per label: an entry carries a SET of
// mechanisms, so the label is a key into the ratchet rather than a partition of
// it, and a rule picking one label per entry would encode its author's ordering.
//
// The sidecar carries the set instead, and this checks that it is a set the
// attribution table can be derived from:
//
//   1. every ratchet id has a mechanism set, and the sidecar names no id the
//      ratchet does not list (the two are written by one command, so a drift
//      here means one of them was edited by hand);
//   2. every label used is declared, and every declared label is one the
//      classifier can actually emit;
//   3. a declared terminal is either an `upstream_issues/` path that exists on
//      disk or the literal `deliberate-divergences`.
//
// `null` is a legal terminal and is NOT a pass: it says the terminal has not
// been established, which is a different fact from "this is ours". What it
// costs is that the id cannot be written into an attribution table, and that
// is reported rather than tolerated — a check that let an unestablished
// terminal through would make an empty sidecar the bar it clears.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { MECHANISMS, UNCLASSIFIED } from "../compat-lsp/mechanism.mjs";

const ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);
// Overridable so the self-test can drive the whole checker against a synthetic
// tree: a guard only ever run on inputs it fails has not been shown to pass.
const DIR = process.env.LSP_MECHANISMS_DIR || path.join(ROOT, "compatibility");
const RATCHET = path.join(DIR, "lsp-known-failures.json");
const SIDECAR = path.join(DIR, "lsp-mechanisms.json");
const ANCHOR = "deliberate-divergences";

const problems = [];
const fail = (message) => problems.push(message);
const cap = (values, limit = 5) =>
  values.length <= limit
    ? values.join(", ")
    : `${values.slice(0, limit).join(", ")} … and ${values.length - limit} more`;

const ratchet = JSON.parse(fs.readFileSync(RATCHET, "utf8"));
const sidecar = JSON.parse(fs.readFileSync(SIDECAR, "utf8"));
const declared = sidecar.mechanisms ?? {};
const entries = sidecar.entries ?? {};
const vocabulary = new Set(MECHANISMS);

const listed = new Set(ratchet);
const covered = new Set(Object.keys(entries));
const uncovered = [...listed].filter((id) => !covered.has(id));
const unlisted = [...covered].filter((id) => !listed.has(id));
if (uncovered.length)
  fail(
    `${uncovered.length} of ${listed.size} ratchet entries carry no mechanism set: ${cap(uncovered)}`,
  );
if (unlisted.length)
  fail(
    `${unlisted.length} sidecar entries name an id the ratchet does not list: ${cap(unlisted)}`,
  );

const used = new Set();
for (const [id, labels] of Object.entries(entries)) {
  if (!Array.isArray(labels) || !labels.length) {
    fail(`${id} has an empty mechanism set; an absence must be spelled`);
    continue;
  }
  for (const label of labels) used.add(label);
}
const undeclared = [...used].filter((label) => !(label in declared));
if (undeclared.length)
  fail(`undeclared mechanism label(s): ${cap([...undeclared].sort())}`);
const unknown = Object.keys(declared).filter((label) => !vocabulary.has(label));
if (unknown.length)
  fail(
    `declared label(s) the classifier cannot emit: ${cap(unknown.sort())} — mechanism.mjs is the vocabulary`,
  );

for (const [label, value] of Object.entries(declared)) {
  const terminal = value?.terminal ?? null;
  if (terminal === null) continue;
  if (terminal === ANCHOR) continue;
  if (
    typeof terminal !== "string" ||
    !terminal.startsWith("upstream_issues/")
  ) {
    fail(
      `${label} has terminal ${JSON.stringify(terminal)}; expected an upstream_issues/ path, "${ANCHOR}", or null`,
    );
    continue;
  }
  if (!fs.existsSync(path.join(ROOT, terminal)))
    fail(`${label} names ${terminal}, which does not exist`);
}

// The count the attribution table can actually reach today. Reported whether or
// not it is zero: a table that cannot be written yet must say so with a number,
// because a missing row and a zero row render the same.
const blocked = new Set();
for (const [id, labels] of Object.entries(entries)) {
  if (!Array.isArray(labels)) continue;
  for (const label of labels) {
    if (
      label === UNCLASSIFIED ||
      (declared[label]?.terminal ?? null) === null
    ) {
      blocked.add(id);
      break;
    }
  }
}
const writable = Object.keys(entries).length - blocked.size;
console.log(
  `[lsp-mechanisms-check] ${listed.size} ratchet entries, ${Object.keys(entries).length} with a mechanism set, ${Object.keys(declared).length} labels declared, ${writable} entries attributable today (${blocked.size} blocked by an unclassified or unestablished terminal)`,
);

if (problems.length) {
  for (const problem of problems) console.error(problem);
  console.error(
    `\n[lsp-mechanisms-check] ${problems.length} problem(s). The sidecar is regenerated with the ratchet by\n` +
      "  node scripts/compat-lsp/merge-current.mjs <artifact-dir> --update-baseline\n" +
      "from the complete 17-artifact set of one lsp-corpus run; it cannot be filled in by hand.",
  );
  process.exit(1);
}
