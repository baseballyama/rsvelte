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
 * A SECOND, independent gate validates the source map both tools return
 * (`map.json`, written by svelte2tsx-compile.mjs). The TSX gate cannot see
 * the map at all, which is how rsvelte shipped a `mappings` string whose
 * generated columns were all zero (issue #2066) — the TSX was byte-perfect and
 * svelte-check consumes the separate `forward_map`, so nothing noticed.
 *
 * The maps are NOT compared to each other. magic-string segments them
 * differently, so byte, decoded-set and lookup-equality parity all diverge on
 * ~100% of the corpus and would ratchet nothing. What is asserted instead is
 * that rsvelte's own map is structurally well-formed against the text it
 * describes (invariants in sourcemap.mjs); the official map only CALIBRATES
 * those invariants — a rule magic-string violates is too strict. Map verdicts:
 *   - map-valid           rsvelte's map is well-formed
 *   - map-invalid         rsvelte's map violates an invariant
 *   - map-missing         official emitted a map, rsvelte emitted none
 *   - map-oracle-invalid  the OFFICIAL map violates an invariant, so the
 *                         invariant — not rsvelte — is suspect; entry skipped
 *   - map-absent          neither side emitted a map (the entry errored)
 *
 * Writes compatibility/report-s2t.json.
 *
 * Ratchet baselines (both checked in, both shrink-only): TSX divergences in
 * compatibility/svelte2tsx-known-failures.json, map violations in
 * compatibility/svelte2tsx-map-known-failures.json. Verification exits non-zero
 * only when an entry NOT in the matching baseline fails (a regression). When
 * previously-known failures now pass, a reminder to shrink the baseline is
 * printed (--update-baseline rewrites BOTH from current results).
 *
 * Usage: node scripts/compat-corpus/svelte2tsx-verify.mjs [--no-fmt] [--max-print <n>] [--update-baseline] [--strict]
 */

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { stripBlankLines, readIf, firstDiffLine } from './normalize.mjs';
import { mappingViolations } from './sourcemap.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');
const CORPUS = path.join(ROOT, 'compatibility');
const EXPECTED = path.join(CORPUS, 'expected-s2t');
const ACTUAL = path.join(CORPUS, 'actual-s2t');

const args = process.argv.slice(2);
const NO_FMT = args.includes('--no-fmt');
const MAX_PRINT = args.includes('--max-print') ? Number(args[args.indexOf('--max-print') + 1]) || 20 : 20;
const UPDATE_BASELINE = args.includes('--update-baseline');
const STRICT = args.includes('--strict'); // ignore the baseline: any failure fails
// --baseline <path> selects an alternate ratchet file (see verify.mjs); rarely
// needed — the corpus is one unified set (default svelte2tsx-known-failures.json).
const ALT_BASELINE = args.includes('--baseline');
const BASELINE_PATH = path.resolve(
	CORPUS,
	ALT_BASELINE ? args[args.indexOf('--baseline') + 1] : 'svelte2tsx-known-failures.json',
);
// --baseline redirects only the TSX ratchet, so the map ratchet keeps pointing at
// the real file — which makes it unsafe to REWRITE from such a run (see below).
const MAP_BASELINE_PATH = path.join(CORPUS, 'svelte2tsx-map-known-failures.json');

const manifest = JSON.parse(fs.readFileSync(path.join(CORPUS, 'manifest.json'), 'utf8')).filter(
	(e) => e.kind === 'component'
);

