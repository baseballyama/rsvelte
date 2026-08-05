#!/usr/bin/env node
/**
 * svelte-check diagnostic-parity verifier (design mirror of lint-verify.mjs,
 * for rsvelte-check). For every scenario under `compatibility/check-fixtures/`:
 *
 *   1. Materialise the fixture into a temp dir and inject the pinned oracle's
 *      `node_modules` (scripts/compat-corpus/check-oracle) — so both checkers
 *      see byte-identical dependencies.
 *   2. Check it with the REAL `svelte-check` — the ground truth.
 *   3. Check it with the native `rsvelte-check` binary.
 *   4. Diff the two normalized diagnostic sets — both sides read via
 *      `--output machine-verbose`, so one parser covers both.
 *
 * Unlike the compiler / fmt / svelte2tsx / lint gates, this one compares
 * *diagnostics of a type-checked project*, not per-file text: alias resolution,
 * workspace layout and the `.d.ts` environment are exactly the axes those gates
 * cannot observe (see #1897).
 *
 * NORMALIZATION — a diagnostic collapses to `<SEVERITY> <relpath>:<line> <code>`:
 *   - path is relative to the checked workspace, `/`-separated;
 *   - line is 1-based (both sides' machine-verbose JSON `start.line` is
 *     0-based, so +1);
 *   - code is the bare TS error number (`TS2322` -> `2322`) or, for Svelte
 *     compiler diagnostics, the warning/error code string.
 * COLUMN and MESSAGE TEXT are deliberately dropped: both differ for reasons that
 * are not diagnostic-parity (rsvelte maps positions back through its own source
 * map, and TypeScript message wording is version-sensitive), and keeping them
 * would make the ratchet churn on every upstream patch release. Severity, file,
 * line and code are what a user acts on.
 *
 * Because that key is lossy, diagnostics are compared as a MULTISET, not a set:
 * one line can legitimately carry several diagnostics with the same code (three
 * binding elements in one destructured parameter, say). Comparing sets would let
 * an already-known divergence swallow a brand-new one at the same key. A
 * divergence of multiplicity n > 1 is recorded with an ` xN` suffix.
 *
 * Usage:
 *   node scripts/compat-corpus/check-verify.mjs                # verify (CI gate)
 *   node scripts/compat-corpus/check-verify.mjs --update       # rewrite known-failures
 *   node scripts/compat-corpus/check-verify.mjs --show N       # print up to N new diffs
 *   node scripts/compat-corpus/check-verify.mjs --scenario a,b # restrict to scenarios
 *   node scripts/compat-corpus/check-verify.mjs --keep         # keep the temp workspaces
 *   node scripts/compat-corpus/check-verify.mjs --rsvelte-backend tsgo
 *                                                               # type-check the rsvelte
 *                                                               # side with tsgo instead of
 *                                                               # tsc (scripts/compat-corpus/
 *                                                               # check-tsgo); the oracle side
 *                                                               # is always tsc-based.
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { diffCounts, parseMachineVerbose, runCapture } from './check-diagnostics.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');
const FIXTURES = path.join(ROOT, 'compatibility/check-fixtures');
const ORACLE_DIR = path.join(__dirname, 'check-oracle');
const TSGO_DIR = path.join(__dirname, 'check-tsgo');

const args = process.argv.slice(2);
const UPDATE = args.includes('--update');
const KEEP = args.includes('--keep');
const SHOW = args.includes('--show') ? Number(args[args.indexOf('--show') + 1] || 50) : 50;
const ONLY = args.includes('--scenario')
	? new Set((args[args.indexOf('--scenario') + 1] || '').split(',').filter(Boolean))
	: null;
// Which compiler backend rsvelte-check itself type-checks with. The oracle
// (real svelte-check) is unconditionally tsc-based regardless of this flag —
// only the side under test switches. `tsc` keeps today's behaviour untouched;
// `tsgo` is the product's other shipped backend (`rsvelte-check --tsgo`),
// exercised nowhere else in CI (#1897 Layer 4).
const BACKEND = args.includes('--rsvelte-backend')
	? args[args.indexOf('--rsvelte-backend') + 1]
	: 'tsc';
if (BACKEND !== 'tsc' && BACKEND !== 'tsgo') {
	fail(`--rsvelte-backend must be "tsc" or "tsgo", got "${BACKEND}"`);
}
// One ratchet shared by both backends: measured locally, tsc and tsgo produce
// IDENTICAL diagnostic sets across every scenario (0 divergence either way —
// see the tsc-vs-tsgo comparison in the PR that added `--rsvelte-backend`).
// Splitting the file only pays off once the backends actually disagree; until
// then a shared ratchet is simpler and a `tsgo`-only regression still fails
// the gate (it shows up as a new divergence against the same known-good
// baseline the `tsc` leg already cleared).
const KNOWN = path.join(ROOT, 'compatibility/check-known-failures.json');
// Report filename still varies by backend so a `--rsvelte-backend tsgo` run
// doesn't clobber the `tsc` leg's debug artifact when run back-to-back locally.
const REPORT = path.join(ROOT, `compatibility/check-report${BACKEND === 'tsgo' ? '.tsgo' : ''}.json`);

function fail(msg) {
	console.error(`[check-verify] ${msg}`);
	process.exit(2);
}

// A partial run rewrites the ratchet from a partial diff, silently dropping
// every entry the subset didn't produce.
if (UPDATE && ONLY) fail('--update cannot be combined with --scenario');

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

/** Resolve the compiler binary rsvelte-check's TSGO_BIN should point at, per `--rsvelte-backend`. */
function rsvelteCompiler(oracleNodeModules) {
	if (BACKEND === 'tsc') {
		// The real TypeScript's own launcher, NOT `.bin/tsc`: the oracle also
		// installs TypeScript 7 under the `@typescript/native` alias, which
		// declares the same `tsc` bin name, so the shim points at whichever of
		// the two npm linked last. Everything but the `ts7-native` scenario
		// must type-check with the TS 6 svelte-check itself runs on.
		const tsc = path.join(oracleNodeModules, 'typescript/bin/tsc');
		if (!fs.existsSync(tsc)) return fail(`oracle typescript missing its tsc at ${tsc}`);
		return tsc;
	}
	const tsgo = path.join(TSGO_DIR, 'node_modules/.bin/tsgo');
	if (!fs.existsSync(tsgo)) {
		return fail(
			'tsgo backend not installed; run `npm --prefix scripts/compat-corpus/check-tsgo install --no-package-lock`'
		);
	}
	return tsgo;
}

