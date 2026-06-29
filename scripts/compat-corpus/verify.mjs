#!/usr/bin/env node
/**
 * Normalize both output trees with oxfmt (formatting-only differences are
 * explicitly tolerated by the corpus contract), then require byte-identical
 * outputs between the official Svelte compiler (expected/) and rsvelte
 * (actual/) for every corpus entry and target (client = CSR, server = SSR).
 *
 * Verdicts per entry:
 *   - match           js (post-oxfmt) and css byte-identical for both targets
 *   - error-parity    official compiler rejected; rsvelte rejected too
 *   - js-mismatch / css-mismatch / error-mismatch (rsvelte errs where official
 *     compiles, or vice versa)
 *
 * Writes compat/corpus/report.json.
 *
 * Ratchet baselines (checked in), one per target so CSR and SSR are tracked
 * independently:
 *   - compat/corpus/known-failures.client.json  (CSR / client target)
 *   - compat/corpus/known-failures.server.json  (SSR / server target)
 * Each lists the entry ids whose output diverges for that target. Verification
 * exits non-zero only when a (id, target) pair NOT in its baseline fails (a
 * regression) — known failures are tolerated and burned down over time (see
 * docs/corpus-remaining-work.md). When previously-known failures now pass, a
 * reminder to shrink the relevant baseline is printed (use --update-baseline to
 * rewrite both files from current results).
 *
 * Usage: node scripts/compat-corpus/verify.mjs [--no-fmt] [--max-print <n>] [--update-baseline] [--strict]
 */

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { flattenTemplateHoles, stripBlankLines, astEquivalent } from './normalize.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');
const CORPUS = path.join(ROOT, 'compat/corpus');
const EXPECTED = path.join(CORPUS, 'expected');
const ACTUAL = path.join(CORPUS, 'actual');

const args = process.argv.slice(2);
const NO_FMT = args.includes('--no-fmt');
const MAX_PRINT = Number(args[args.indexOf('--max-print') + 1] || 20);
const UPDATE_BASELINE = args.includes('--update-baseline');
const STRICT = args.includes('--strict'); // ignore the baseline: any failure fails
// --baseline-client <path> / --baseline-server <path> select alternate ratchet
// files (defaults: known-failures.{client,server}.json). The corpus is a single
// unified set, so these are rarely needed — kept for ad-hoc scoped runs.
function baselineArg(flag, fallback) {
	const i = args.indexOf(flag);
	return path.resolve(CORPUS, i !== -1 ? args[i + 1] : fallback);
}
const BASELINE_CLIENT = baselineArg('--baseline-client', 'known-failures.client.json');
const BASELINE_SERVER = baselineArg('--baseline-server', 'known-failures.server.json');

// ---- oxfmt normalization ---------------------------------------------------

function flattenTreeTemplateHoles(dir) {
	const entries = fs.readdirSync(dir, { withFileTypes: true });
	for (const entry of entries) {
		const p = path.join(dir, entry.name);
		if (entry.isDirectory()) flattenTreeTemplateHoles(p);
		else if (entry.name.endsWith('.js')) {
			const src = fs.readFileSync(p, 'utf8');
			const flat = flattenTemplateHoles(src);
			if (flat !== src) fs.writeFileSync(p, flat);
		}
	}
}

