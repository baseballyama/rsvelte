#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const COMPARE = join(HERE, "..", "diff", "compare-compatibility-reports.mjs");
const dir = mkdtempSync(join(tmpdir(), "compatibility-report-comparison-"));
let failures = 0;

function report(passed, failed) {
  return JSON.stringify({
    svelte_commit: "0123456789abcdef",
    categories: {
      parser: { stats: { passed, failed, total: passed + failed } },
    },
  });
}

function check(name, fn) {
  try {
    fn();
    console.log(`  ok   ${name}`);
  } catch (error) {
    failures++;
    console.error(`  FAIL ${name}\n       ${error.message}`);
  }
}

function run(...args) {
  return execFileSync("node", [COMPARE, ...args], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
}

try {
  const current = join(dir, "current.json");
  const base = join(dir, "base.json");
  writeFileSync(current, report(9, 1));
  writeFileSync(base, report(8, 2));

  console.log("compatibility report comparison self-test");
  check("uses the downloaded base report for deltas", () => {
    const output = run(
      "--current-report",
      current,
      "--base-report",
      base,
      "--pr-summary",
    );
    if (
      !output.includes("| parser | 8/10 (80.0%) | 9/10 (90.0%) | +1 | -1 ✅ |")
    ) {
      throw new Error(`unexpected comparison output: ${output}`);
    }
  });
  check("rejects a missing base report", () => {
    try {
      run(
        "--current-report",
        current,
        "--base-report",
        join(dir, "missing.json"),
      );
    } catch (error) {
      if (error.status !== 0) return;
    }
    throw new Error("missing base report was accepted");
  });
  check("rejects a base report without categories", () => {
    const invalid = join(dir, "invalid.json");
    writeFileSync(invalid, "{}");
    try {
      run("--current-report", current, "--base-report", invalid);
    } catch (error) {
      if (error.status !== 0) return;
    }
    throw new Error("category-less base report was accepted");
  });
  check("validates the current report on main", () => {
    const output = run("--current-report", current, "--validate");
    if (!output.includes("validated 1 compatibility report categories")) {
      throw new Error(`unexpected validation output: ${output}`);
    }
  });
} finally {
  rmSync(dir, { recursive: true, force: true });
}

process.exitCode = failures === 0 ? 0 : 1;
