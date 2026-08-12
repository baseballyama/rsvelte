#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "../..");
const inputPath = join(root, "compatibility/report.json");
const manifestPath = join(root, "compatibility/manifest.json");
const outputPath = join(root, "apps/playground/static/compatibility-report.json");
const fixturePath = join(root, "apps/playground/static/test-results.json");
const performancePath = join(root, "apps/playground/static/performance-report.json");

if (!existsSync(inputPath) || !existsSync(manifestPath)) {
  throw new Error(
    "compatibility/report.json and compatibility/manifest.json are required; run pnpm corpus:verify first",
  );
}

const readJson = (path) => JSON.parse(readFileSync(path, "utf8"));
const readOptionalJson = (path) => (existsSync(path) ? readJson(path) : null);
const report = readJson(inputPath);
const manifest = readJson(manifestPath);
const fixtures = readJson(fixturePath);
const exact = (report.counts.match ?? 0) + (report.counts["error-parity"] ?? 0);
const sourceIds = [...new Set(manifest.map(({ id }) => id.split("/")[0]))].sort();

const baselineSize = (name) => {
  const path = join(root, "compatibility", name);
  return existsSync(path) ? readJson(path).length : 0;
};

const targetDivergences = (id) =>
  report.failures.filter((failure) => failure.details.some((detail) => detail.target === id))
    .length;

const surface = (id, label, matched, total, differences, unit, note) => ({
  id,
  label,
  status: total === null ? "unmeasured" : differences === 0 ? "pass" : "differences",
  matched,
  total,
  differences,
  unit,
  note,
});

const parserCategories = fixtures.categories.filter(({ id }) => id.startsWith("parser-"));
const parserPassed = parserCategories.reduce((sum, category) => sum + category.passed, 0);
const parserFailed = parserCategories.reduce((sum, category) => sum + category.failed, 0);
const parserSkipped = parserCategories.reduce((sum, category) => sum + category.skipped, 0);
const fmtReport = readOptionalJson(join(root, "compatibility/fmt-report.json"));
const svelte2tsxReport = readOptionalJson(join(root, "compatibility/report-s2t.json"));
const lintReport = readOptionalJson(join(root, "compatibility/lint-report.json"));
const performanceReport = readOptionalJson(performancePath);

const competitorDefinitions = [
  { id: "mrwaip", label: "@mrwaip/svelte-rs" },
  { id: "verter", label: "@verter/wasm" },
];
const competitors = performanceReport
  ? competitorDefinitions.flatMap((definition) => {
      const surfaces = performanceReport.surfaces.map((performanceSurface) => {
        const comparison = performanceSurface.comparisonClasses.find((group) =>
          group.variants.some((variant) => variant.id === definition.id),
        );
        const competitor = comparison?.variants.find((variant) => variant.id === definition.id);
        const reference = comparison?.variants.find((variant) => variant.id === "official");
        return {
          id: performanceSurface.id,
          label:
            {
              client: "CSR",
              server: "SSR",
              "client-dev": "CSR dev",
              "server-dev": "SSR dev",
            }[performanceSurface.id] ?? performanceSurface.id,
          matched: competitor?.correctFiles ?? 0,
          compiled: competitor?.compiledFiles ?? 0,
          total: comparison?.files ?? 0,
          status: competitor?.status ?? "unmeasured",
          referenceVersion: reference?.version,
        };
      });
      const variant = performanceReport.surfaces
        .flatMap(({ comparisonClasses }) => comparisonClasses)
        .flatMap(({ variants }) => variants)
        .find(({ id }) => id === definition.id);
      if (!variant) return [];
      return [
        {
          ...definition,
          version: variant.version,
          metric: "normalized-output-parity",
          measuredAt: performanceReport.generatedAt,
          surfaces,
          note: "JavaScript AST equivalence and CSS output parity against the matching Svelte version.",
        },
      ];
    })
  : [];

const compileSurface = (id, label) => {
  const differences = targetDivergences(id);
  return surface(
    id,
    label,
    report.total - differences,
    report.total,
    differences,
    "files",
    "Normalized JS and CSS output",
  );
};

