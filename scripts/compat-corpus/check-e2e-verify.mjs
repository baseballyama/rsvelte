#!/usr/bin/env node
/**
 * svelte-check diagnostic-parity verifier, LAYER 2 — real project trees.
 *
 * Layer 1 (`check-verify.mjs`) checks committed mini-projects whose whole
 * dependency tree is one symlink to the pinned oracle. Layer 2 checks REAL
 * repositories, pinned as submodules, with their own `pnpm install` /
 * `npm ci`-materialised `node_modules`, their own `tsconfig` chain, their own
 * `svelte.config.js`, and — for the monorepo — sibling workspace packages
 * resolved through `exports` across package boundaries. That is the shape all
 * five false positives in the #1883–#1889 cluster were reported from: every one
 * was found by pointing the checker at somebody's actual repository, never by a
 * fixture. This gate puts that discovery path in CI.
 *
 * For each unit (a directory that has its own `tsconfig.json` and would be
 * checked by its own `pnpm check`):
 *
 *   1. `svelte-kit sync` where the unit is a SvelteKit app, so `.svelte-kit/`
 *      exists before either checker reads it (official `svelte-check` requires
 *      it; both sides then read the same generated types).
 *   2. Check with the REAL `svelte-check` — the ground truth.
 *   3. Check with the native `rsvelte-check` binary.
 *   4. Diff the two normalized diagnostic multisets.
 *
 * Both sides run from the unit directory with `--tsconfig ./tsconfig.json` and
 * NO `--workspace`, i.e. exactly what the project's own `check` script runs.
 * Normalization, the diagnostic key and the multiset diff are shared with
 * Layer 1 (`check-diagnostics.mjs`) so the two ratchets speak one language.
 *
 * The oracle's `node_modules` is NOT injected into these projects: they pin
 * their own `svelte` / `@sveltejs/kit` and their types are half the thing being
 * checked. What is shared is the CHECKER: official `svelte-check` runs from the
 * pinned oracle (so it uses the oracle's `typescript`), and `rsvelte-check` is
 * pointed at that same oracle `tsc` via `TSGO_BIN`. Both sides therefore
 * type-check the project's real dependency tree with one identical compiler.
 *
 * Usage:
 *   node scripts/compat-corpus/check-e2e-verify.mjs                # verify (CI gate)
 *   node scripts/compat-corpus/check-e2e-verify.mjs --update       # rewrite known-failures
 *   node scripts/compat-corpus/check-e2e-verify.mjs --show N       # print up to N new diffs
 *   node scripts/compat-corpus/check-e2e-verify.mjs --project a,b  # restrict to projects
 *   node scripts/compat-corpus/check-e2e-verify.mjs --skip-install # reuse an installed tree
 */

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { diffCounts, parseMachineVerbose, runCapture } from './check-diagnostics.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');
const KNOWN = path.join(ROOT, 'compatibility/check-e2e-known-failures.json');
const REPORT = path.join(ROOT, 'compatibility/check-e2e-report.json');
const ORACLE_DIR = path.join(__dirname, 'check-oracle');

/**
 * The corpus. A `unit` is one directory with its own `tsconfig.json` — the
 * granularity at which these repositories run `svelte-check` themselves.
 * `install` runs once per project, in the submodule root.
 */
const PROJECTS = [
	{
		id: 'cmsaasstarter',
		submodule: 'submodules/cmsaasstarter',
		// npm, not pnpm: the project ships a package-lock.json. Scripts stay
		// enabled because its postinstall (`patch-package`) patches @sveltejs/kit,
		// and `svelte-kit sync` runs against the patched copy.
		install: ['npm', ['ci']],
		units: [{ id: 'app', dir: '.', kit: true }]
	},
	{
		id: 'skeleton',
		submodule: 'submodules/skeleton',
		// Filtered install: `<pkg>...` pulls the unit plus its workspace
		// dependencies, which is what makes the cross-package resolution real
		// without installing the React / Astro halves of the monorepo.
		install: [
			'pnpm',
			[
				'install',
				'--frozen-lockfile',
				'--ignore-scripts',
				'--filter',
				'@skeletonlabs/playground-skeleton-svelte...',
				'--filter',
				'@skeletonlabs/skeleton-svelte...'
			]
		],
		units: [
			// A SvelteKit app importing two sibling workspace packages.
			{ id: 'playground', dir: 'playgrounds/skeleton-svelte', kit: true },
			// The library those siblings resolve to: 300+ components whose `.ts`
			// barrels re-export types out of `<script module>` blocks.
			{ id: 'library', dir: 'packages/skeleton-svelte', kit: false }
		]
	}
];

const args = process.argv.slice(2);
const UPDATE = args.includes('--update');
const SKIP_INSTALL = args.includes('--skip-install');
const SHOW = args.includes('--show') ? Number(args[args.indexOf('--show') + 1] || 50) : 50;
const ONLY = args.includes('--project')
	? new Set((args[args.indexOf('--project') + 1] || '').split(',').filter(Boolean))
	: null;

function fail(msg) {
	console.error(`[check-e2e] ${msg}`);
	process.exit(2);
}

// A partial run rewrites the ratchet from a partial diff, silently dropping
// every entry the subset didn't produce.
if (UPDATE && ONLY) fail('--update cannot be combined with --project');

function readJson(file, what) {
	try {
		return JSON.parse(fs.readFileSync(file, 'utf8'));
	} catch (err) {
		return fail(`${what} is not readable JSON (${path.relative(ROOT, file)}): ${err.message}`);
	}
}

