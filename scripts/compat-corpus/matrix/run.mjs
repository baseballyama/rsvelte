#!/usr/bin/env node
/**
 * Differential gate over a GENERATED corpus (#2281 Gate 2).
 *
 * The collected corpus (`compile.mjs` + `verify.mjs`) samples the marginal
 * distribution of published Svelte code; this one samples the PRODUCT of
 * declared axes. The distinction is not academic: `client` and `server` sat at
 * 0 known failures — saturated — while a 329-case matrix found 21 divergences
 * in seconds, because every bug in the #2253/#2254/#2255/#2256 batch was an
 * interaction (binding kind × syntactic position, construct × comment slot)
 * and a found corpus under-samples interactions exponentially. #2254's shape
 * occurs 0 times in 14,026 real files; #2253's likewise.
 *
 * Needs no corpus submodules — only `submodules/svelte` and the rsvelte NAPI
 * binding — so it can gate every PR rather than run nightly.
 *
 * Normalization is deliberately IDENTICAL to verify.mjs (flatten template holes
 * -> oxfmt -> strip blank lines): a divergence this gate reports must be a
 * divergence the corpus gate would also report, or the two gates disagree about
 * what "identical output" means. `--no-fmt` skips oxfmt for a fast local loop
 * and inflates the count — never baseline from it.
 *
 * Warning CODES are compared alongside the output, because a warning that never
 * fires has no output to diverge on — `js.code` alone cannot report it. That
 * comparison was worth nothing until the `directive-element` family arrived:
 * seven of the ten families emit zero warnings from either compiler over all
 * 5244 accepted (case, target) pairs, so on those the comparison runs on an
 * empty population. Positions are deliberately left to the collected gate.
 *
 * Four comparisons here are about the ratchet KEY rather than about tolerance,
 * because a listed entry suppresses everything its key cannot tell apart:
 *
 *   - the acorn parse oracle runs on both sides of every accepted pair, so
 *     "text no JS parser accepts" is `output-unparseable` and not one more
 *     `js-mismatch`. An OFFICIAL output it rejects fails the run outright —
 *     these cases are authored, so the fix is the case, never an exemption.
 *   - a divergence that comment + whitespace normalization absorbs is
 *     `comment-mismatch`. Both verdicts stay ratcheted two-sided; the split
 *     stops a comment-fidelity entry from covering a later code regression on
 *     the same id, which is what would have happened to `opaque-keyword`.
 *   - exactly one side rejecting is `over-accept` (rsvelte compiles what
 *     official refuses) or `over-reject` (the reverse), never one flat
 *     `error-mismatch`. They are the two opposite failures of one check, and
 *     `invalid-bind` / `param-default` carry invalid AND valid rows precisely
 *     so both are reachable — under one key a listed over-rejection covers a
 *     later over-acceptance on the same (id, target) for free.
 *   - both sides rejecting with different codes carries the code PAIR, so a
 *     regression from a ported diagnostic to a lucky parse error is a new key
 *     rather than the same one.
 *
 * Ratchet: compatibility/matrix-known-failures.json, shrink-only and two-sided
 * (a new failure AND a listed entry that already passes both fail), justified
 * per entry in the paired .md.
 *
 * Usage:
 *   node scripts/compat-corpus/matrix/run.mjs [--no-fmt] [--update-baseline]
 *        [--families <a,b>] [--targets <keys>] [--max-print <n>] [--keep-artifacts]
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import {
	flattenTemplateHoles,
	stripBlankLines,
	firstDiffLine,
	oxfmtTree,
	codeIdentity,
} from '../normalize.mjs';
import { selectTargets, TARGET_KEYS } from '../targets.mjs';
import { refuseUnrepresentativeBaseline } from '../baseline-guard.mjs';
import { unattributedBindingReason } from '../binding.mjs';
import { errorCode } from '../error-code.mjs';
import { parseFailure } from '../parseable.mjs';
import { generate, FAMILIES } from './generate.mjs';

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../..');
const CORPUS = path.join(ROOT, 'compatibility');
const TREE = path.join(CORPUS, 'matrix-artifacts');
const BASELINE = path.join(CORPUS, 'matrix-known-failures.json');

const args = process.argv.slice(2);
const NO_FMT = args.includes('--no-fmt');
const UPDATE_BASELINE = args.includes('--update-baseline');
const KEEP_ARTIFACTS = args.includes('--keep-artifacts');
const MAX_PRINT = args.includes('--max-print') ? Number(args[args.indexOf('--max-print') + 1]) || 20 : 20;
const TARGETS = selectTargets(args);

const FAMILY_KEYS = (() => {
	const i = args.indexOf('--families');
	const value = i !== -1 ? args[i + 1] : null;
	if (!value || value.startsWith('--')) return Object.keys(FAMILIES);
	return value.split(',').map((s) => s.trim()).filter(Boolean);
})();

// Refuse at parse time: the run that is about to be rejected is otherwise paid
// for in full before its result is thrown away.
if (UPDATE_BASELINE) {
	refuseUnrepresentativeBaseline('matrix', [
		unattributedBindingReason(ROOT),
		NO_FMT &&
			'--no-fmt counts formatting-only differences as failures, which the corpus gate tolerates by contract',
		FAMILY_KEYS.length !== Object.keys(FAMILIES).length &&
			`--families measured ${FAMILY_KEYS.length} of ${Object.keys(FAMILIES).length} families; the rewrite deletes every entry it did not measure (FALSE-SHRINK)`,
		TARGETS.length !== TARGET_KEYS.length &&
			`--targets measured ${TARGETS.length} of ${TARGET_KEYS.length} (${TARGETS.map((t) => t.key).join(', ')}); baseline ids carry their target, so the rewrite deletes every entry for the others (FALSE-SHRINK)`,
	]);
}

// ---- compilers -------------------------------------------------------------

const BINDING = path.resolve(ROOT, '.corpus-cache/rsvelte.node');
if (!fs.existsSync(BINDING)) {
	console.error(`[matrix] rsvelte NAPI binding missing at ${path.relative(ROOT, BINDING)}`);
	console.error('  build: cargo build --release -p rsvelte_napi --lib');
	console.error('  stage: mkdir -p .corpus-cache && cp target/release/librsvelte_napi.{dylib,so} .corpus-cache/rsvelte.node.staging && mv .corpus-cache/rsvelte.node.staging .corpus-cache/rsvelte.node');
	process.exit(2);
}
const OFFICIAL = path.join(ROOT, 'submodules/svelte/packages/svelte/src/compiler/index.js');
if (!fs.existsSync(OFFICIAL)) {
	console.error(`[matrix] official compiler missing at ${path.relative(ROOT, OFFICIAL)}`);
	console.error('  fix: git submodule update --init --depth 1 submodules/svelte && (cd submodules/svelte && pnpm install --ignore-scripts)');
	process.exit(2);
}

const svelte = await import(OFFICIAL);
const rsvelte = require(BINDING);

// ---- generate + compile ----------------------------------------------------

// The axes generate 5011 cases on an unmodified tree; the floor only has to
// separate "generation broke" from "the gate got easier".
const MIN_MATRIX_CASES = 1000;

const cases = generate(FAMILY_KEYS);
console.log(`[matrix] families: ${FAMILY_KEYS.join(', ')}`);
const comparisons = cases.reduce(
	(n, c) => n + TARGETS.filter((t) => !c.targets || c.targets.includes(t.key)).length,
	0
);
console.log(`[matrix] cases: ${cases.length}  targets: ${TARGETS.map((t) => t.key).join(', ')}  comparisons: ${comparisons}`);

fs.rmSync(TREE, { recursive: true, force: true });

const counts = {
	match: 0,
	'error-parity': 0,
	'js-mismatch': 0,
	'comment-mismatch': 0,
	'over-accept': 0,
	'over-reject': 0,
	'error-code-mismatch': 0,
	'warning-mismatch': 0,
	'output-unparseable': 0,
};
/** Official outputs the parse oracle rejected — an oracle fault, never a finding. */
const oracleRejections = [];
/** Pending byte comparisons, resolved after the trees are normalized. */
const pending = [];
const failures = [];

