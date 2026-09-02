#!/usr/bin/env node
// Positive control for `scripts/ci/lsp-mechanisms-check.mjs`. The checker's
// only observable pass is silence, so each case introduces exactly one defect
// and asserts the checker reddens on it — and one case asserts a well-formed
// sidecar passes, which is the half a red-only suite never measures.
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);
const CHECKER = path.join(ROOT, "scripts/ci/lsp-mechanisms-check.mjs");
const EXISTING_REPORT = "upstream_issues/README.md";

function run(ratchet, sidecar) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "lsp-mech-"));
  fs.writeFileSync(
    path.join(dir, "lsp-known-failures.json"),
    JSON.stringify(ratchet),
  );
  fs.writeFileSync(
    path.join(dir, "lsp-mechanisms.json"),
    JSON.stringify(sidecar),
  );
  const result = spawnSync(process.execPath, [CHECKER], {
    encoding: "utf8",
    env: { ...process.env, LSP_MECHANISMS_DIR: dir },
  });
  fs.rmSync(dir, { recursive: true, force: true });
  return { code: result.status, out: `${result.stdout}${result.stderr}` };
}

const wellFormed = {
  ratchet: ["aggregate:corpus/a.svelte|textDocument/hover"],
  sidecar: {
    mechanisms: {
      "ts-render": { terminal: EXISTING_REPORT },
      "ts-lib-copy": { terminal: "deliberate-divergences" },
      unclassified: { terminal: null },
    },
    entries: {
      "aggregate:corpus/a.svelte|textDocument/hover": [
        "ts-render",
        "ts-lib-copy",
      ],
    },
  },
};

const cases = [
  ["a well-formed sidecar passes", wellFormed, 0, /1 ratchet entries/],
  [
    "an uncovered ratchet entry fails",
    { ...wellFormed, ratchet: [...wellFormed.ratchet, "differential:x|y|z:v"] },
    1,
    /carry no mechanism set/,
  ],
  [
    "a sidecar id the ratchet does not list fails",
    { ...wellFormed, ratchet: [] },
    1,
    /the ratchet does not list/,
  ],
  [
    "an empty mechanism set fails",
    {
      ...wellFormed,
      sidecar: {
        ...wellFormed.sidecar,
        entries: { "aggregate:corpus/a.svelte|textDocument/hover": [] },
      },
    },
    1,
    /an absence must be spelled/,
  ],
  [
    "an undeclared label fails",
    {
      ...wellFormed,
      sidecar: {
        ...wellFormed.sidecar,
        mechanisms: { "ts-render": { terminal: EXISTING_REPORT } },
      },
    },
    1,
    /undeclared mechanism label/,
  ],
  [
    "a label outside the classifier's vocabulary fails",
    {
      ...wellFormed,
      sidecar: {
        ...wellFormed.sidecar,
        mechanisms: {
          ...wellFormed.sidecar.mechanisms,
          "invented-label": { terminal: null },
        },
      },
    },
    1,
    /the classifier cannot emit/,
  ],
  [
    "a terminal naming a file that does not exist fails",
    {
      ...wellFormed,
      sidecar: {
        ...wellFormed.sidecar,
        mechanisms: {
          ...wellFormed.sidecar.mechanisms,
          "ts-render": { terminal: "upstream_issues/not-a-report.md" },
        },
      },
    },
    1,
    /which does not exist/,
  ],
  [
    "a terminal that is neither a path nor the anchor fails",
    {
      ...wellFormed,
      sidecar: {
        ...wellFormed.sidecar,
        mechanisms: {
          ...wellFormed.sidecar.mechanisms,
          "ts-render": { terminal: "rsvelte" },
        },
      },
    },
    1,
    /expected an upstream_issues\/ path/,
  ],
];

let failures = 0;
for (const [name, input, expected, pattern] of cases) {
  const { code, out } = run(input.ratchet, input.sidecar);
  try {
    assert.equal(code, expected, `${name}: exit ${code}, expected ${expected}`);
    assert.match(out, pattern, `${name}: output did not match ${pattern}`);
    console.log(`ok   ${name}`);
  } catch (error) {
    failures++;
    console.error(`FAIL ${name}\n${error.message}\n${out}`);
  }
}

// An unestablished terminal is legal and still blocks the table; the count has
// to be reported rather than folded into the pass.
const blocked = run(wellFormed.ratchet, {
  ...wellFormed.sidecar,
  mechanisms: {
    ...wellFormed.sidecar.mechanisms,
    "ts-render": { terminal: null },
  },
});
try {
  assert.equal(blocked.code, 0, "a null terminal is legal");
  assert.match(blocked.out, /0 entries attributable today \(1 blocked/);
  console.log("ok   a null terminal passes the checker and blocks the table");
} catch (error) {
  failures++;
  console.error(
    `FAIL a null terminal is counted\n${error.message}\n${blocked.out}`,
  );
}

if (failures) {
  console.error(`\n${failures} case(s) failed`);
  process.exit(1);
}
console.log("\nall lsp-mechanisms-check cases pass");
