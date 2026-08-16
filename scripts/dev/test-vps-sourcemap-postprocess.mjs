#!/usr/bin/env node
// The vite-plugin-svelte dev-server postprocessing gate.
//
// `postprocessCompiled` rewrites the compiled JavaScript twice: the HMR partial
// accept call and the appended CSS import. Both edits move generated
// coordinates, so the returned map has to be recomposed rather than carried
// over. This script decodes the map on both sides and compares the ORIGINAL
// position of every generated column of every token the two outputs share — a
// map that merely exists, or whose `sources` spelling drifted, fails here. Two
// negative controls keep the comparison honest: a same-line rewrite and a
// line-shifting injection, each with the pre-edit map carried over.
//
// It needs neither the NAPI binding nor the submodules: the postprocessing is a
// pure module and the official Svelte compiler (a devDependency) supplies a
// realistic compile result to feed it.
//
// Run: `node scripts/dev/test-vps-sourcemap-postprocess.mjs`

import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { compile } from 'svelte/compiler';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, '../..');
const pkgRoot = resolve(repoRoot, 'apps/npm/vite-plugin-svelte');

const { postprocessCompiled } = await import(`file://${resolve(pkgRoot, 'src/utils/map-edits.js')}`);
const requireFromPkg = createRequire(resolve(pkgRoot, 'package.json'));
const { TraceMap, originalPositionFor } = requireFromPkg('@jridgewell/trace-mapping');

const filename = '/project/src/lib/Counter.svelte';
const cssId = `${filename}?svelte&type=style&lang.css`;
const source = `<script>
	let count = $state(0);
	const doubled = $derived(count * 2);

	function increment() {
		count += 1;
	}
</script>

<button onclick={increment}>clicks: {count}</button>
<p>doubled: {doubled}</p>

<style>
	button {
		color: red;
	}
</style>
`;

let pass = 0;
let fail = 0;
/**
 * @param {string} label
 * @param {boolean} cond
 * @param {string} [extra]
 */
function assert(label, cond, extra = '') {
	if (cond) {
		console.log(`PASS ${label}`);
		pass += 1;
	} else {
		console.log(`FAIL ${label}${extra ? ` :: ${extra}` : ''}`);
		fail += 1;
	}
}

function compileOnce() {
	const result = compile(source, {
		filename,
		generate: 'client',
		dev: true,
		hmr: true,
		css: 'external'
	});
	// `js` exposes `map` through a getter; the plugin mutates a plain result.
	return {
		js: { code: result.js.code, map: JSON.parse(JSON.stringify(result.js.map)) },
		css: result.css
			? { code: result.css.code, map: JSON.parse(JSON.stringify(result.css.map)) }
			: null
	};
}

/** @param {string} code */
function tokenOffsets(code) {
	/** @type {Map<string, number[]>} */
	const offsets = new Map();
	for (const match of code.matchAll(/[A-Za-z_$][A-Za-z0-9_$]*/g)) {
		const found = offsets.get(match[0]);
		if (found) found.push(/** @type {number} */ (match.index));
		else offsets.set(match[0], [/** @type {number} */ (match.index)]);
	}
	return offsets;
}

/**
 * @param {string} code
 * @param {number} offset
 */
function positionOf(code, offset) {
	return {
		line: code.slice(0, offset).split('\n').length,
		column: offset - code.lastIndexOf('\n', offset - 1) - 1
	};
}

/**
 * Original position of every generated column of every token whose occurrence
 * count is the same in both outputs, paired in source order. That makes the
 * generated-position correspondence unambiguous without diffing, and because
 * tokens rather than whole lines are matched, a rewrite that only shifts
 * columns on its own line is still compared.
 *
 * @param {{code: string, map: any}} before
 * @param {{code: string, map: any}} after
 */
function compareDecodedMappings(before, after) {
	const beforeTokens = tokenOffsets(before.code);
	const afterTokens = tokenOffsets(after.code);
	const beforeMap = new TraceMap(before.map);
	const afterMap = new TraceMap(after.map);

	let compared = 0;
	let lastComparedLine = 0;
	let lastComparedOffset = -1;
	const mismatches = [];
	for (const [token, offsets] of beforeTokens) {
		const afterOffsets = afterTokens.get(token);
		if (!afterOffsets || afterOffsets.length !== offsets.length) continue;
		for (let n = 0; n < offsets.length; n++) {
			const b0 = positionOf(before.code, offsets[n]);
			const a0 = positionOf(after.code, afterOffsets[n]);
			for (let i = 0; i < token.length; i++) {
				const b = originalPositionFor(beforeMap, { line: b0.line, column: b0.column + i });
				const a = originalPositionFor(afterMap, { line: a0.line, column: a0.column + i });
				compared += 1;
				if (b.source !== a.source || b.line !== a.line || b.column !== a.column) {
					if (mismatches.length < 5) {
						mismatches.push({ token, generated: b0, before: b, after: a });
					}
				}
			}
			if (b0.line > lastComparedLine) lastComparedLine = b0.line;
			if (offsets[n] > lastComparedOffset) lastComparedOffset = offsets[n];
		}
	}
	return { compared, lastComparedLine, lastComparedOffset, mismatches };
}

