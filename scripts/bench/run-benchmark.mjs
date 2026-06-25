#!/usr/bin/env node
/**
 * Benchmark script that measures JS vs Rust compiler performance.
 * Collects all Svelte test files and compiles them with both compilers.
 *
 * Supports five tasks: compile-client, compile-server, parse, svelte2tsx,
 * svelte-check.
 *
 * Designed to run identically on local machines and in CI. The JS
 * baselines (`svelte/compiler`, `svelte2tsx`, `svelte-check`) live in
 * submodules and publish their consumable entrypoints as rollup build
 * outputs, not checked-in artefacts — so we bootstrap them on demand
 * below, then dynamic-import once they exist. Already-built outputs are
 * skipped, so a warm checkout pays nothing.
 */

import { execSync, spawn, spawnSync } from 'child_process';
import { mkdirSync, mkdtempSync, rmSync } from 'fs';
import { arch as nodeArch, cpus, loadavg as osLoadAvg, platform as nodePlatform, tmpdir } from 'os';
import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, '../..');
const SVELTE_TESTS = join(REPO_ROOT, 'submodules/svelte/packages/svelte/tests');

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
	const sio = { stdio: ['ignore', 2, 'inherit'] };
	const run = (cmd, cwd) =>
		execSync(cmd, { ...sio, cwd: join(REPO_ROOT, cwd) });
	const built = (marker) => existsSync(join(REPO_ROOT, marker));

	// 1. svelte/compiler — self-contained, has its own install + build.
	if (!built('submodules/svelte/packages/svelte/compiler/index.js')) {
		console.error('[run-benchmark] building svelte/compiler (one-time)…');
		run('pnpm install --frozen-lockfile && pnpm build', 'submodules/svelte');
	}

	// 2. language-tools — svelte2tsx → language-server → svelte-check is a
	// hard dependency chain (each package's build config imports the
	// previous package's `dist/`). Walk it explicitly so we don't end up
	// re-running upstream's recursive `pnpm build` script, which
	// rebuilds everything and tail-runs a slow `test:sanity` pass.
	// Each package's own build command differs: svelte2tsx and
	// svelte-check use rollup, language-server uses tsc — call each
	// package's defined `pnpm build` for the first two, and rollup
	// directly for svelte-check (skipping the recursive cd dance).
	const langPkgs = [
		{
			name: 'svelte2tsx',
			marker: 'submodules/language-tools/packages/svelte2tsx/index.mjs',
			cwd: 'submodules/language-tools/packages/svelte2tsx',
			cmd: 'pnpm build',
		},
		{
			name: 'language-server',
			marker: 'submodules/language-tools/packages/language-server/dist/src/index.js',
			cwd: 'submodules/language-tools/packages/language-server',
			cmd: 'pnpm build',
		},
		{
			name: 'svelte-check',
			marker: 'submodules/language-tools/packages/svelte-check/dist/src/index.js',
			cwd: 'submodules/language-tools/packages/svelte-check',
			// Upstream's `pnpm build` recursively rebuilds svelte2tsx +
			// language-server (idempotent but slow) and runs a fixture
			// `test:sanity` pass. Invoke rollup directly — it's in
			// svelte-check's own devDeps.
			cmd: 'pnpm exec rollup -c',
		},
	];
	const langPending = langPkgs.filter((p) => !built(p.marker));
	if (langPending.length > 0) {
		if (!built('submodules/language-tools/node_modules/.modules.yaml')) {
			console.error('[run-benchmark] installing language-tools workspace (one-time)…');
			run('pnpm install --frozen-lockfile', 'submodules/language-tools');
		}
		for (const pkg of langPending) {
			console.error(`[run-benchmark] building language-tools/${pkg.name} (one-time)…`);
			run(pkg.cmd, pkg.cwd);
		}
	}
}

ensureBenchDeps();

// Now safe to import. We use dynamic imports so the prereq check above
// runs first — static imports get hoisted and would crash before we
// could print a helpful message / build the missing output.
const svelteCompilerMod = await import(
	'../../submodules/svelte/packages/svelte/compiler/index.js'
);
const { compile, parse } = svelteCompilerMod.default ?? svelteCompilerMod;
const { svelte2tsx: upstreamSvelte2tsx } = await import(
	'../../submodules/language-tools/packages/svelte2tsx/index.mjs'
);