const fmtSurface = fmtReport
  ? surface(
      "fmt",
      "fmt",
      fmtReport.matched,
      fmtReport.matched + fmtReport.failed,
      fmtReport.failed,
      "files",
      `${fmtReport.excluded} oracle exclusions`,
    )
  : surface(
      "fmt",
      "fmt",
      null,
      null,
      baselineSize("fmt-known-failures.json"),
      "files",
      "Run the formatter corpus to measure",
    );

const svelte2tsxExact = svelte2tsxReport
  ? (svelte2tsxReport.counts.match ?? 0) + (svelte2tsxReport.counts["error-parity"] ?? 0)
  : null;
const svelte2tsxDifferences =
  svelte2tsxReport?.failures.length ?? baselineSize("svelte2tsx-known-failures.json");
const svelte2tsxSurface = svelte2tsxReport
  ? surface(
      "svelte2tsx",
      "svelte2tsx",
      svelte2tsxExact,
      svelte2tsxExact + svelte2tsxDifferences,
      svelte2tsxDifferences,
      "files",
      `${svelte2tsxReport.counts["oracle-invalid"] ?? 0} oracle exclusions`,
    )
  : surface(
      "svelte2tsx",
      "svelte2tsx",
      null,
      null,
      svelte2tsxDifferences,
      "files",
      "Run the svelte2tsx corpus to measure",
    );

const lintSurface = lintReport
  ? surface(
      "lint",
      "lint",
      lintReport.matchedFiles,
      lintReport.compared,
      lintReport.divergentFiles,
      "files",
      `${lintReport.differences} finding differences across ${lintReport.rules} rules`,
    )
  : surface(
      "lint",
      "lint",
      null,
      null,
      new Set(
        readJson(join(root, "compatibility/lint-known-failures.json")).map(
          (entry) => entry.split("|")[0],
        ),
      ).size,
      "files",
      `${baselineSize("lint-known-failures.json")} known finding differences`,
    );

const git = (...args) => {
  try {
    return execFileSync("git", args, { cwd: root, encoding: "utf8" }).trim();
  } catch {
    return "unknown";
  }
};

const result = {
  schemaVersion: 5,
  kind: "rsvelte-compatibility-report",
  generatedAt: report.generatedAt,
  commit: {
    rsvelte: git("rev-parse", "HEAD"),
    upstreamSvelte: git("-C", "submodules/svelte", "rev-parse", "HEAD"),
  },
  corpus: {
    name: "rsvelte real-world compatibility corpus",
    configuredFiles: manifest.length,
    componentFiles: manifest.filter(({ kind }) => kind === "component").length,
    moduleFiles: manifest.filter(({ kind }) => kind === "module").length,
    sourceCount: sourceIds.length,
    truncated: false,
  },
  summary: {
    exact,
    total: report.total,
    percentage: (exact / report.total) * 100,
    outputMatches: report.counts.match ?? 0,
    errorParity: report.counts["error-parity"] ?? 0,
    divergences: report.total - exact,
    unparseable: report.counts["js-unparseable"] ?? 0,
  },
  surfaces: [
    surface(
      "parser",
      "Parser",
      parserPassed,
      parserPassed + parserFailed,
      parserFailed,
      "fixtures",
      `${parserSkipped} upstream or unsupported fixtures skipped`,
    ),
    compileSurface("client", "CSR"),
    compileSurface("server", "SSR"),
    compileSurface("client-dev", "CSR dev"),
    compileSurface("server-dev", "SSR dev"),
    fmtSurface,
    svelte2tsxSurface,
    lintSurface,
  ],
  competitors,
  unmeasuredCompetitors:
    performanceReport?.unsupported.map(({ id, label, reason }) => ({ id, label, reason })) ?? [],
  methodology: [
    "Every collected component and Svelte module is compiled as CSR, SSR, CSR dev, and SSR dev.",
    "JavaScript and CSS are compared after the same oxfmt and blank-line normalization on both sides.",
    "Other compiler implementations use the same normalized JavaScript AST-equivalence and CSS-output comparison.",
    "Compiler warnings, error detail, and emitted JavaScript parseability have independent shrink-only ratchets.",
  ],
};

writeFileSync(outputPath, `${JSON.stringify(result, null, 2)}\n`);
console.error(`[report] wrote ${outputPath}`);
