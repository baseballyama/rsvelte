#!/usr/bin/env node
/**
 * Benchmark script that measures JS vs Rust compiler performance.
 * Collects all Svelte test files and compiles them with both compilers.
 *
 * Supports four tasks: compile-client, compile-server, parse, svelte2tsx.
 *
 * Designed to run identically on local machines and in CI. The two JS
 * baselines (`svelte/compiler` and `svelte2tsx`) live in submodules and
 * publish their consumable entrypoints as rollup build outputs, not
 * checked-in artefacts — so we bootstrap them on demand below, then
 * dynamic-import once they exist. Already-built outputs are skipped,
 * so a warm checkout pays nothing.
 */

import { execSync, spawn } from 'child_process';
import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, '..');
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
	const deps = [
		{
			name: 'svelte/compiler',
			marker: 'submodules/svelte/packages/svelte/compiler/index.js',
			cwd: 'submodules/svelte',
			build: 'pnpm install --frozen-lockfile && pnpm build',
		},
		{
			name: 'svelte2tsx',
			marker: 'submodules/language-tools/packages/svelte2tsx/index.mjs',
			cwd: 'submodules/language-tools',
			build: 'pnpm install --frozen-lockfile && (cd packages/svelte2tsx && pnpm build)',
		},
	];
	for (const dep of deps) {
		if (existsSync(join(REPO_ROOT, dep.marker))) continue;
		console.error(`[run-benchmark] ${dep.name}: ${dep.marker} missing — building (one-time setup)…`);
		execSync(dep.build, { cwd: join(REPO_ROOT, dep.cwd), stdio: 'inherit' });
	}
}

ensureBenchDeps();

// Now safe to import. We use dynamic imports so the prereq check above
// runs first — static imports get hoisted and would crash before we
// could print a helpful message / build the missing output.
const svelteCompilerMod = await import(
	'../submodules/svelte/packages/svelte/compiler/index.js'
);
const { compile, parse } = svelteCompilerMod.default ?? svelteCompilerMod;
const { svelte2tsx: upstreamSvelte2tsx } = await import(
	'../submodules/language-tools/packages/svelte2tsx/index.mjs'
);

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

// How many iterations to run for accurate timing
const WARMUP_ITERATIONS = 1;
const BENCHMARK_ITERATIONS = 3;

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
 * Benchmark Rust compiler using the benchmark binary
 */
async function benchmarkRust(files, singleThread, task) {
	const mode = singleThread ? 'single' : 'multi';

	// Create a temp file with all file paths
	const fileList = files.map((f) => f.path).join('\n');
	const tempFile = join(__dirname, '../.benchmark-files.txt');
	writeFileSync(tempFile, fileList);

	return new Promise((resolve, reject) => {
		const args = [
			'run',
			'--release',
			'--bin',
			'benchmark_runner',
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
			cwd: join(__dirname, '..'),
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
 * Calculate statistics from timing results
 */
function calculateStats(times, filesCount) {
	const sum = times.reduce((a, b) => a + b, 0);
	const avg = sum / times.length;

	return {
		durationMs: avg,
		throughputFilesPerSec: (filesCount / avg) * 1000,
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

	// Output combined JSON. Compile-client lives at the top level for
	// backward compatibility with the existing benchmark page; parse and
	// svelte2tsx are nested siblings so the page can render extra sections.
	const output = {
		generatedAt: new Date().toISOString(),
		commitSha: getCommitSha(),
		testFilesCount: files.length,
		...asTaskResults(compileClient),
		parse: asTaskResults(parse),
		svelte2tsx: asTaskResults(svelte2tsx),
	};

	console.log(JSON.stringify(output, null, 2));
}

main().catch((err) => {
	console.error('Benchmark failed:', err);
	process.exit(1);
});
