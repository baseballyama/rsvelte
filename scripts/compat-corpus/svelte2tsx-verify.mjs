#!/usr/bin/env node
/**
 * Normalize both svelte2tsx output trees with oxfmt (formatting-only
 * differences are tolerated), then require byte-identical TSX between the
 * official svelte2tsx (expected-s2t/) and rsvelte's port (actual-s2t/) for
 * every component corpus entry.
 *
 * Unlike the compiler corpus (verify.mjs) there is NO AST-structural fallback:
 * svelte2tsx embeds functional comments — `///<reference>` directives and
 * `/*Ωignore_startΩ*​/` markers the language server depends on — so comment and
 * exact-token parity is part of the contract, not noise.
 *
 * Verdicts per entry:
 *   - match           index.tsx (post-oxfmt) byte-identical
 *   - error-parity    official svelte2tsx rejected; rsvelte rejected too
 *   - ts-mismatch     output differs after normalization
 *   - error-mismatch  one side errors where the other produces output
 *
 * Writes compat/corpus/report-s2t.json.
 *
 * Ratchet baseline: compat/corpus/svelte2tsx-known-failures.json (checked in)
 * lists entry ids that are known-divergent. Verification exits non-zero only
 * when an entry NOT in the baseline fails (a regression). When previously-known
 * failures now pass, a reminder to shrink the baseline is printed (use
 * --update-baseline to rewrite it from current results).
 *
 * Usage: node scripts/compat-corpus/svelte2tsx-verify.mjs [--no-fmt] [--max-print <n>] [--update-baseline] [--strict]
 */

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { stripBlankLines } from './normalize.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');
const CORPUS = path.join(ROOT, 'compat/corpus');
const EXPECTED = path.join(CORPUS, 'expected-s2t');
const ACTUAL = path.join(CORPUS, 'actual-s2t');

const args = process.argv.slice(2);
const NO_FMT = args.includes('--no-fmt');
const MAX_PRINT = Number(args[args.indexOf('--max-print') + 1] || 20);
const UPDATE_BASELINE = args.includes('--update-baseline');
const STRICT = args.includes('--strict'); // ignore the baseline: any failure fails
// --baseline <path> selects an alternate ratchet file (see verify.mjs); rarely
// needed — the corpus is one unified set (default svelte2tsx-known-failures.json).
const BASELINE_PATH = path.resolve(
	CORPUS,
	args.indexOf('--baseline') !== -1 ? args[args.indexOf('--baseline') + 1] : 'svelte2tsx-known-failures.json',
);

// ---- oxfmt normalization ---------------------------------------------------

