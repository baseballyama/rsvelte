#!/usr/bin/env node
/**
 * Lint output-parity verifier (design mirror of corpus verify.mjs, for the
 * native linter). For every `.svelte` source collected by lint-collect.mjs:
 *
 *   1. Lint it with the REAL eslint-plugin-svelte (scripts/compat-corpus/
 *      lint-oracle) — the ground truth.
 *   2. Lint it with the native `rsvelte-lint` binary.
 *   3. Diff the two finding sets (ruleId, line, column, message), scoped to the
 *      rule universe both linters implement (minus a small unsupported set).
 *
 * Any finding present on exactly one side is a *divergence*. The set of
 * currently-accepted divergences lives in `compatibility/lint-known-failures.json`
 * and may only SHRINK: a NEW divergence fails the run (CI gate); divergences
 * that disappear are pruned with `--update`.
 *
 * Usage:
 *   node scripts/compat-corpus/lint-verify.mjs            # verify (CI gate)
 *   node scripts/compat-corpus/lint-verify.mjs --update   # rewrite known-failures
 *   node scripts/compat-corpus/lint-verify.mjs --show N    # print up to N new diffs
 */

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');
const CORPUS = path.join(ROOT, 'compatibility');
const SOURCES = path.join(CORPUS, 'lint-sources');
const ORACLE_DIR = path.join(__dirname, 'lint-oracle');
const KNOWN = path.join(CORPUS, 'lint-known-failures.json');

const args = process.argv.slice(2);
const UPDATE = args.includes('--update');
const SHOW = args.includes('--show') ? Number(args[args.indexOf('--show') + 1] || 50) : 50;

// Rules excluded from the parity universe, each for a structural reason that
// makes a finding-level comparison meaningless on this corpus (NOT a place to
// hide real divergences — those go in known-failures.json and must shrink).
const EXCLUDE = new Set([
	// ── Type-aware: need the TypeScript checker (tsgo) to match upstream. The
	//    type-aware path is covered separately by `rsvelte_lint_types`.
	'svelte/no-unused-props',
	'svelte/no-navigation-without-resolve',
	// `require-event-prefix` resolves component event names from TS types; the
	//    corpus oracle has only the TS *parser* (no type checker), so it returns
	//    `{}` and stays silent even on its own invalid fixtures. rsvelte's
	//    syntactic port recovers them, so a finding-level comparison here is
	//    meaningless (the rule IS exercised by the exact-fixture oracle test).
	'svelte/require-event-prefix',
	// ── Option-required: schema rejects an empty option list, so the rule is a
	//    no-op without a per-project allowlist. rsvelte defaults it off too.
	'svelte/no-restricted-html-elements',
	// ── Svelte 3/4-only (`meta.conditions: svelteVersions: ['3/4']`). The corpus
	//    declares Svelte 5 (see lint-collect's synthetic package.json), so the
	//    oracle skips these; rsvelte doesn't version-gate, so it would over-report.
	'svelte/experimental-require-strict-events',
	'svelte/require-event-dispatcher-types',
	// ── `indent`: a stylistic whitespace rule only partially ported (template
	//    level; the JS/TS-AST script indentation the fixture oracle skips). Full
	//    real-world parity is a tracked follow-up — see lint-corpus README. It
	//    dominates (~84%) the raw divergence count and would drown the gate.
	'svelte/indent',
	// ── Compiler/CSS-parser meta-rules: these run the Svelte compiler / CSS
	//    parser and surface its warnings (a11y, unused-selector, CSS parse
	//    errors). Their parity is governed by the compiler's own extensive test
	//    suites (validator/snapshot/CSS fixtures — all at 100%) and the fixture
	//    oracle, not the lint port. Comparing them here just re-surfaces
	//    compiler-level differences already tracked elsewhere.
	'svelte/valid-compile',
	'svelte/valid-style-parse'
]);

