#!/usr/bin/env node
/**
 * Benchmark script that measures JS vs Rust performance across seven tasks:
 * compile-client, compile-server, parse, svelte2tsx, fmt, lint, svelte-check.
 *
 * The JS baselines (`svelte/compiler`, `svelte2tsx`, `svelte-check`) live in
 * submodules and publish their consumable entrypoints as rollup build
 * outputs, not checked-in artefacts — so we bootstrap them on demand
 * below, then dynamic-import once they exist. Already-built outputs are
 * skipped, so a warm checkout pays nothing.
 */

import { execSync, spawn, spawnSync } from "child_process";
import { createHash } from "crypto";
import { copyFileSync, mkdirSync, mkdtempSync, realpathSync, rmSync, symlinkSync } from "fs";
import { arch as nodeArch, cpus, loadavg as osLoadAvg, platform as nodePlatform, tmpdir } from "os";
import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from "fs";
import { join, dirname, relative, basename, isAbsolute, sep } from "path";
import { fileURLToPath } from "url";
import { format as oxfmtFormat } from "oxfmt";
import {
  OXVELTE_BIN,
  OXVELTE_REV,
  OXVELTE_VERSION,
  oxvelteInstalled,
  oxvelteRules,
} from "./oxvelte-oracle.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, "../..");
const SVELTE_TESTS = join(REPO_ROOT, "submodules/svelte/packages/svelte/tests");
const OXFMT_BIN = join(REPO_ROOT, "node_modules/.bin/oxfmt");
const OXFMT_CONFIG = join(REPO_ROOT, "scripts/fixtures/fmt-corpus.oxfmtrc.json");
const REQUESTED_TASKS = new Set(
  (
    process.env.BENCHMARK_TASKS ??
    "compile-client,compile-server,parse,svelte2tsx,fmt,lint,svelte-check"
  )
    .split(",")
    .map((task) => task.trim())
    .filter(Boolean),
);

/**
 * Ensure the JS baselines the benchmark consumes are built. Both are
 * generated outputs (svelte/compiler is rollup-bundled, svelte2tsx is
 * rollup-bundled too) — a fresh `git submodule update` alone leaves the
 * upstream sources but not these files. Skips work when the outputs
 * already exist so warm checkouts (CI cache hits or repeat local runs)
 * cost nothing.
 */
function ensureBenchDeps() {
  // Stdio used for every shell-out below: stdin ignored, child stdout
  // redirected to *our* stderr so it can never corrupt the JSON the
  // parent script pipes from our stdout, stderr inherited so build
  // logs still surface in the terminal.
  const sio = { stdio: ["ignore", 2, "inherit"] };
  const run = (cmd, cwd) => execSync(cmd, { ...sio, cwd: join(REPO_ROOT, cwd) });
  const built = (marker) => existsSync(join(REPO_ROOT, marker));

  // 1. svelte/compiler — self-contained, has its own install + build.
  if (!built("submodules/svelte/packages/svelte/compiler/index.js")) {
    console.error("[run-benchmark] building svelte/compiler (one-time)…");
    run("pnpm install --frozen-lockfile && pnpm build", "submodules/svelte");
  }

  // 2. language-tools — svelte2tsx → language-server → svelte-check is a
  // hard dependency chain (each package's build config imports the
  // previous package's `dist/`). Walk it explicitly so we don't end up
  // re-running upstream's recursive `pnpm build` script, which
  // rebuilds everything and tail-runs a slow `test:sanity` pass.
  const langPkgs = [
    {
      name: "svelte2tsx",
      marker: "submodules/language-tools/packages/svelte2tsx/index.mjs",
      cwd: "submodules/language-tools/packages/svelte2tsx",
      cmd: "pnpm build",
    },
    {
      name: "language-server",
      marker: "submodules/language-tools/packages/language-server/dist/src/index.js",
      cwd: "submodules/language-tools/packages/language-server",
      cmd: "pnpm build",
    },
    {
      name: "svelte-check",
      marker: "submodules/language-tools/packages/svelte-check/dist/src/index.js",
      cwd: "submodules/language-tools/packages/svelte-check",
      // Upstream's `pnpm build` recursively rebuilds svelte2tsx +
      // language-server (idempotent but slow) and runs a fixture
      // `test:sanity` pass. Invoke rollup directly — it's in
      // svelte-check's own devDeps.
      cmd: "pnpm exec rollup -c",
    },
  ];
  const requiredLangPackages = REQUESTED_TASKS.has("svelte-check")
    ? langPkgs
    : langPkgs.filter(({ name }) => name === "svelte2tsx");
  const langPending = requiredLangPackages.filter((p) => !built(p.marker));
  if (langPending.length > 0) {
    if (!built("submodules/language-tools/node_modules/.modules.yaml")) {
      console.error("[run-benchmark] installing language-tools workspace (one-time)…");
      run("pnpm install --frozen-lockfile", "submodules/language-tools");
    }
    for (const pkg of langPending) {
      console.error(`[run-benchmark] building language-tools/${pkg.name} (one-time)…`);
      run(pkg.cmd, pkg.cwd);
    }
  }

  // 3. The lint baseline is the real eslint-plugin-svelte, installed in the
  // parity corpus' isolated oracle package (same pin the lint gate compares
  // against) rather than as a root devDependency.
  if (!built("scripts/compat-corpus/lint-oracle/node_modules/eslint-plugin-svelte")) {
    console.error("[run-benchmark] installing lint oracle (one-time)…");
    run("npm ci", "scripts/compat-corpus/lint-oracle");
  }
}

ensureBenchDeps();

// Now safe to import. We use dynamic imports so the prereq check above
// runs first — static imports get hoisted and would crash before we
// could print a helpful message / build the missing output.
const svelteCompilerMod = await import("../../submodules/svelte/packages/svelte/compiler/index.js");
const { compile, parse } = svelteCompilerMod.default ?? svelteCompilerMod;
const { svelte2tsx: upstreamSvelte2tsx } =
  await import("../../submodules/language-tools/packages/svelte2tsx/index.mjs");

// Prettier + prettier-plugin-svelte are the JS baseline for the `fmt` task.
// Both are plain npm devDependencies (see root package.json), so a normal
// `pnpm install` makes them resolvable — unlike svelte/compiler and
// language-tools above, there is nothing to build first. prettier-plugin-
// svelte also peer-depends on `svelte`, which is likewise a devDependency.
let prettier;
let prettierPluginSvelte;
try {
  const prettierMod = await import("prettier");
  prettier = prettierMod.default ?? prettierMod;
  prettierPluginSvelte = await import("prettier-plugin-svelte");
} catch (err) {
  console.error(
    "[run-benchmark] prettier / prettier-plugin-svelte not found — run `pnpm install`.",
  );
  throw err;
}

const TEST_CATEGORIES = [
  "parser-modern/samples",
  "snapshot/samples",
  "css/samples",
  "runtime-runes/samples",
  "runtime-legacy/samples",
  "runtime-browser/samples",
  "hydration/samples",
  "server-side-rendering/samples",
  "validator/samples",
];