if (!NO_FMT) {
	const emptyIgnore = path.join(CORPUS, '.oxfmt-ignore-nothing');
	fs.writeFileSync(emptyIgnore, '');
	for (const tree of [EXPECTED, ACTUAL]) {
		if (!fs.existsSync(tree)) continue;
		console.log(`[s2t-verify] oxfmt ${path.relative(ROOT, tree)}…`);
		try {
			execFileSync('npx', ['oxfmt', '-c', path.join(CORPUS, '.oxfmtrc.json'), '--ignore-path', emptyIgnore, '--no-error-on-unmatched-pattern', '.'], {
				cwd: tree,
				stdio: ['ignore', 'ignore', 'pipe'],
				maxBuffer: 1024 * 1024 * 64,
			});
		} catch (e) {
			// oxfmt exits non-zero when some files cannot be parsed. Those files
			// are left unformatted in BOTH trees and compared byte-for-byte
			// instead (an unparsable rsvelte output is itself a real divergence).
			const stderr = e.stderr?.toString() ?? '';
			const unparsable = (stderr.match(/x `|x Expected|x Unexpected/g) ?? []).length;
			console.log(`[s2t-verify]   oxfmt skipped unparsable files (${unparsable} parse diagnostics)`);
		}
	}
}

// ---- comparison --------------------------------------------------------------

const manifest = JSON.parse(fs.readFileSync(path.join(CORPUS, 'manifest.json'), 'utf8')).filter(
	(e) => e.kind === 'component'
);

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

const counts = { match: 0, 'error-parity': 0, 'ts-mismatch': 0, 'error-mismatch': 0, missing: 0 };
const failures = [];

for (const { id } of manifest) {
	const expDir = path.join(EXPECTED, id);
	const actDir = path.join(ACTUAL, id);
	const expErr = readIf(path.join(expDir, 'error.json'));
	const actErr = readIf(path.join(actDir, 'error.json'));
	const expTsx = readIf(path.join(expDir, 'index.tsx'));
	const actTsx = readIf(path.join(actDir, 'index.tsx'));

	let verdict = 'match';
	const details = [];

	// Every compiled entry writes EITHER index.tsx OR error.json on each side.
	// If a side has neither, the compile step never produced it (e.g. a crashed
	// shard) — flag it instead of letting two absent outputs compare as equal.
	if ((expErr == null && expTsx == null) || (actErr == null && actTsx == null)) {
		verdict = 'missing';
		details.push({
			kind: 'missing-output',
			expected: expErr == null && expTsx == null ? 'absent' : 'present',
			actual: actErr == null && actTsx == null ? 'absent' : 'present',
		});
	} else if (expErr && actErr) {
		verdict = 'error-parity';
	} else if (expErr || actErr) {
		verdict = 'error-mismatch';
		details.push({
			kind: 'error-presence',
			expected: expErr ? 'error' : 'compiles',
			actual: actErr ? 'error' : 'compiles',
		});
	} else {
		const expTs = stripBlankLines(expTsx ?? '');
		const actTs = stripBlankLines(actTsx ?? '');
		if (expTs !== actTs) {
			verdict = 'ts-mismatch';
			details.push({ kind: 'ts', ...firstDiffLine(expTs, actTs) });
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
fs.writeFileSync(path.join(CORPUS, 'report-s2t.json'), JSON.stringify(report, null, '\t') + '\n');

console.log('\n[s2t-verify] results:');
for (const [k, v] of Object.entries(counts)) console.log(`  ${k.padEnd(16)} ${v}`);
console.log(`  report: ${path.relative(ROOT, path.join(CORPUS, 'report-s2t.json'))}`);

if (UPDATE_BASELINE) {
	const baseline = failures.map((f) => f.id).sort();
	fs.writeFileSync(BASELINE_PATH, JSON.stringify(baseline, null, '\t') + '\n');
	console.log(`\n[s2t-verify] baseline updated: ${baseline.length} known failures -> ${path.relative(ROOT, BASELINE_PATH)}`);
	process.exit(0);
}

const baseline = new Set(
	!STRICT && fs.existsSync(BASELINE_PATH) ? JSON.parse(fs.readFileSync(BASELINE_PATH, 'utf8')) : []
);
const regressions = failures.filter((f) => !baseline.has(f.id));
const failingIds = new Set(failures.map((f) => f.id));
const fixedKnown = [...baseline].filter((id) => !failingIds.has(id));

if (fixedKnown.length) {
	console.log(`\n[s2t-verify] 🎉 ${fixedKnown.length} known failures now PASS — shrink the baseline:`);
	console.log('  node scripts/compat-corpus/svelte2tsx-verify.mjs --no-fmt --update-baseline');
}

if (regressions.length) {
	console.log(`\n[s2t-verify] ❌ ${regressions.length} NEW failures (not in baseline); first ${Math.min(MAX_PRINT, regressions.length)}:`);
	for (const f of regressions.slice(0, MAX_PRINT)) {
		console.log(`  - ${f.id} [${f.verdict}]`);
		for (const d of f.details.slice(0, 2)) {
			console.log(`      ${d.kind} line ${d.line ?? ''}`);
			if (d.expected !== undefined) console.log(`        expected: ${d.expected}`);
			if (d.actual !== undefined) console.log(`        actual:   ${d.actual}`);
		}
	}
	process.exit(1);
}

if (failures.length) {
	console.log(`\n[s2t-verify] ✅ no regressions (${failures.length} known failures remain)`);
} else {
	console.log('\n[s2t-verify] ✅ all svelte2tsx outputs identical after normalization');
}
