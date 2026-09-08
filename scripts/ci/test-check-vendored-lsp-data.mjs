// The gate watches a hand-written list of paths, which is the enumeration
// hazard: a generator that grows an eighth output would be unwatched and the
// gate would stay green. So the list is checked against the generators' own
// source, in both directions.
//
//   node scripts/ci/test-check-vendored-lsp-data.mjs
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(fileURLToPath(import.meta.url), "../../..");
const GATE = path.join(ROOT, "scripts/ci/check-vendored-lsp-data.mjs");
const GENERATORS = [
  "scripts/dev/generate-html-data.mjs",
  "scripts/dev/generate-css-data.mjs",
];
// The generators write only under this subtree, which is what makes a literal
// scan a partition rather than a work log.
const WATCHED_PREFIX = "crates/rsvelte_language_server/";

const gateSource = fs.readFileSync(GATE, "utf8");

/** The `GENERATED` array the gate declares, read out of its source. */
function declaredPaths() {
  const body = gateSource.slice(
    gateSource.indexOf("const GENERATED = ["),
    gateSource.indexOf("];", gateSource.indexOf("const GENERATED = [")),
  );
  return new Set([...body.matchAll(/"([^"]+)"/g)].map((m) => m[1]));
}

/**
 * Every repo-relative path under the watched subtree that the generators can
 * write. An output is spelled either as one literal joined onto `ROOT`, or as a
 * directory constant joined with a bare filename, so the scan resolves that one
 * level of `path.join` from the constant's own binding rather than pairing every
 * literal with every basename.
 */
function producedPaths() {
  const found = new Set();
  for (const rel of GENERATORS) {
    const src = fs.readFileSync(path.join(ROOT, rel), "utf8");
    for (const m of src.matchAll(/"([^"]*)"/g)) {
      if (m[1].startsWith(WATCHED_PREFIX) && /\.(rs|json)$/.test(m[1])) {
        found.add(m[1]);
      }
    }
    // `const DIR = path.join(ROOT, "crates/.../css_data");`
    const dirs = new Map();
    for (const m of src.matchAll(
      /const\s+(\w+)\s*=\s*path\.join\(\s*ROOT\s*,\s*"([^"]+)"\s*\)/g,
    )) {
      if (m[2].startsWith(WATCHED_PREFIX)) dirs.set(m[1], m[2]);
    }
    // `const OUTPUT = path.join(DIR, "web.rs");`
    for (const m of src.matchAll(
      /path\.join\(\s*(\w+)\s*,\s*"([^"]+)"\s*\)/g,
    )) {
      if (dirs.has(m[1])) found.add(`${dirs.get(m[1])}/${m[2]}`);
    }
  }
  return found;
}

const declared = declaredPaths();
const produced = producedPaths();

// Positive control: the scan must find something, or every assertion below is
// vacuous.
// A count would be a second claim to keep in step with the generators; the set
// comparison below is the assertion, and these two only rule out a scan or a
// declaration that came back empty.
assert.ok(produced.size > 0, "the generator scan found no output paths");
assert.ok(declared.size > 0, "the gate declares no watched paths");

const missing = [...produced].filter((p) => !declared.has(p)).sort();
assert.deepEqual(
  missing,
  [],
  `the generators write these and the gate does not watch them:\n  ${missing.join("\n  ")}`,
);
// The other direction is checked against the filesystem rather than against the
// scan, because the join resolution above can over-generate a candidate no
// assignment actually uses; a declared path that does not exist is a dead row.
for (const rel of declared) {
  assert.ok(
    fs.existsSync(path.join(ROOT, rel)),
    `the gate watches ${rel}, which does not exist`,
  );
}

// Negative control on the derivation itself: a path outside the subtree must
// not be picked up, or `produced` is just "every string in the file".
assert.ok(
  !produced.has("submodules/language-tools/pnpm-lock.yaml"),
  "the scan is not filtering by the watched subtree",
);

// The gate has to run the generators; a gate that only diffs would be green on
// a stale tree forever, which is exactly the defect it exists to close.
for (const rel of GENERATORS) {
  assert.ok(
    gateSource.includes(rel),
    `the gate does not run ${rel}, so it cannot see a bump nobody regenerated`,
  );
}
// And it has to format, because the generators emit unformatted Rust: without
// this the gate is red on a tree that is in fact current.
assert.ok(gateSource.includes("rustfmt"), "the gate does not run rustfmt");

console.log(
  `check-vendored-lsp-data self-test OK — ${declared.size} generated paths, watched set == produced set`,
);