// --- the map a compile with neither feature enabled would return -------------
const baseline = compileOnce();
postprocessCompiled(baseline, { filename, cssId, partialAccept: false, emitCssImport: false });

const acceptOffset = baseline.js.code.indexOf('import.meta.hot.accept(');
assert('fixture exercises the HMR accept call', acceptOffset > -1, baseline.js.code.slice(-200));
assert('fixture emits css', !!baseline.css?.code?.trim(), String(baseline.css?.code));
const acceptLine = positionOf(baseline.js.code, Math.max(acceptOffset, 0)).line;

// --- both features on ---------------------------------------------------------
const actual = compileOnce();
postprocessCompiled(actual, { filename, cssId, partialAccept: true, emitCssImport: true });

assert(
	'partial accept rewrote the accept call',
	actual.js.code.includes('import.meta.hot.acceptExports(["default"],'),
	actual.js.code.slice(-300)
);
assert(
	'css import was appended',
	actual.js.code.includes(`import ${JSON.stringify(cssId)};`),
	actual.js.code.slice(-300)
);

const result = compareDecodedMappings(baseline.js, actual.js);
assert('mappings were actually compared', result.compared > 200, `compared=${result.compared}`);
assert(
	'comparison reaches past the injected code',
	result.lastComparedLine > acceptLine && result.lastComparedOffset > acceptOffset,
	`lastLine=${result.lastComparedLine} acceptLine=${acceptLine}`
);
assert(
	'every shared generated column resolves to the same original token',
	result.mismatches.length === 0,
	JSON.stringify(result.mismatches, null, 2)
);

assert(
	'source spelling survives postprocessing',
	JSON.stringify(actual.js.map.sources) === JSON.stringify(baseline.js.map.sources),
	`${JSON.stringify(actual.js.map.sources)} vs ${JSON.stringify(baseline.js.map.sources)}`
);
assert(
	'sources stay relative to the component directory',
	actual.js.map.sources.every((/** @type {string} */ s) => !s.startsWith('/') && !s.includes(':\\')),
	JSON.stringify(actual.js.map.sources)
);
assert(
	'sourcesContent survives postprocessing',
	JSON.stringify(actual.js.map.sourcesContent) === JSON.stringify(baseline.js.map.sourcesContent),
	JSON.stringify(actual.js.map.sourcesContent?.map((/** @type {string} */ s) => s?.length))
);

// `file` is optional in Svelte's own output, so drive it from a map that has one.
// `mapToRelative` rewrites it to the component's basename; postprocessing must
// not drop it on the way through.
const withFile = compileOnce();
withFile.js.map.file = 'Counter.svelte.js';
postprocessCompiled(withFile, { filename, cssId, partialAccept: true, emitCssImport: true });
assert(
	'map.file survives postprocessing',
	withFile.js.map.file === 'Counter.svelte',
	String(withFile.js.map.file)
);

// --- negative controls: the comparison must be able to fail -------------------
/** @param {(code: string) => string} mutate */
function carriedOverMap(mutate) {
	const broken = compileOnce();
	postprocessCompiled(broken, { filename, cssId, partialAccept: false, emitCssImport: false });
	broken.js.code = mutate(broken.js.code);
	return compareDecodedMappings(baseline.js, broken.js);
}

const columnShiftControl = carriedOverMap((code) => code.replace('\tlet count', '\t let count'));
assert(
	'negative control — an unmapped column shift is caught',
	columnShiftControl.mismatches.length > 0,
	`compared=${columnShiftControl.compared}`
);

const lineShiftControl = carriedOverMap((code) => `import ${JSON.stringify(cssId)};\n${code}`);
assert(
	'negative control — an unmapped line-shifting injection is caught',
	lineShiftControl.mismatches.length > 0,
	`compared=${lineShiftControl.compared}`
);

// The bug this gate was written for changed only `sources`, so the comparison
// has to be sensitive to that field on its own.
const drifted = compileOnce();
postprocessCompiled(drifted, { filename, cssId, partialAccept: false, emitCssImport: false });
drifted.js.map.sources = drifted.js.map.sources.map((/** @type {string} */ s) => `/project/${s}`);
assert(
	'negative control — a source-spelling drift is caught',
	compareDecodedMappings(baseline.js, drifted.js).mismatches.length > 0
);

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
