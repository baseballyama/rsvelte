#!/usr/bin/env node
import { MIN_MAPPED_LINE_COVERAGE, mappedLineCoverage } from "../compat-corpus/sourcemap.mjs";

let failed = 0;
function check(name, actual, expected) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  console.log(`  ${ok ? "✓" : "✗"} ${name}`);
  if (!ok) failed++;
}

check(
  "counts source-bearing segments on non-empty lines",
  mappedLineCoverage("AAAA;AACA;;AACA", [1, 1, 0, 1]),
  {
    generatedLines: 3,
    mappedLines: 3,
  },
);
check("does not count generated-only segments", mappedLineCoverage("A;AACA", [1, 1]), {
  generatedLines: 2,
  mappedLines: 1,
});
check("rejects undecodable mappings", mappedLineCoverage("!", [1]), null);
const truncated = mappedLineCoverage("AAAA", Array(1000).fill(1));
check(
  "rejects a one-line map for 1000 generated lines",
  truncated.mappedLines / truncated.generatedLines < MIN_MAPPED_LINE_COVERAGE,
  true,
);

if (failed) process.exit(1);