function findBinary() {
	for (const profile of ['release', 'debug']) {
		const p = path.join(ROOT, 'target', profile, 'svelte_check');
		if (fs.existsSync(p)) return p;
	}
	return fail('rsvelte-check binary not found; run `cargo build --release -p rsvelte_check`');
}

function oracleModules() {
	const nm = path.join(ORACLE_DIR, 'node_modules');
	if (!fs.existsSync(path.join(nm, 'svelte-check'))) {
		return fail(
			'oracle not installed; run `npm --prefix scripts/compat-corpus/check-oracle install --no-package-lock`'
		);
	}
	return nm;
}

function run(program, argv, cwd) {
	execFileSync(program, argv, { cwd, stdio: 'inherit', env: process.env });
}

function main() {
	const bin = findBinary();
	const nodeModules = oracleModules();
	const tsc = path.join(nodeModules, '.bin/tsc');
	if (!fs.existsSync(tsc)) return fail(`oracle typescript missing its tsc at ${tsc}`);
	const svelteCheck = path.join(nodeModules, 'svelte-check/bin/svelte-check');

	const projects = PROJECTS.filter((p) => !ONLY || ONLY.has(p.id));
	if (projects.length === 0) return fail('no projects selected');

	const missing = projects.filter(
		(p) => !fs.existsSync(path.join(ROOT, p.submodule, 'package.json'))
	);
	if (missing.length > 0) {
		return fail(
			`submodule(s) not checked out: run \`git submodule update --init --depth 1 ${missing
				.map((p) => p.submodule)
				.join(' ')}\``
		);
	}

	const diffs = [];
	const report = {};

	for (const project of projects) {
		const projectDir = path.join(ROOT, project.submodule);
		if (!SKIP_INSTALL) {
			const started = Date.now();
			console.log(`[check-e2e] ${project.id}: ${project.install[0]} ${project.install[1].join(' ')}`);
			run(project.install[0], project.install[1], projectDir);
			console.log(`[check-e2e] ${project.id}: installed in ${((Date.now() - started) / 1000).toFixed(1)}s`);
		}

		for (const unit of project.units) {
			const id = `${project.id}/${unit.id}`;
			const cwd = path.join(projectDir, unit.dir);
			if (unit.kit) {
				// `.svelte-kit/tsconfig.json` is what the project tsconfig extends and
				// `$types` come from; official svelte-check refuses to run without it.
				run(path.join('node_modules', '.bin', 'svelte-kit'), ['sync'], cwd);
			}

			const argv = ['--output', 'machine-verbose', '--tsconfig', './tsconfig.json'];
			const overlay = path.join(cwd, '.svelte-check');

			// rsvelte-check's overlay lands inside the project, so it is removed
			// before BOTH runs: the oracle must never walk a stale overlay, and
			// rsvelte-check must never reuse one from a previous invocation.
			fs.rmSync(overlay, { recursive: true, force: true });
			let started = Date.now();
			const oracle = parseMachineVerbose(runCapture('node', [svelteCheck, ...argv], cwd));
			const oracleMs = Date.now() - started;

			fs.rmSync(overlay, { recursive: true, force: true });
			started = Date.now();
			const actual = parseMachineVerbose(runCapture(bin, argv, cwd, { TSGO_BIN: tsc }));
			const actualMs = Date.now() - started;
			fs.rmSync(overlay, { recursive: true, force: true });

			diffs.push(...diffCounts(id, oracle.counts, actual.counts));
			report[id] = { oracle: oracle.detail, rsvelte: actual.detail };
			console.log(
				`[check-e2e] ${id}: oracle ${oracle.detail.length} diagnostic(s) in ${(oracleMs / 1000).toFixed(1)}s, ` +
					`rsvelte ${actual.detail.length} in ${(actualMs / 1000).toFixed(1)}s`
			);
		}
	}

	fs.writeFileSync(REPORT, JSON.stringify(report, null, '\t') + '\n');

	diffs.sort();
	const known = fs.existsSync(KNOWN) ? readJson(KNOWN, 'the ratchet') : [];
	const knownSet = new Set(known);
	const current = new Set(diffs);
	const added = diffs.filter((d) => !knownSet.has(d));
	const removed = known.filter((d) => !current.has(d));

	console.log(
		`[check-e2e] divergences: ${diffs.length} current, ${known.length} known (${added.length} new, ${removed.length} fixed)`
	);

	if (UPDATE) {
		fs.writeFileSync(KNOWN, JSON.stringify(diffs, null, '\t') + '\n');
		console.log(`[check-e2e] wrote ${diffs.length} entries to ${path.relative(ROOT, KNOWN)}`);
		return;
	}

	if (added.length > 0) {
		console.error(`\n[check-e2e] ❌ ${added.length} NEW divergence(s) from official svelte-check:`);
		for (const d of added.slice(0, SHOW)) console.error('  ' + d);
		if (added.length > SHOW) console.error(`  … and ${added.length - SHOW} more`);
		console.error(
			`\n  (+ = rsvelte-only, - = official-only; details in ${path.relative(ROOT, REPORT)})`
		);
		process.exit(1);
	}
	if (removed.length > 0) {
		console.log(
			`[check-e2e] ✅ ${removed.length} divergence(s) fixed — run with --update to prune check-e2e-known-failures.json`
		);
	}
	console.log('[check-e2e] ✅ no new divergences');
}

main();