// How many iterations to run for accurate timing.
// Override via env vars when you need tighter error bars — e.g. when
// publishing `apps/playground/static/benchmark-results.json`, run with
// `BENCHMARK_WARMUP=3 BENCHMARK_ITERATIONS=10 node scripts/bench/run-benchmark.mjs`
// so per-run jitter (mostly JS-side V8 inlining warmup) is averaged out.
const WARMUP_ITERATIONS = Number(process.env.BENCHMARK_WARMUP ?? 1);
const BENCHMARK_ITERATIONS = Number(process.env.BENCHMARK_ITERATIONS ?? 3);
function findSvelteFiles(dir, files = []) {
  if (!existsSync(dir)) return files;

  const entries = readdirSync(dir);
  for (const entry of entries) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);

    if (stat.isDirectory()) {
      findSvelteFiles(fullPath, files);
    } else if (entry.endsWith(".svelte")) {
      files.push({
        path: fullPath,
        content: readFileSync(fullPath, "utf-8"),
        size: stat.size,
      });
    }
  }

  return files;
}

/**
 * Svelte's test corpus deliberately contains sources that do not compile —
 * `validator/samples` is mostly error cases. Those files return from the
 * compiler almost immediately, so leaving them in blends "time to compile" with
 * "time to throw". Keep only what the official compiler accepts in *both*
 * client and server mode.
 */
function filterCompilableFiles(files) {
  return files.filter((file) => {
    for (const generate of ["client", "server"]) {
      try {
        compile(file.content, { generate, filename: file.path, dev: false });
      } catch {
        return false;
      }
    }
    return true;
  });
}

let cachedTestFiles = null;

function collectTestFiles() {
  if (cachedTestFiles) return cachedTestFiles;

  const externalFileList = process.env.BENCHMARK_FILE_LIST;
  if (externalFileList) {
    const collected = readFileSync(externalFileList, "utf8")
      .split(/\r?\n/)
      .filter(Boolean)
      .map((path) => ({ path, content: readFileSync(path, "utf8") }));
    const files = filterCompilableFiles(collected);
    const excluded = collected.length - files.length;
    console.error(
      `[run-benchmark] complete corpus: excluded ${excluded} files rejected by the reference (${collected.length} → ${files.length})`,
    );
    cachedTestFiles = { files, excludedCount: excluded };
    return cachedTestFiles;
  }

  const collected = [];
  for (const category of TEST_CATEGORIES) {
    const categoryPath = join(SVELTE_TESTS, category);
    findSvelteFiles(categoryPath, collected);
  }

  const files = filterCompilableFiles(collected);
  const excluded = collected.length - files.length;
  console.error(
    `[run-benchmark] excluded ${excluded} files that fail to compile (${collected.length} → ${files.length})`,
  );

  cachedTestFiles = { files, excludedCount: excluded };
  return cachedTestFiles;
}

function processFileJS(file, task) {
  switch (task) {
    case "compile-client":
      compile(file.content, {
        generate: "client",
        filename: file.path,
        dev: false,
      });
      break;
    case "compile-server":
      compile(file.content, {
        generate: "server",
        filename: file.path,
        dev: false,
      });
      break;
    case "parse":
      parse(file.content, { modern: true });
      break;
    case "svelte2tsx":
      upstreamSvelte2tsx(file.content, {
        filename: file.path,
        isTsFile: false,
        mode: "ts",
        typingsNamespace: "svelteHTML",
        version: "5",
      });
      break;
  }
}

function benchmarkJavaScript(files, iterations, task) {
  const times = [];

  for (let i = 0; i < WARMUP_ITERATIONS; i++) {
    for (const file of files) {
      try {
        processFileJS(file, task);
      } catch {
        // Ignore compilation errors for benchmark
      }
    }
  }

  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    for (const file of files) {
      try {
        processFileJS(file, task);
      } catch {
        // Ignore compilation errors for benchmark
      }
    }
    const end = performance.now();
    times.push(end - start);
  }

  return times;
}

/**
 * Benchmark Rust compiler using the benchmark binary.
 *
 * `binName` selects which Cargo binary drives the task. Compiler tasks
 * (compile-client / parse / svelte2tsx) use `benchmark_runner` in
 * `rsvelte_devtools`; the `fmt` task uses `fmt_benchmark_runner` in
 * `rsvelte_fmt` (the formatter can't live in the compiler crate without a
 * dependency cycle). Both share the same CLI + JSON-output contract.
 */