function firstLine(message) {
	return String(message).split('\n')[0];
}

const codeBag = (result) => (result.warnings ?? []).map((w) => w.code ?? '(none)').sort();
/** Multiset difference a \ b: a code emitted twice on one side and once on the other still diverges. */
function bagDiff(a, b) {
	const rest = [...b];
	return a.filter((x) => {
		const i = rest.indexOf(x);
		if (i === -1) return true;
		rest.splice(i, 1);
		return false;
	});
}

for (const testCase of cases) {
	// A case may name the targets it can be compared on. The only reason to use
	// it is an oracle that does not exist: where the official compiler's output
	// for a target is not JavaScript, "identical bytes" scores reproducing
	// garbage as a pass and any other divergence as a failure, so the comparison
	// carries no signal. Never narrow a case to hide a divergence — the ratchet
	// is for that.
	for (const target of TARGETS.filter((t) => !testCase.targets || testCase.targets.includes(t.key))) {
		// `.svelte.(js|ts)` cases are a different entry point, not a flag:
		// `compile` rejects module source outright ("Expected token }"), so
		// dispatching on `kind` is what makes the module cases a comparison
		// rather than an error. `css` is component-only (mirrors compile.mjs).
		const isModule = testCase.kind === 'module';
		const options = { generate: target.generate, dev: target.dev, filename: path.basename(testCase.id) };
		if (!isModule) options.css = 'external';
		// A per-case compile OPTION, not a source shape. Every other harness here
		// passes a fixed option set, so a defect that only exists under a flag
		// (`experimental.async`) is unreachable for them at any corpus size.
		Object.assign(options, testCase.options ?? {});
		const compileWith = (compiler) =>
			isModule ? compiler.compileModule(testCase.source, options) : compiler.compile(testCase.source, options);
		let expected = null;
		let actual = null;
		let expectedError = null;
		let actualError = null;
		let expectedResult = null;
		let actualResult = null;
		try {
			expectedResult = compileWith(svelte);
				expected = expectedResult.js.code;
		} catch (e) {
			expectedError = { message: firstLine(e.message), code: errorCode(e) };
		}
		try {
			actualResult = compileWith(rsvelte);
				actual = actualResult.js.code;
		} catch (e) {
			actualError = { message: firstLine(e.message), code: errorCode(e) };
		}

		// Both compilers rejecting is the generated shape being invalid, not a
		// finding — but ONE rejecting is the sharpest signal this gate produces.
		if (expectedError && actualError) {
			// …and rejecting for a DIFFERENT reason is the second sharpest:
			// "both threw" cannot separate a ported diagnostic from a lucky
			// parse error, which is what an invalid-input family needs it to do.
			// The code PAIR is in the verdict for the same reason the direction is,
			// one line down: an entry keyed on `error-code-mismatch` alone covers
			// every future pairing on that case, including a regression from a
			// ported diagnostic to a lucky parse error.
			if (expectedError.code !== actualError.code) {
				const verdict = `error-code-mismatch:${expectedError.code ?? '(none)'}-vs-${actualError.code ?? '(none)'}`;
				counts['error-code-mismatch'] += 1;
				failures.push({
					id: testCase.id,
					target: target.key,
					verdict,
					detail: `official ${expectedError.code ?? '(none)'}, rsvelte ${actualError.code ?? '(none)'}: ${actualError.message}`,
				});
				continue;
			}
			counts['error-parity'] += 1;
			continue;
		}
		if (expectedError || actualError) {
			// The DIRECTION is the verdict, not a `detail` string. These two are
			// opposite failures of one check — `invalid-bind` and `param-default`
			// carry invalid and valid rows precisely so both can be seen — and
			// under one flat `error-mismatch` key a listed over-rejection
			// suppresses a later over-acceptance on the same (id, target), which
			// is the class those families exist to find.
			const verdict = expectedError ? 'over-accept' : 'over-reject';
			counts[verdict] += 1;
			failures.push({
				id: testCase.id,
				target: target.key,
				verdict,
				detail: expectedError
					? `rsvelte accepts, official rejects: ${expectedError.message}`
					: `rsvelte rejects, official accepts: ${actualError.message}`,
			});
			continue;
		}

		// Independent of the byte comparison below: a warning that never fires
		// has no output to diverge on, so `js.code` alone cannot report it. Codes
		// only — the position backlog is an order of magnitude larger on the
		// collected gate and folding it in here would bury every semantic
		// divergence under it (the argument settled in #2314).
		// The verdict carries the code and the direction because the ratchet key is
		// (id, verdict, target): a case listed for one missing code would otherwise
		// absorb a regression in a different one — verified, not assumed. Reverting
		// #2521 with a plain `warning-mismatch` verdict left the gate green.
		const warningDiffs = [
			...bagDiff(codeBag(expectedResult), codeBag(actualResult)).map((c) => `warning-missing:${c}`),
			...bagDiff(codeBag(actualResult), codeBag(expectedResult)).map((c) => `warning-extra:${c}`),
		];
		for (const verdict of new Set(warningDiffs)) {
			counts['warning-mismatch'] += 1;
			failures.push({ id: testCase.id, target: target.key, verdict, detail: verdict });
		}

		// "Is what rsvelte emitted even JavaScript?" — a question the byte
		// comparison cannot ask, because a wrong-text and a not-JavaScript output
		// produce the same `js-mismatch` row and the same ratchet entry. #2986
		// emitted `#const_flag = …` outside a class body: the collected gate
		// separates the two verdicts (verify.mjs), this one folded them together,
		// so a listed js-mismatch here silently covers a degradation into
		// non-JavaScript. The verdict is its own so the ratchet key carries it.
		const oracleParse = parseFailure(expected);
		if (oracleParse) {
			oracleRejections.push({ id: testCase.id, target: target.key, why: oracleParse });
		} else {
			const why = parseFailure(actual);
			if (why) {
				counts['output-unparseable'] += 1;
				failures.push({
					id: testCase.id,
					target: target.key,
					verdict: 'output-unparseable',
					detail: why,
				});
			}
		}

		const dir = path.join(TREE, testCase.id);
		fs.mkdirSync(path.join(dir, 'expected'), { recursive: true });
		fs.mkdirSync(path.join(dir, 'actual'), { recursive: true });
		fs.writeFileSync(path.join(dir, 'expected', `${target.key}.js`), expected);
		fs.writeFileSync(path.join(dir, 'actual', `${target.key}.js`), actual);
		pending.push({ id: testCase.id, target: target.key, dir });
	}
}