// Individual findings excluded for a structural reason OUTSIDE rsvelte's
// control (a version skew in the oracle's tooling, or a capability rsvelte does
// not implement) — the finding-scoped analogue of the per-rule `EXCLUDE` above,
// NOT a place to hide real divergences. Each entry is a full
// `<corpus-id>|<+|-><rule>\t<line>:<col>\t<message>` string and MUST carry a
// documented justification (see compatibility/lint-known-failures.md).
const MANUAL_EXCLUSIONS = new Set([
	// H4 — `globals` version split on `localStorage`/`navigator`/`sessionStorage`.
	// The corpus oracle runs eslint-plugin-svelte against globals@16.5, where
	// these are node-available, so upstream's `getBrowserGlobals()` (browser ∖
	// node) EXCLUDES them and the rule does not flag a bare top-level
	// `localStorage`. rsvelte MUST keep flagging them: eslint-plugin-svelte's
	// own fixture suite (the `eslint_plugin_oracle` hard gate) declares
	// `invalid/test03` expecting exactly this report. The two upstream artefacts
	// (live globals vs bundled fixtures) disagree; rsvelte matches the
	// authoritative fixtures. Reported upstream — see compatibility/lint-known-failures.md.
	'eslint-plugin-svelte/docs/rules/no-top-level-browser-globals.md/1.svelte|+svelte/no-top-level-browser-globals\t25:13\tUnexpected top-level browser global variable "localStorage".',
	'eslint-plugin-svelte/packages/eslint-plugin-svelte/tests/fixtures/rules/no-top-level-browser-globals/invalid/test03-input.svelte|+svelte/no-top-level-browser-globals\t2:12\tUnexpected top-level browser global variable "localStorage".',

	// `comment-directive` reportUnusedDisableDirectives on a CORE ESLint rule.
	// The oracle reports an `eslint-disable-next-line no-undef` as unused because
	// it RAN `no-undef` and it produced no error. rsvelte implements only
	// `svelte/*` rules, so it cannot tell "no-undef ran and found nothing"
	// (→ unused) from "no-undef would have fired but we never ran it" (→ used) —
	// it deliberately stays silent for unimplemented targets to avoid the FP
	// (verified: removing that guard trades this FN for a real FP on the very
	// next directive in the same fixture, line 8 having an undefined variable).
	// Same class as the type-aware `EXCLUDE` rules: not comparable without a
	// capability rsvelte does not have. The svelte/* unused-directive behaviour
	// IS still compared (only this single core-rule finding is excluded).
	"eslint-plugin-svelte/docs/rules/comment-directive.md/4.svelte|-svelte/comment-directive\t11:31\tUnused eslint-disable-next-line directive (no problems were reported from 'no-undef')."
]);

function findBinary() {
	for (const profile of ['dist-lint', 'release', 'debug']) {
		const p = path.join(ROOT, 'target', profile, 'rsvelte-lint');
		if (fs.existsSync(p)) return p;
	}
	console.error('[lint-verify] rsvelte-lint binary not found; run `cargo build --bin rsvelte-lint`');
	process.exit(2);
}

function ruleUniverse(bin) {
	// rsvelte rule ids (the implemented set)…
	const listed = execFileSync(bin, ['--list-rules'], { encoding: 'utf8', maxBuffer: 1 << 24 });
	const rsvelte = new Set(
		listed
			.split('\n')
			.map((l) => l.match(/^(svelte\/[a-z0-9-]+)/))
			.filter(Boolean)
			.map((m) => m[1])
	);
	// …intersected with the plugin's rule ids (read from the oracle env).
	const pluginList = JSON.parse(
		execFileSync(
			'node',
			[
				'-e',
				'import("eslint-plugin-svelte").then(m=>process.stdout.write(JSON.stringify(Object.keys(m.default.rules).map(n=>"svelte/"+n))))'
			],
			{ cwd: ORACLE_DIR, encoding: 'utf8' }
		)
	);
	const plugin = new Set(pluginList);
	const universe = [...rsvelte].filter((id) => plugin.has(id) && !EXCLUDE.has(id)).sort();
	return universe;
}

function corpusFiles() {
	const manifest = JSON.parse(fs.readFileSync(path.join(CORPUS, 'lint-manifest.json'), 'utf8'));
	return manifest
		.filter((e) => e.kind === 'component')
		.map((e) => path.join(SOURCES, e.id))
		.filter((p) => fs.existsSync(p));
}

// finding -> stable string key. Columns are 1-based on both sides.
const key = (ruleId, line, col, message) => `${ruleId}\t${line}:${col}\t${message}`;

function runOracle(files, universe) {
	const rulesFile = path.join(CORPUS, '.lint-rules.json');
	fs.writeFileSync(rulesFile, JSON.stringify(universe));
	const out = execFileSync('node', ['lint-oracle/run.mjs', '--rules', rulesFile, '--stdin'], {
		cwd: __dirname,
		input: files.join('\0'),
		encoding: 'utf8',
		maxBuffer: 1 << 28
	});
	const data = JSON.parse(out);
	const universeSet = new Set(universe);
	const byFile = new Map();
	for (const entry of data) {
		const set = new Set();
		// Inline `/* eslint svelte/<rule>: … */` comments in fixtures can enable
		// rules outside the parity universe (incl. excluded ones); scope the
		// oracle findings to the universe just like the rsvelte side.
		for (const m of entry.messages) {
			if (universeSet.has(m.ruleId)) set.add(key(m.ruleId, m.line, m.column, m.message));
		}
		byFile.set(path.resolve(entry.file), { set, fatal: entry.fatal });
	}
	return byFile;
}

