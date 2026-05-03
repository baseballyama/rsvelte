#!/usr/bin/env node

/**
 * Update documentation from compatibility report.
 *
 * This script reads the compatibility report JSON and updates:
 * 1. README.md - Compatibility table
 * 2. docs/static/test-results.json - Progress dashboard data
 *
 * Usage:
 *   node scripts/update-docs.mjs
 *   node scripts/update-docs.mjs --report path/to/report.json
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Get Svelte commit hash
function getSvelteCommitHash() {
	try {
		const result = execSync('git rev-parse HEAD', {
			cwd: path.join(rootDir, 'svelte'),
			encoding: 'utf-8'
		});
		return result.trim();
	} catch {
		return 'unknown';
	}
}

// Get the compatibility report path
function getReportPath() {
	const args = process.argv.slice(2);
	const reportIndex = args.indexOf('--report');

	if (reportIndex !== -1 && args[reportIndex + 1]) {
		return args[reportIndex + 1];
	}

	// Default: use fixtures/{commit}/compatibility-report.json
	const commit = getSvelteCommitHash();
	const shortHash = commit.substring(0, 12);
	return path.join(rootDir, 'fixtures', shortHash, 'compatibility-report.json');
}

// Load compatibility report
function loadReport(reportPath) {
	if (!fs.existsSync(reportPath)) {
		console.error(`Error: Report not found at ${reportPath}`);
		console.error('Run "npm run compatibility-report" first to generate it.');
		process.exit(1);
	}

	const content = fs.readFileSync(reportPath, 'utf-8');
	return JSON.parse(content);
}

// Category display names and order
const CATEGORY_CONFIG = {
	'parser-modern': { name: 'Parser Modern', order: 1 },
	'parser-legacy': { name: 'Parser Legacy', order: 2 },
	snapshot: { name: 'Compiler Snapshot', order: 3 },
	css: { name: 'CSS', order: 4 },
	validator: { name: 'Validator', order: 5 },
	'compiler-errors': { name: 'Compiler Errors', order: 6 },
	'runtime-runes': { name: 'Runtime Runes', order: 7 },
	'runtime-legacy': { name: 'Runtime Legacy', order: 8 },
	'runtime-browser': { name: 'Runtime Browser', order: 9 },
	hydration: { name: 'Hydration', order: 10 },
	'server-side-rendering': { name: 'SSR', order: 11 },
	sourcemaps: { name: 'Sourcemaps', order: 12 },
	preprocess: { name: 'Preprocess', order: 13 },
	print: { name: 'Print', order: 14 },
	migrate: { name: 'Migrate', order: 15 }
};

// Generate README compatibility table
function generateReadmeTable(report) {
	const categories = Object.entries(report.categories)
		.map(([id, data]) => ({
			id,
			...data,
			config: CATEGORY_CONFIG[id] || { name: id, order: 99 }
		}))
		.sort((a, b) => a.config.order - b.config.order);

	let table = '| Test Suite | Passing | Total | Coverage | Notes |\n';
	table += '|------------|---------|-------|----------|-------|\n';

	for (const cat of categories) {
		const { stats } = cat;
		const runCount = stats.total - stats.skipped;
		const percentage = runCount > 0 ? ((stats.passed / runCount) * 100).toFixed(0) : 0;

		let notes = '';
		if (stats.skipped > 0 && stats.skipped === stats.total) {
			// Whole category skipped — surface the reason recorded by the
			// test runner (e.g. "out of scope" vs "not implemented") rather
			// than always saying "Not implemented".
			const firstReason = cat.samples?.find((s) => s.skip_reason)?.skip_reason;
			if (firstReason && /out of scope/i.test(firstReason)) {
				notes = 'Out of scope';
			} else if (firstReason) {
				notes = firstReason;
			} else {
				notes = 'Not implemented';
			}
		} else if (stats.skipped > 0) {
			notes = `${stats.skipped} skipped`;
		}

		table += `| ${cat.config.name} | ${stats.passed} | ${runCount} | ${percentage}% | ${notes} |\n`;
	}

	return table;
}

// Update README.md
function updateReadme(report) {
	const readmePath = path.join(rootDir, 'README.md');
	let content = fs.readFileSync(readmePath, 'utf-8');

	// Generate new table
	const newTable = generateReadmeTable(report);

	// Find and replace the compatibility table
	// Look for the section starting with "## Compatibility" and ending with the table
	const compatibilityRegex =
		/(## Compatibility\s*\n\s*Current compatibility with the official Svelte compiler test suite:\s*\n\s*)\|[^#]+(\n\n###|\n\n## |\n\n$)/s;

	if (compatibilityRegex.test(content)) {
		content = content.replace(compatibilityRegex, `$1${newTable}$2`);
		fs.writeFileSync(readmePath, content);
		console.log('Updated README.md compatibility table');
	} else {
		console.warn('Warning: Could not find compatibility table in README.md');
	}
}

// Convert to test-results.json format (for docs site)
function generateTestResults(report) {
	const categories = Object.entries(report.categories)
		.map(([id, data]) => ({
			id,
			name: CATEGORY_CONFIG[id]?.name || id,
			total: data.stats.total,
			passed: data.stats.passed,
			failed: data.stats.failed,
			skipped: data.stats.skipped,
			percentage:
				data.stats.total - data.stats.skipped > 0
					? (data.stats.passed / (data.stats.total - data.stats.skipped)) * 100
					: 0,
			tests: data.samples.map((sample) => ({
				name: sample.name,
				status:
					sample.status === 'passed'
						? 'pass'
						: sample.status === 'failed'
							? 'fail'
							: sample.status === 'error'
								? 'fail'
								: 'skip',
				error_message: sample.error || undefined,
				skip_reason: sample.skip_reason || undefined
			}))
		}))
		.sort((a, b) => (CATEGORY_CONFIG[a.id]?.order || 99) - (CATEGORY_CONFIG[b.id]?.order || 99));

	const totalTests = report.summary.total_tests;
	const totalSkipped = report.summary.total_skipped;
	const runCount = totalTests - totalSkipped;

	return {
		generated_at: report.generated_at,
		commit_sha: report.svelte_short_hash,
		summary: {
			total: totalTests,
			passed: report.summary.total_passed,
			failed: report.summary.total_failed + report.summary.total_errors,
			skipped: totalSkipped,
			percentage: runCount > 0 ? (report.summary.total_passed / runCount) * 100 : 0
		},
		categories
	};
}

// Update docs test-results.json
function updateTestResults(report) {
	const testResultsPath = path.join(rootDir, 'docs', 'static', 'test-results.json');
	const testResults = generateTestResults(report);

	// Ensure directory exists
	const dir = path.dirname(testResultsPath);
	if (!fs.existsSync(dir)) {
		fs.mkdirSync(dir, { recursive: true });
	}

	fs.writeFileSync(testResultsPath, JSON.stringify(testResults, null, 2));
	console.log('Updated docs/static/test-results.json');
}

// Main
function main() {
	console.log('Updating documentation from compatibility report...\n');

	const reportPath = getReportPath();
	console.log(`Loading report from: ${reportPath}`);

	const report = loadReport(reportPath);
	console.log(`Report date: ${report.generated_at}`);
	console.log(`Svelte commit: ${report.svelte_short_hash}`);
	console.log(`Total tests: ${report.summary.total_tests}`);
	console.log(`Overall: ${report.summary.total_passed}/${report.summary.total_tests - report.summary.total_skipped} (${report.summary.overall_percentage.toFixed(1)}%)\n`);

	updateReadme(report);
	updateTestResults(report);

	console.log('\nDone!');
}

main();
