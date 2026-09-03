#!/usr/bin/env node

import { execFileSync, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { arch, cpus, loadavg, platform, tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";
import { pgoEnv } from "../bench/pgo-env.mjs";
import { flattenTemplateHoles, oxfmtTree, stripBlankLines } from "../compat-corpus/normalize.mjs";
import { OXVELTE_REV, OXVELTE_VERSION, oxvelteInstalled } from "../bench/oxvelte-oracle.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "../..");
const corpusDir = join(root, "compatibility/sources");
const manifestPath = join(root, "compatibility/manifest.json");
const compatibilityPath = join(root, "compatibility/report.json");
const oracleDir = join(root, "scripts/bench/competitor-oracle");
const outputPath = process.env.RSVELTE_REPORT_OUT
  ? resolve(process.env.RSVELTE_REPORT_OUT)
  : join(root, "apps/playground/static/performance-report.json");
const astEquivBin = join(root, "target/release/ast_equiv_batch");
const warmups = Number(process.env.REPORT_WARMUPS ?? 1);
const runs = Number(process.env.REPORT_RUNS ?? 5);
const fileLimit = Number(process.env.REPORT_FILE_LIMIT ?? 0);

if (!existsSync(manifestPath) || !existsSync(corpusDir)) {
  throw new Error("The collected corpus is required; run pnpm corpus:collect first");
}
if (!existsSync(join(oracleDir, "node_modules")) || !oxvelteInstalled()) {
  throw new Error("Competitor packages are missing; run pnpm report:competitors:install");
}
if (!existsSync(join(root, "submodules/svelte/packages/svelte/compiler/index.js"))) {
  throw new Error("The official compiler is not built; run pnpm --dir submodules/svelte build");
}

const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
const componentEntries = manifest.filter(({ kind }) => kind === "component");
const selectedEntries = fileLimit > 0 ? componentEntries.slice(0, fileLimit) : componentEntries;
const files = selectedEntries.map(({ id }) => {
  const path = join(corpusDir, id);
  const source = readFileSync(path, "utf8");
  return { id, path, source, bytes: Buffer.byteLength(source) };
});

const currentModule = await import(
  pathToFileURL(join(root, "submodules/svelte/packages/svelte/compiler/index.js"))
);
const currentCompile = (currentModule.default ?? currentModule).compile;
const mrwaipModule = await import(
  pathToFileURL(join(oracleDir, "node_modules/@mrwaip/svelte-rs/compiler/index.js"))
);
const mrwaipCompile = (mrwaipModule.default ?? mrwaipModule).compile;
const referenceModule = await import(
  pathToFileURL(join(oracleDir, "node_modules/svelte-mrwaip-reference/compiler/index.js"))
);
const referenceCompile = (referenceModule.default ?? referenceModule).compile;
const { createVerterCompiler } = await import(pathToFileURL(join(oracleDir, "verter-adapter.mjs")));

const allTargets = [
  { id: "client", generate: "client", dev: false },
  { id: "server", generate: "server", dev: false },
  { id: "client-dev", generate: "client", dev: true },
  { id: "server-dev", generate: "server", dev: true },
];
// Re-measuring one surface must not cost the other three. A surface's own arms are
// interleaved within its iteration, so dropping later targets cannot change an earlier
// one's conditions; `outputPath` is refused below for a subset, because a report missing
// three surfaces is not the published artifact.
const requestedTargets = process.env.RSVELTE_REPORT_TARGETS?.split(",").map((s) => s.trim());
const targets = requestedTargets
  ? allTargets.filter((t) => requestedTargets.includes(t.id))
  : allTargets;
if (requestedTargets && !process.env.RSVELTE_REPORT_OUT) {
  throw new Error(
    "RSVELTE_REPORT_TARGETS measures a subset; set RSVELTE_REPORT_OUT so the published report is not overwritten with missing surfaces",
  );
}
if (requestedTargets && targets.length !== requestedTargets.length) {
  throw new Error(
    `RSVELTE_REPORT_TARGETS names an unknown surface: ${requestedTargets.join(",")}; known: ${allTargets.map((t) => t.id).join(",")}`,
  );
}

const optionsFor = (target, filename) => ({
  filename,
  generate: target.generate,
  dev: target.dev,
  css: "external",
});

async function acceptedBy(compile, target) {
  const accepted = [];
  for (const file of files) {
    try {
      compile(file.source, optionsFor(target, file.id));
      accepted.push(file);
    } catch {
      // Eligibility is version-class-specific by design.
    }
  }
  return accepted;
}

function stats(samples, fileCount) {
  const sorted = [...samples].sort((a, b) => a - b);
  const median =
    sorted.length % 2
      ? sorted[(sorted.length - 1) / 2]
      : (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2;
  const mean = samples.reduce((sum, value) => sum + value, 0) / samples.length;
  const stddev = Math.sqrt(
    samples.reduce((sum, value) => sum + (value - mean) ** 2, 0) / samples.length,
  );
  return {
    medianMs: median,
    minMs: sorted[0],
    maxMs: sorted.at(-1),
    stddevMs: stddev,
    cvPct: mean === 0 ? 0 : (stddev / mean) * 100,
    throughputFilesPerSec: (fileCount / median) * 1000,
    rawMs: samples,
  };
}

// An arm is `{ warm, once }`: `once` returns one elapsed sample. Splitting a
// benchmark into samples is what lets `interleave` decide the ORDER the arms
// run in, which is the whole point -- see its comment.
function jsArm(compile, corpus, target, { tolerateRejections = false } = {}) {
  const run = tolerateRejections
    ? () => {
        for (const file of corpus) {
          try {
            compile(file.source, optionsFor(target, file.id));
          } catch {
            // Rejections are part of this complete-corpus elapsed-time metric.
          }
        }
      }
    : () => {
        for (const file of corpus) compile(file.source, optionsFor(target, file.id));
      };
  return {
    count: corpus.length,
    warm: () => run(),
    once: () => {
      const start = performance.now();
      run();
      return performance.now() - start;
    },
  };
}

// Run one sample of every arm per round, alternating the order each round, and
// take each arm's `runs` samples from `runs` different rounds.
//
// Measured sequentially -- every sample of one arm, then every sample of the
// next -- the arms occupy different wall-clock windows, and on this corpus they
// occupy windows of wildly different LENGTH: official takes ~40s a sample and
// rsvelte-multi ~2.7s, so official's five samples span ~4 minutes while
// multi's span ~17 seconds. A load burst that covers the short window and
// averages out over the long one moves the RATIO, which is the reported
// number, and it moves it one way. That is not hypothetical here: on the
// 2026-09-02 report, `official` and `rsvelte-single` came in at cv 0.5% and
// 0.6% while `rsvelte-multi` -- the arm with the shortest window and the most
// threads to lose -- came in at cv 8.1%.
//
// Alternating the order matters as much as interleaving: a fixed order inside
// a round still charges the same arm for whatever the previous arm left warm.
function interleave(arms) {
  for (const arm of Object.values(arms)) {
    for (let i = 0; i < warmups; i += 1) arm.warm();
  }
  const names = Object.keys(arms);
  const samples = Object.fromEntries(names.map((name) => [name, []]));
  for (let round = 0; round < runs; round += 1) {
    const order = round % 2 === 0 ? names : [...names].reverse();
    for (const name of order) samples[name].push(arms[name].once());
  }
  return Object.fromEntries(
    names.map((name) => [name, stats(samples[name], arms[name].count)]),
  );
}

// One sample per spawn, so a rsvelte arm can be interleaved with the JS arms.
// The file list is keyed by mode too: `interleave` holds several rsvelte arms
// open at once, and a shared name would let one arm's list be deleted while
// another still needs it.
function rustArm(eligible, target, mode, tag) {
  const fileList = join(root, `.report-files-${target.id}-${tag}.txt`);
  // Every sample is its own process, so the in-process warmup has to be per
  // sample: a cold rayon pool and cold allocator arenas cost this arm ~60% on
  // its first pass and nothing thereafter, which would otherwise land entirely
  // on round 1 and drag the median.
  const once = () => {
    writeFileSync(fileList, `${eligible.map(({ path }) => path).join("\n")}\n`);
    const args = [
      "run",
      "--release",
      "-p",
      "rsvelte_devtools",
      "--bin",
      "benchmark_runner",
      "--",
      "--mode",
      mode,
      "--task",
      `compile-${target.generate}`,
      "--files",
      fileList,
      "--iterations",
      "1",
      "--warmup",
      String(Math.max(warmups, 1)),
    ];
    if (target.dev) args.push("--dev");
    const result = spawnSync("cargo", args, {
      cwd: root,
      encoding: "utf8",
      maxBuffer: 1 << 24,
      // The published surface numbers are the speed of what the npm package
      // ships, and what it ships is PGO-built. This arm has its own cargo
      // spawn; wiring only run-benchmark.mjs measured a non-PGO binary here.
      env: { ...process.env, ...pgoEnv() },
    });
    if (result.status !== 0)
      throw new Error(result.stderr || `Rust benchmark exited ${result.status}`);
    return JSON.parse(result.stdout).times[0];
  };
  // `once` already warms inside its own process, so there is nothing left for a
  // round of `interleave`'s warmup to do here.
  return { count: eligible.length, warm: () => {}, once, cleanup: () => rmSync(fileList, { force: true }) };
}

// Single-arm shorthand for the comparison classes whose two sides are both
// single-threaded JS: they occupy windows of the same length and lose the same
// amount to a load burst, so interleaving them buys nothing measured.
const benchmarkJs = (compile, eligible, target) =>
  interleave({ only: jsArm(compile, eligible, target) }).only;
const benchmarkJsAttempts = (compile, corpus, target) =>
  interleave({ only: jsArm(compile, corpus, target, { tolerateRejections: true }) }).only;

const outputCode = (output) =>
  typeof output === "string" ? output : typeof output?.code === "string" ? output.code : null;

async function compileCoverage(compile, reference, eligible, target, label) {
  let compiled = 0;
  const failures = [];
  const successfulFiles = [];
  const stage = mkdtempSync(join(tmpdir(), "rsvelte-competitor-parity-"));
  const expected = join(stage, "expected");
  const actual = join(stage, "actual");
  mkdirSync(expected);
  mkdirSync(actual);

  try {
    for (const [index, file] of eligible.entries()) {
      try {
        const options = optionsFor(target, file.id);
        const referenceResult = reference(file.source, options);
        const result = compile(file.source, options);
        const referenceJs = outputCode(referenceResult?.js);
        const actualJs = outputCode(result?.js);
        if (actualJs !== null && referenceJs !== null) {
          const name = String(index).padStart(6, "0");
          writeFileSync(join(expected, `${name}.js`), flattenTemplateHoles(referenceJs));
          writeFileSync(join(actual, `${name}.js`), flattenTemplateHoles(actualJs));
          writeFileSync(join(expected, `${name}.css`), outputCode(referenceResult?.css) ?? "");
          writeFileSync(join(actual, `${name}.css`), outputCode(result?.css) ?? "");
          successfulFiles.push({ ...file, parityName: name });
          compiled += 1;
        } else if (failures.length < 10) {
          failures.push({ id: file.id, code: "missing_output" });
        }
      } catch (error) {
        if (failures.length < 10) {
          failures.push({ id: file.id, code: error?.code ?? "compile_error" });
        }
      }
    }

    oxfmtTree(expected, {
      config: join(root, "compatibility/.oxfmtrc.json"),
      label: `${label}-expected`,
    });
    oxfmtTree(actual, {
      config: join(root, "compatibility/.oxfmtrc.json"),
      label: `${label}-actual`,
    });

    const pairs = [];
    const byteEqual = new Set();
    for (const file of successfulFiles) {
      const left = join(expected, `${file.parityName}.js`);
      const right = join(actual, `${file.parityName}.js`);
      const expectedJs = stripBlankLines(readFileSync(left, "utf8"));
      const actualJs = stripBlankLines(readFileSync(right, "utf8"));
      if (expectedJs === actualJs) byteEqual.add(file.parityName);
      else pairs.push({ id: file.parityName, left, right });
    }

    if (pairs.length > 0 && !existsSync(astEquivBin)) {
      throw new Error(
        "The AST equivalence comparator is required; run cargo build --release --bin ast_equiv_batch",
      );
    }
    const astVerdicts = pairs.length
      ? new Map(
          JSON.parse(
            execFileSync(astEquivBin, [], {
              input: JSON.stringify(pairs),
              encoding: "utf8",
              maxBuffer: 1 << 28,
            }),
          ).map((verdict) => [verdict.id, verdict]),
        )
      : new Map();

    let correct = 0;
    for (const file of successfulFiles) {
      const jsVerdict = astVerdicts.get(file.parityName);
      const jsMatches = byteEqual.has(file.parityName) || jsVerdict?.verdict === "equivalent";
      const cssMatches =
        readFileSync(join(expected, `${file.parityName}.css`), "utf8") ===
        readFileSync(join(actual, `${file.parityName}.css`), "utf8");
      if (jsMatches && cssMatches) {
        correct += 1;
      } else if (failures.length < 10) {
        failures.push({
          id: file.id,
          code: !jsMatches ? (jsVerdict?.verdict ?? "js_mismatch") : "css_mismatch",
        });
      }
    }

    return {
      compiled,
      correct,
      failures,
      successfulFiles: successfulFiles.map(({ parityName: _, ...file }) => file),
    };
  } finally {
    rmSync(stage, { recursive: true, force: true });
  }
}

function rejectionParity(compile, corpus, eligible, target) {
  const accepted = new Set(eligible.map(({ id }) => id));
  let correct = 0;
  for (const file of corpus) {
    if (accepted.has(file.id)) continue;
    try {
      compile(file.source, optionsFor(target, file.id));
    } catch {
      correct += 1;
    }
  }
  return correct;
}

const exactTargetFailures = new Map(targets.map(({ id }) => [id, new Set()]));
if (existsSync(compatibilityPath)) {
  const report = JSON.parse(readFileSync(compatibilityPath, "utf8"));
  for (const failure of report.failures) {
    for (const detail of failure.details) {
      exactTargetFailures.get(detail.target)?.add(failure.id);
    }
  }
}

const surfaces = [];
for (const target of targets) {
  console.error(`[report] resolving eligible files for ${target.id}`);
  const currentEligible = await acceptedBy(currentCompile, target);
  const mrwaipEligible = await acceptedBy(referenceCompile, target);
  const currentBytes = currentEligible.reduce((sum, file) => sum + file.bytes, 0);
  const mrwaipBytes = mrwaipEligible.reduce((sum, file) => sum + file.bytes, 0);

  console.error(
    `[report] benchmarking ${target.id}: ${currentEligible.length} current, ${mrwaipEligible.length} mrwaip-reference`,
  );
  // The headline ratios: official against rsvelte. These are the arms whose
  // window lengths differ by more than an order of magnitude, so they are the
  // ones `interleave` exists for.
  const rustArms = {
    rustSingle: rustArm(currentEligible, target, "single", "single"),
    rustMulti: rustArm(currentEligible, target, "multi", "multi"),
    rustMultiAttempts: rustArm(files, target, "multi", "attempts"),
  };
  const { officialCurrent, rustSingle, rustMulti, officialCurrentAttempts, rustMultiAttempts } =
    interleave({
      officialCurrent: jsArm(currentCompile, currentEligible, target),
      officialCurrentAttempts: jsArm(currentCompile, files, target, { tolerateRejections: true }),
      ...rustArms,
    });
  for (const arm of Object.values(rustArms)) arm.cleanup();
  const officialMrwaip = await benchmarkJs(referenceCompile, mrwaipEligible, target);
  const officialMrwaipAttempts = await benchmarkJsAttempts(referenceCompile, files, target);
  const mrwaipCoverage = await compileCoverage(
    mrwaipCompile,
    referenceCompile,
    mrwaipEligible,
    target,
    `mrwaip-${target.id}`,
  );
  const mrwaipRejectedCorrect = rejectionParity(mrwaipCompile, files, mrwaipEligible, target);
  const mrwaipCorrect = mrwaipCoverage.correct + mrwaipRejectedCorrect;
  const mrwaipComparable = mrwaipCorrect === files.length;
  const mrwaipReferenceSubset = mrwaipComparable
    ? await benchmarkJs(referenceCompile, mrwaipEligible, target)
    : null;
  const mrwaip = mrwaipComparable ? await benchmarkJs(mrwaipCompile, mrwaipEligible, target) : null;
  const mrwaipAttempts = await benchmarkJsAttempts(mrwaipCompile, files, target);

  const verterCompile = createVerterCompiler({ dev: target.dev });
  const verterCoverage =
    target.generate === "client"
      ? await compileCoverage(
          verterCompile,
          currentCompile,
          currentEligible,
          target,
          `verter-${target.id}`,
        )
      : { compiled: 0, correct: 0, failures: [], successfulFiles: [] };
  const verterRejectedCorrect =
    target.generate === "client"
      ? rejectionParity(verterCompile, files, currentEligible, target)
      : 0;
  const verterCorrect = verterCoverage.correct + verterRejectedCorrect;
  const verterComparable = target.generate === "client" && verterCorrect === files.length;
  const verterReferenceSubset = verterComparable
    ? await benchmarkJs(currentCompile, currentEligible, target)
    : null;
  const verter = verterComparable
    ? await benchmarkJs(verterCompile, currentEligible, target)
    : null;
  const verterAttempts =
    target.generate === "client" ? await benchmarkJsAttempts(verterCompile, files, target) : null;

  surfaces.push({
    id: target.id,
    generate: target.generate,
    dev: target.dev,
    comparisonClasses: [
      {
        id: "svelte-5.56.8",
        files: currentEligible.length,
        excludedFiles: files.length - currentEligible.length,
        bytes: currentBytes,
        variants: [
          {
            id: "official",
            label: "svelte/compiler",
            version: "5.56.8",
            status: "reference",
            correctFiles: files.length,
            attemptFiles: files.length,
            attemptMedianMs: officialCurrentAttempts.medianMs,
            ...officialCurrent,
          },
          {
            id: "rsvelte-single",
            label: "rsvelte",
            version: "workspace",
            threading: "single",
            status: "ok",
            compiledFiles: currentEligible.length,
            correctFiles: files.length - (exactTargetFailures.get(target.id)?.size ?? 0),
            exactOutputDivergences: exactTargetFailures.get(target.id)?.size ?? 0,
            speedup: officialCurrent.medianMs / rustSingle.medianMs,
            ...rustSingle,
          },
          {
            id: "rsvelte-multi",
            label: "rsvelte",
            version: "workspace",
            threading: "parallel",
            status: "ok",
            compiledFiles: currentEligible.length,
            correctFiles: files.length - (exactTargetFailures.get(target.id)?.size ?? 0),
            exactOutputDivergences: exactTargetFailures.get(target.id)?.size ?? 0,
            attemptFiles: files.length,
            attemptMedianMs: rustMultiAttempts.medianMs,
            attemptRatioVsRsvelte: 1,
            speedup: officialCurrent.medianMs / rustMulti.medianMs,
            ...rustMulti,
          },
        ],
      },
      {
        id: "svelte-5.56.4",
        files: mrwaipEligible.length,
        excludedFiles: files.length - mrwaipEligible.length,
        bytes: mrwaipBytes,
        variants: [
          {
            id: "official",
            label: "svelte/compiler",
            version: "5.56.4",
            status: "reference",
            correctFiles: files.length,
            attemptFiles: files.length,
            attemptMedianMs: officialMrwaipAttempts.medianMs,
            ...officialMrwaip,
          },
          {
            id: "mrwaip",
            label: "@mrwaip/svelte-rs",
            version: "0.0.0-canary.13.1",
            status: mrwaipCorrect === files.length ? "ok" : "unranked",
            compiledFiles: mrwaipCoverage.compiled,
            correctFiles: mrwaipCorrect,
            exactOutputDivergences: mrwaipEligible.length - mrwaipCoverage.correct,
            benchmarkFiles: mrwaipComparable ? mrwaipEligible.length : 0,
            failureExamples: mrwaipCoverage.failures,
            attemptFiles: files.length,
            attemptMedianMs: mrwaipAttempts.medianMs,
            attemptRatioVsRsvelte: mrwaipAttempts.medianMs / rustMultiAttempts.medianMs,
            ...(mrwaip && mrwaipReferenceSubset
              ? {
                  speedup: mrwaipReferenceSubset.medianMs / mrwaip.medianMs,
                  benchmarkReferenceMedianMs: mrwaipReferenceSubset.medianMs,
                  ...mrwaip,
                }
              : {}),
          },
        ],
      },
      {
        id: "svelte-5.56.8-verter",
        files: currentEligible.length,
        excludedFiles: files.length - currentEligible.length,
        bytes: currentBytes,
        variants: [
          {
            id: "official",
            label: "svelte/compiler",
            version: "5.56.8",
            status: "reference",
            correctFiles: files.length,
            attemptFiles: files.length,
            ...officialCurrent,
          },
          {
            id: "verter",
            label: "@verter/wasm",
            version: "0.0.1-beta.3",
            status:
              target.generate !== "client"
                ? "unsupported"
                : verterCorrect === files.length
                  ? "ok"
                  : "unranked",
            compiledFiles: verterCoverage.compiled,
            correctFiles: verterCorrect,
            exactOutputDivergences: currentEligible.length - verterCoverage.correct,
            benchmarkFiles: verterComparable ? currentEligible.length : 0,
            failureExamples: verterCoverage.failures,
            adapter: "Node WASM asset-path adapter",
            ...(verterAttempts
              ? {
                  attemptFiles: files.length,
                  attemptMedianMs: verterAttempts.medianMs,
                  attemptRatioVsRsvelte: verterAttempts.medianMs / rustMultiAttempts.medianMs,
                }
              : {}),
            ...(verter && verterReferenceSubset
              ? {
                  speedup: verterReferenceSubset.medianMs / verter.medianMs,
                  benchmarkReferenceMedianMs: verterReferenceSubset.medianMs,
                  ...verter,
                }
              : {}),
          },
        ],
      },
    ],
  });
}

// Everything below this line is corpus-wide -- tool tasks, the printer, and
// competitor arms -- and a subset run wants none of it. It is also where this
// script has hung: @verter/wasm panics on a non-ASCII char boundary and the run
// blocked there for 30 minutes with the surfaces already measured, then lost
// them because the artifact is only written at the very end. Write the measured
// surfaces first so a kill in the tail cannot discard a completed measurement.
{
  // A full run must not write a partial file to the published path, so its
  // crash-safety copy goes to a sidecar; a subset run has nothing else to write.
  const surfacesPath = requestedTargets ? outputPath : `${outputPath}.surfaces.json`;
  writeFileSync(
    surfacesPath,
    `${JSON.stringify(
      {
        schemaVersion: 10,
        kind: "rsvelte-performance-report",
        generatedAt: new Date().toISOString(),
        partial: {
          surfacesMeasured: targets.map((t) => t.id),
          surfacesOmitted: allTargets.filter((t) => !targets.includes(t)).map((t) => t.id),
          incomplete: "surfaces only; tool tasks, printer and competitor arms not run",
          note: requestedTargets
            ? "Subset run (RSVELTE_REPORT_TARGETS). Not the published report; do not quote as one."
            : "Crash-safety copy of a full run's surfaces, written before the corpus-wide tail. The published report is the sibling file.",
        },
        surfaces,
      },
      null,
      2,
    )}\n`,
  );
  console.error(`[report] wrote surfaces-only artifact to ${surfacesPath}`);
}

console.error("[report] benchmarking parser and toolchain tasks");
const toolFileListDir = mkdtempSync(join(tmpdir(), "rsvelte-tool-corpus-"));
const toolFileList = join(toolFileListDir, "files.txt");
writeFileSync(toolFileList, `${files.map(({ path }) => path).join("\n")}\n`);
const toolBenchmark = spawnSync(process.execPath, [join(root, "scripts/bench/run-benchmark.mjs")], {
  cwd: root,
  encoding: "utf8",
  maxBuffer: 1 << 28,
  env: {
    ...process.env,
    BENCHMARK_TASKS: "parse,svelte2tsx,fmt,lint,svelte-check",
    BENCHMARK_FILE_LIST: toolFileList,
    BENCHMARK_WARMUP: String(warmups),
    BENCHMARK_ITERATIONS: String(runs),
  },
});
rmSync(toolFileListDir, { recursive: true, force: true });
if (toolBenchmark.stderr) process.stderr.write(toolBenchmark.stderr);
if (toolBenchmark.status !== 0) {
  throw new Error(`Toolchain benchmark exited ${toolBenchmark.status}`);
}
const toolResults = JSON.parse(toolBenchmark.stdout);

const packageVersion = (path) => JSON.parse(readFileSync(join(root, path), "utf8")).version;
const toolTask = ({
  id,
  label,
  reference,
  version,
  rsvelteLabel = "rsvelte",
  rsvelteVersion,
  result,
  files,
  excludedFiles = 0,
  rulesCount,
  note,
}) => ({
  id,
  label,
  dataset: id.startsWith("svelte-check") ? "synthetic-workspace" : "compatibility-corpus",
  files,
  excludedFiles,
  ...(rulesCount ? { rulesCount } : {}),
  reference: {
    label: reference,
    version,
    ...result.javascript,
  },
  rsvelteSingle: {
    label: rsvelteLabel,
    ...(rsvelteVersion ? { version: rsvelteVersion } : {}),
    threading: "single",
    speedup: result.speedup.singleThreadVsJs,
    ...result.rustSingleThread,
  },
  rsvelteParallel: {
    label: rsvelteLabel,
    ...(rsvelteVersion ? { version: rsvelteVersion } : {}),
    threading: "parallel",
    speedup: result.speedup.multiThreadVsJs,
    ...result.rustMultiThread,
  },
  alternatives: (result.alternatives ?? []).map((alternative) => ({
    ...alternative,
    speedupVsRsvelteParallel: alternative.durationMs / result.rustMultiThread.durationMs,
  })),
  note,
});

const fixtureFiles = toolResults.testFilesCount;
const fixtureExcluded = toolResults.excludedFilesCount;
const svelteCheckVersion = packageVersion(
  "submodules/language-tools/packages/svelte-check/package.json",
);
// TypeScript 7 stable, installed under the `@typescript/native` alias that
// svelte-check itself prescribes; the manifest inside still names itself
// `typescript`, which is what both --tsgo resolvers match on.
const tsgoVersion = `TypeScript ${packageVersion(
  "scripts/bench/competitor-oracle/node_modules/@typescript/native/package.json",
)} (native)`;
const typescriptVersion = packageVersion(
  "submodules/language-tools/packages/svelte-check/node_modules/typescript/package.json",
);
const svelteCheckRsVersion = packageVersion(
  "scripts/bench/competitor-oracle/node_modules/svelte-check-rs/package.json",
);
const svelteCheckRsTsgoVersion = packageVersion(
  "scripts/bench/competitor-oracle/node_modules/@typescript/native-preview/package.json",
);
const oxvelteAlternative = toolResults.lint.alternatives.find(({ id }) => id === "oxvelte");
if (!oxvelteAlternative) throw new Error("the lint task did not measure oxvelte");
const toolTasks = [
  toolTask({
    id: "parser",
    label: "Parser",
    reference: "svelte/compiler.parse",
    version: "5.56.8",
    result: toolResults.parse,
    files: fixtureFiles,
    excludedFiles: fixtureExcluded,
    note: "Complete collected corpus accepted by the official compiler in CSR and SSR.",
  }),
  toolTask({
    id: "svelte2tsx",
    label: "svelte2tsx",
    reference: "svelte2tsx",
    version: packageVersion("submodules/language-tools/packages/svelte2tsx/package.json"),
    result: toolResults.svelte2tsx,
    files: fixtureFiles,
    excludedFiles: fixtureExcluded,
    note: "Complete collected corpus accepted by the official compiler in CSR and SSR.",
  }),
  toolTask({
    id: "fmt",
    label: "Formatter",
    reference: "Prettier + prettier-plugin-svelte",
    version: `${packageVersion("node_modules/prettier/package.json")} + ${packageVersion("node_modules/prettier-plugin-svelte/package.json")}`,
    result: toolResults.fmt,
    files: fixtureFiles,
    excludedFiles: fixtureExcluded,
    note: "Complete collected corpus accepted by the official compiler in CSR and SSR.",
  }),
  toolTask({
    id: "lint",
    label: "Linter",
    reference: "ESLint + eslint-plugin-svelte",
    version: `10.x + ${packageVersion("scripts/compat-corpus/lint-oracle/node_modules/eslint-plugin-svelte/package.json")}`,
    result: toolResults.lint,
    files: fixtureFiles,
    excludedFiles: fixtureExcluded,
    rulesCount: toolResults.lint.rulesCount,
    note: `${toolResults.lint.rulesCount} rules implemented by both linters. oxvelte runs ${oxvelteAlternative.rulesCount} of them; it is a CLI, so its sample also carries process startup and its own file discovery.`,
  }),
  toolTask({
    id: "svelte-check-tsgo",
    label: "Typecheck",
    reference: "svelte-check",
    version: `${svelteCheckVersion} + TypeScript ${typescriptVersion}`,
    rsvelteLabel: "rsvelte + tsgo",
    rsvelteVersion: tsgoVersion,
    result: {
      ...toolResults.svelteCheck.endToEnd,
      alternatives: toolResults.svelteCheck.endToEnd.alternatives.map((alternative) => ({
        ...alternative,
        version:
          alternative.id === "svelte-check-rs"
            ? `${svelteCheckRsVersion} + tsgo ${svelteCheckRsTsgoVersion}`
            : `${svelteCheckVersion} + ${tsgoVersion}`,
      })),
    },
    files: toolResults.svelteCheck.filesCount,
    note: `${toolResults.svelteCheck.filesCount.toLocaleString("en-US")}-file synthetic workspace; end-to-end Svelte and TypeScript diagnostics. The equivalent tsgo rows use ${tsgoVersion}; regular svelte-check uses TypeScript ${typescriptVersion}. svelte-check-rs uses default diagnostic sources and is shown separately after passing ${toolResults.svelteCheck.endToEnd.alternatives.find((alternative) => alternative.id === "svelte-check-rs").compatibility.matchedDiagnostics}/${toolResults.svelteCheck.endToEnd.alternatives.find((alternative) => alternative.id === "svelte-check-rs").compatibility.expectedDiagnostics} planted diagnostic checks.`,
  }),
];

console.error("[report] benchmarking JavaScript printers");
const printerBenchmark = spawnSync(
  process.execPath,
  [join(root, "scripts/bench/run-printer-benchmark.mjs")],
  {
    cwd: root,
    encoding: "utf8",
    maxBuffer: 1 << 24,
    env: {
      ...process.env,
      PRINTER_BENCHMARK_WARMUPS: String(warmups),
      PRINTER_BENCHMARK_RUNS: String(runs),
    },
  },
);
if (printerBenchmark.stderr) process.stderr.write(printerBenchmark.stderr);
if (printerBenchmark.status !== 0) {
  throw new Error(`Printer benchmark exited ${printerBenchmark.status}`);
}
const printerBenchmarks = JSON.parse(printerBenchmark.stdout);
const printerOutputPath = join(root, "apps/playground/static/printer-performance-report.json");
writeFileSync(printerOutputPath, `${JSON.stringify(printerBenchmarks, null, 2)}\n`);

const git = (...args) => {
  try {
    return execFileSync("git", args, { cwd: root, encoding: "utf8" }).trim();
  } catch {
    return "unknown";
  }
};
const fileSetHash = createHash("sha256")
  .update(selectedEntries.map(({ id }) => id).join("\n"))
  .digest("hex");
const result = {
  schemaVersion: 10,
  kind: "rsvelte-performance-report",
  generatedAt: new Date().toISOString(),
  // A subset run is not the published artifact. Redirecting the output protects the
  // published file; this marks the value itself, so a reader who opens the JSON — or
  // quotes a number out of it — can see that three surfaces are missing.
  ...(requestedTargets
    ? {
        partial: {
          surfacesMeasured: targets.map((t) => t.id),
          surfacesOmitted: allTargets
            .filter((t) => !targets.includes(t))
            .map((t) => t.id),
          note: "Subset run (RSVELTE_REPORT_TARGETS). Not the published report; do not quote as one.",
        },
      }
    : {}),
  provenance: {
    benchmarkDesign:
      "https://github.com/pikax/svelte-benchmarks/tree/e19c48b81ad24b75a6d4b81377b4a7ebc39a1900",
    // The two arms do not perform identical work, and a speedup column invites the
    // reader to assume they do.
    armsDiffer:
      "official's compile() sets result.ast = to_public_ast(...) unconditionally " +
      "(compiler/index.js:58) - for the legacy shape a full convert(source, ast) walk - " +
      "while rsvelte defers that field to its first reader, and neither this harness nor a " +
      "bundler ever reads it. The speedup column therefore includes work only official " +
      "performs. This is the comparison a bundler experiences (@sveltejs/vite-plugin-svelte " +
      "is charged for the AST whether it wants it or not), so it is reported as-is rather " +
      "than corrected; it is NOT a like-for-like compiler-throughput ratio. The deferral " +
      "also cuts the other way: rsvelte's CompiledAst::get() does not serialize a retained " +
      "tree, it rebuilds PreparedComponent from the source, so a consumer that reads .ast " +
      "pays a fresh parse on top of the compile, where official's is already built. " +
      "BOTH magnitudes are unmeasured - official's to_public_ast + convert, and rsvelte's " +
      "re-parse. No shipping consumer currently reads .ast (a repo search finds it only in " +
      "scripts/dev/test-napi-compile-options.mjs and in the playground, which calls " +
      "parse_svelte rather than compile; control: .js.code has 109 read sites), so today the " +
      "second direction is latent rather than paid.",
    reproduceCommand: "pnpm benchmark:reproduce",
    competitorPackages: [
      "@mrwaip/svelte-rs@0.0.0-canary.13.1",
      "@verter/wasm@0.0.1-beta.3",
      "esrap@2.3.2",
      "oxfmt@0.62.0",
      `svelte-check@${svelteCheckVersion}`,
      `svelte-check-rs@${svelteCheckRsVersion}`,
      `typescript@${typescriptVersion}`,
      `@typescript/native (npm:typescript@${tsgoVersion.replace(/^TypeScript | \(native\)$/g, "")})`,
      `oxvelte@${OXVELTE_VERSION}+${OXVELTE_REV}`,
    ],
    competitorReferences: ["svelte@5.56.4", "svelte@5.56.8"],
  },
  commit: {
    rsvelte: git("rev-parse", "HEAD"),
    upstreamSvelte: git("-C", "submodules/svelte", "rev-parse", "HEAD"),
  },
  corpus: {
    name: "rsvelte real-world compatibility corpus",
    configuredComponentFiles: componentEntries.length,
    measuredFiles: files.length,
    bytes: files.reduce((sum, file) => sum + file.bytes, 0),
    truncated: fileLimit > 0,
    fileSetHash: `sha256:${fileSetHash}`,
  },
  runner: {
    label: process.env.BENCHMARK_RUNNER_LABEL ?? "local",
    platform: platform(),
    arch: arch(),
    cpus: cpus().length,
    cpuModel: cpus()[0]?.model?.trim() ?? "unknown",
    node: process.versions.node,
    loadAvg1min: loadavg()[0],
    warmups,
    runs,
  },
  surfaces,
  toolTasks,
  printerBenchmarks,
  benchmarkCoverage: [
    { id: "compiler", label: "Compiler", status: "measured", detail: "CSR, SSR, CSR dev, SSR dev" },
    {
      id: "printer",
      label: "JavaScript printer",
      status: "measured",
      detail: "Code, decoded source maps, and common comments",
    },
    { id: "parser", label: "Parser", status: "measured", detail: "Complete accepted corpus" },
    { id: "projection", label: "TS projection", status: "measured", detail: "svelte2tsx" },
    {
      id: "typecheck",
      label: "Typecheck",
      status: "measured",
      detail: "End-to-end diagnostics, including svelte-check-rs",
    },
    { id: "format", label: "Format", status: "measured", detail: "Prettier and Oxfmt" },
    {
      id: "lint",
      label: "Lint",
      status: "measured",
      detail: `${toolResults.lint.rulesCount} equivalent rules, including oxvelte`,
    },
    {
      id: "metadata",
      label: "Component metadata",
      status: "unmeasured",
      detail: "sveld, svelte-docinfo, Verter",
    },
    {
      id: "lsp-hover",
      label: "LSP hover",
      status: "unsupported",
      detail: "Not implemented by rsvelte LS",
    },
    {
      id: "lsp-format",
      label: "LSP formatting",
      status: "unmeasured",
      detail: "Supported; adapter not pinned",
    },
    { id: "memory", label: "Memory", status: "unmeasured", detail: "Peak RSS and resource use" },
    { id: "vite", label: "Vite", status: "unmeasured", detail: "Bundle and incremental transform" },
  ],
  alternativeProducts: [
    {
      task: "fmt",
      label: "dprint + markup_fmt",
      status: "unmeasured",
      note: "Svelte is supported through the markup_fmt plugin; no in-process benchmark adapter is pinned yet.",
    },
    {
      task: "fmt",
      label: "Biome",
      status: "different-scope",
      note: "Svelte formatting is experimental and does not yet cover the same syntax as the parity benchmark.",
    },
    {
      task: "lint",
      label: "Oxlint",
      status: "different-scope",
      note: `Oxlint does not implement the ${toolResults.lint.rulesCount} Svelte-specific rules used by this benchmark.`,
    },
    {
      task: "lint",
      label: "Biome",
      status: "different-scope",
      note: "Biome does not implement the same Svelte-specific rule set.",
    },
    {
      task: "typecheck",
      label: "svelte-check-rs",
      status: "different-scope",
      note: "Uses a different diagnostic pipeline; an equivalent Svelte-only adapter is not pinned yet.",
    },
    {
      task: "typecheck",
      label: "svelte-check-native",
      status: "different-scope",
      note: "Uses a different TypeScript engine, so its end-to-end result is not mixed into this Svelte-only row.",
    },
    {
      task: "typecheck",
      label: "verter-tsc",
      status: "different-scope",
      note: "Experimental and not yet pinned to an equivalent benchmark adapter.",
    },
  ],
  unsupported: [],
  methodology: [
    "Compiler rows use real files read byte-for-byte from the pinned compatibility corpus.",
    "Parser, formatter, linter, and svelte2tsx rows use the same complete collected corpus accepted by the official compiler in CSR and SSR.",
    `Typecheck runs end to end on a generated ${toolResults.svelteCheck.filesCount.toLocaleString("en-US")}-file workspace; regular svelte-check uses its pinned TypeScript backend, and the svelte-check + tsgo and rsvelte + tsgo rows share the same pinned tsgo backend.`,
    "svelte-check-rs is timed on the same workspace and gated with planted script and template diagnostics, but remains a separate default-sources workload because its CLI cannot select diagnostic sources.",
    "Each compiler is compared only with the official compiler version it targets; accepted inputs require output parity and rejected inputs require rejection parity.",
    "Every published duration is the median of warmed in-process runs; raw samples and coefficient of variation remain in this artifact.",
    "A competitor stays unranked unless every complete-corpus input has the same acceptance outcome and every accepted input has equivalent normalized JavaScript and identical CSS output.",
    "Compiler elapsed time and correctness use the same complete corpus, with rejections included; partial implementations remain visible but are not equivalent-work speed rankings.",
    "Verter's published Node package requires an asset-path adapter; initialization is excluded from timed samples.",
    "Printer rows use a fixed generated-JavaScript corpus and native wall time. Each backend retains its parsed AST; parsing and process startup are excluded.",
    `oxvelte is measured through its CLI on the same corpus, with every rule outside the shared universe turned off; its row is scoped to the ${oxvelteAlternative.rulesCount} universe rules it implements and carries process startup and file discovery the in-process rows do not.`,
  ],
};

writeFileSync(outputPath, `${JSON.stringify(result, null, 2)}\n`);
execFileSync(join(root, "node_modules/.bin/oxfmt"), [outputPath], { stdio: "ignore" });
execFileSync(join(root, "node_modules/.bin/oxfmt"), [printerOutputPath], { stdio: "ignore" });
console.error(`[report] wrote ${outputPath}`);