// An official output the oracle rejects has no exclusion list here on purpose:
// the generated cases are small and authored, so the fix is to change the case
// or widen `parseable.mjs` — never to carry a permanent exemption.
if (oracleRejections.length) {
	console.error(`\n[matrix] ❌ the parse oracle rejected ${oracleRejections.length} OFFICIAL output(s)`);
	for (const { id, target, why } of oracleRejections.slice(0, MAX_PRINT)) {
		console.error(`  - ${id} (${target}): ${why}`);
	}
	console.error('  decide which it is: acorn rejects legal output -> widen OPTIONS in');
	console.error('  scripts/compat-corpus/parseable.mjs; the generated case is degenerate -> fix the axis.');
	cleanup(2);
}

// ---- normalization (must match verify.mjs exactly) -------------------------

function flattenTreeTemplateHoles(dir) {
	for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
		const p = path.join(dir, entry.name);
		if (entry.isDirectory()) flattenTreeTemplateHoles(p);
		else if (entry.name.endsWith('.js')) {
			const src = fs.readFileSync(p, 'utf8');
			const flat = flattenTemplateHoles(src);
			if (flat !== src) fs.writeFileSync(p, flat);
		}
	}
}

if (!NO_FMT && pending.length) {
	flattenTreeTemplateHoles(TREE);
	console.log('[matrix] oxfmt…');
	oxfmtTree(TREE, { config: path.join(CORPUS, '.oxfmtrc.json'), label: 'matrix' });
}

