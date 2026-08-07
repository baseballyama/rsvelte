#!/usr/bin/env node
/**
 * Normalize both output trees with oxfmt (formatting-only differences are
 * explicitly tolerated by the corpus contract), then require byte-identical
 * outputs between the official Svelte compiler (expected/) and rsvelte
 * (actual/) for every corpus entry and target (client = CSR, server = SSR,
 * client-dev = CSR with `dev: true`).
 *
 * Verdicts per entry:
 *   - match           js (post-oxfmt) and css byte-identical for every target
 *   - error-parity    official compiler rejected; rsvelte rejected too
 *   - js-mismatch / css-mismatch / error-mismatch (rsvelte errs where official
 *     compiles, or vice versa)
 *   - js-unparseable  one side's output does not parse, so there is no
 *     comparison to make (see compatibility/ast-equivalence.md)
 *
 * Compiler WARNINGS are gated separately, on their own ratchets, and never
 * touch the output verdicts above — see "warning parity" further down.
 *
 * Writes compatibility/report.json.
 *
 * Ratchet baselines (checked in), one per target (see targets.mjs) so every
 * target is tracked independently:
 *   - compatibility/known-failures.client.json      (CSR / client target)
 *   - compatibility/known-failures.server.json      (SSR / server target)
 *   - compatibility/known-failures.client-dev.json  (CSR with `dev: true`)
 * Each lists the entry ids whose output diverges for that target. Verification
 * exits non-zero when a (id, target) pair NOT in its baseline fails (a
 * regression) AND when a baseline still lists a pair that now passes (a stale
 * ratchet) — known failures are tolerated and burned down over time (see
 * compatibility/known-failures.md for the root-cause writeup of each entry).
 * Both are fixed with --update-baseline, which rewrites the files from current
 * results; `--update-baseline <target>` rewrites only that target's file.
 *
 * --from-report <path> skips normalization/comparison entirely and derives the
 * baselines from an existing report.json (e.g. downloaded from a CI run), so a
 * new target's baseline can be bootstrapped without a local full run.
 *
 * A passing run deletes expected/ and actual/ (see artifacts.mjs); a failing run
 * keeps them so the divergence can be inspected. --keep-artifacts always keeps,
 * --clean-artifacts always deletes.
 *
 * ---- warning parity --------------------------------------------------------
 *
 * `compile.mjs` records every compiler warning as (code, line, column) in
 * `warnings.json` next to the output. Two independent comparisons run here:
 *
 *   - warning-code-mismatch      the multiset of warning CODES differs. A
 *                                semantic bug: rsvelte warns where upstream
 *                                does not, or stays silent where it warns.
 *                                Ratchet: warning-known-failures.<target>.json
 *   - warning-position-mismatch  the codes agree but a (line, column) does
 *                                not — usually because rsvelte attaches no
 *                                span at that emission site, so an editor has
 *                                nowhere to put the squiggle.
 *                                Ratchet: warning-position-known-failures.<target>.json
 *
 * They are separate because they have different causes and different fixes;
 * folded together, the much larger position backlog would hide every semantic
 * regression. Both are shrink-only, like the output ratchets, and neither can
 * ever change an output ratchet — a warning divergence is not an output
 * divergence.
 *
 * Warning comparison needs no normalization, so it is meaningful under
 * `--no-fmt`. `--update-warning-baseline` rewrites ONLY the warning ratchets,
 * so a `--no-fmt` run (which inflates JS failures) can seed them without
 * corrupting the output baselines.
 *
 * The two update flags compose: passing both rewrites both ratchet families in
 * one run (the families are disjoint). Every run that asks for a rewrite prints
 * up front which families it will write, and a run that writes nothing is never
 * reported as a successful rewrite.
 *
 * Usage: node scripts/compat-corpus/verify.mjs [--no-fmt] [--max-print <n>] [--update-baseline [<target>]] [--update-warning-baseline] [--from-report <path>] [--targets <keys>] [--strict] [--keep-artifacts|--clean-artifacts]
 */

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { flattenTemplateHoles, stripBlankLines, readIf, firstDiffLine, oxfmtTree } from './normalize.mjs';
import { TARGET_KEYS as ALL_TARGET_KEYS, selectTargets } from './targets.mjs';
import { MIN_FULL_CORPUS_ENTRIES, OUTPUT_TREES, cleanupArtifacts, readGeneration, requireGenerationUnchanged } from './artifacts.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');
const CORPUS = path.join(ROOT, 'compatibility');
const EXPECTED = path.join(CORPUS, 'expected');
const ACTUAL = path.join(CORPUS, 'actual');