// map.json carries the generated line lengths the mappings were built against,
// so this gate never reads index.tsx — which oxfmt rewrites in place, leaving it
// inconsistent with the map on any later re-run.
const mapCounts = { 'map-valid': 0, 'map-invalid': 0, 'map-missing': 0, 'map-oracle-invalid': 0, 'map-absent': 0 };
const mapFailures = [];
const readMap = (dir) => {
	const json = readIf(path.join(dir, 'map.json'));
	return json == null ? null : JSON.parse(json);
};
for (const { id } of manifest) {
	const expected = readMap(path.join(EXPECTED, id));
	const actual = readMap(path.join(ACTUAL, id));
	const source = readIf(path.join(CORPUS, 'sources', id)) ?? '';

	let verdict;
	let details = [];
	if (actual == null) {
		// Official emitting a map while rsvelte emits none is the regression that
		// would follow from dropping the map from the NAPI surface again.
		verdict = expected == null ? 'map-absent' : 'map-missing';
	} else if (expected != null && mappingViolations(expected.mappings, expected.generatedLines, source).length) {
		verdict = 'map-oracle-invalid';
	} else {
		details = mappingViolations(actual.mappings, actual.generatedLines, source);
		verdict = details.length ? 'map-invalid' : 'map-valid';
	}

	mapCounts[verdict]++;
	if (verdict === 'map-invalid' || verdict === 'map-missing') mapFailures.push({ id, verdict, details });
}

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

const counts = { match: 0, 'error-parity': 0, 'oracle-invalid': 0, 'ts-mismatch': 0, 'error-mismatch': 0, missing: 0 };
const failures = [];

// An output-parity oracle is only meaningful when the OFFICIAL tool itself
// produced valid output. In a handful of degenerate inputs the official
// svelte2tsx either CRASHES with an internal MagicString error (not a
// deliberate Svelte/TS compiler rejection) or emits TSX that isn't even
// parseable — there is then no valid target to match, and rsvelte's own valid
// output is correct by construction. Such entries are classified `oracle-invalid`
// (a pass), NOT a `ts-mismatch`/`error-mismatch` failure.
//
// This never masks a real rsvelte bug: it fires ONLY when the official side is
// broken (crash / unparseable) AND rsvelte's side is valid (oxfmt-parseable).
// A rsvelte regression that emits invalid output, or any divergence where the
// official output IS valid, still fails normally.
const ORACLE_CRASH_SIGNATURES = [
	'Cannot overwrite across a split point',
	'Cannot split a chunk that has already been edited',
];
function isOracleInternalCrash(errJson) {
	if (!errJson) return false;
	try {
		const msg = JSON.parse(errJson).message ?? '';
		return ORACLE_CRASH_SIGNATURES.some((s) => msg.includes(s));
	} catch {
		return false;
	}
}
function oxfmtParses(absFile) {
	if (!fs.existsSync(absFile)) return false;
	try {
		execFileSync('npx', ['oxfmt', '-c', path.join(CORPUS, '.oxfmtrc.json'), absFile], { stdio: 'ignore' });
		return true;
	} catch {
		return false;
	}
}

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
		// Official crashed internally (MagicString bug, not a real rejection) and
		// rsvelte produced valid TSX → oracle-invalid (no valid target to match).
		if (expErr && !actErr && isOracleInternalCrash(expErr) && oxfmtParses(path.join(actDir, 'index.tsx'))) {
			verdict = 'oracle-invalid';
		} else {
			verdict = 'error-mismatch';
			details.push({
				kind: 'error-presence',
				expected: expErr ? 'error' : 'compiles',
				actual: actErr ? 'error' : 'compiles',
			});
		}
	} else {
		const expTs = stripBlankLines(expTsx ?? '');
		const actTs = stripBlankLines(actTsx ?? '');
		if (expTs !== actTs) {
			// If the OFFICIAL output isn't even parseable TSX (a broken oracle
			// transformation) while rsvelte's IS valid, there is no valid target
			// to match → oracle-invalid rather than a ts-mismatch failure.
			if (!oxfmtParses(path.join(expDir, 'index.tsx')) && oxfmtParses(path.join(actDir, 'index.tsx'))) {
				verdict = 'oracle-invalid';
			} else {
				verdict = 'ts-mismatch';
				details.push({ kind: 'ts', ...firstDiffLine(expTs, actTs) });
			}
		}
	}

	counts[verdict]++;
	if (verdict !== 'match' && verdict !== 'error-parity' && verdict !== 'oracle-invalid') {
		failures.push({ id, verdict, details });
	}
}