function runRsvelte(files, universe) {
	const cfg = { extends: ['none'], rules: Object.fromEntries(universe.map((id) => [id, 'warn'])) };
	const cfgFile = path.join(CORPUS, '.lint-rsvelte-lint.json');
	fs.writeFileSync(cfgFile, JSON.stringify(cfg));
	const bin = findBinary();
	let out;
	try {
		out = execFileSync(bin, ['--format', 'sarif', '--config', cfgFile, SOURCES], {
			encoding: 'utf8',
			maxBuffer: 1 << 28
		});
	} catch (err) {
		// rsvelte-lint exits non-zero when it finds warnings/errors; stdout is on err.
		out = err.stdout || '';
	}
	const byFile = new Map();
	for (const f of files) byFile.set(path.resolve(f), new Set());
	let sarif;
	try {
		sarif = JSON.parse(out);
	} catch {
		console.error('[lint-verify] failed to parse rsvelte-lint SARIF output');
		process.exit(2);
	}
	const universeSet = new Set(universe);
	for (const run of sarif.runs || []) {
		for (const r of run.results || []) {
			const ruleId = r.ruleId;
			if (!ruleId || !universeSet.has(ruleId)) continue;
			const loc = r.locations?.[0]?.physicalLocation;
			const uri = loc?.artifactLocation?.uri;
			if (!uri) continue;
			const abs = path.resolve(uri.replace(/^file:\/\//, ''));
			const line = loc?.region?.startLine ?? 1;
			const col = loc?.region?.startColumn ?? 1;
			const message = r.message?.text ?? '';
			if (!byFile.has(abs)) byFile.set(abs, new Set());
			byFile.get(abs).add(key(ruleId, line, col, message));
		}
	}
	return byFile;
}

function main() {
	const bin = findBinary();
	const files = corpusFiles();
	if (files.length === 0) {
		console.error('[lint-verify] no corpus sources; run `node scripts/compat-corpus/lint-collect.mjs` first');
		process.exit(2);
	}
	const universe = ruleUniverse(bin);
	console.log(`[lint-verify] ${files.length} sources, ${universe.length} rules in parity universe`);

	console.log('[lint-verify] running oracle (eslint-plugin-svelte)…');
	const oracle = runOracle(files, universe);
	console.log('[lint-verify] running rsvelte-lint…');
	const rsvelte = runRsvelte(files, universe);

	// Compute divergences as `<corpus-id>|<+|-><finding>` strings.
	const diffs = [];
	let oracleFatal = 0;
	for (const file of files) {
		const abs = path.resolve(file);
		const id = path.relative(SOURCES, abs).split(path.sep).join('/');
		const o = oracle.get(abs);
		if (o?.fatal) {
			// Oracle couldn't parse — not a rule divergence; skip (both sides
			// effectively produce nothing comparable).
			oracleFatal++;
			continue;
		}
		const oset = o?.set ?? new Set();
		const rset = rsvelte.get(abs) ?? new Set();
		for (const k of rset) if (!oset.has(k)) diffs.push(`${id}|+${k}`); // false positive
		for (const k of oset) if (!rset.has(k)) diffs.push(`${id}|-${k}`); // false negative
	}
	// Drop documented finding-level exclusions (version skew / capability gap).
	const filtered = diffs.filter((d) => !MANUAL_EXCLUSIONS.has(d));
	diffs.length = 0;
	diffs.push(...filtered);
	diffs.sort();

	const known = fs.existsSync(KNOWN) ? JSON.parse(fs.readFileSync(KNOWN, 'utf8')) : [];
	const knownSet = new Set(known);
	const current = new Set(diffs);
	const added = diffs.filter((d) => !knownSet.has(d));
	const removed = known.filter((d) => !current.has(d));

	console.log(
		`[lint-verify] divergences: ${diffs.length} current, ${known.length} known (${added.length} new, ${removed.length} fixed), oracle-unparseable: ${oracleFatal}`
	);

	if (UPDATE) {
		fs.writeFileSync(KNOWN, JSON.stringify(diffs, null, '\t') + '\n');
		console.log(`[lint-verify] wrote ${diffs.length} entries to ${path.relative(ROOT, KNOWN)}`);
		return;
	}

	if (added.length > 0) {
		console.error(`\n[lint-verify] ❌ ${added.length} NEW divergence(s) from eslint-plugin-svelte:`);
		for (const d of added.slice(0, SHOW)) console.error('  ' + d.replace(/\t/g, ' '));
		if (added.length > SHOW) console.error(`  … and ${added.length - SHOW} more`);
		process.exit(1);
	}
	if (removed.length > 0) {
		console.log(
			`[lint-verify] ✅ ${removed.length} divergence(s) fixed — run with --update to prune known-failures.json`
		);
	}
	console.log('[lint-verify] ✅ no new divergences');
}

main();