for (const item of pending) {
	const expected = stripBlankLines(fs.readFileSync(path.join(item.dir, 'expected', `${item.target}.js`), 'utf8'));
	const actual = stripBlankLines(fs.readFileSync(path.join(item.dir, 'actual', `${item.target}.js`), 'utf8'));
	if (expected === actual) {
		counts.match += 1;
		continue;
	}
	// A difference that survives comment + whitespace normalization is a code
	// divergence; one that does not is comment fidelity. Both stay ratcheted —
	// the split is about the KEY, not about tolerance. Under one flat
	// `js-mismatch` an id whose comments already diverge absorbs a later code
	// regression on the same id for free: the `opaque-keyword` family is the
	// sharpest case (its comment carriers all diverge on comment placement, so
	// re-breaking #2986 would have reproduced an already-listed key), and the
	// same argument holds for every `comment-slot` entry.
	const verdict = codeIdentity(expected) === codeIdentity(actual) ? 'comment-mismatch' : 'js-mismatch';
	counts[verdict] += 1;
	const diff = firstDiffLine(expected, actual);
	failures.push({ id: item.id, target: item.target, verdict, ...diff });
}

// ---- report ----------------------------------------------------------------

console.log('\n[matrix] results:');
for (const [k, v] of Object.entries(counts)) console.log(`  ${k.padEnd(16)} ${v}`);