async function benchmarkRust(
  files,
  singleThread,
  task,
  binName = "benchmark_runner",
  extraArgs = [],
) {
  const mode = singleThread ? "single" : "multi";

  const fileList = files.map((f) => f.path).join("\n");
  const tempFile = join(__dirname, "../../.benchmark-files.txt");
  writeFileSync(tempFile, fileList);

  // `profile.release` sets `panic = "abort"`, so a formatter/linter panic on
  // a malformed corpus file would kill the whole run. Both runners rely on
  // `catch_unwind` to skip such files, which only works under a profile with
  // `panic = "unwind"` — that's exactly what `profile.bench` is for (it
  // inherits release's optimisation flags, so the timings stay
  // representative). Compiler tasks don't panic on this corpus, so they
  // keep the faster-to-link release profile.
  const profileFlag = binName === "benchmark_runner" ? "--release" : "--profile=bench";
  const packageArgs = binName === "benchmark_runner" ? ["-p", "rsvelte_devtools"] : [];

  return new Promise((resolve, reject) => {
    const args = [
      "run",
      profileFlag,
      ...packageArgs,
      "--bin",
      binName,
      "--",
      "--mode",
      mode,
      "--task",
      task,
      "--files",
      tempFile,
      "--iterations",
      String(BENCHMARK_ITERATIONS),
      "--warmup",
      String(WARMUP_ITERATIONS),
      ...extraArgs,
    ];

    const proc = spawn("cargo", args, {
      cwd: join(__dirname, "../.."),
      stdio: ["ignore", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";

    proc.stdout.on("data", (data) => {
      stdout += data.toString();
    });
    proc.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    proc.on("close", (code) => {
      if (code !== 0) {
        console.error("Rust benchmark stderr:", stderr);
        reject(new Error(`Rust benchmark failed with code ${code}`));
        return;
      }

      try {
        const result = JSON.parse(stdout);
        resolve(result.times);
      } catch (e) {
        console.error("Failed to parse Rust output:", stdout);
        reject(e);
      }
    });
  });
}

function getCommitSha() {
  try {
    return execSync("git rev-parse --short HEAD", { encoding: "utf-8" }).trim();
  } catch {
    return "unknown";
  }
}

/**
 * Capture hardware / OS info for the machine running this benchmark.
 * Surfaced into the JSON output so the /benchmark page can credit the
 * runner — multi-threaded numbers only mean something in the context
 * of how many cores were available. In CI the workflow sets
 * `BENCHMARK_RUNNER_LABEL` to the GitHub-hosted runner label
 * (e.g. `ubuntu-22.04-arm-16-cores`); locally it's just "local".
 *
 * Also records the Node + V8 versions and a 1-minute load average so
 * that JS-baseline regressions between snapshots are diagnosable. V8
 * inlining heuristics and per-version optimizations can move the JS
 * Svelte compiler's wall-clock time by 2× between Node releases, and
 * background CPU contention can move it another 2× — without these
 * fields recorded, a future "why did the speedup ratio change?" review
 * can't tell environmental drift from real regressions.
 */
function getRunnerInfo() {
  const cpuList = cpus();
  // `os.loadavg()` returns [1min, 5min, 15min] on Unix; on Windows it
  // returns `[0, 0, 0]`. We only emit the 1-minute figure (the rest is
  // rarely actionable for a benchmark run that takes <5min total).
  let loadAvg = null;
  try {
    loadAvg = osLoadAvg()[0];
  } catch {
    loadAvg = null;
  }
  return {
    label: process.env.BENCHMARK_RUNNER_LABEL || "local",
    os: nodePlatform(),
    arch: nodeArch(),
    cpus: cpuList.length,
    cpuModel: cpuList[0]?.model?.trim() ?? "unknown",
    nodeVersion: process.versions.node,
    v8Version: process.versions.v8,
    loadAvg1min: loadAvg,
    warmupIterations: WARMUP_ITERATIONS,
    benchmarkIterations: BENCHMARK_ITERATIONS,
  };
}

/**
 * Calculate statistics from timing results.
 *
 * Headline `durationMs` uses the **median** rather than the mean —
 * median ignores a single warmup-jitter outlier without us having to
 * over-warm. `min` is the best-case (mostly-JIT-warm) time, `max` is
 * the worst case, and `stdDev` lets the page render an error bar so
 * apples-to-apples comparisons between snapshots are obvious.
 */
function calculateStats(times, filesCount) {
  const sum = times.reduce((a, b) => a + b, 0);
  const mean = sum / times.length;
  const sorted = times.slice().sort((a, b) => a - b);
  const median =
    sorted.length % 2 === 0
      ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
      : sorted[(sorted.length - 1) / 2];
  const variance = times.reduce((acc, t) => acc + (t - mean) ** 2, 0) / times.length;
  const stdDev = Math.sqrt(variance);

  return {
    durationMs: median,
    throughputFilesPerSec: (filesCount / median) * 1000,
    minMs: sorted[0],
    maxMs: sorted[sorted.length - 1],
    meanMs: mean,
    stdDevMs: stdDev,
    samples: times.length,
  };
}

async function runBenchmarkTask(files, task) {
  const taskLabel = {
    "compile-client": "Compile (Client)",
    "compile-server": "Compile (SSR)",
    parse: "Parse",
    svelte2tsx: "svelte2tsx",
  }[task];

  console.error(`\n=== ${taskLabel} ===`);

  console.error(`  Benchmarking JavaScript...`);
  const jsTimes = benchmarkJavaScript(files, BENCHMARK_ITERATIONS, task);
  const jsStats = calculateStats(jsTimes, files.length);
  console.error(
    `    ${jsStats.durationMs.toFixed(2)}ms (${jsStats.throughputFilesPerSec.toFixed(0)} files/sec)`,
  );

  console.error(`  Benchmarking Rust (single-threaded)...`);
  const rustSingleTimes = await benchmarkRust(files, true, task);
  const rustSingleStats = calculateStats(rustSingleTimes, files.length);
  console.error(
    `    ${rustSingleStats.durationMs.toFixed(2)}ms (${rustSingleStats.throughputFilesPerSec.toFixed(0)} files/sec)`,
  );

  console.error(`  Benchmarking Rust (multi-threaded)...`);
  const rustMultiTimes = await benchmarkRust(files, false, task);
  const rustMultiStats = calculateStats(rustMultiTimes, files.length);
  console.error(
    `    ${rustMultiStats.durationMs.toFixed(2)}ms (${rustMultiStats.throughputFilesPerSec.toFixed(0)} files/sec)`,
  );

  const speedupSingle = jsStats.durationMs / rustSingleStats.durationMs;
  const speedupMulti = jsStats.durationMs / rustMultiStats.durationMs;

  console.error(
    `  Speedup: single=${speedupSingle.toFixed(1)}x, multi=${speedupMulti.toFixed(1)}x`,
  );

  return {
    task,
    taskLabel,
    javascript: { ...jsStats },
    rustSingleThread: { ...rustSingleStats },
    rustMultiThread: { ...rustMultiStats },
    speedup: {
      singleThreadVsJs: speedupSingle,
      multiThreadVsJs: speedupMulti,
    },
  };
}

/**
 * Strip the script's `task`/`taskLabel` framing so the result matches the docs
 * `BenchmarkTaskResults` shape (just javascript / rust* / speedup).
 */
function asTaskResults(taskResult) {
  const { javascript, rustSingleThread, rustMultiThread, speedup, alternatives } = taskResult;
  return {
    javascript,
    rustSingleThread,
    rustMultiThread,
    speedup,
    alternatives,
  };
}

// The `fmt` task pits prettier + prettier-plugin-svelte (the canonical JS
// Svelte formatter) against rsvelte_formatter over the shared per-file
// corpus. It needs its own runner because prettier 3's `format()` is async,
// whereas the compiler tasks above call synchronous APIs. The Rust side is
// driven by the `fmt_benchmark_runner` binary in `rsvelte_fmt`.

async function benchmarkPrettier(files, iterations) {
  const opts = (filepath) => ({
    parser: "svelte",
    plugins: [prettierPluginSvelte],
    filepath,
  });

  for (let i = 0; i < WARMUP_ITERATIONS; i++) {
    for (const file of files) {
      try {
        await prettier.format(file.content, opts(file.path));
      } catch {
        // Ignore formatting errors — some fixtures aren't valid Svelte.
      }
    }
  }

  const times = [];
  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    for (const file of files) {
      try {
        await prettier.format(file.content, opts(file.path));
      } catch {
        // Ignore formatting errors for benchmark
      }
    }
    times.push(performance.now() - start);
  }
  return times;
}

async function benchmarkOxfmt(files, iterations) {
  let completed = 0;
  for (const file of files) {
    try {
      const result = await oxfmtFormat(file.path, file.content, { svelte: true });
      if (result.errors.length === 0) completed += 1;
    } catch {
      // Completion is checked separately from the parallel timing run.
    }
  }

  const stage = mkdtempSync(join(REPO_ROOT, ".oxfmt-benchmark-"));
  const inputs = join(stage, "inputs");
  mkdirSync(inputs);
  try {
    for (const [index, file] of files.entries()) {
      copyFileSync(file.path, join(inputs, `${String(index).padStart(6, "0")}.svelte`));
    }
    const run = () => {
      const result = spawnSync(
        OXFMT_BIN,
        [
          "--check",
          `--threads=${cpus().length}`,
          "--config",
          OXFMT_CONFIG,
          "--ignore-path=/dev/null",
          inputs,
        ],
        { cwd: REPO_ROOT, stdio: "ignore" },
      );
      // Exit 2 includes per-file parse failures already captured by the completion pass.
      if (result.error || ![0, 1, 2].includes(result.status)) {
        throw result.error ?? new Error(`Oxfmt exited ${result.status}`);
      }
    };
    for (let i = 0; i < WARMUP_ITERATIONS; i++) run();
    const times = [];
    for (let i = 0; i < iterations; i++) {
      const start = performance.now();
      run();
      times.push(performance.now() - start);
    }
    return { completed, times };
  } finally {
    rmSync(stage, { recursive: true, force: true });
  }
}

async function runFmtTask(files) {
  console.error("\n=== fmt ===");

  console.error("  Benchmarking JavaScript (prettier-plugin-svelte)...");
  const jsTimes = await benchmarkPrettier(files, BENCHMARK_ITERATIONS);
  const jsStats = calculateStats(jsTimes, files.length);
  console.error(
    `    ${jsStats.durationMs.toFixed(2)}ms (${jsStats.throughputFilesPerSec.toFixed(0)} files/sec)`,
  );

  console.error("  Benchmarking alternative (oxfmt)...");
  const oxfmtResult = await benchmarkOxfmt(files, BENCHMARK_ITERATIONS);
  const oxfmtStats = calculateStats(oxfmtResult.times, files.length);
  console.error(
    `    ${oxfmtStats.durationMs.toFixed(2)}ms (${oxfmtResult.completed}/${files.length} files)`,
  );

  console.error("  Benchmarking Rust (single-threaded)...");
  const rustSingleTimes = await benchmarkRust(files, true, "fmt", "fmt_benchmark_runner");
  const rustSingleStats = calculateStats(rustSingleTimes, files.length);
  console.error(
    `    ${rustSingleStats.durationMs.toFixed(2)}ms (${rustSingleStats.throughputFilesPerSec.toFixed(0)} files/sec)`,
  );

  console.error("  Benchmarking Rust (multi-threaded)...");
  const rustMultiTimes = await benchmarkRust(files, false, "fmt", "fmt_benchmark_runner");
  const rustMultiStats = calculateStats(rustMultiTimes, files.length);
  console.error(
    `    ${rustMultiStats.durationMs.toFixed(2)}ms (${rustMultiStats.throughputFilesPerSec.toFixed(0)} files/sec)`,
  );

  const speedupSingle = jsStats.durationMs / rustSingleStats.durationMs;
  const speedupMulti = jsStats.durationMs / rustMultiStats.durationMs;
  console.error(
    `  Speedup: single=${speedupSingle.toFixed(1)}x, multi=${speedupMulti.toFixed(1)}x`,
  );

  return {
    task: "fmt",
    taskLabel: "fmt",
    javascript: { ...jsStats },
    alternatives: [
      {
        id: "oxfmt",
        label: "Oxfmt",
        version: "0.62.0",
        completedFiles: oxfmtResult.completed,
        ...oxfmtStats,
      },
    ],
    rustSingleThread: { ...rustSingleStats },
    rustMultiThread: { ...rustMultiStats },
    speedup: {
      singleThreadVsJs: speedupSingle,
      multiThreadVsJs: speedupMulti,
    },
  };
}

// The `lint` task pits ESLint + eslint-plugin-svelte against `rsvelte_lint`
// over the shared per-file corpus.
//
// Fairness rests on one thing: **both sides must evaluate the same rules.** A
// linter's cost is the sum of its enabled rules, so comparing rsvelte's rule
// set against the plugin's `recommended` preset would measure preset
// composition, not implementation speed. Both sides therefore run the parity
// corpus' rule universe (`scripts/compat-corpus/lint-universe.mjs`) — the
// intersection of "rules rsvelte implements" and "rules the pinned plugin
// exposes", minus the handful that are structurally incomparable (type-aware
// rules the oracle can't evaluate without a checker, and the compiler
// meta-rules whose cost is the compiler's, not the linter's). That is the same
// universe the lint output-parity gate diffs, so speed and parity are measured
// over identical work.
//
// The JS side is timed in-process by the oracle's own `run.mjs --bench`, so
// neither side pays node startup or ESLint config resolution inside the
// measured loop, and both pre-read every source before timing starts.
//
// One asymmetry is left in deliberately, and it counts AGAINST rsvelte:
// `rsvelte-lint` always runs its compiler validator pass (the analyzer's own
// warnings are part of what the tool reports), while the ESLint side's
// equivalent — `svelte/valid-compile` — sits outside the shared universe. The
// reported ratio therefore understates a rule-engine-only comparison.

const LINT_BENCH_BIN = join(REPO_ROOT, "target/release/lint_benchmark_runner");
const LINT_ORACLE_DIR = join(REPO_ROOT, "scripts/compat-corpus/lint-oracle");

function lintOracleMetadata() {
  const packageJson = JSON.parse(readFileSync(join(LINT_ORACLE_DIR, "package.json"), "utf8"));
  const lockfile = readFileSync(join(LINT_ORACLE_DIR, "package-lock.json"));
  return {
    eslintPluginSvelte: packageJson.dependencies["eslint-plugin-svelte"],
    lockfileSha256: createHash("sha256").update(lockfile).digest("hex"),
  };
}

function ensureLintBenchRunnerBuilt() {
  // Unconditional for the same reason as ensureRsvelteSvelteCheckBuilt.
  console.error("  Building lint_benchmark_runner...");
  // `--profile=bench` for the same reason the fmt runner uses it: the runner
  // isolates a per-file panic with `catch_unwind`, which needs unwinding.
  const r = spawnSync("cargo", ["build", "--profile=bench", "--bin", "lint_benchmark_runner"], {
    cwd: REPO_ROOT,
    stdio: ["ignore", 2, "inherit"],
  });
  if (r.status !== 0) throw new Error("cargo build --bin lint_benchmark_runner failed");
}

// oxvelte's walker drops a directory with any of these names outright, which
// would silently shrink the measured population.
const OXVELTE_SKIPPED_DIRS = new Set(["node_modules", ".svelte-kit", "build", "dist", ".git"]);

// Staging keeps each file's repo-relative path (renaming only a segment oxvelte
// would skip) because its SvelteKit-aware rules key on `src/routes/…`; a flat
// dir would silence them on one side of the comparison only.
function oxvelteStageRelative(path, index) {
  const rel = relative(REPO_ROOT, path);
  const usable = rel && !rel.startsWith("..") && !isAbsolute(rel);
  const source = usable ? rel : join("external", `${String(index).padStart(6, "0")}-${basename(path)}`);
  return source
    .split(sep)
    .map((segment) => (OXVELTE_SKIPPED_DIRS.has(segment) ? `${segment}_` : segment))
    .join(sep);
}

// oxvelte is a third implementation of this row, and the only one that is
// neither in-process nor configurable upward: `oxvelte.config.json` can turn a
// rule OFF but never ON, so the closest reachable set is `--all-rules` minus
// everything outside the shared universe. Whatever survives is the row's scope,
// and it is published as such — if oxvelte does not implement every rule the
// universe holds, the two sides are not doing equivalent work and the row is a
// separate scope rather than a ranking.
//
// Two asymmetries are left in and both count AGAINST oxvelte, so the number is
// a lower bound on its speed rather than a flattering one: it is a CLI, so its
// sample includes process startup and directory discovery that the in-process
// ESLint and rsvelte samples never pay, and it re-reads every source from disk
// inside the timed loop while the other two pre-read theirs.
function benchmarkOxvelte(files, universe, iterations) {
  const implemented = oxvelteRules();
  const shared = universe.filter((id) => implemented.has(id));
  const sharedSet = new Set(shared);
  const configFile = join(REPO_ROOT, ".benchmark-oxvelte-config.json");
  writeFileSync(
    configFile,
    JSON.stringify({
      rules: Object.fromEntries(
        [...implemented].filter((id) => !sharedSet.has(id)).map((id) => [id, "off"]),
      ),
    }),
  );

  const stage = mkdtempSync(join(tmpdir(), "rsvelte-oxvelte-benchmark-"));
  try {
    for (const [index, file] of files.entries()) {
      const target = join(stage, oxvelteStageRelative(file.path, index));
      mkdirSync(dirname(target), { recursive: true });
      copyFileSync(file.path, target);
    }

    const run = (stdio) =>
      spawnSync(
        OXVELTE_BIN,
        ["lint", "--all-rules", "--quiet", "--config", configFile, stage],
        // `--quiet` keeps rendering out of the sample; exit 1 only means the
        // corpus produced error-severity findings.
        { cwd: REPO_ROOT, encoding: "utf8", maxBuffer: 1 << 26, stdio },
      );

    const completion = run(["ignore", "ignore", "pipe"]);
    if (completion.error || ![0, 1].includes(completion.status)) {
      throw completion.error ?? new Error(`oxvelte exited ${completion.status}`);
    }
    const scanned = Number(completion.stderr.match(/^(\d+) file\(s\) scanned/m)?.[1] ?? NaN);
    if (scanned !== files.length) {
      throw new Error(`oxvelte scanned ${scanned} files, expected ${files.length}`);
    }
    const panicked = (completion.stderr.match(/^oxvelte: internal error parsing /gm) ?? []).length;

    for (let i = 0; i < WARMUP_ITERATIONS; i++) run("ignore");
    const times = [];
    for (let i = 0; i < iterations; i++) {
      const start = performance.now();
      run("ignore");
      times.push(performance.now() - start);
    }
    return { times, completed: scanned - panicked, rules: shared };
  } finally {
    rmSync(stage, { recursive: true, force: true });
    rmSync(configFile, { force: true });
  }
}

async function runLintTask(files) {
  console.error("\n=== lint ===");

  if (!oxvelteInstalled()) {
    throw new Error(
      `oxvelte is not installed at ${OXVELTE_BIN} — run \`pnpm run report:competitors:install\``,
    );
  }
  ensureLintBenchRunnerBuilt();
  const { ruleUniverse } = await import("../compat-corpus/lint-universe.mjs");
  const universe = ruleUniverse(LINT_BENCH_BIN);
  console.error(`  Rule universe: ${universe.length} rules enabled on both sides`);

  const rulesFile = join(REPO_ROOT, ".benchmark-lint-rules.json");
  const configFile = join(REPO_ROOT, ".benchmark-lint-config.json");
  writeFileSync(rulesFile, JSON.stringify(universe));
  writeFileSync(
    configFile,
    JSON.stringify({
      extends: ["none"],
      rules: Object.fromEntries(universe.map((id) => [id, "warn"])),
    }),
  );

  console.error("  Benchmarking JavaScript (eslint + eslint-plugin-svelte)...");
  const jsProc = spawnSync(
    "node",
    [
      "run.mjs",
      "--rules",
      rulesFile,
      "--stdin",
      "--bench",
      "--iterations",
      String(BENCHMARK_ITERATIONS),
      "--warmup",
      String(WARMUP_ITERATIONS),
    ],
    {
      cwd: LINT_ORACLE_DIR,
      input: files.map((f) => f.path).join("\0"),
      encoding: "utf8",
      maxBuffer: 1 << 28,
      stdio: ["pipe", "pipe", "inherit"],
    },
  );
  if (jsProc.status !== 0) throw new Error("lint oracle benchmark failed");
  const jsTimes = JSON.parse(jsProc.stdout).times;
  const jsStats = calculateStats(jsTimes, files.length);
  console.error(
    `    ${jsStats.durationMs.toFixed(2)}ms (${jsStats.throughputFilesPerSec.toFixed(0)} files/sec)`,
  );

  console.error("  Benchmarking alternative (oxvelte)...");
  const oxvelteResult = benchmarkOxvelte(files, universe, BENCHMARK_ITERATIONS);
  const oxvelteStats = calculateStats(oxvelteResult.times, files.length);
  console.error(
    `    ${oxvelteStats.durationMs.toFixed(2)}ms (${oxvelteResult.completed}/${files.length} files, ${oxvelteResult.rules.length}/${universe.length} shared rules)`,
  );

  console.error("  Benchmarking Rust (single-threaded)...");
  const rustSingleTimes = await benchmarkRust(files, true, "lint", "lint_benchmark_runner", [
    "--config",
    configFile,
  ]);
  const rustSingleStats = calculateStats(rustSingleTimes, files.length);
  console.error(
    `    ${rustSingleStats.durationMs.toFixed(2)}ms (${rustSingleStats.throughputFilesPerSec.toFixed(0)} files/sec)`,
  );

  console.error("  Benchmarking Rust (multi-threaded)...");
  const rustMultiTimes = await benchmarkRust(files, false, "lint", "lint_benchmark_runner", [
    "--config",
    configFile,
  ]);
  const rustMultiStats = calculateStats(rustMultiTimes, files.length);
  console.error(
    `    ${rustMultiStats.durationMs.toFixed(2)}ms (${rustMultiStats.throughputFilesPerSec.toFixed(0)} files/sec)`,
  );

  const speedupSingle = jsStats.durationMs / rustSingleStats.durationMs;
  const speedupMulti = jsStats.durationMs / rustMultiStats.durationMs;
  console.error(
    `  Speedup: single=${speedupSingle.toFixed(1)}x, multi=${speedupMulti.toFixed(1)}x`,
  );

  return {
    task: "lint",
    taskLabel: "lint",
    rulesCount: universe.length,
    javascript: { ...jsStats },
    alternatives: [
      {
        id: "oxvelte",
        label: "oxvelte",
        version: `${OXVELTE_VERSION} (${OXVELTE_REV.slice(0, 7)})`,
        completedFiles: oxvelteResult.completed,
        rulesCount: oxvelteResult.rules.length,
        comparable: oxvelteResult.rules.length === universe.length,
        scope: `${oxvelteResult.rules.length} of ${universe.length} shared rules`,
        ...oxvelteStats,
      },
    ],
    rustSingleThread: { ...rustSingleStats },
    rustMultiThread: { ...rustMultiStats },
    speedup: {
      singleThreadVsJs: speedupSingle,
      multiThreadVsJs: speedupMulti,
    },
  };
}

// Unlike the other tasks, svelte-check is a project-wise CLI, not a per-file
// API. We materialise a synthetic workspace of N `.svelte` files and time each
// CLI's wall-clock cost end-to-end.
//
// The first measurement skips TypeScript checking and is retained only for
// profiling the Svelte-specific work. It is not published as type checking.
// The published end-to-end comparison runs full JS and Svelte diagnostics:
// regular svelte-check uses its bundled TypeScript, while the other two rows
// use the same pinned tsgo binary.
//
// Why both sides skip TypeScript checking in the profiling measurement:
// svelte-check's job is split into (1) the *tool's own work* — find files,
// parse + analyze each `.svelte`, generate the `.tsx` overlay — and (2)
// delegating semantic type-checking to an *external* TypeScript compiler
// (`tsc`/`tsgo`) as a subprocess. Part (2) is the same shared dependency for
// both implementations (rsvelte shells out to `tsc`/`tsgo`; JS svelte-check
// runs the TypeScript LanguageService), so when it is enabled it dominates the
// wall-clock and compresses the ratio toward ~1x — it benchmarks TypeScript,
// not svelte-check. To isolate part (1) — the only part where rsvelte's Rust +
// rayon implementation differs from the JS one — we disable the TS pass on
// BOTH sides:
//   * rsvelte: `--no-type-check` (skips overlay materialisation + the tsc/tsgo
//     subprocess), plus `--diagnostic-sources svelte` for parity.
//   * JS svelte-check: `--diagnostic-sources svelte`. This is the only
//     supported way to make JS svelte-check skip TS work — it stops the
//     language-server from registering the TypeScript plugin at all. Merely
//     omitting a tsconfig does NOT skip checking: TS then falls back to a
//     default inferred config and still semantic-checks every file.
// Multi-threaded numbers come from rsvelte's default rayon fan-out;
// single-threaded numbers come from forcing `RAYON_NUM_THREADS=1` so the two
// figures parallel the per-file tasks above.

const SVELTE_CHECK_FILES = 5_000;
const RSVELTE_SVELTE_CHECK_BIN = join(REPO_ROOT, "target/release/svelte_check");
const JS_SVELTE_CHECK_BIN = join(
  REPO_ROOT,
  "submodules/language-tools/packages/svelte-check/bin/svelte-check",
);
// The TypeScript 7 native compiler both `--tsgo` rows type-check with.
// `@typescript/native-preview` published its last dated dev build on
// 2026-07-07 and was superseded by TypeScript 7 stable, which ships the same
// Go compiler as its own `tsc`; svelte-check's own not-found message names the
// `@typescript/native@npm:typescript@7` alias as the supported way to install
// it, and both CLIs resolve that name from the workspace on their own. Pinned
// exactly in scripts/bench/competitor-oracle for the usual reason: a floating
// range would move this baseline with no change in this repo.
const SVELTE_CHECK_TS7_DIR = join(
  REPO_ROOT,
  "scripts/bench/competitor-oracle/node_modules/@typescript/native",
);
const SVELTE_CHECK_RS_BIN = join(
  REPO_ROOT,
  "scripts/bench/competitor-oracle/node_modules/.bin/svelte-check-rs",
);
const SVELTE_CHECK_RS_TSGO_BIN = join(
  REPO_ROOT,
  "scripts/bench/competitor-oracle/node_modules/.bin/tsgo",
);

function buildSyntheticSvelte(seed) {
  return `<script>
\tlet count = ${seed};
\tfunction increment() { count++; }
</script>

<button onclick={increment}>Click {count}</button>
{#if count > 0}
\t<p>Positive: {count}</p>
{:else}
\t<p>Zero or negative</p>
{/if}
`;
}

function makeSvelteCheckFixture(n) {
  const dir = mkdtempSync(join(tmpdir(), "rsvelte-bench-svc-"));
  const fixtureNodeModules = join(dir, "node_modules");
  const svelteNodeModules = dirname(realpathSync(join(REPO_ROOT, "node_modules/svelte")));
  mkdirSync(fixtureNodeModules, { recursive: true });
  for (const entry of readdirSync(svelteNodeModules)) {
    const source = join(svelteNodeModules, entry);
    const target = join(fixtureNodeModules, entry);
    if (entry.startsWith("@")) {
      mkdirSync(target, { recursive: true });
      for (const child of readdirSync(source)) {
        symlinkSync(realpathSync(join(source, child)), join(target, child), "dir");
      }
    } else {
      symlinkSync(realpathSync(source), target, "dir");
    }
  }
  mkdirSync(join(dir, "node_modules", "@typescript"), { recursive: true });
  mkdirSync(join(dir, "node_modules", ".bin"), { recursive: true });
  symlinkSync(
    realpathSync(
      join(
        REPO_ROOT,
        "scripts/bench/competitor-oracle/node_modules/@typescript/native-preview",
      ),
    ),
    join(dir, "node_modules", "@typescript", "native-preview"),
    "dir",
  );
  symlinkSync(
    realpathSync(SVELTE_CHECK_RS_TSGO_BIN),
    join(dir, "node_modules", ".bin", "tsgo"),
  );
  // Both `--tsgo` rows find their compiler here: rsvelte-check walks up from
  // the workspace for `@typescript/native`, and svelte-check resolves the same
  // name from the tsconfig's directory. Neither is told where it is, so the
  // two rows cannot be pointed at different backends by accident.
  symlinkSync(
    realpathSync(SVELTE_CHECK_TS7_DIR),
    join(dir, "node_modules", "@typescript", "native"),
    "dir",
  );
  writeFileSync(
    join(dir, "tsconfig.json"),
    JSON.stringify({ compilerOptions: { noEmit: true, skipLibCheck: true }, include: ["src"] }),
  );
  for (let i = 0; i < n; i++) {
    const sub = `pkg${(i / 50) | 0}`;
    const subdir = join(dir, "src", sub);
    mkdirSync(subdir, { recursive: true });
    writeFileSync(join(subdir, `Comp${i}.svelte`), buildSyntheticSvelte(i));
  }
  return dir;
}

function ensureRsvelteSvelteCheckBuilt() {
  // Deliberately unconditional. Skipping the build when the file exists makes
  // the measured binary a property of whatever was last left in target/, not of
  // the tree being measured; cargo is a no-op when it is already current.
  console.error("  Building rsvelte svelte_check...");
  // Stdout from this script becomes the benchmark JSON file — anything
  // cargo prints to its own stdout would corrupt it. Redirect both
  // streams to our stderr so logs still surface in the terminal but
  // never leak into the JSON.
  const r = spawnSync(
    "cargo",
    ["build", "--release", "-p", "rsvelte_check", "--bin", "svelte_check"],
    {
      cwd: REPO_ROOT,
      stdio: ["ignore", 2, "inherit"],
    },
  );
  if (r.status !== 0) {
    throw new Error("cargo build -p rsvelte_check --bin svelte_check failed");
  }
}

function ensureSvelteCheckTsgoAvailable() {
  const manifest = join(SVELTE_CHECK_TS7_DIR, "package.json");
  if (!existsSync(manifest)) {
    throw new Error(
      "the TypeScript 7 native backend is missing; run `pnpm run report:competitors:install`",
    );
  }
  const { name, version } = JSON.parse(readFileSync(manifest, "utf8"));
  // Both resolvers accept only these two names at major >= 7, so a pin that
  // silently resolved to something else would otherwise be found by neither
  // CLI and reported as "TypeScript 7 is not installed".
  if (!["typescript", "@typescript/native-preview"].includes(name)) {
    throw new Error(`@typescript/native resolved to ${name}, which no --tsgo row can use`);
  }
  if (Number(version.split(".")[0]) < 7) {
    throw new Error(`@typescript/native resolved to ${version}; --tsgo requires major >= 7`);
  }
  console.error(`  tsgo backend: ${name}@${version}`);
}

function verifySvelteCheckRsDiagnostics(fixture) {
  const gateFile = join(fixture, "src", "DiagnosticGate.svelte");
  writeFileSync(
    gateFile,
    '<script lang="ts">let count: number = "bad";</script>\n<p>{missingName}</p>\n',
  );
  try {
    const runs = [
      spawnSync(
        "node",
        [
          JS_SVELTE_CHECK_BIN,
          "--workspace",
          fixture,
          "--output",
          "machine",
          "--threshold",
          "error",
          "--diagnostic-sources",
          "js,svelte",
        ],
        { encoding: "utf8", maxBuffer: 1 << 24 },
      ),
      spawnSync(
        SVELTE_CHECK_RS_BIN,
        [
          "--workspace",
          fixture,
          "--tsconfig",
          join(fixture, "tsconfig.json"),
          "--output",
          "machine",
          "--threshold",
          "error",
        ],
        { encoding: "utf8", maxBuffer: 1 << 24 },
      ),
    ];
    const expected = ["Type 'string' is not assignable", "Cannot find name 'missingName'"];
    for (const run of runs) {
      const output = `${run.stdout ?? ""}\n${run.stderr ?? ""}`;
      if (run.status !== 1 || expected.some((message) => !output.includes(message))) {
        throw new Error(`typecheck diagnostic gate failed:\n${output.split("\n").slice(0, 12).join("\n")}`);
      }
    }
    return { matchedDiagnostics: expected.length, expectedDiagnostics: expected.length };
  } finally {
    rmSync(gateFile, { force: true });
    rmSync(join(fixture, ".svelte-check"), { recursive: true, force: true });
  }
}

function verifySvelteCheckRsCoverage(fixture) {
  const result = spawnSync(
    SVELTE_CHECK_RS_BIN,
    [
      "--workspace",
      fixture,
      "--tsconfig",
      join(fixture, "tsconfig.json"),
      "--list-files",
    ],
    { encoding: "utf8", maxBuffer: 1 << 24 },
  );
  if (result.status !== 0) {
    throw new Error(`svelte-check-rs --list-files failed:\n${result.stderr || result.stdout}`);
  }
  const discoveredFiles = `${result.stdout ?? ""}\n${result.stderr ?? ""}`
    .split("\n")
    .filter((line) => line.trim().endsWith(".svelte")).length;
  if (discoveredFiles !== SVELTE_CHECK_FILES) {
    throw new Error(
      `svelte-check-rs discovered ${discoveredFiles}/${SVELTE_CHECK_FILES} benchmark files`,
    );
  }
  return discoveredFiles;
}

function timeSvelteCheckRun(label, bin, args, env, beforeRun) {
  const samples = [];
  const run = () => {
    beforeRun?.();
    const result = spawnSync(bin, args, {
      encoding: "utf8",
      maxBuffer: 1 << 24,
      env: { ...process.env, ...env },
    });
    if (result.status !== 0) {
      const diagnostic = (result.stderr || result.stdout || "").split("\n").slice(0, 12).join("\n");
      throw new Error(`${label} exited with status ${result.status}: ${diagnostic}`);
    }
  };
  for (let i = 0; i < WARMUP_ITERATIONS; i++) {
    run();
  }
  for (let i = 0; i < BENCHMARK_ITERATIONS; i++) {
    const t0 = process.hrtime.bigint();
    run();
    const t1 = process.hrtime.bigint();
    samples.push(Number(t1 - t0) / 1e6);
  }
  const stats = calculateStats(samples, SVELTE_CHECK_FILES);
  console.error(
    `    ${label.padEnd(28)} ${stats.durationMs.toFixed(2)}ms (${stats.throughputFilesPerSec.toFixed(0)} files/sec)`,
  );
  return stats;
}

async function runSvelteCheckTask() {
  console.error("\n=== svelte-check ===");
  console.error(`  Synthetic workspace: ${SVELTE_CHECK_FILES} files`);
  ensureRsvelteSvelteCheckBuilt();
  ensureSvelteCheckTsgoAvailable();
  if (!existsSync(SVELTE_CHECK_RS_BIN) || !existsSync(SVELTE_CHECK_RS_TSGO_BIN)) {
    throw new Error("svelte-check-rs is missing; run `pnpm run report:competitors:install`");
  }
  const fixture = makeSvelteCheckFixture(SVELTE_CHECK_FILES);
  try {
    const svelteCheckRsDiscoveredFiles = verifySvelteCheckRsCoverage(fixture);
    const svelteCheckRsGate = verifySvelteCheckRsDiagnostics(fixture);
    // Disables the TypeScript pass on both sides — see the comment above.
    const rsArgs = [
      "--workspace",
      fixture,
      "--output",
      "machine",
      "--no-type-check",
      "--diagnostic-sources",
      "svelte",
    ];
    const jsArgs = [
      JS_SVELTE_CHECK_BIN,
      "--workspace",
      fixture,
      "--output",
      "machine",
      "--diagnostic-sources",
      "svelte",
    ];

    console.error("  Benchmarking JavaScript (svelte-check)...");
    const jsStats = timeSvelteCheckRun("JS svelte-check", "node", jsArgs);

    console.error("  Benchmarking Rust (single-threaded)...");
    const rsSingleStats = timeSvelteCheckRun(
      "rsvelte (RAYON=1)",
      RSVELTE_SVELTE_CHECK_BIN,
      rsArgs,
      {
        RAYON_NUM_THREADS: "1",
      },
    );

    console.error("  Benchmarking Rust (multi-threaded)...");
    const rsMultiStats = timeSvelteCheckRun(
      "rsvelte (default)",
      RSVELTE_SVELTE_CHECK_BIN,
      rsArgs,
      {},
    );

    const result = {
      javascript: jsStats,
      rustSingleThread: rsSingleStats,
      rustMultiThread: rsMultiStats,
      speedup: {
        singleThreadVsJs: jsStats.durationMs / rsSingleStats.durationMs,
        multiThreadVsJs: jsStats.durationMs / rsMultiStats.durationMs,
      },
    };
    console.error(
      `  Speedup: single=${result.speedup.singleThreadVsJs.toFixed(1)}x, multi=${result.speedup.multiThreadVsJs.toFixed(1)}x`,
    );

    const jsFullArgs = [
      JS_SVELTE_CHECK_BIN,
      "--workspace",
      fixture,
      "--output",
      "machine",
      "--diagnostic-sources",
      "js,svelte",
    ];
    const rsTsgoArgs = [
      "--workspace",
      fixture,
      "--output",
      "machine",
      "--tsgo",
      "--diagnostic-sources",
      "js,svelte",
    ];
    const svelteCheckRsArgs = [
      "--workspace",
      fixture,
      "--tsconfig",
      join(fixture, "tsconfig.json"),
      "--output",
      "machine",
      "--threshold",
      "error",
    ];
    const jsTsgoArgs = [
      JS_SVELTE_CHECK_BIN,
      "--workspace",
      fixture,
      "--output",
      "machine",
      "--tsgo",
      "--diagnostic-sources",
      "js,svelte",
    ];
    // No TSGO_BIN: the override would bypass each CLI's own resolution, and a
    // flag naming a binary is not evidence that the binary was used.
    const tsgoEnv = {};
    const cleanTypecheckArtifacts = () => {
      rmSync(join(fixture, ".svelte-check"), { recursive: true, force: true });
      rmSync(join(fixture, "node_modules", ".cache", "svelte-check-rs"), {
        recursive: true,
        force: true,
      });
    };

    console.error("  Benchmarking end-to-end TypeScript diagnostics...");
    const jsFullStats = timeSvelteCheckRun(
      "JS svelte-check",
      "node",
      jsFullArgs,
      {},
      cleanTypecheckArtifacts,
    );
    const jsTsgoStats = timeSvelteCheckRun(
      "JS svelte-check + tsgo",
      "node",
      jsTsgoArgs,
      tsgoEnv,
      cleanTypecheckArtifacts,
    );
    const rsTsgoSingleStats = timeSvelteCheckRun(
      "rsvelte + tsgo (RAYON=1)",
      RSVELTE_SVELTE_CHECK_BIN,
      rsTsgoArgs,
      { ...tsgoEnv, RAYON_NUM_THREADS: "1" },
      cleanTypecheckArtifacts,
    );
    const rsTsgoMultiStats = timeSvelteCheckRun(
      "rsvelte + tsgo (default)",
      RSVELTE_SVELTE_CHECK_BIN,
      rsTsgoArgs,
      tsgoEnv,
      cleanTypecheckArtifacts,
    );
    const svelteCheckRsStats = timeSvelteCheckRun(
      "svelte-check-rs",
      SVELTE_CHECK_RS_BIN,
      svelteCheckRsArgs,
      {},
      cleanTypecheckArtifacts,
    );
    result.endToEnd = {
      javascript: jsFullStats,
      rustSingleThread: rsTsgoSingleStats,
      rustMultiThread: rsTsgoMultiStats,
      alternatives: [
        {
          id: "svelte-check-tsgo",
          label: "svelte-check + tsgo",
          completedFiles: SVELTE_CHECK_FILES,
          ...jsTsgoStats,
        },
        {
          id: "svelte-check-rs",
          label: "svelte-check-rs",
          completedFiles: svelteCheckRsDiscoveredFiles,
          comparable: false,
          scope: "default sources",
          compatibility: svelteCheckRsGate,
          ...svelteCheckRsStats,
        },
      ],
      speedup: {
        singleThreadVsJs: jsFullStats.durationMs / rsTsgoSingleStats.durationMs,
        multiThreadVsJs: jsFullStats.durationMs / rsTsgoMultiStats.durationMs,
      },
    };
    return result;
  } finally {
    rmSync(fixture, { recursive: true, force: true });
  }
}

async function main() {
  console.error("Collecting Svelte test files...");
  const { files, excludedCount } = collectTestFiles();
  console.error(`Found ${files.length} files`);

  const results = {};
  if (REQUESTED_TASKS.has("compile-client"))
    results.compileClient = await runBenchmarkTask(files, "compile-client");
  if (REQUESTED_TASKS.has("compile-server"))
    results.compileServer = await runBenchmarkTask(files, "compile-server");
  if (REQUESTED_TASKS.has("parse")) results.parse = await runBenchmarkTask(files, "parse");
  if (REQUESTED_TASKS.has("svelte2tsx"))
    results.svelte2tsx = await runBenchmarkTask(files, "svelte2tsx");
  if (REQUESTED_TASKS.has("fmt")) results.fmt = await runFmtTask(files);
  if (REQUESTED_TASKS.has("lint")) results.lint = await runLintTask(files);
  if (REQUESTED_TASKS.has("svelte-check")) results.svelteCheck = await runSvelteCheckTask();

  // Output combined JSON. Compile-client (CSR) lives at the top level for
  // backward compatibility with the existing benchmark page; compile-server
  // (SSR), parse, svelte2tsx, fmt, lint and svelte-check are nested siblings
  // so the page can render each as its own section.
  const output = {
    generatedAt: new Date().toISOString(),
    commitSha: getCommitSha(),
    runner: getRunnerInfo(),
    testFilesCount: files.length,
    excludedFilesCount: excludedCount,
    ...(results.compileClient ? asTaskResults(results.compileClient) : {}),
    ...(results.compileServer ? { compileServer: asTaskResults(results.compileServer) } : {}),
    ...(results.parse ? { parse: asTaskResults(results.parse) } : {}),
    ...(results.svelte2tsx ? { svelte2tsx: asTaskResults(results.svelte2tsx) } : {}),
    ...(results.fmt ? { fmt: asTaskResults(results.fmt) } : {}),
    ...(results.lint
      ? {
          lint: {
            ...asTaskResults(results.lint),
            rulesCount: results.lint.rulesCount,
            oracle: lintOracleMetadata(),
          },
        }
      : {}),
    ...(results.svelteCheck
      ? {
          svelteCheck: {
            ...results.svelteCheck,
            filesCount: SVELTE_CHECK_FILES,
          },
        }
      : {}),
  };

  console.log(JSON.stringify(output, null, 2));
}

main().catch((err) => {
  console.error("Benchmark failed:", err);
  process.exit(1);
});
