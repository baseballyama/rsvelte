#!/usr/bin/env node
/**
 * `parse()` output parity — the public AST API (#3389).
 *
 * WHAT IT COMPARES. One unit is (source, mode): every `.svelte` file under
 * `compatibility/pattern-corpus/` parsed by the official compiler and by
 * rsvelte's NAPI `parse`, under `{ modern: true }` and under the default
 * (legacy) shape, and diffed as JSON. Divergences are keyed by a *class* — the
 * JSON path with array indices collapsed, plus how it diverges — so one
 * ratchet entry is one (file, mode, field-class) and cannot suppress a
 * different field in the same file. Shrink-only, two-sided, through
 * `compatibility/parse-ast-known-failures.json`.
 *
 * WHY THE COMPARISON GOES THROUGH JSON ON BOTH SIDES. rsvelte's binding returns
 * a JSON *string* and official returns an object, and official's modern AST
 * keeps `EachBlock.index`, `EachBlock.key` and `SnippetBlock.typeParams` as
 * present-but-undefined keys, which survive `Object.keys` but not
 * `JSON.stringify`. Comparing the two without a round-trip on both sides
 * reports a catastrophe that is entirely the harness (#3389).
 *
 * POPULATION 0 IS NOT A PASS. A comparison that runs on nothing reports exactly
 * what a comparison that could never run reports, so the verdict asserts the
 * compared-pair count before it asserts parity, and prints it either way.
 *
 * WHY A LENGTH DIFFERENCE STOPS THE DESCENT. When two arrays differ in length,
 * element-wise comparison is comparing a statement to its successor: rsvelte
 * dropping one TS-only statement makes every position in the rest of the body
 * "diverge". The class is the length, once, and the entries behind it come back
 * when the length agrees.
 *
 * Usage:
 *   node scripts/compat-corpus/parse-ast-verify.mjs
 *   node scripts/compat-corpus/parse-ast-verify.mjs --update-baseline
 *   node scripts/compat-corpus/parse-ast-verify.mjs --corpus      # wider, unratcheted
 */

import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { refuseUnrepresentativeBaseline } from './baseline-guard.mjs';
import { parse as officialParse } from '../../submodules/svelte/packages/svelte/src/compiler/index.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const PATTERN_DIR = path.join(ROOT, 'compatibility/pattern-corpus');
const BASELINE = path.join(ROOT, 'compatibility/parse-ast-known-failures.json');

/**
 * The pattern corpus is committed, so this floor moves only when someone
 * deletes files from it. It is an absolute floor rather than a ratio because
 * the failure it guards against — a run over a truncated tree rewriting the
 * ratchet to whatever it happened to see — makes every ratio agree with itself.
 */
const MIN_FILES = 600;

const argv = process.argv.slice(2);
const updateBaseline = argv.includes('--update-baseline');
const wideCorpus = argv.includes('--corpus');

function loadBinding() {
	const require_ = createRequire(import.meta.url);
	const candidates = [
		path.join(ROOT, '.corpus-cache/rsvelte.node'),
		path.join(ROOT, `apps/npm/vite-plugin-svelte-native-${process.platform}-${process.arch}/rsvelte.node`),
	];
	const found = candidates.find((p) => fs.existsSync(p));
	if (!found) {
		console.error('[parse-ast] no NAPI binding found; looked for:');
		for (const c of candidates) console.error(`  ${path.relative(ROOT, c)}`);
		console.error('  build one: cargo build --release -p rsvelte_napi --lib && node scripts/compat-corpus/binding.mjs --stage');
		process.exit(2);
	}
	return require_(found);
}

/** Every `.svelte` component under a directory. `.svelte.js` / `.svelte.ts` are
 *  modules, which `parse()` does not accept. */
function collectSvelte(dir, prefix, out) {
	for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
		const abs = path.join(dir, entry.name);
		if (entry.isDirectory()) {
			collectSvelte(abs, `${prefix}${entry.name}/`, out);
		} else if (entry.name.endsWith('.svelte')) {
			out.push({ id: prefix + entry.name, file: abs });
		}
	}
	return out;
}

function population() {
	const files = fs.existsSync(PATTERN_DIR) ? collectSvelte(PATTERN_DIR, 'pattern/', []) : [];
	if (!wideCorpus) return files;
	// The collected corpus is a wider population that needs `corpus:collect`
	// and 34 submodules; it is available for a burndown run and is never
	// ratcheted, because a ratchet written from it would be unreproducible on
	// a checkout that has fewer submodules initialised.
	const manifestPath = path.join(ROOT, 'compatibility/manifest.json');
	if (!fs.existsSync(manifestPath)) {
		console.error('[parse-ast] --corpus needs compatibility/manifest.json (run `pnpm run corpus:collect`)');
		process.exit(2);
	}
	const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
	for (const entry of manifest) {
		if (!entry.id.endsWith('.svelte') || entry.id.startsWith('pattern/')) continue;
		files.push({ id: entry.id, file: path.join(ROOT, 'compatibility/sources', entry.id) });
	}
	return files;
}

/** The JSON path with array indices collapsed — one class per field, not per
 *  occurrence, so a ratchet entry names a defect rather than an index. */
const classOf = (p) => (p === '' ? '<root>' : p).replace(/\[\d+\]/g, '[]');

