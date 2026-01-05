#!/usr/bin/env node
/**
 * Benchmark script that measures JS vs Rust compiler performance.
 * Collects all Svelte test files and compiles them with both compilers.
 */

import pkg from '../svelte/packages/svelte/compiler/index.js';
const { compile } = pkg;
import { execSync, spawn } from 'child_process';
import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SVELTE_TESTS = join(__dirname, '../svelte/packages/svelte/tests');

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
 * Benchmark JavaScript Svelte compiler
 */
function benchmarkJavaScript(files, iterations) {
	const times = [];

	// Warmup
	for (let i = 0; i < WARMUP_ITERATIONS; i++) {
		for (const file of files) {
			try {
				compile(file.content, { generate: 'client', filename: file.path, dev: false });
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
				compile(file.content, { generate: 'client', filename: file.path, dev: false });
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
async function benchmarkRust(files, singleThread) {
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

async function main() {
	console.error('Collecting Svelte test files...');
	const files = collectTestFiles();

	console.error(`Found ${files.length} files`);

	// Run JavaScript benchmark
	console.error('\nBenchmarking JavaScript compiler...');
	const jsTimes = benchmarkJavaScript(files, BENCHMARK_ITERATIONS);
	const jsStats = calculateStats(jsTimes, files.length);
	console.error(`  Average: ${jsStats.durationMs.toFixed(2)}ms`);
	console.error(`  Throughput: ${jsStats.throughputFilesPerSec.toFixed(1)} files/sec`);

	// Run Rust single-threaded benchmark
	console.error('\nBenchmarking Rust compiler (single-threaded)...');
	const rustSingleTimes = await benchmarkRust(files, true);
	const rustSingleStats = calculateStats(rustSingleTimes, files.length);
	console.error(`  Average: ${rustSingleStats.durationMs.toFixed(2)}ms`);
	console.error(`  Throughput: ${rustSingleStats.throughputFilesPerSec.toFixed(1)} files/sec`);

	// Run Rust multi-threaded benchmark
	console.error('\nBenchmarking Rust compiler (multi-threaded)...');
	const rustMultiTimes = await benchmarkRust(files, false);
	const rustMultiStats = calculateStats(rustMultiTimes, files.length);
	console.error(`  Average: ${rustMultiStats.durationMs.toFixed(2)}ms`);
	console.error(`  Throughput: ${rustMultiStats.throughputFilesPerSec.toFixed(1)} files/sec`);

	// Calculate speedups
	const speedupSingleVsJs = jsStats.durationMs / rustSingleStats.durationMs;
	const speedupMultiVsJs = jsStats.durationMs / rustMultiStats.durationMs;

	console.error('\n--- Speedup Summary ---');
	console.error(`Rust (single) vs JS: ${speedupSingleVsJs.toFixed(1)}x faster`);
	console.error(`Rust (multi) vs JS: ${speedupMultiVsJs.toFixed(1)}x faster`);

	// Generate results JSON
	const results = {
		generatedAt: new Date().toISOString(),
		commitSha: getCommitSha(),
		testFilesCount: files.length,
		javascript: {
			name: 'JavaScript (svelte/compiler)',
			filesCount: files.length,
			...jsStats,
		},
		rustSingleThread: {
			name: 'Rust (single-threaded)',
			filesCount: files.length,
			...rustSingleStats,
		},
		rustMultiThread: {
			name: 'Rust (multi-threaded)',
			filesCount: files.length,
			...rustMultiStats,
		},
		speedup: {
			singleThreadVsJs: speedupSingleVsJs,
			multiThreadVsJs: speedupMultiVsJs,
		},
	};

	console.log(JSON.stringify(results, null, 2));
}

main().catch((err) => {
	console.error('Benchmark failed:', err);
	process.exit(1);
});