// Prettier + prettier-plugin-svelte are the JS baseline for the `fmt` task.
// Both are plain npm devDependencies (see root package.json), so a normal
// `pnpm install` makes them resolvable — unlike svelte/compiler and
// language-tools above, there is nothing to build first. prettier-plugin-
// svelte also peer-depends on `svelte`, which is likewise a devDependency.
let prettier;
let prettierPluginSvelte;
try {
	const prettierMod = await import('prettier');
	prettier = prettierMod.default ?? prettierMod;
	prettierPluginSvelte = await import('prettier-plugin-svelte');
} catch (err) {
	console.error(
		'[run-benchmark] prettier / prettier-plugin-svelte not found — run `pnpm install`.',
	);
	throw err;
}

// Test directories containing Svelte files
const TEST_CATEGORIES = [
	'parser-modern/samples',
	'snapshot/samples',
	'css/samples',
	'runtime-runes/samples',
	'runtime-legacy/samples',
	'runtime-browser/samples',
	'hydration/samples',
	'server-side-rendering/samples',
	'validator/samples',
];

// How many iterations to run for accurate timing.
// Override via env vars when you need tighter error bars — e.g. when
// publishing `apps/playground/static/benchmark-results.json`, run with
// `BENCHMARK_WARMUP=3 BENCHMARK_ITERATIONS=10 node scripts/bench/run-benchmark.mjs`
// so per-run jitter (mostly JS-side V8 inlining warmup) is averaged out.
const WARMUP_ITERATIONS = Number(process.env.BENCHMARK_WARMUP ?? 1);
const BENCHMARK_ITERATIONS = Number(process.env.BENCHMARK_ITERATIONS ?? 3);

/**
 * Recursively find all .svelte files in a directory
 */
function findSvelteFiles(dir, files = []) {
	if (!existsSync(dir)) return files;

	const entries = readdirSync(dir);
	for (const entry of entries) {
		const fullPath = join(dir, entry);
		const stat = statSync(fullPath);

		if (stat.isDirectory()) {
			findSvelteFiles(fullPath, files);
		} else if (entry.endsWith('.svelte')) {
			files.push({
				path: fullPath,
				content: readFileSync(fullPath, 'utf-8'),
				size: stat.size,
			});
		}
	}

	return files;
}

/**
 * Collect all Svelte test files
 */
function collectTestFiles() {
	const files = [];

	for (const category of TEST_CATEGORIES) {
		const categoryPath = join(SVELTE_TESTS, category);
		findSvelteFiles(categoryPath, files);
	}

	return files;
}

/**
 * Process a single file based on the task
 */
function processFileJS(file, task) {
	switch (task) {
		case 'compile-client':
			compile(file.content, { generate: 'client', filename: file.path, dev: false });
			break;
		case 'compile-server':
			compile(file.content, { generate: 'server', filename: file.path, dev: false });
			break;
		case 'parse':
			parse(file.content, { modern: true });
			break;
		case 'svelte2tsx':
			upstreamSvelte2tsx(file.content, {
				filename: file.path,
				isTsFile: false,
				mode: 'ts',
				typingsNamespace: 'svelteHTML',
				version: '5',
			});
			break;
	}
}

/**
 * Benchmark JavaScript Svelte compiler
 */
