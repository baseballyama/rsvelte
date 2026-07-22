#!/usr/bin/env node
// Smoke test for the @rsvelte/vite-plugin-svelte-native NAPI surface.
//
// Wave 3 acceptance hinges on the JS shim (`@rsvelte/vite-plugin-svelte`,
// vendored at `apps/npm/vite-plugin-svelte`) being able to call into the
// rsvelte NAPI bindings end-to-end. This script is a fast, dependency-light
// guard that runs in CI by exercising the NAPI surface directly.
//
// Run: `node scripts/dev/test-vps-shim.mjs` (after `cargo build --release
// --features napi --lib` and `cp target/release/librsvelte_napi.dylib
// apps/npm/vite-plugin-svelte-native-<triple>/rsvelte.node`).

import { createRequire } from 'node:module';
import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, '../..');
const shimEntry = resolve(repoRoot, 'apps/npm/vite-plugin-svelte-native/index.cjs');

if (!existsSync(shimEntry)) {
	console.error(`[vps-shim] missing shim entry: ${shimEntry}`);
	process.exit(2);
}

const require = createRequire(import.meta.url);
const r = require(shimEntry);

let pass = 0;
let fail = 0;
function assert(label, cond, extra = '') {
	if (cond) {
		console.log(`PASS ${label}`);
		pass += 1;
	} else {
		console.log(`FAIL ${label}${extra ? ` :: ${extra}` : ''}`);
		fail += 1;
	}
}

// 1. compile() — the hot path of the Vite `transform` hook
const compiled = r.compile('<h1>{name}</h1>', {
	filename: 'Foo.svelte',
	generate: 'client',
});
assert(
	'compile() returns js.code',
	typeof compiled?.js?.code === 'string' && compiled.js.code.length > 0,
);
assert('compile() returns source map', compiled?.js?.map != null);

// 2. compileModule() — used by the `.svelte.js` / `.svelte.ts` path
const m = r.compileModule('export const x = $state(0);', {
	filename: 'foo.svelte.js',
	generate: 'client',
});
assert('compileModule() returns js.code', typeof m?.js?.code === 'string');

// 3. hmrDiff() — the fast-path HMR optimization the shim can consult
const same = r.hmrDiff('<h1>x</h1>', '<h1>x</h1>');
assert('hmrDiff() detects unchanged', same?.change === 'unchanged');

const tplOnly = r.hmrDiff('<h1>x</h1>', '<h1>y</h1>');
assert(
	'hmrDiff() flags template-only edit as hot-update',
	tplOnly?.change === 'hot-update',
	JSON.stringify(tplOnly),
);

const scriptChange = r.hmrDiff(
	'<script>let x = 1</script><h1>{x}</h1>',
	'<script>let x = 2</script><h1>{x}</h1>',
);
assert(
	'hmrDiff() reports instanceChanged for script edits',
	typeof scriptChange?.instanceChanged === 'boolean',
	JSON.stringify(scriptChange),
);

// 4. resolveId() — used by Vite's `resolveId` hook for `<script src=...>`
const resolved = r.resolveId('./Bar.svelte', '/abs/path/Foo.svelte');
assert(
	'resolveId() returns string-or-null for unresolvable importee',
	typeof resolved === 'string' || resolved === null,
);

// 5. preprocess() — async pipeline; verifies the threadsafe-function bridge
const out = await r.preprocess('<h1>hi</h1>', [
	{
		markup: async ({ content }) => ({ code: content.toUpperCase() }),
	},
]);
assert(
	'preprocess() routes markup through the JS callback',
	typeof out?.code === 'string' && out.code.includes('<H1>HI</H1>'),
	out?.code,
);

// 6. VERSION constant — feature detection in the shim
assert(
	'VERSION exposes upstream Svelte semver',
	typeof r.VERSION === 'string' && /^\d+\.\d+\.\d+/.test(r.VERSION),
	r.VERSION,
);

// 7. Standalone parse surfaces — `parse` (JSON), `parseEnvelope` (raw buffer),
//    and the `decodeParseEnvelope` decoder must all be re-exported.
assert('parse() is re-exported', typeof r.parse === 'function');
assert('parseEnvelope() is re-exported', typeof r.parseEnvelope === 'function');
assert('decodeParseEnvelope() is re-exported', typeof r.decodeParseEnvelope === 'function');

const parseSrc = '<script lang="ts">let x = 1;</script><h1>{x}</h1>';
const parsedAst = JSON.parse(r.parse(parseSrc));
assert('parse() returns a Root AST as JSON', parsedAst?.type === 'Root', parsedAst?.type);

const envBuf = r.parseEnvelope(parseSrc);
assert('parseEnvelope() returns a Buffer', Buffer.isBuffer(envBuf));

const decodedAst = r.decodeParseEnvelope(envBuf);
assert(
	'decodeParseEnvelope() round-trips to the same Root as parse()',
	decodedAst?.type === parsedAst?.type,
	`${decodedAst?.type} vs ${parsedAst?.type}`,
);

// 8. Lenient compiler options — `runes` accepts any JS value (mirroring the
//    upstream `parametric` validator, so tooling passing `null`/`undefined`/a
//    number never crashes the compile), and a wrong-typed option is rejected
//    with the upstream "Invalid compiler option" message rather than a raw
//    N-API "Failed to convert napi value" error.
const runesSrc = '<h1>{name}</h1>';
for (const [runes, expected] of [
	[true, true],
	[false, false],
	[1, true],
	['true', true],
	[null, false],
	[undefined, false],
	// Non-finite numbers must not crash the serde bridge: NaN is falsy
	// (auto-detect -> legacy for this rune-free source), Infinity is truthy.
	[NaN, false],
	[Infinity, true],
]) {
	let ok = true;
	let meta;
	try {
		meta = r.compile(runesSrc, { filename: 'A.svelte', generate: 'client', runes })?.metadata
			?.runes;
	} catch {
		ok = false;
	}
	assert(
		`compile() accepts runes=${JSON.stringify(runes)} (runes mode ${expected})`,
		ok && meta === expected,
		`ok=${ok} meta=${JSON.stringify(meta)}`,
	);
}

function compileError(options) {
	try {
		r.compile('<h1>x</h1>', { filename: 'A.svelte', generate: 'client', ...options });
		return null;
	} catch (e) {
		return e.message;
	}
}
for (const [label, options, needle] of [
	['dev', { dev: 1 }, 'dev should be true or false'],
	['dev (NaN)', { dev: NaN }, 'dev should be true or false'],
	['name (Infinity)', { name: Infinity }, 'name should be a string'],
	['namespace', { namespace: 2 }, 'namespace should be one of'],
	['css', { css: 3 }, 'css should be either'],
	['experimental.async', { experimental: { async: 1 } }, 'experimental.async should be true or false'],
	[
		'compatibility.componentApi',
		{ compatibility: { componentApi: '4' } },
		'componentApi should be either',
	],
]) {
	const msg = compileError(options);
	assert(
		`compile() rejects invalid ${label} with the upstream message`,
		msg != null && msg.startsWith('Invalid compiler option') && msg.includes(needle),
		msg,
	);
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail > 0 ? 1 : 0);