const args = process.argv.slice(2);
const NO_FMT = args.includes('--no-fmt');
// Without the flag the lookup lands on args[0], which is another flag: fall back.
const MAX_PRINT = args.includes('--max-print') ? Number(args[args.indexOf('--max-print') + 1]) || 20 : 20;
const UPDATE_BASELINE = args.includes('--update-baseline');
const UPDATE_WARNING_BASELINE = args.includes('--update-warning-baseline');
const STRICT = args.includes('--strict'); // ignore the baseline: any failure fails
const TARGETS = selectTargets(args);
const TARGET_KEYS = TARGETS.map((t) => t.key);

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

// State an update run's intent before doing any work: the failure mode this
// guards against is a rewrite that silently writes nothing and still exits 0.
const UPDATE_FAMILIES = [UPDATE_BASELINE && 'output', UPDATE_WARNING_BASELINE && 'warning'].filter(Boolean);
if (UPDATE_FAMILIES.length) {
	console.log(`[verify] rewriting ${UPDATE_FAMILIES.join(' + ')} ratchets for ${TARGET_KEYS.join(', ')}`);
}

// --from-report reconstructs only the output ratchets, so pairing it with the
// warning flag would write half of what was asked for.
if (FROM_REPORT && UPDATE_WARNING_BASELINE) {
	console.error('[verify] --from-report cannot rewrite the warning ratchets (it derives output failures only)');
	console.error('  fix: drop --update-warning-baseline, then re-run a full verify with it');
	process.exit(2);
}

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
			// Silently skip targets deselected via --targets; warn only for a
			// target no descriptor declares (a stale report, or a typo that would
			// otherwise drop failures on the floor).
			else if (!ALL_TARGET_KEYS.includes(d.target))
				console.warn(`[verify] ignoring failure detail for unknown target "${d.target}" (${f.id})`);
		}
	}
	return byTarget;
}

// `--update-baseline` DELETES every baseline id this run did not observe
// failing, so a run over a partial corpus silently shrinks the ratchets to
// whatever it happened to measure. Refuse unless the run saw the whole corpus.
function requireFullCorpus(measured, what) {
	if (measured >= MIN_FULL_CORPUS_ENTRIES) return;
	console.error(
		`[verify] refusing to rewrite baselines from ${measured} ${what} (expected >= ${MIN_FULL_CORPUS_ENTRIES})`
	);
	console.error('  a partial corpus would delete every baseline entry it did not measure');
	console.error('  fix: git submodule update --init --depth 1 … && node scripts/compat-corpus/collect.mjs');
	process.exit(2);
}

// Which ratchet families this run actually wrote, checked against
// UPDATE_FAMILIES in finish() so a rewrite that reaches no write cannot exit 0.
const WRITTEN = new Set();

function writeBaselines(byTarget) {
	WRITTEN.add('output');
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
	requireFullCorpus(report.total ?? 0, 'entries in the report');
	writeBaselines(partitionFailures(report.failures));
	process.exit(0);
}

// ---- inputs ----------------------------------------------------------------

const manifest = JSON.parse(fs.readFileSync(path.join(CORPUS, 'manifest.json'), 'utf8'));
// Captured before comparison, re-asserted before any verdict or baseline write.
const generation = readGeneration(CORPUS);

// A near-empty manifest (partial checkout, failed collect) would make the
// comparison below pass vacuously instead of catching a real regression.
const MIN_MANIFEST_ENTRIES = 1000;
if (manifest.length < MIN_MANIFEST_ENTRIES) {
	console.error(
		`[verify] only ${manifest.length} entries in manifest.json (expected >= ${MIN_MANIFEST_ENTRIES}); run \`node scripts/compat-corpus/collect.mjs\` first`,
	);
	process.exit(2);
}