function benchmarkJavaScript(files, iterations, task) {
	const times = [];

	// Warmup
	for (let i = 0; i < WARMUP_ITERATIONS; i++) {
		for (const file of files) {
			try {
				processFileJS(file, task);
			} catch {
				// Ignore compilation errors for benchmark
			}
		}
	}

	// Benchmark
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
 * `rsvelte_core`; the `fmt` task uses `fmt_benchmark_runner` in
 * `rsvelte_fmt` (the formatter can't live in the compiler crate without a
 * dependency cycle). Both share the same CLI + JSON-output contract.
 */
async function benchmarkRust(files, singleThread, task, binName = 'benchmark_runner') {
	const mode = singleThread ? 'single' : 'multi';

	// Create a temp file with all file paths
	const fileList = files.map((f) => f.path).join('\n');
	const tempFile = join(__dirname, '../../.benchmark-files.txt');
	writeFileSync(tempFile, fileList);

	// `profile.release` sets `panic = "abort"`, so a formatter panic on a
	// malformed corpus file would kill the whole run. The fmt runner relies
	// on `catch_unwind` to skip such files, which only works under a profile
	// with `panic = "unwind"` — that's exactly what `profile.bench` is for
	// (it inherits release's optimisation flags, so the timings stay
	// representative). Compiler tasks don't panic on this corpus, so they
	// keep the faster-to-link release profile.
	const profileFlag = binName === 'fmt_benchmark_runner' ? '--profile=bench' : '--release';

	return new Promise((resolve, reject) => {
		const args = [
			'run',
			profileFlag,
			'--bin',
			binName,
			'--',
			'--mode',
			mode,
			'--task',
			task,
			'--files',
			tempFile,
			'--iterations',
			String(BENCHMARK_ITERATIONS),
			'--warmup',
			String(WARMUP_ITERATIONS),
		];

		const proc = spawn('cargo', args, {
			cwd: join(__dirname, '../..'),
			stdio: ['ignore', 'pipe', 'pipe'],
		});

		let stdout = '';
		let stderr = '';

		proc.stdout.on('data', (data) => {
			stdout += data.toString();
		});
		proc.stderr.on('data', (data) => {
			stderr += data.toString();
		});

		proc.on('close', (code) => {
			if (code !== 0) {
				console.error('Rust benchmark stderr:', stderr);
				reject(new Error(`Rust benchmark failed with code ${code}`));
				return;
			}

			try {
				// Parse the JSON output
				const result = JSON.parse(stdout);
				resolve(result.times);
			} catch (e) {
				console.error('Failed to parse Rust output:', stdout);
				reject(e);
			}
		});
	});
}

/**
 * Get git commit SHA
 */
function getCommitSha() {
	try {
		return execSync('git rev-parse --short HEAD', { encoding: 'utf-8' }).trim();
	} catch {
		return 'unknown';
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
		label: process.env.BENCHMARK_RUNNER_LABEL || 'local',
		os: nodePlatform(),
		arch: nodeArch(),
		cpus: cpuList.length,
		cpuModel: cpuList[0]?.model?.trim() ?? 'unknown',
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
	const median = sorted.length % 2 === 0
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

/**
 * Run a single benchmark task (compile-client, compile-server, or parse)
 */
async function runBenchmarkTask(files, task) {
	const taskLabel = {
		'compile-client': 'Compile (Client)',
		'compile-server': 'Compile (SSR)',
		parse: 'Parse',
		svelte2tsx: 'svelte2tsx',
	}[task];

	console.error(`\n=== ${taskLabel} ===`);

	// JS
	console.error(`  Benchmarking JavaScript...`);
	const jsTimes = benchmarkJavaScript(files, BENCHMARK_ITERATIONS, task);
	const jsStats = calculateStats(jsTimes, files.length);
	console.error(`    ${jsStats.durationMs.toFixed(2)}ms (${jsStats.throughputFilesPerSec.toFixed(0)} files/sec)`);

	// Rust single-threaded
	console.error(`  Benchmarking Rust (single-threaded)...`);
	const rustSingleTimes = await benchmarkRust(files, true, task);
	const rustSingleStats = calculateStats(rustSingleTimes, files.length);
	console.error(
		`    ${rustSingleStats.durationMs.toFixed(2)}ms (${rustSingleStats.throughputFilesPerSec.toFixed(0)} files/sec)`,
	);

	// Rust multi-threaded
	console.error(`  Benchmarking Rust (multi-threaded)...`);
	const rustMultiTimes = await benchmarkRust(files, false, task);
	const rustMultiStats = calculateStats(rustMultiTimes, files.length);
	console.error(
		`    ${rustMultiStats.durationMs.toFixed(2)}ms (${rustMultiStats.throughputFilesPerSec.toFixed(0)} files/sec)`,
	);

	const speedupSingle = jsStats.durationMs / rustSingleStats.durationMs;
	const speedupMulti = jsStats.durationMs / rustMultiStats.durationMs;

	console.error(`  Speedup: single=${speedupSingle.toFixed(1)}x, multi=${speedupMulti.toFixed(1)}x`);

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
	const { javascript, rustSingleThread, rustMultiThread, speedup } = taskResult;
	return { javascript, rustSingleThread, rustMultiThread, speedup };
}

// ── fmt task ────────────────────────────────────────────────────────────────
//
// The `fmt` task pits prettier + prettier-plugin-svelte (the canonical JS
// Svelte formatter) against rsvelte_formatter over the shared per-file
// corpus. It needs its own runner because prettier 3's `format()` is async,
// whereas the compiler tasks above call synchronous APIs. The Rust side is
// driven by the `fmt_benchmark_runner` binary in `rsvelte_fmt`.

async function benchmarkPrettier(files, iterations) {
	const opts = (filepath) => ({
		parser: 'svelte',
		plugins: [prettierPluginSvelte],
		filepath,
	});

	// Warmup
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

async function runFmtTask(files) {
	console.error('\n=== fmt ===');

	console.error('  Benchmarking JavaScript (prettier-plugin-svelte)...');
	const jsTimes = await benchmarkPrettier(files, BENCHMARK_ITERATIONS);
	const jsStats = calculateStats(jsTimes, files.length);
	console.error(
		`    ${jsStats.durationMs.toFixed(2)}ms (${jsStats.throughputFilesPerSec.toFixed(0)} files/sec)`,
	);

	console.error('  Benchmarking Rust (single-threaded)...');
	const rustSingleTimes = await benchmarkRust(files, true, 'fmt', 'fmt_benchmark_runner');
	const rustSingleStats = calculateStats(rustSingleTimes, files.length);
	console.error(
		`    ${rustSingleStats.durationMs.toFixed(2)}ms (${rustSingleStats.throughputFilesPerSec.toFixed(0)} files/sec)`,
	);

	console.error('  Benchmarking Rust (multi-threaded)...');
	const rustMultiTimes = await benchmarkRust(files, false, 'fmt', 'fmt_benchmark_runner');
	const rustMultiStats = calculateStats(rustMultiTimes, files.length);
	console.error(
		`    ${rustMultiStats.durationMs.toFixed(2)}ms (${rustMultiStats.throughputFilesPerSec.toFixed(0)} files/sec)`,
	);

	const speedupSingle = jsStats.durationMs / rustSingleStats.durationMs;
	const speedupMulti = jsStats.durationMs / rustMultiStats.durationMs;
	console.error(`  Speedup: single=${speedupSingle.toFixed(1)}x, multi=${speedupMulti.toFixed(1)}x`);

	return {
		task: 'fmt',
		taskLabel: 'fmt',
		javascript: { ...jsStats },
		rustSingleThread: { ...rustSingleStats },
		rustMultiThread: { ...rustMultiStats },
		speedup: {
			singleThreadVsJs: speedupSingle,
			multiThreadVsJs: speedupMulti,
		},
	};
}

// ── svelte-check task ──────────────────────────────────────────────────────
//
// Unlike the other tasks, svelte-check is a project-wise CLI, not a per-file
// API. We materialise a synthetic workspace of N `.svelte` files and time each
// CLI's wall-clock cost end-to-end.
//
// IMPORTANT — what this measures and why both sides skip TypeScript checking:
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
//     language-server from registering the TypeScript plugin at all. (Merely
//     omitting a tsconfig does NOT skip checking: TS then falls back to a
//     default inferred config and still semantic-checks every file, which is
//     why a previous version of this comment — "no tsconfig so both skip TS"
//     — was wrong on the JS side and produced a meaningless ~1.6x.)
// Multi-threaded numbers come from rsvelte's default rayon fan-out;
// single-threaded numbers come from forcing `RAYON_NUM_THREADS=1` so the two
// figures parallel the per-file tasks above.

const SVELTE_CHECK_FILES = 500;
const RSVELTE_SVELTE_CHECK_BIN = join(REPO_ROOT, 'target/release/svelte_check');
const JS_SVELTE_CHECK_BIN = join(
	REPO_ROOT,
	'submodules/language-tools/packages/svelte-check/bin/svelte-check',
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
	const dir = mkdtempSync(join(tmpdir(), 'rsvelte-bench-svc-'));
	for (let i = 0; i < n; i++) {
		const sub = `pkg${(i / 50) | 0}`;
		const subdir = join(dir, 'src', sub);
		mkdirSync(subdir, { recursive: true });
		writeFileSync(join(subdir, `Comp${i}.svelte`), buildSyntheticSvelte(i));
	}
	return dir;
}

function ensureRsvelteSvelteCheckBuilt() {
	if (existsSync(RSVELTE_SVELTE_CHECK_BIN)) return;
	console.error('  Building rsvelte svelte_check (one-time)...');
	// Stdout from this script becomes the benchmark JSON file — anything
	// cargo prints to its own stdout would corrupt it. Redirect both
	// streams to our stderr so logs still surface in the terminal but
	// never leak into the JSON.
	const r = spawnSync('cargo', ['build', '--release', '--bin', 'svelte_check'], {
		cwd: REPO_ROOT,
		stdio: ['ignore', 2, 'inherit'],
	});
	if (r.status !== 0) throw new Error('cargo build --bin svelte_check failed');
}

function timeSvelteCheckRun(label, bin, args, env) {
	const samples = [];
	for (let i = 0; i < WARMUP_ITERATIONS; i++) {
		spawnSync(bin, args, { stdio: 'ignore', env: { ...process.env, ...env } });
	}
	for (let i = 0; i < BENCHMARK_ITERATIONS; i++) {
		const t0 = process.hrtime.bigint();
		spawnSync(bin, args, { stdio: 'ignore', env: { ...process.env, ...env } });
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
	console.error('\n=== svelte-check ===');
	console.error(`  Synthetic workspace: ${SVELTE_CHECK_FILES} files`);
	ensureRsvelteSvelteCheckBuilt();
	const fixture = makeSvelteCheckFixture(SVELTE_CHECK_FILES);
	try {
		// See the task comment above: disable the external TypeScript pass on
		// BOTH sides so this isolates the tool's own Svelte work (find +
		// parse + analyze), not the shared `tsc`/`tsgo` subprocess.
		//   * rsvelte: `--no-type-check` (no overlay + no tsc/tsgo) + svelte-only sources.
		//   * JS svelte-check: `--diagnostic-sources svelte` (the only flag that
		//     stops it registering the TypeScript plugin).
		const rsArgs = [
			'--workspace',
			fixture,
			'--output',
			'machine',
			'--no-type-check',
			'--diagnostic-sources',
			'svelte',
		];
		const jsArgs = [
			JS_SVELTE_CHECK_BIN,
			'--workspace',
			fixture,
			'--output',
			'machine',
			'--diagnostic-sources',
			'svelte',
		];

		console.error('  Benchmarking JavaScript (svelte-check)...');
		const jsStats = timeSvelteCheckRun('JS svelte-check', 'node', jsArgs);

		console.error('  Benchmarking Rust (single-threaded)...');
		const rsSingleStats = timeSvelteCheckRun(
			'rsvelte (RAYON=1)',
			RSVELTE_SVELTE_CHECK_BIN,
			rsArgs,
			{ RAYON_NUM_THREADS: '1' },
		);

		console.error('  Benchmarking Rust (multi-threaded)...');
		const rsMultiStats = timeSvelteCheckRun(
			'rsvelte (default)',
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
		return result;
	} finally {
		rmSync(fixture, { recursive: true, force: true });
	}
}

async function main() {
	console.error('Collecting Svelte test files...');
	const files = collectTestFiles();
	console.error(`Found ${files.length} files`);

	// `compile-server` benchmarks are currently broken (Rust durations report
	// near-zero, yielding `Infinity` speedups) and would mislead the report —
	// omit until the runner is fixed.
	const compileClient = await runBenchmarkTask(files, 'compile-client');
	const parse = await runBenchmarkTask(files, 'parse');
	const svelte2tsx = await runBenchmarkTask(files, 'svelte2tsx');
	const fmt = await runFmtTask(files);
	const svelteCheck = await runSvelteCheckTask();

	// Output combined JSON. Compile-client lives at the top level for
	// backward compatibility with the existing benchmark page; parse,
	// svelte2tsx, fmt and svelte-check are nested siblings so the page can
	// render each as its own section.
	const output = {
		generatedAt: new Date().toISOString(),
		commitSha: getCommitSha(),
		runner: getRunnerInfo(),
		testFilesCount: files.length,
		...asTaskResults(compileClient),
		parse: asTaskResults(parse),
		svelte2tsx: asTaskResults(svelte2tsx),
		fmt: asTaskResults(fmt),
		svelteCheck: { ...svelteCheck, filesCount: SVELTE_CHECK_FILES },
	};

	console.log(JSON.stringify(output, null, 2));
}

main().catch((err) => {
	console.error('Benchmark failed:', err);
	process.exit(1);
});
