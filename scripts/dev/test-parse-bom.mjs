#!/usr/bin/env node
/**
 * A leading BOM is an input axis every other gate holds at 0 (#3488).
 *
 * `compile`, `compileModule`, `parse` and `parseCss` all call `remove_bom` in
 * upstream's `compiler/index.js`, so a BOM never reaches the parser and every
 * position upstream reports is relative to the trimmed text. rsvelte kept it,
 * and no gate could see that: the collected corpus is published code (checked in
 * without a BOM), the generated matrix builds its sources in JS string literals,
 * and the pattern corpus is written by hand. "Does this file start with a BOM"
 * was a constant across all ~39 gates.
 *
 * This gate varies it. For each source it compares official's `parse()` with
 * rsvelte's NAPI `parse` — the same source twice, once with a BOM and once
 * without — under both AST modes.
 *
 * THE WITHOUT-BOM ROWS ARE THE CONTROL, NOT PADDING. A BOM row that matches
 * proves nothing on its own if the same source diverges anyway; the pair is
 * what isolates the axis. A run where a control row fails reports that and
 * exits non-zero rather than scoring the BOM row.
 *
 * Hard gate: any divergence fails. No ratchet.
 *
 * Usage: node scripts/dev/test-parse-bom.mjs
 */

import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const require_ = createRequire(import.meta.url);

const BOM = '﻿';

const SOURCES = [
	['plain element', '<p>x</p>'],
	['instance script', '<script>let a = 1;</script>\n<p>{a}</p>'],
	['module script', '<script module>export const x = 1;</script>\n<p>y</p>'],
	['style', '<style>p{color:red}</style>\n<p>x</p>'],
	['block', '{#if a}<b>x</b>{:else}<i>y</i>{/if}'],
	['each with index', '{#each xs as x, i}<b>{i}</b>{/each}'],
	['comment carriers', '<!-- html -->\n<script>\n\t// line\n\tlet a = 1;\n</script>\n{a /* tail */}'],
	['non-ascii text', '<p>日本語 {a}</p>'],
	['whitespace only', '   \n'],
	['empty', ''],
];

function loadBinding() {
	const candidates = [
		path.join(ROOT, '.corpus-cache/rsvelte.node'),
		path.join(
			ROOT,
			`apps/npm/vite-plugin-svelte-native-${process.platform}-${process.arch}/rsvelte.node`,
		),
	];
	const found = candidates.find((p) => fs.existsSync(p));
	if (!found) {
		console.error('[parse-bom] no NAPI binding found; looked for:');
		for (const c of candidates) console.error(`  ${path.relative(ROOT, c)}`);
		console.error('  build one: cargo build --release -p rsvelte_napi --lib');
		process.exit(2);
	}
	return require_(found);
}

const binding = loadBinding();
const { parse: officialParse } = await import(
	`file://${path.join(ROOT, 'submodules/svelte/packages/svelte/src/compiler/index.js')}`
);

/** Both sides through one JSON round-trip: official keeps present-but-undefined
 *  keys that `Object.keys` sees and `JSON.stringify` drops, and rsvelte's
 *  binding returns a string. */
function bothSides(source, options) {
	const expected = JSON.parse(JSON.stringify(officialParse(source, options)));
	const actual = JSON.parse(binding.parse(source, options));
	return [expected, actual];
}

function firstDiff(a, b, p = '') {
	if (a === b) return null;
	const ta = a === null ? 'null' : Array.isArray(a) ? 'array' : typeof a;
	const tb = b === null ? 'null' : Array.isArray(b) ? 'array' : typeof b;
	if (ta !== tb) return `${p || '<root>'}: ${ta} vs ${tb}`;
	if (ta === 'array') {
		if (a.length !== b.length) return `${p}: length ${a.length} vs ${b.length}`;
		for (let i = 0; i < a.length; i++) {
			const d = firstDiff(a[i], b[i], `${p}[${i}]`);
			if (d) return d;
		}
		return null;
	}
	if (ta === 'object') {
		for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) {
			if (!(k in a)) return `${p}.${k}: only rsvelte has it`;
			if (!(k in b)) return `${p}.${k}: only official has it`;
			const d = firstDiff(a[k], b[k], `${p}.${k}`);
			if (d) return d;
		}
		return null;
	}
	return `${p}: ${JSON.stringify(a)} vs ${JSON.stringify(b)}`;
}

let passed = 0;
let failed = 0;
let controlFailed = 0;

for (const [label, body] of SOURCES) {
	for (const modern of [true, false]) {
		const mode = modern ? 'modern' : 'legacy';
		// Control first: the axis is only isolated if the same source agrees
		// without a BOM.
		let control;
		try {
			control = firstDiff(...bothSides(body, { modern }));
		} catch (error) {
			control = `threw: ${error.message}`;
		}
		if (control) {
			controlFailed++;
			console.error(`CONTROL ${label} [${mode}] diverges WITHOUT a BOM — ${control}`);
			continue;
		}
		let diff;
		try {
			diff = firstDiff(...bothSides(BOM + body, { modern }));
		} catch (error) {
			diff = `threw: ${error.message}`;
		}
		if (diff) {
			failed++;
			console.error(`FAIL ${label} [${mode}] — ${diff}`);
		} else {
			passed++;
			console.log(`PASS ${label} [${mode}]`);
		}
	}
}

console.log(`\n${passed} passed, ${failed} failed, ${controlFailed} control failure(s)`);
if (passed === 0) {
	console.error('[parse-bom] nothing was compared — NOT MEASURED, not a pass.');
	process.exit(2);
}
if (failed > 0 || controlFailed > 0) process.exit(1);