function diffClasses(a, b, p, out) {
	if (a === b) return;
	const ta = a === null ? 'null' : Array.isArray(a) ? 'array' : typeof a;
	const tb = b === null ? 'null' : Array.isArray(b) ? 'array' : typeof b;
	if (ta !== tb) {
		out.add(`${classOf(p)}:type`);
		return;
	}
	if (ta === 'array') {
		if (a.length !== b.length) {
			out.add(`${classOf(p)}:length`);
			return;
		}
		for (let i = 0; i < a.length; i++) diffClasses(a[i], b[i], `${p}[${i}]`, out);
		return;
	}
	if (ta === 'object') {
		for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) {
			if (!(k in a)) out.add(`${classOf(`${p}.${k}`)}:extra`);
			else if (!(k in b)) out.add(`${classOf(`${p}.${k}`)}:missing`);
			else diffClasses(a[k], b[k], `${p}.${k}`, out);
		}
		return;
	}
	out.add(`${classOf(p)}:value`);
}

function main() {
	const binding = loadBinding();
	const files = population();

	if (files.length < MIN_FILES) {
		console.error(
			`[parse-ast] population is ${files.length} file(s), below the floor of ${MIN_FILES} — ` +
				'this is a truncated checkout, not a passing run.'
		);
		process.exit(2);
	}

	const baseline = fs.existsSync(BASELINE) ? JSON.parse(fs.readFileSync(BASELINE, 'utf8')) : [];
	const listed = new Set(baseline);

	const observed = new Set();
	let comparedPairs = 0;
	let bothRejected = 0;
	let divergentUnits = 0;

	for (const { id, file } of files) {
		const source = fs.readFileSync(file, 'utf8');
		for (const [mode, options] of [
			['modern', { modern: true }],
			['legacy', { modern: false }],
		]) {
			let expected;
			let actual;
			let expectedError = null;
			let actualError = null;
			try {
				expected = JSON.parse(JSON.stringify(officialParse(source, options)));
			} catch (error) {
				expectedError = error;
			}
			try {
				actual = JSON.parse(binding.parse(source, options));
			} catch (error) {
				actualError = error;
			}
			if (expectedError && actualError) {
				bothRejected++;
				continue;
			}
			if (expectedError || actualError) {
				// Not a field divergence: one side has no AST at all. Its own
				// class, so a rejection can never be listed as a field.
				observed.add(`${id}::${mode}::<rejected-by:${expectedError ? 'official' : 'rsvelte'}>`);
				divergentUnits++;
				continue;
			}
			comparedPairs++;
			const classes = new Set();
			diffClasses(expected, actual, '', classes);
			if (classes.size === 0) continue;
			divergentUnits++;
			for (const c of classes) observed.add(`${id}::${mode}::${c}`);
		}
	}

	// Population before parity: a run that compared nothing reports what an
	// unreachable population reports.
	if (comparedPairs === 0) {
		console.error(
			`[parse-ast] 0 pairs compared over ${files.length} file(s) — NOT MEASURED, not a pass ` +
				`(${bothRejected} pair(s) rejected by both compilers).`
		);
		process.exit(2);
	}

	if (updateBaseline) {
		refuseUnrepresentativeBaseline('parse-ast', [
			wideCorpus &&
				'--corpus adds a population that needs 34 initialised submodules; a baseline written from it cannot be reproduced or shrunk on a normal checkout',
		]);
		const next = [...observed].sort();
		fs.writeFileSync(BASELINE, `${JSON.stringify(next, null, '\t')}\n`);
		console.log(`[parse-ast] baseline rewritten: ${next.length} entr${next.length === 1 ? 'y' : 'ies'}`);
		console.log(`[parse-ast] ${comparedPairs} pair(s) compared, ${divergentUnits} divergent unit(s)`);
		return;
	}

	const unexpected = [...observed].filter((k) => !listed.has(k)).sort();
	const fixed = [...listed].filter((k) => !observed.has(k)).sort();

	console.log(
		`[parse-ast] ${files.length} file(s), ${comparedPairs} pair(s) compared, ` +
			`${bothRejected} rejected by both, ${divergentUnits} divergent unit(s), ` +
			`${observed.size} divergence class instance(s)`
	);

	if (unexpected.length === 0 && fixed.length === 0) {
		console.log(`[parse-ast] OK — matches the ${listed.size}-entry baseline exactly.`);
		return;
	}

	if (unexpected.length > 0) {
		console.error(`\n[parse-ast] ${unexpected.length} NEW divergence(s):`);
		for (const k of unexpected.slice(0, 50)) console.error(`  + ${k}`);
		if (unexpected.length > 50) console.error(`  … ${unexpected.length - 50} more`);
	}
	if (fixed.length > 0) {
		console.error(
			`\n[parse-ast] ${fixed.length} baseline entr${fixed.length === 1 ? 'y' : 'ies'} no longer diverge(s) — ` +
				're-baseline in the same PR that fixed them:'
		);
		for (const k of fixed.slice(0, 50)) console.error(`  - ${k}`);
		if (fixed.length > 50) console.error(`  … ${fixed.length - 50} more`);
	}
	console.error('\n  node scripts/compat-corpus/parse-ast-verify.mjs --update-baseline');
	process.exit(1);
}

main();
