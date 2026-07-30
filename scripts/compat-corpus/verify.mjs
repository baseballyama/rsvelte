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
 * Writes compatibility/report.json.
 *
 * Ratchet baselines (checked in), one per target (see targets.mjs) so CSR and
 * SSR are tracked independently:
 *   - compatibility/known-failures.client.json  (CSR / client target)
 *   - compatibility/known-failures.server.json  (SSR / server target)
 * Each lists the entry ids whose output diverges for that target. Verification
 * exits non-zero only when a (id, target) pair NOT in its baseline fails (a
 * regression) — known failures are tolerated and burned down over time (see
 * compatibility/known-failures.md for the root-cause writeup of each entry).
 * When previously-known failures now pass, a reminder to shrink the relevant
 * baseline is printed (use --update-baseline to rewrite the files from current
 * results; `--update-baseline <target>` rewrites only that target's file).
 *
 * --from-report <path> skips normalization/comparison entirely and derives the
 * baselines from an existing report.json (e.g. downloaded from a CI run), so a
 * new target's baseline can be bootstrapped without a local full run.
 *
 * Usage: node scripts/compat-corpus/verify.mjs [--no-fmt] [--max-print <n>] [--update-baseline [<target>]] [--from-report <path>] [--strict]
 */

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { flattenTemplateHoles, stripBlankLines, astEquivalent, readIf, firstDiffLine } from './normalize.mjs';
import { TARGETS, TARGET_KEYS } from './targets.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');
const CORPUS = path.join(ROOT, 'compatibility');
const EXPECTED = path.join(CORPUS, 'expected');
const ACTUAL = path.join(CORPUS, 'actual');

const args = process.argv.slice(2);
const NO_FMT = args.includes('--no-fmt');
const MAX_PRINT = Number(args[args.indexOf('--max-print') + 1] || 20);
const UPDATE_BASELINE = args.includes('--update-baseline');
const STRICT = args.includes('--strict'); // ignore the baseline: any failure fails

// `--update-baseline <target>` limits the rewrite to one target; bare
// `--update-baseline` rewrites every target's baseline (the historical
// behaviour).
const UPDATE_SCOPE = (() => {
	const next = args[args.indexOf('--update-baseline') + 1];
	if (!UPDATE_BASELINE || !next || next.startsWith('--')) return null;
	if (!TARGET_KEYS.includes(next)) {
		console.error(`[verify] unknown --update-baseline target "${next}" (known: ${TARGET_KEYS.join(', ')})`);
		process.exit(2);
	}
	return next;
})();

const FROM_REPORT = (() => {
	const i = args.indexOf('--from-report');
	return i !== -1 && args[i + 1] ? path.resolve(process.cwd(), args[i + 1]) : null;
})();

// --baseline-client <path> / --baseline-server <path> select alternate ratchet
// files (defaults come from targets.mjs). The corpus is a single unified set,
// so these are rarely needed — kept for ad-hoc scoped runs.
function baselinePath(target) {
	const i = args.indexOf(`--baseline-${target.key}`);
	return path.resolve(CORPUS, i !== -1 ? args[i + 1] : target.baseline);
}

// Partition failures by target so every target ratchets independently. Every
// failure detail carries a target (css mismatches are client-only), so an entry
// that diverges on two targets lands in both sets.
function partitionFailures(failures) {
	const byTarget = new Map(TARGET_KEYS.map((key) => [key, new Set()]));
	for (const f of failures) {
		for (const d of f.details) {
			const set = byTarget.get(d.target);
			if (set) set.add(f.id);
			else console.warn(`[verify] ignoring failure detail for unknown target "${d.target}" (${f.id})`);
		}
	}
	return byTarget;
}

function writeBaselines(byTarget) {
	console.log();
	for (const target of TARGETS) {
		if (UPDATE_SCOPE && target.key !== UPDATE_SCOPE) continue;
		const ids = byTarget.get(target.key);
		const p = baselinePath(target);
		fs.writeFileSync(p, JSON.stringify([...ids].sort(), null, '\t') + '\n');
		console.log(`[verify] baseline updated: ${ids.size} known failures -> ${path.relative(ROOT, p)}`);
	}
}

if (FROM_REPORT) {
	const report = JSON.parse(fs.readFileSync(FROM_REPORT, 'utf8'));
	console.log(`[verify] deriving baselines from ${path.relative(ROOT, FROM_REPORT)} (${report.failures.length} failures)`);
	writeBaselines(partitionFailures(report.failures));
	process.exit(0);
}

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

const counts = { match: 0, 'error-parity': 0, 'js-mismatch': 0, 'css-mismatch': 0, 'error-mismatch': 0 };
const failures = [];

for (const { id } of manifest) {
	const expDir = path.join(EXPECTED, id);
	const actDir = path.join(ACTUAL, id);
	const expErr = JSON.parse(readIf(path.join(expDir, 'error.json')) ?? '{}');
	const actErr = JSON.parse(readIf(path.join(actDir, 'error.json')) ?? '{}');

	let verdict = 'match';
	const details = [];

	for (const targetDef of TARGETS) {
		const target = targetDef.key;
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
		if (targetDef.css) {
			const expCss = readIf(path.join(expDir, `${target}.css`));
			const actCss = readIf(path.join(actDir, `${target}.css`));
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

const failById = new Map(failures.map((f) => [f.id, f]));
const failsByTarget = partitionFailures(failures);

if (UPDATE_BASELINE) {
	writeBaselines(failsByTarget);
	process.exit(0);
}

const loadBaseline = (p) =>
	new Set(!STRICT && fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf8')) : []);
const baselines = new Map(TARGETS.map((t) => [t.key, loadBaseline(baselinePath(t))]));

// A regression is a (id, target) pair failing while absent from that target's
// baseline.
const regressions = [];
for (const key of TARGET_KEYS) {
	for (const id of failsByTarget.get(key)) {
		if (!baselines.get(key).has(id)) regressions.push({ id, target: key });
	}
}

const fixedByTarget = TARGET_KEYS.map((key) => [
	key,
	[...baselines.get(key)].filter((id) => !failsByTarget.get(key).has(id)),
]);
const fixedKnown = fixedByTarget.reduce((n, [, ids]) => n + ids.length, 0);

if (fixedKnown) {
	const breakdown = fixedByTarget.map(([key, ids]) => `${key} ${ids.length}`).join(', ');
	console.log(`\n[verify] 🎉 ${fixedKnown} known failures now PASS (${breakdown}) — shrink the baselines:`);
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
	const breakdown = TARGET_KEYS.map((key) => `${key} ${failsByTarget.get(key).size}`).join(', ');
	console.log(`\n[verify] ✅ no regressions (${breakdown} known failures remain — see compatibility/known-failures.md)`);
} else {
	console.log('\n[verify] ✅ all corpus outputs identical after normalization');
}
