#!/usr/bin/env node
/**
 * Compare the freshly-generated compatibility report against the one from the
 * PR's base branch and emit a Markdown summary suitable for posting on a PR.
 *
 * Usage:
 *   node scripts/diff/compare-compatibility-reports.mjs --base-report <path> --pr-summary > out.md
 *   node scripts/diff/compare-compatibility-reports.mjs --validate
 *
 * The script:
 *   1. Locates the current report at fixtures/{commitHash}/compatibility-report.json
 *   2. Reads the base-branch report downloaded from a successful CI artifact
 *   3. Diffs per-category pass counts
 *   4. Prints a Markdown table; non-zero diffs are flagged
 *
 * A comparison without both reports is not meaningful, so malformed or absent
 * reports fail rather than publishing a head-only table.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');

function findCurrentReport() {
  const fixturesDir = path.join(ROOT, 'fixtures');
  if (!fs.existsSync(fixturesDir)) return null;

  const candidates = fs
    .readdirSync(fixturesDir)
    .map((name) => path.join(fixturesDir, name, 'compatibility-report.json'))
    .filter((p) => fs.existsSync(p));

  if (candidates.length === 0) return null;
  // Most recently modified wins (handles multiple commit dirs).
  return candidates.sort(
    (a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs,
  )[0];
}
function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function summarizeReport(report, label) {
  if (!report || typeof report !== 'object' || !report.categories || typeof report.categories !== 'object') {
    throw new Error(`${label} report has no categories`);
  }
  const out = {};
  for (const [name, cat] of Object.entries(report.categories)) {
    // Two shapes are accepted:
    //   * tests/common/mod.rs: CategoryResult { stats: { total, passed, ... } }
    //   * scripts/fixtures/generate-fixtures.mjs manifest: flat { total, success, failed }
    const stats = cat?.stats ?? cat;
    if (!stats || typeof stats !== 'object') {
      throw new Error(`${label} report category ${name} has no stats`);
    }
    out[name] = {
      passed: stats.passed ?? stats.success ?? 0,
      total: stats.total ?? 0,
      failed: stats.failed ?? 0,
      skipped: stats.skipped ?? 0,
    };
  }
  if (Object.keys(out).length === 0) throw new Error(`${label} report has no categories`);
  return out;
}
function getCommitHash(report) {
  return (
    report?.svelte_commit ??
    report?.commitHash ??
    null
  );
}

function fmtCell(passed, total) {
  if (total === 0) return '—';
  const pct = ((passed / total) * 100).toFixed(1);
  return `${passed}/${total} (${pct}%)`;
}

function diffSign(n) {
  if (n === 0) return '0';
  return n > 0 ? `+${n}` : `${n}`;
}

function main() {
  const args = process.argv.slice(2);
  const isSummary = args.includes('--pr-summary');
  const isValidate = args.includes('--validate');
  const currentIndex = args.indexOf('--current-report');
  const baseIndex = args.indexOf('--base-report');
  const currentOverride = currentIndex === -1 ? null : args[currentIndex + 1];
  const basePath = baseIndex === -1 ? null : args[baseIndex + 1];
  if (currentIndex !== -1 && !currentOverride) throw new Error('--current-report requires a path');
  if (!isValidate && !basePath) throw new Error('--base-report requires a path');

  const currentPath = currentOverride ?? findCurrentReport();
  if (!currentPath) {
    throw new Error('current compatibility report not found');
  }
  const current = readJson(currentPath);
  const currentSummary = summarizeReport(current, 'current');
  if (isValidate) {
    process.stdout.write(`validated ${Object.keys(currentSummary).length} compatibility report categories\n`);
    return;
  }
  if (!fs.existsSync(basePath)) throw new Error(`base compatibility report not found: ${basePath}`);

  const base = readJson(basePath);
  const baseSummary = summarizeReport(base, 'base');

  const allCategories = Array.from(
    new Set([...Object.keys(currentSummary), ...Object.keys(baseSummary)]),
  ).sort();

  const lines = [];
  const currentHash = getCommitHash(current);
  const baseHash = getCommitHash(base);
  lines.push(`Current commit: \`${currentHash?.slice(0, 12) ?? 'unknown'}\``);
  lines.push(`Base commit:    \`${baseHash?.slice(0, 12) ?? 'unknown'}\``);
  lines.push('');
  lines.push('| Category | Base | Current | Δ passed | Δ failed |');
  lines.push('|----------|------|---------|----------|----------|');

  let totalDeltaPassed = 0;
  let totalDeltaFailed = 0;

  for (const cat of allCategories) {
    const cur = currentSummary[cat] ?? { passed: 0, total: 0, failed: 0 };
    const bas = baseSummary[cat] ?? { passed: 0, total: 0, failed: 0 };
    const dp = cur.passed - bas.passed;
    const df = cur.failed - bas.failed;
    totalDeltaPassed += dp;
    totalDeltaFailed += df;

    let flag = '';
    if (dp < 0 || df > 0) flag = ' ⚠️';
    else if (dp > 0 || df < 0) flag = ' ✅';

    lines.push(
      `| ${cat} | ${fmtCell(bas.passed, bas.total)} | ${fmtCell(cur.passed, cur.total)} | ${diffSign(dp)} | ${diffSign(df)}${flag} |`,
    );
  }

  lines.push('');
  if (totalDeltaPassed === 0 && totalDeltaFailed === 0) {
    lines.push('No change in pass/fail counts versus base.');
  } else {
    lines.push(
      `**Net change**: ${diffSign(totalDeltaPassed)} passed, ${diffSign(totalDeltaFailed)} failed.`,
    );
  }

  process.stdout.write(lines.join('\n') + '\n');

  if (!isSummary) {
    process.stdout.write('\n--- raw current ---\n');
    process.stdout.write(JSON.stringify(currentSummary, null, 2) + '\n');
  }
}

try {
  main();
} catch (error) {
  console.error(`compatibility-report comparison failed: ${error.message}`);
  process.exitCode = 1;
}