// compile.mjs writes either `<target>.js` or `error.json` for every entry on
// both sides, so a missing pair means the tree was never compiled (or was
// cleaned away). Comparing against an absent tree reads both sides as "" and
// scores every entry `match` — a green run that measured nothing.
function hasOutputs(tree, id) {
	if (fs.existsSync(path.join(tree, id, 'error.json'))) return true;
	return TARGET_KEYS.some((key) => fs.existsSync(path.join(tree, id, `${key}.js`)));
}

// A crashed worker leaves its one entry with only the rsvelte-side error.json,
// so coverage is checked against the union rather than demanded per tree.
const compiled = manifest.filter(({ id }) => hasOutputs(EXPECTED, id) || hasOutputs(ACTUAL, id)).length;
if (compiled < manifest.length * 0.99) {
	console.error(
		`[verify] only ${compiled}/${manifest.length} manifest entries have compiled output for ${TARGET_KEYS.join(', ')}`
	);
	console.error('  run: node scripts/compat-corpus/compile.mjs   (outputs are deleted after a green verify)');
	process.exit(2);
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
	for (const tree of [EXPECTED, ACTUAL]) {
		// esrap wraps long expressions inside `${}` template holes; oxfmt
		// preserves hole multiline-ness from its input, so flatten holes
		// BEFORE formatting to make both trees converge (see normalize.mjs).
		console.log(`[verify] flatten template holes ${path.relative(ROOT, tree)}…`);
		flattenTreeTemplateHoles(tree);
		console.log(`[verify] oxfmt ${path.relative(ROOT, tree)}…`);
		oxfmtTree(tree, { config: path.join(CORPUS, '.oxfmtrc.json'), label: 'verify' });
	}
}

// ---- comparison --------------------------------------------------------------

const counts = {
	match: 0,
	'error-parity': 0,
	'js-mismatch': 0,
	'js-unparseable': 0,
	'css-mismatch': 0,
	'error-mismatch': 0,
};
const failures = [];

// ---- AST equivalence -------------------------------------------------------
//
// Byte comparison first (cheap). Where the bytes differ, the verdict comes from
// the shared Rust comparator (crates/rsvelte_ast_equiv) rather than a second
// definition of "equivalent" written here: same question, one answer. Output
// that does not parse is its own verdict — never quietly demoted to a text
// diff.
//
// NOT COVERED — comment parity. `ast_equiv_batch` applies
// `CommentPolicy::Ignore` unless `--comments` is passed, and the call below
// passes no arguments. A divergence that lives ONLY in comments is therefore
// byte-different, AST-equivalent, and scored a pass — for every entry and every
// target, not some subset. Nothing in this corpus gates comments.
//
// Flipping the flag would not close that on its own: under
// `CommentPolicy::Meaningful` only directive-like comments count
// (`is_meaningful_comment` matches `@ts-`, `svelte-ignore`, `@component`, …),
// so JSDoc type tags such as `@type` are still filtered as prose. The gate is
// blind to them under either policy. The path forward is rsvelte preserving
// comments plus `--comments` here — see compatibility/ast-equivalence.md.
//
// Preservation is necessary but NOT sufficient. Official drops the comment in
// 80 of 192 generated module positions and keeps it in the other 112 — the
// choice is position-dependent, not per-comment-kind (#2399). Parity therefore
// requires reproducing official's position rule; a blanket-preserve rsvelte
// would diverge on those 80.
//
// A second, narrower cause compounds this for modules: `.svelte.ts` entries
// reach both compilers TS-stripped, and esbuild drops all comments on the way
// (see compile.mjs's `prepareSource`).

const AST_EQUIV_BIN = path.join(ROOT, 'target/release/ast_equiv_batch');
const jsKey = (id, target) => `${id}\0${target}`;
const jsByteEqual = new Map();
const astCandidates = new Map();