if (!NO_FMT) {
	const emptyIgnore = path.join(CORPUS, '.oxfmt-ignore-nothing');
	fs.writeFileSync(emptyIgnore, '');
	for (const tree of [EXPECTED, ACTUAL]) {
		// esrap wraps long expressions inside `${}` template holes; oxfmt
		// preserves hole multiline-ness from its input, so flatten holes
		// BEFORE formatting to make both trees converge (see normalize.mjs).
		console.log(`[verify] flatten template holes ${path.relative(ROOT, tree)}…`);
		flattenTreeTemplateHoles(tree);
		console.log(`[verify] oxfmt ${path.relative(ROOT, tree)}…`);
		try {
			execFileSync('npx', ['oxfmt', '-c', path.join(CORPUS, '.oxfmtrc.json'), '--ignore-path', emptyIgnore, '--no-error-on-unmatched-pattern', '.'], {
				cwd: tree,
				stdio: ['ignore', 'ignore', 'pipe'],
				maxBuffer: 1024 * 1024 * 64,
			});
		} catch (e) {
			// oxfmt exits non-zero when some files cannot be parsed (e.g. the
			// official compiler emits `await` inside non-async component
			// functions for async components). Those files are left unformatted
			// in BOTH trees and compared byte-for-byte instead.
			const stderr = e.stderr?.toString() ?? '';
			const unparsable = (stderr.match(/x `|x Expected|x Unexpected/g) ?? []).length;
			console.log(`[verify]   oxfmt skipped unparsable files (${unparsable} parse diagnostics)`);
		}
	}
}

// ---- comparison --------------------------------------------------------------

const manifest = JSON.parse(fs.readFileSync(path.join(CORPUS, 'manifest.json'), 'utf8'));

function readIf(p) {
	return fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : null;
}

function firstDiffLine(a, b) {
	const al = a.split('\n');
	const bl = b.split('\n');
	for (let i = 0; i < Math.max(al.length, bl.length); i++) {
		if (al[i] !== bl[i]) {
			return { line: i + 1, expected: (al[i] ?? '<EOF>').slice(0, 120), actual: (bl[i] ?? '<EOF>').slice(0, 120) };
		}
	}
	return null;
}

const counts = { match: 0, 'error-parity': 0, 'js-mismatch': 0, 'css-mismatch': 0, 'error-mismatch': 0 };
const failures = [];

for (const { id } of manifest) {
	const expDir = path.join(EXPECTED, id);
	const actDir = path.join(ACTUAL, id);
	const expErr = JSON.parse(readIf(path.join(expDir, 'error.json')) ?? '{}');
	const actErr = JSON.parse(readIf(path.join(actDir, 'error.json')) ?? '{}');

	let verdict = 'match';
	const details = [];

	for (const target of ['client', 'server']) {
		const e = expErr[target];
		const a = actErr[target];
		if (e && a) {
			if (e.code && a.code && e.code !== a.code) {
				verdict = 'error-mismatch';
				details.push({ target, kind: 'error-code', expected: e.code, actual: a.code });
			} else if (verdict === 'match') {
				verdict = 'error-parity';
			}
			continue;
		}
		if (e || a) {
			verdict = 'error-mismatch';
			details.push({
				target,
				kind: 'error-presence',
				expected: e ? `error: ${e.code ?? e.message}` : 'compiles',
				actual: a ? `error: ${a.code ?? a.message}` : 'compiles',
			});
			continue;
		}
		const expRaw = readIf(path.join(expDir, `${target}.js`)) ?? '';
		const actRaw = readIf(path.join(actDir, `${target}.js`)) ?? '';
		const expJs = stripBlankLines(expRaw);
		const actJs = stripBlankLines(actRaw);
		// Byte comparison first (cheap). If it differs, fall back to AST
		// structural equivalence (acorn, not regex): the same code differing
		// only in comment placement / line-wrapping / redundant parens is
		// accepted, while genuinely-different code — and output acorn can't
		// parse — still fails.
		if (expJs !== actJs && !astEquivalent(expRaw, actRaw)) {
			verdict = 'js-mismatch';
			details.push({ target, kind: 'js', ...firstDiffLine(expJs, actJs) });
		}
		if (target === 'client') {
			const expCss = readIf(path.join(expDir, 'client.css'));
			const actCss = readIf(path.join(actDir, 'client.css'));
			if ((expCss ?? '') !== (actCss ?? '')) {
				if (verdict === 'match') verdict = 'css-mismatch';
				details.push({ target, kind: 'css', ...firstDiffLine(expCss ?? '', actCss ?? '') });
			}
		}
	}

	counts[verdict]++;
	if (verdict !== 'match' && verdict !== 'error-parity') {
		failures.push({ id, verdict, details });
	}
}

const report = {
	generatedAt: new Date().toISOString(),
	total: manifest.length,
	counts,
	failures,
};
fs.writeFileSync(path.join(CORPUS, 'report.json'), JSON.stringify(report, null, '\t') + '\n');

console.log('\n[verify] results:');
for (const [k, v] of Object.entries(counts)) console.log(`  ${k.padEnd(16)} ${v}`);
console.log(`  report: ${path.relative(ROOT, path.join(CORPUS, 'report.json'))}`);

// Partition failures by target so CSR (client) and SSR (server) ratchet
// independently. Every failure detail carries a target (css mismatches are
// client-only), so an entry that diverges on both targets lands in both sets.
const failById = new Map(failures.map((f) => [f.id, f]));
const clientFails = new Set();
const serverFails = new Set();
for (const f of failures) {
	for (const d of f.details) {
		if (d.target === 'client') clientFails.add(f.id);
		else if (d.target === 'server') serverFails.add(f.id);
	}
}

if (UPDATE_BASELINE) {
	const writeBaseline = (p, ids) => {
		fs.writeFileSync(p, JSON.stringify([...ids].sort(), null, '\t') + '\n');
		console.log(`[verify] baseline updated: ${ids.size} known failures -> ${path.relative(ROOT, p)}`);
	};
	console.log();
	writeBaseline(BASELINE_CLIENT, clientFails);
	writeBaseline(BASELINE_SERVER, serverFails);
	process.exit(0);
}

const loadBaseline = (p) =>
	new Set(!STRICT && fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf8')) : []);
const clientBaseline = loadBaseline(BASELINE_CLIENT);
const serverBaseline = loadBaseline(BASELINE_SERVER);

// A regression is a (id, target) pair failing while absent from that target's
// baseline.
const regressions = [];
for (const id of clientFails) if (!clientBaseline.has(id)) regressions.push({ id, target: 'client' });
for (const id of serverFails) if (!serverBaseline.has(id)) regressions.push({ id, target: 'server' });

const fixedClient = [...clientBaseline].filter((id) => !clientFails.has(id));
const fixedServer = [...serverBaseline].filter((id) => !serverFails.has(id));
const fixedKnown = fixedClient.length + fixedServer.length;

if (fixedKnown) {
	console.log(`\n[verify] 🎉 ${fixedKnown} known failures now PASS (client ${fixedClient.length}, server ${fixedServer.length}) — shrink the baselines:`);
	console.log('  node scripts/compat-corpus/verify.mjs --no-fmt --update-baseline');
}

if (regressions.length) {
	console.log(`\n[verify] ❌ ${regressions.length} NEW failures (not in baseline); first ${Math.min(MAX_PRINT, regressions.length)}:`);
	for (const { id, target } of regressions.slice(0, MAX_PRINT)) {
		const f = failById.get(id);
		console.log(`  - ${id} [${f.verdict}] (${target})`);
		for (const d of f.details.filter((d) => d.target === target).slice(0, 2)) {
			console.log(`      ${d.target}/${d.kind} line ${d.line ?? ''}`);
			if (d.expected !== undefined) console.log(`        expected: ${d.expected}`);
			if (d.actual !== undefined) console.log(`        actual:   ${d.actual}`);
		}
	}
	process.exit(1);
}

if (failures.length) {
	console.log(`\n[verify] ✅ no regressions (client ${clientFails.size}, server ${serverFails.size} known failures remain — see docs/corpus-remaining-work.md)`);
} else {
	console.log('\n[verify] ✅ all corpus outputs identical after normalization');
}
