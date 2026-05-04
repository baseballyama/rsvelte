#!/usr/bin/env node
/**
 * Benchmark script that measures JS vs Rust compiler performance.
 * Collects all Svelte test files and compiles them with both compilers.
 *
 * Supports three tasks: compile-client, compile-server, parse
 */

import pkg from '../submodules/svelte/packages/svelte/compiler/index.js';
const { compile, parse } = pkg;
import { execSync, spawn } from 'child_process';
import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SVELTE_TESTS = join(__dirname, '../submodules/svelte/packages/svelte/tests');

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

async function main() {
	console.error('Collecting Svelte test files...');
	const files = collectTestFiles();
	console.error(`Found ${files.length} files`);

	const tasks = ['compile-client', 'compile-server', 'parse'];
	const results = {};

	for (const task of tasks) {
		results[task] = await runBenchmarkTask(files, task);
	}

	// Output combined JSON
	const output = {
		generatedAt: new Date().toISOString(),
		commitSha: getCommitSha(),
		testFilesCount: files.length,
		...results,
	};

	console.log(JSON.stringify(output, null, 2));
}

main().catch((err) => {
	console.error('Benchmark failed:', err);
	process.exit(1);
});