const ids = new Set(failures.map((f) => `${f.id} [${f.verdict}] (${f.target})`));

if (UPDATE_BASELINE) {
	// The parse-time guards are relative to whatever population the run was handed,
	// so an edit that collapsed generation would satisfy them and still empty the
	// ratchet. This one is absolute.
	if (cases.length < MIN_MATRIX_CASES) {
		console.error(`\n[matrix] refusing to baseline from ${cases.length} generated cases (expected >= ${MIN_MATRIX_CASES}).`);
		console.error('  the axes generate ~5011; far below that means generation broke, not that the gate got easier.');
		process.exit(2);
	}
	fs.writeFileSync(BASELINE, JSON.stringify([...ids].sort(), null, '\t') + '\n');
	console.log(`\n[matrix] baseline: ${ids.size} known -> ${path.relative(ROOT, BASELINE)}`);
	cleanup(0);
}

const baseline = new Set(fs.existsSync(BASELINE) ? JSON.parse(fs.readFileSync(BASELINE, 'utf8')) : []);
const regressions = [...ids].filter((id) => !baseline.has(id));
// Only entries in the families this run measured can be judged stale.
const measuredFamilies = new Set(FAMILY_KEYS);
const measuredTargets = new Set(TARGETS.map((t) => t.key));
const fixed = [...baseline].filter((id) => {
	if (ids.has(id)) return false;
	const family = id.split('/')[0];
	const target = id.match(/\(([^)]+)\)$/)?.[1];
	return measuredFamilies.has(family) && measuredTargets.has(target);
});

const failById = new Map(failures.map((f) => [`${f.id} [${f.verdict}] (${f.target})`, f]));

if (regressions.length) {
	console.log(`\n[matrix] ❌ ${regressions.length} NEW divergences (not in the baseline):`);
	for (const id of regressions.slice(0, MAX_PRINT)) {
		const f = failById.get(id);
		console.log(`  - ${id}`);
		if (f.detail) console.log(`      ${f.detail}`);
		else {
			console.log(`      line ${f.line}`);
			console.log(`        official: ${String(f.expected).trim()}`);
			console.log(`        rsvelte : ${String(f.actual).trim()}`);
		}
	}
	if (regressions.length > MAX_PRINT) console.log(`  … and ${regressions.length - MAX_PRINT} more`);
}

if (fixed.length) {
	console.log(`\n[matrix] ❌ ${fixed.length} baseline entries already PASS — the ratchet is stale.`);
	for (const id of fixed.slice(0, MAX_PRINT)) console.log(`  - ${id}`);
	if (fixed.length > MAX_PRINT) console.log(`  … and ${fixed.length - MAX_PRINT} more`);
	console.log('  fix: node scripts/compat-corpus/matrix/run.mjs --update-baseline');
}

if (regressions.length || fixed.length) cleanup(1);

if (ids.size) {
	console.log(`\n[matrix] ✅ no regressions (${ids.size} known divergences remain — see compatibility/matrix-known-failures.md)`);
} else {
	console.log('\n[matrix] ✅ every generated case matches the official compiler');
}
cleanup(0);

function cleanup(code) {
	// A passing run leaves nothing behind; a failing one keeps the trees so the
	// divergence can be diffed (same contract as verify.mjs).
	if (!KEEP_ARTIFACTS && code === 0) fs.rmSync(TREE, { recursive: true, force: true });
	else if (fs.existsSync(TREE)) console.log(`[matrix] artifacts kept: ${path.relative(ROOT, TREE)}`);
	process.exit(code);
}
