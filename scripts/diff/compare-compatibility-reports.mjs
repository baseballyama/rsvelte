#!/usr/bin/env node
/**
 * Compare the freshly-generated compatibility report against the one from the
 * PR's base branch and emit a Markdown summary suitable for posting on a PR.
 *
 * Usage:
 *   node scripts/diff/compare-compatibility-reports.mjs --pr-summary > out.md
 *
 * The script:
 *   1. Locates the current report at fixtures/{commitHash}/compatibility-report.json
 *   2. Fetches the same file from origin/main via `git show`
 *   3. Diffs per-category pass counts
 *   4. Prints a Markdown table; non-zero diffs are flagged
 *
 * If the base branch report can't be located, the script still prints the
 * current numbers so the PR comment is useful.
 */

import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../..");

function findCurrentReport() {
  const fixturesDir = path.join(ROOT, "fixtures");
  if (!fs.existsSync(fixturesDir)) return null;

  const candidates = fs
    .readdirSync(fixturesDir)
    .map((name) => path.join(fixturesDir, name, "compatibility-report.json"))
    .filter((p) => fs.existsSync(p));

  if (candidates.length === 0) return null;
  // Most recently modified wins (handles multiple commit dirs).
  return candidates.sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs)[0];
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function tryReadBaseReport(currentReportRelative) {
  const refs = ["origin/main", "main"];
  for (const ref of refs) {
    try {
      const out = execSync(`git show ${ref}:${currentReportRelative}`, {
        cwd: ROOT,
        stdio: ["ignore", "pipe", "ignore"],
      }).toString();
      return JSON.parse(out);
    } catch {
      // Not on this ref or file doesn't exist there. Try the next.
    }
  }
  return null;
}

function summarizeReport(report) {
  if (!report || !report.categories) return null;
  const out = {};
  for (const [name, cat] of Object.entries(report.categories)) {
    // Two shapes are accepted:
    //   * tests/common/mod.rs: CategoryResult { stats: { total, passed, ... } }
    //   * scripts/fixtures/generate-fixtures.mjs manifest: flat { total, success, failed }
    const stats = cat.stats ?? cat;
    out[name] = {
      passed: stats.passed ?? stats.success ?? 0,
      total: stats.total ?? 0,
      failed: stats.failed ?? 0,
      skipped: stats.skipped ?? 0,
    };
  }
  return out;
}

function getCommitHash(report) {
  return report?.svelte_commit ?? report?.commitHash ?? null;
}

function fmtCell(passed, total) {
  if (total === 0) return "—";
  const pct = ((passed / total) * 100).toFixed(1);
  return `${passed}/${total} (${pct}%)`;
}

function diffSign(n) {
  if (n === 0) return "0";
  return n > 0 ? `+${n}` : `${n}`;
}

function main() {
  const args = new Set(process.argv.slice(2));
  const isSummary = args.has("--pr-summary");

  const currentPath = findCurrentReport();
  if (!currentPath) {
    process.stdout.write("_No compatibility report found in `fixtures/`._\n");
    process.exit(0);
  }

  const currentRel = path.relative(ROOT, currentPath);
  const current = readJson(currentPath);
  const base = tryReadBaseReport(currentRel);

  const currentSummary = summarizeReport(current) ?? {};
  const baseSummary = summarizeReport(base) ?? {};

  const allCategories = Array.from(
    new Set([...Object.keys(currentSummary), ...Object.keys(baseSummary)]),
  ).sort();

  const lines = [];
  const currentHash = getCommitHash(current);
  const baseHash = getCommitHash(base);
  lines.push(`Current commit: \`${currentHash?.slice(0, 12) ?? "unknown"}\``);
  if (baseHash) {
    lines.push(`Base commit:    \`${baseHash.slice(0, 12)}\``);
  } else {
    lines.push("_(Base branch report not available — showing current numbers only.)_");
  }
  lines.push("");
  lines.push("| Category | Base | Current | Δ passed | Δ failed |");
  lines.push("|----------|------|---------|----------|----------|");

  let totalDeltaPassed = 0;
  let totalDeltaFailed = 0;

  for (const cat of allCategories) {
    const cur = currentSummary[cat] ?? { passed: 0, total: 0, failed: 0 };
    const bas = baseSummary[cat] ?? { passed: 0, total: 0, failed: 0 };
    const dp = cur.passed - bas.passed;
    const df = cur.failed - bas.failed;
    totalDeltaPassed += dp;
    totalDeltaFailed += df;

    let flag = "";
    if (dp < 0 || df > 0) flag = " ⚠️";
    else if (dp > 0 || df < 0) flag = " ✅";

    lines.push(
      `| ${cat} | ${fmtCell(bas.passed, bas.total)} | ${fmtCell(cur.passed, cur.total)} | ${diffSign(dp)} | ${diffSign(df)}${flag} |`,
    );
  }

  lines.push("");
  if (totalDeltaPassed === 0 && totalDeltaFailed === 0) {
    lines.push("No change in pass/fail counts versus base.");
  } else {
    lines.push(
      `**Net change**: ${diffSign(totalDeltaPassed)} passed, ${diffSign(totalDeltaFailed)} failed.`,
    );
  }

  process.stdout.write(lines.join("\n") + "\n");

  if (!isSummary) {
    process.stdout.write("\n--- raw current ---\n");
    process.stdout.write(JSON.stringify(currentSummary, null, 2) + "\n");
  }
}

main();
