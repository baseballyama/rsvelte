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
			cwd: path.join(rootDir, 'submodules', 'svelte'),
			encoding: 'utf-8'
		});
		return result.trim();
	} catch {
		return 'unknown';
	}
}

// Get the Svelte release version (e.g. "5.51.3"). We read the version field
// from `packages/svelte/package.json` because CI checks out submodules with
// shallow depth and no tags, so `git describe` can't resolve `svelte@<ver>`.
function getSvelteVersion() {
	try {
		const pkgPath = path.join(
			rootDir,
			'submodules',
			'svelte',
			'packages',
			'svelte',
			'package.json'
		);
		const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
		if (pkg && typeof pkg.version === 'string') return pkg.version;
	} catch {
		// Fall through to git-describe.
	}
	try {
		const result = execSync('git describe --tags --exact-match HEAD 2>/dev/null', {
			cwd: path.join(rootDir, 'submodules', 'svelte'),
			encoding: 'utf-8'
		}).trim();
		const match = /^svelte@(.+)$/.exec(result);
		return match ? match[1] : result || 'unknown';
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

// Replace the <!-- svelte-target-version -->…<!-- /svelte-target-version -->
// marker block in README.md so the displayed Svelte version stays in sync with
// the submodule pointer. Used by CI to enforce that the README never drifts.
function renderSvelteTargetBlock(version, commitHash) {
	const shortHash = commitHash.slice(0, 12);
	return [
		'<!-- svelte-target-version -->',
		`**Targeting Svelte \`v${version}\`** ([\`${shortHash}\`](https://github.com/sveltejs/svelte/commit/${shortHash})) — automatically maintained by \`pnpm run update-docs\`.`,
		'<!-- /svelte-target-version -->'
	].join('\n');
}

function updateSvelteTargetMarker(content, version, commitHash) {
	const block = renderSvelteTargetBlock(version, commitHash);
	const markerRegex =
		/<!-- svelte-target-version -->[\s\S]*?<!-- \/svelte-target-version -->/;
	if (markerRegex.test(content)) {
		return content.replace(markerRegex, block);
	}
	// First-time insertion: place it right before the compatibility table.
	const insertRegex =
		/(## Compatibility\s*\n\s*)(Current compatibility with the official Svelte compiler test suite:)/;
	if (insertRegex.test(content)) {
		return content.replace(insertRegex, `$1${block}\n\n$2`);
	}
	console.warn(
		'Warning: Could not find compatibility marker or section in README.md — Svelte target version not written.'
	);
	return content;
}

// Update README.md
//
// We only touch the <!-- svelte-target-version --> marker block so the
// displayed Svelte version stays in sync with the submodule pointer. The
// compatibility table itself is maintained manually because it carries
// hand-written annotations (totals row, skip reasons) that don't survive
// a fully automated regeneration.
function updateReadme(_report) {
	const readmePath = path.join(rootDir, 'README.md');
	const original = fs.readFileSync(readmePath, 'utf-8');

	const version = getSvelteVersion();
	const commit = getSvelteCommitHash();
	const updated = updateSvelteTargetMarker(original, version, commit);

	if (updated !== original) {
		fs.writeFileSync(readmePath, updated);
		console.log(`Updated README.md Svelte target marker (v${version} @ ${commit.slice(0, 12)})`);
	} else {
		console.log(`README.md Svelte target marker already up to date (v${version} @ ${commit.slice(0, 12)})`);
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

// Verify the README's Svelte target-version marker is consistent with the
// submodule pointer. Used by CI to catch stale docs after a submodule bump.
function checkReadmeInSync(_report) {
	const readmePath = path.join(rootDir, 'README.md');
	const original = fs.readFileSync(readmePath, 'utf-8');

	const version = getSvelteVersion();
	const commit = getSvelteCommitHash();
	const expected = updateSvelteTargetMarker(original, version, commit);

	if (expected !== original) {
		console.error(
			'README.md Svelte target-version marker is out of sync with the submodule.'
		);
		console.error('Run `pnpm run update-docs` and commit the result.');
		console.error('');
		console.error(`Expected Svelte target: v${version} (${commit.slice(0, 12)})`);
		process.exit(1);
	}

	console.log(`README.md Svelte target marker is in sync (v${version} @ ${commit.slice(0, 12)})`);
}

// Main
function main() {
	const args = process.argv.slice(2);
	const checkMode = args.includes('--check');

	if (checkMode) {
		console.log('Checking documentation is in sync with compatibility report...\n');
	} else {
		console.log('Updating documentation from compatibility report...\n');
	}

	const reportPath = getReportPath();
	console.log(`Loading report from: ${reportPath}`);

	const report = loadReport(reportPath);
	console.log(`Report date: ${report.generated_at}`);
	console.log(`Svelte commit: ${report.svelte_short_hash}`);
	console.log(`Total tests: ${report.summary.total_tests}`);
	console.log(`Overall: ${report.summary.total_passed}/${report.summary.total_tests - report.summary.total_skipped} (${report.summary.overall_percentage.toFixed(1)}%)\n`);

	if (checkMode) {
		checkReadmeInSync(report);
		return;
	}

	updateReadme(report);
	updateTestResults(report);

	console.log('\nDone!');
}

main();
