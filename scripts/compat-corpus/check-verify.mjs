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
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');
const FIXTURES = path.join(ROOT, 'compatibility/check-fixtures');
const KNOWN = path.join(ROOT, 'compatibility/check-known-failures.json');
const REPORT = path.join(ROOT, 'compatibility/check-report.json');
const ORACLE_DIR = path.join(__dirname, 'check-oracle');

const args = process.argv.slice(2);
const UPDATE = args.includes('--update');
const KEEP = args.includes('--keep');
const SHOW = args.includes('--show') ? Number(args[args.indexOf('--show') + 1] || 50) : 50;
const ONLY = args.includes('--scenario')
	? new Set((args[args.indexOf('--scenario') + 1] || '').split(',').filter(Boolean))
	: null;

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

function runCapture(program, argv, cwd, env) {
	try {
		return execFileSync(program, argv, {
			cwd,
			encoding: 'utf8',
			maxBuffer: 1 << 28,
			env: { ...process.env, ...env }
		});
	} catch (err) {
		// Both CLIs exit non-zero as soon as they report an error; stdout is on err.
		if (err.stdout === undefined) throw err;
		return err.stdout;
	}
}

const rel = (p) => p.split(path.sep).join('/');
const key = (severity, file, line, code) => `${severity} ${rel(file)}:${line} ${code}`;

const bump = (counts, k) => counts.set(k, (counts.get(k) ?? 0) + 1);

/** `TS2322` / `2322` / 2322 -> `2322`; Svelte codes stay as written. */
function normalizeCode(code) {
	if (code === undefined || code === null || code === '') return '?';
	return String(code).replace(/^TS(?=\d)/, '');
}

/**
 * `--output machine-verbose`: one `<epoch-ms> <payload>` line per event, where
 * a diagnostic payload is the JSON object built by `MachineFriendlyWriter`.
 * START / COMPLETED lines are not JSON objects and are skipped. Both checkers
 * emit this same shape, so a single parser covers both sides.
 */
function parseMachineVerbose(stdout) {
	const counts = new Map();
	const detail = [];
	for (const line of stdout.split('\n')) {
		const payload = line.slice(line.indexOf(' ') + 1).trim();
		if (!payload.startsWith('{')) continue;
		let d;
		try {
			d = JSON.parse(payload);
		} catch {
			continue;
		}
		if (d.type !== 'ERROR' && d.type !== 'WARNING') continue;
		const k = key(d.type, d.filename, d.start.line + 1, normalizeCode(d.code));
		bump(counts, k);
		detail.push({ key: k, message: d.message, source: d.source });
	}
	return { counts, detail };
}

/**
 * Multiset difference: one entry per key whose multiplicity differs, tagged with
 * the side that has the surplus and how large it is.
 */
function diffCounts(scenario, oracle, rsvelte) {
	const out = [];
	for (const k of new Set([...oracle.keys(), ...rsvelte.keys()])) {
		const delta = (rsvelte.get(k) ?? 0) - (oracle.get(k) ?? 0);
		if (delta === 0) continue;
		const n = Math.abs(delta);
		out.push(`${scenario}|${delta > 0 ? '+' : '-'}${k}${n > 1 ? ` x${n}` : ''}`);
	}
	return out;
}

function main() {
	const bin = findBinary();
	const nodeModules = oracleModules();
	const tsc = path.join(nodeModules, '.bin/tsc');
	if (!fs.existsSync(tsc)) return fail(`oracle typescript missing its tsc at ${tsc}`);
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
		const ws = config.workspace ?? '.';

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
		const actual = parseMachineVerbose(
			runCapture(bin, ['--output', 'machine-verbose', ...common], path.join(actualDir, ws), {
				TSGO_BIN: tsc
			})
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
		process.exit(1);
	}
	if (removed.length > 0) {
		console.log(
			`[check-verify] ✅ ${removed.length} divergence(s) fixed — run with --update to prune check-known-failures.json`
		);
	}
	console.log('[check-verify] ✅ no new divergences');
}

main();