function scenarios() {
	return fs
		.readdirSync(FIXTURES, { withFileTypes: true })
		.filter((e) => e.isDirectory())
		.map((e) => e.name)
		.filter((n) => !ONLY || ONLY.has(n))
		.sort();
}

/** Copy `<scenario>/project` into `dest` and wire up its node_modules + symlinks. */
function materialize(name, config, dest, nodeModules) {
	fs.rmSync(dest, { recursive: true, force: true });
	fs.mkdirSync(dest, { recursive: true });
	fs.cpSync(path.join(FIXTURES, name, 'project'), dest, { recursive: true });
	// A single root-level link is enough: both Node and TypeScript walk up from
	// the importing file, so nested packages resolve through it too.
	fs.symlinkSync(nodeModules, path.join(dest, 'node_modules'), 'dir');
	for (const [link, target] of Object.entries(config.links ?? {})) {
		const p = path.join(dest, link);
		fs.mkdirSync(path.dirname(p), { recursive: true });
		fs.symlinkSync(target, p, 'dir');
	}
}

function main() {
	const bin = findBinary();
	const nodeModules = oracleModules();
	const rsvelteTsBin = rsvelteCompiler(nodeModules);
	console.log(`[check-verify] rsvelte-check backend: ${BACKEND} (${rsvelteTsBin})`);
	const names = scenarios();
	if (names.length === 0) return fail('no scenarios under compatibility/check-fixtures');

	const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'rsvelte-check-parity-'));
	const diffs = [];
	const report = {};

	for (const name of names) {
		const config = readJson(path.join(FIXTURES, name, 'scenario.json'), `scenario ${name}`);
		// Each side gets its own copy: a checker's emitted `.svelte-check/`
		// overlay would otherwise become input to the other one's file walk.
		const oracleDir = path.join(tmpRoot, name, 'oracle');
		const actualDir = path.join(tmpRoot, name, 'actual');
		materialize(name, config, oracleDir, nodeModules);
		materialize(name, config, actualDir, nodeModules);

		// Both checkers run with the checked package as cwd AND as `--workspace .`,
		// so a relative `--tsconfig` means the same thing to both (upstream resolves
		// it against the workspace, rsvelte-check against cwd).
		const common = ['--workspace', '.'];
		if (config.tsconfig) common.push('--tsconfig', config.tsconfig);
		// `args` opts a scenario into a flag both checkers understand — the
		// point being to compare the diagnostics that flag produces, so it has
		// to reach both sides identically.
		for (const extra of config.args ?? []) common.push(extra);
		const ws = config.workspace ?? '.';
		// `TSGO_BIN` pins rsvelte-check to the backend selected above so both
		// sides type-check with the same compiler. A scenario whose whole
		// subject IS compiler discovery has to be allowed to do its own.
		const actualEnv = config.discoverCompiler ? {} : { TSGO_BIN: rsvelteTsBin };

		const oracle = parseMachineVerbose(
			runCapture(
				'node',
				[
					path.join(nodeModules, 'svelte-check/bin/svelte-check'),
					'--output',
					'machine-verbose',
					...common
				],
				path.join(oracleDir, ws)
			)
		);
		// `TSGO_BIN` always wins over `--tsgo` (see tsgo.rs's `find_compiler`), so
		// pointing it straight at the chosen binary is enough on its own; `--tsgo`
		// is added too so the invocation matches how a real caller selects the
		// backend and isn't relying on an implementation detail of the override.
		// A scenario that already asks for `--tsgo` itself must not get a second
		// copy — clap rejects a repeated flag outright.
		const backendArgs =
			BACKEND === 'tsgo' && !(config.args ?? []).includes('--tsgo') ? ['--tsgo'] : [];
		const actual = parseMachineVerbose(
			runCapture(
				bin,
				['--output', 'machine-verbose', ...common, ...backendArgs],
				path.join(actualDir, ws),
				actualEnv
			)
		);

		diffs.push(...diffCounts(name, oracle.counts, actual.counts));
		report[name] = { oracle: oracle.detail, rsvelte: actual.detail };
		console.log(
			`[check-verify] ${name}: oracle ${oracle.detail.length}, rsvelte ${actual.detail.length} diagnostic(s)`
		);
	}

	if (!KEEP) fs.rmSync(tmpRoot, { recursive: true, force: true });
	else console.log(`[check-verify] temp workspaces kept at ${tmpRoot}`);
	fs.writeFileSync(REPORT, JSON.stringify(report, null, '\t') + '\n');

	diffs.sort();
	const known = fs.existsSync(KNOWN) ? readJson(KNOWN, 'the ratchet') : [];
	const knownSet = new Set(known);
	const current = new Set(diffs);
	const added = diffs.filter((d) => !knownSet.has(d));
	const removed = known.filter((d) => !current.has(d));

	console.log(
		`[check-verify] divergences: ${diffs.length} current, ${known.length} known (${added.length} new, ${removed.length} fixed)`
	);

	if (UPDATE) {
		fs.writeFileSync(KNOWN, JSON.stringify(diffs, null, '\t') + '\n');
		console.log(`[check-verify] wrote ${diffs.length} entries to ${path.relative(ROOT, KNOWN)}`);
		return;
	}

	if (added.length > 0) {
		console.error(
			`\n[check-verify] ❌ ${added.length} NEW divergence(s) from official svelte-check:`
		);
		for (const d of added.slice(0, SHOW)) console.error('  ' + d);
		if (added.length > SHOW) console.error(`  … and ${added.length - SHOW} more`);
		console.error(
			`\n  (+ = rsvelte-only, - = official-only; details in ${path.relative(ROOT, REPORT)})`
		);
	}
	// Staleness is fatal: a large "already fixed" delta on a later PR reads as
	// normal noise, so a real regression can hide inside it.
	if (removed.length > 0) {
		console.error(`\n[check-verify] ❌ ${removed.length} ratchet entries no longer diverge — the ratchet is stale.`);
		for (const d of removed.slice(0, SHOW)) console.error('  ' + d);
		if (removed.length > SHOW) console.error(`  … and ${removed.length - SHOW} more`);
		console.error('\n  fix: node scripts/compat-corpus/check-verify.mjs --update');
	}
	if (added.length > 0 || removed.length > 0) process.exit(1);
	console.log('[check-verify] ✅ no new divergences');
}

main();