for (const { id } of manifest) {
	for (const targetDef of TARGETS) {
		const target = targetDef.key;
		const left = path.join(EXPECTED, id, `${target}.js`);
		const right = path.join(ACTUAL, id, `${target}.js`);
		const expJs = stripBlankLines(readIf(left) ?? '');
		const actJs = stripBlankLines(readIf(right) ?? '');
		const key = jsKey(id, target);
		if (expJs === actJs) {
			jsByteEqual.set(key, true);
		} else {
			jsByteEqual.set(key, false);
			astCandidates.set(key, { left, right, expJs, actJs });
		}
	}
}

const astVerdicts = (() => {
	if (astCandidates.size === 0) return new Map();
	if (!fs.existsSync(AST_EQUIV_BIN)) {
		console.error(`[verify] missing ${AST_EQUIV_BIN} — build it first:`);
		console.error('  cargo build --release --bin ast_equiv_batch');
		process.exit(2);
	}
	console.log(`[verify] AST comparison for ${astCandidates.size} byte-different output(s)…`);
	const pairs = [...astCandidates].map(([key, { left, right }]) => ({ id: key, left, right }));
	// The empty argv is load-bearing: no `--comments` means comments are ignored.
	const out = execFileSync(AST_EQUIV_BIN, [], {
		input: JSON.stringify(pairs),
		encoding: 'utf8',
		maxBuffer: 1024 * 1024 * 256,
	});
	return new Map(JSON.parse(out).map((v) => [v.id, v]));
})();

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
		const key = jsKey(id, target);
		if (!jsByteEqual.get(key)) {
			const ast = astVerdicts.get(key);
			const { expJs, actJs } = astCandidates.get(key);
			if (ast.verdict === 'unparseable') {
				verdict = 'js-unparseable';
				details.push({
					target,
					kind: 'js-unparseable',
					expected: 'parses',
					actual: `${ast.side} side: ${ast.message}`,
				});
			} else if (ast.verdict !== 'equivalent') {
				verdict = 'js-mismatch';
				details.push({ target, kind: 'js', reason: ast.verdict, ...firstDiffLine(expJs, actJs) });
			}
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

// ---- warning parity --------------------------------------------------------
//
// Independent of everything above: its own comparison, its own failure list and
// its own ratchets. A warning divergence must never move an output ratchet, and
// an output divergence must never move a warning ratchet.

const warningCounts = { match: 0, 'warning-code-mismatch': 0, 'warning-position-mismatch': 0 };
const warningFailures = [];

const readWarnings = (dir) => JSON.parse(readIf(path.join(dir, 'warnings.json')) ?? '{}');
const codeBag = (list) => list.map((w) => w.code).sort();
const posKey = (w) => `${w.code}@${w.line ?? '?'}:${w.column ?? '?'}`;
// Multiset difference a \ b, so a code emitted twice on one side and once on
// the other is still a divergence.
const bagDiff = (a, b) => {
	const rest = [...b];
	return a.filter((x) => {
		const i = rest.indexOf(x);
		if (i === -1) return true;
		rest.splice(i, 1);
		return false;
	});
};

for (const { id } of manifest) {
	const expWarn = readWarnings(path.join(EXPECTED, id));
	const actWarn = readWarnings(path.join(ACTUAL, id));
	// An entry either compiler rejects has no warnings to compare; error parity
	// already covers it.
	const expErr = JSON.parse(readIf(path.join(EXPECTED, id, 'error.json')) ?? '{}');
	const actErr = JSON.parse(readIf(path.join(ACTUAL, id, 'error.json')) ?? '{}');

	const details = [];
	for (const targetDef of TARGETS) {
		const target = targetDef.key;
		if (expErr[target] || actErr[target]) continue;
		const e = expWarn[target] ?? [];
		const a = actWarn[target] ?? [];

		const extra = bagDiff(codeBag(a), codeBag(e));
		const missing = bagDiff(codeBag(e), codeBag(a));
		if (extra.length || missing.length) {
			details.push({
				target,
				kind: 'warning-code',
				expected: missing.length ? `missing: ${missing.join(', ')}` : '(none missing)',
				actual: extra.length ? `extra: ${extra.join(', ')}` : '(none extra)',
			});
			continue;
		}

		const ePos = e.map(posKey).sort();
		const aPos = a.map(posKey).sort();
		if (String(ePos) !== String(aPos)) {
			const i = ePos.findIndex((x, k) => x !== aPos[k]);
			details.push({ target, kind: 'warning-position', expected: ePos[i], actual: aPos[i] });
		}
	}

	if (!details.length) {
		warningCounts.match++;
		continue;
	}
	const verdict = details.some((d) => d.kind === 'warning-code')
		? 'warning-code-mismatch'
		: 'warning-position-mismatch';
	warningCounts[verdict]++;
	warningFailures.push({ id, verdict, details });
}

// Two ratchets per target, partitioned by detail kind so a position divergence
// never lands in the semantic baseline (and vice versa).
function partitionWarnings(kind) {
	const byTarget = new Map(TARGET_KEYS.map((key) => [key, new Set()]));
	for (const f of warningFailures) {
		for (const d of f.details) {
			if (d.kind !== kind) continue;
			const set = byTarget.get(d.target);
			if (set) set.add(f.id);
		}
	}
	return byTarget;
}

const WARNING_RATCHETS = [
	{ kind: 'warning-code', label: 'warning codes', file: (t) => t.warningBaseline },
	{ kind: 'warning-position', label: 'warning positions', file: (t) => t.warningPositionBaseline },
];

// Before any verdict is written or any ratchet rewritten: the corpus these
// results describe must still be the corpus on disk.
requireGenerationUnchanged(CORPUS, generation, 'verify');

const report = {
	generatedAt: new Date().toISOString(),
	total: manifest.length,
	counts,
	failures,
	warningCounts,
	warningFailures,
};
fs.writeFileSync(path.join(CORPUS, 'report.json'), JSON.stringify(report, null, '\t') + '\n');

console.log('\n[verify] results:');
for (const [k, v] of Object.entries(counts)) console.log(`  ${k.padEnd(16)} ${v}`);
console.log('\n[verify] warning parity:');
for (const [k, v] of Object.entries(warningCounts)) console.log(`  ${k.padEnd(26)} ${v}`);
console.log(`  report: ${path.relative(ROOT, path.join(CORPUS, 'report.json'))}`);

// ---- warning ratchets ------------------------------------------------------

const warningRegressions = [];
const warningFailById = new Map(warningFailures.map((f) => [f.id, f]));
let warningFixed = 0;

// `--update-baseline` alone is about the OUTPUT ratchets; leave the warning ones
// alone so an output burn-down cannot silently absorb a warning regression. Ask
// for both and both are rewritten.
const SKIP_WARNING_RATCHETS = UPDATE_BASELINE && !UPDATE_WARNING_BASELINE;
for (const ratchet of SKIP_WARNING_RATCHETS ? [] : WARNING_RATCHETS) {
	const byTarget = partitionWarnings(ratchet.kind);
	for (const target of TARGETS) {
		const p = path.resolve(CORPUS, ratchet.file(target));
		const ids = byTarget.get(target.key);

		if (UPDATE_WARNING_BASELINE) {
			// Same FALSE-SHRINK trap as the output baselines: this rewrite drops
			// every id the run did not measure.
			requireFullCorpus(manifest.length, 'corpus entries');
			fs.writeFileSync(p, JSON.stringify([...ids].sort(), null, '\t') + '\n');
			WRITTEN.add('warning');
			console.log(`[verify] ${ratchet.label} baseline: ${ids.size} known -> ${path.relative(ROOT, p)}`);
			continue;
		}

		const baseline = new Set(!STRICT && fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf8')) : []);
		for (const id of ids) {
			if (!baseline.has(id)) warningRegressions.push({ id, target: target.key, kind: ratchet.kind });
		}
		warningFixed += [...baseline].filter((id) => !ids.has(id)).length;
	}
}

// Hand off to the output rewrite below when both were asked for.
if (UPDATE_WARNING_BASELINE && !UPDATE_BASELINE) finish(0);

// Two-sided, like the output ratchets: a listed entry that already passes fails
// the run, so the PR that fixes entries re-baselines in the same PR.
if (warningFixed) {
	console.log(`\n[verify] ❌ ${warningFixed} warning baseline entries already PASS — the ratchet is stale.`);
	console.log('  node scripts/compat-corpus/verify.mjs --no-fmt --update-warning-baseline');
}

if (warningRegressions.length) {
	console.log(`\n[verify] ❌ ${warningRegressions.length} NEW warning failures (not in baseline); first ${Math.min(MAX_PRINT, warningRegressions.length)}:`);
	for (const { id, target, kind } of warningRegressions.slice(0, MAX_PRINT)) {
		const f = warningFailById.get(id);
		console.log(`  - ${id} [${f.verdict}] (${target})`);
		for (const d of f.details.filter((d) => d.target === target && d.kind === kind)) {
			console.log(`      expected: ${d.expected}`);
			console.log(`      actual:   ${d.actual}`);
		}
	}
}

const failById = new Map(failures.map((f) => [f.id, f]));
const failsByTarget = partitionFailures(failures);

// Only compile.mjs and cluster.mjs read these trees; nothing downstream does,
// so a green run deletes them here instead of leaving ~0.5 GiB per checkout for
// the operator to remember.
function finish(code) {
	const missed = code === 0 ? UPDATE_FAMILIES.filter((f) => !WRITTEN.has(f)) : [];
	if (missed.length) {
		console.error(`\n[verify] ❌ asked to rewrite ${missed.join(' + ')} ratchets but wrote none of them`);
		code = 2;
	}
	cleanupArtifacts(OUTPUT_TREES, args, { failed: code !== 0, label: 'verify' });
	process.exit(code);
}

if (UPDATE_BASELINE) {
	requireFullCorpus(manifest.length, 'corpus entries');
	writeBaselines(failsByTarget);
	finish(0);
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

// A ratchet that still lists passing entries is stale, and staleness is fatal:
// a large "now PASS" delta on the next PR is indistinguishable from noise, so a
// real regression can hide inside it.
if (fixedKnown) {
	const breakdown = fixedByTarget.map(([key, ids]) => `${key} ${ids.length}`).join(', ');
	console.log(`\n[verify] ❌ ${fixedKnown} baseline entries already PASS (${breakdown}) — the ratchet is stale.`);
	let shown = 0;
	for (const [key, ids] of fixedByTarget) {
		for (const id of ids) {
			if (shown++ >= MAX_PRINT) break;
			console.log(`  - ${id} (${key})`);
		}
	}
	if (fixedKnown > MAX_PRINT) console.log(`  … and ${fixedKnown - MAX_PRINT} more`);
	// A target-scoped run only measured those targets, so the suggested rewrite
	// must stay scoped too — otherwise it would empty the unmeasured baselines.
	const scope = TARGET_KEYS.length === ALL_TARGET_KEYS.length ? '' : ` --targets ${TARGET_KEYS.join(',')}`;
	console.log(`\n  fix: node scripts/compat-corpus/verify.mjs --no-fmt${scope} --update-baseline`);
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
}

// Both gates report before either exits, so one run shows every regression
// rather than hiding the warning ones behind an output failure.
if (regressions.length || fixedKnown || warningRegressions.length || warningFixed) finish(1);

if (failures.length) {
	const breakdown = TARGET_KEYS.map((key) => `${key} ${failsByTarget.get(key).size}`).join(', ');
	console.log(`\n[verify] ✅ no regressions (${breakdown} known failures remain — see compatibility/known-failures.md)`);
} else {
	console.log('\n[verify] ✅ all corpus outputs identical after normalization');
}

if (warningFailures.length) {
	console.log(`[verify] ✅ no warning regressions (${warningFailures.length} known warning failures remain — see compatibility/warning-known-failures.md)`);
} else {
	console.log('[verify] ✅ all corpus warnings identical');
}

finish(0);