const report = {
	generatedAt: new Date().toISOString(),
	total: manifest.length,
	counts,
	failures,
	mapCounts,
	mapFailures,
};
fs.writeFileSync(path.join(CORPUS, 'report-s2t.json'), JSON.stringify(report, null, '\t') + '\n');

console.log('\n[s2t-verify] results:');
for (const [k, v] of Object.entries({ ...counts, ...mapCounts })) console.log(`  ${k.padEnd(18)} ${v}`);
console.log(`  report: ${path.relative(ROOT, path.join(CORPUS, 'report-s2t.json'))}`);

if (UPDATE_BASELINE) {
	const updates = [[failures, BASELINE_PATH]];
	// A --baseline run targets some alternate TSX ratchet; rewriting the one real
	// map ratchet from it would clobber it with that run's narrower results.
	if (ALT_BASELINE) {
		console.log(`\n[s2t-verify] --baseline given: leaving ${path.relative(ROOT, MAP_BASELINE_PATH)} untouched`);
	} else {
		updates.push([mapFailures, MAP_BASELINE_PATH]);
	}
	for (const [entries, file] of updates) {
		const baseline = entries.map((f) => f.id).sort();
		fs.writeFileSync(file, JSON.stringify(baseline, null, '\t') + '\n');
		console.log(`\n[s2t-verify] baseline updated: ${baseline.length} known failures -> ${path.relative(ROOT, file)}`);
	}
	process.exit(0);
}

// Guard against a vacuous map gate: a tree produced before svelte2tsx-compile.mjs
// wrote map.json has no maps at all, and every entry would silently pass.
if (counts.match > 0 && mapCounts['map-valid'] + mapCounts['map-invalid'] === 0) {
	console.error('\n[s2t-verify] no source maps found in either tree — re-run svelte2tsx-compile.mjs');
	process.exit(1);
}

/**
 * Ratchet `entries` against the checked-in baseline at `file`: report entries
 * that newly fail, and nudge to shrink the baseline when known ones now pass.
 * Returns true when there is a regression.
 */
function ratchet(label, entries, file) {
	const baseline = new Set(!STRICT && fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : []);
	const failingIds = new Set(entries.map((f) => f.id));
	const fixedKnown = [...baseline].filter((id) => !failingIds.has(id));
	const regressions = entries.filter((f) => !baseline.has(f.id));

	if (fixedKnown.length) {
		console.log(`\n[s2t-verify] 🎉 ${fixedKnown.length} known ${label} failures now PASS — shrink the baseline:`);
		console.log('  node scripts/compat-corpus/svelte2tsx-verify.mjs --no-fmt --update-baseline');
	}

	if (regressions.length) {
		console.log(
			`\n[s2t-verify] ❌ ${regressions.length} NEW ${label} failures (not in baseline); first ${Math.min(MAX_PRINT, regressions.length)}:`
		);
		for (const f of regressions.slice(0, MAX_PRINT)) {
			console.log(`  - ${f.id} [${f.verdict}]`);
			for (const d of f.details.slice(0, 2)) {
				console.log(`      ${d.kind} ${d.detail ?? `line ${d.line ?? ''}`}`);
				if (d.expected !== undefined) console.log(`        expected: ${d.expected}`);
				if (d.actual !== undefined) console.log(`        actual:   ${d.actual}`);
			}
		}
		return true;
	}

	if (entries.length) {
		console.log(`\n[s2t-verify] ✅ no ${label} regressions (${entries.length} known failures remain)`);
	}
	return false;
}

// Both gates are reported before exiting so one run shows every regression.
const tsxRegressed = ratchet('TSX', failures, BASELINE_PATH);
const mapRegressed = ratchet('source-map', mapFailures, MAP_BASELINE_PATH);

if (tsxRegressed || mapRegressed) process.exit(1);

if (!failures.length && !mapFailures.length) {
	console.log('\n[s2t-verify] ✅ all svelte2tsx outputs identical after normalization, all source maps well-formed');
}
