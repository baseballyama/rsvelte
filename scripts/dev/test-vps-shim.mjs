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

// A self-referential object must not crash the process while decoding — it is
// rejected (or ignored) like any other non-scalar, never followed into a cycle.
const circular = {};
circular.self = circular;
// Reaching this line at all proves no fatal crash occurred; throwing a normal
// error is an acceptable outcome, a process abort is not.
const survives = (options) => {
	try {
		r.compile('<h1>x</h1>', { filename: 'A.svelte', generate: 'client', ...options });
	} catch {
		/* a normal thrown error is fine */
	}
	return true;
};
assert(
	'compile() rejects a circular object option without crashing',
	compileError({ dev: circular }) != null,
);
assert('compile() survives a circular experimental option', survives({ experimental: circular }));
assert(
	'compile() survives a nested circular option',
	survives({ experimental: { async: circular } }),
);
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
// 9. Function-form compile options (customElement / css / runes) are resolved
//    at the binding boundary — a `({ filename }) => value` form must produce the
//    same output as the resolved value.
const ceBool = r.compile('<svelte:options customElement="my-el" /><h1>hi</h1>', {
	filename: 'El.svelte',
	generate: 'client',
	customElement: true,
});
const ceFn = r.compile('<svelte:options customElement="my-el" /><h1>hi</h1>', {
	filename: 'El.svelte',
	generate: 'client',
	customElement: () => true,
});
assert(
	'customElement function form resolves to boolean value',
	ceFn.js.code === ceBool.js.code && ceBool.js.code.length > 0,
);

const cssExternal = r.compile('<h1>hi</h1><style>h1{color:red}</style>', {
	filename: 'C.svelte',
	generate: 'client',
	css: 'external',
});
const cssFn = r.compile('<h1>hi</h1><style>h1{color:red}</style>', {
	filename: 'C.svelte',
	generate: 'client',
	css: () => 'injected',
});
assert(
	'css function form resolves and injects styles',
	cssFn.css == null && cssFn.js.code !== cssExternal.js.code,
	JSON.stringify({ hasCss: cssFn.css != null }),
);

const runesFn = r.compile('<script>let count = $state(0);</script><h1>{count}</h1>', {
	filename: 'R.svelte',
	generate: 'client',
	runes: () => true,
});
assert('runes function form compiles', typeof runesFn?.js?.code === 'string');

// 10. cssHashOverride — a constant scope hash must appear verbatim in the CSS.
const hashed = r.compile('<h1>hi</h1><style>h1{color:red}</style>', {
	filename: 'H.svelte',
	generate: 'client',
	css: 'injected',
	cssHashOverride: 's-DEADBEEF',
});
assert(
	'cssHashOverride sets the scope class',
	hashed.js.code.includes('s-DEADBEEF'),
	hashed.js.code.slice(0, 120),
);

// 11. warningFilter — post-filtering the returned warnings array.
const warnSrc = '<img src="x.png">';
const unfiltered = r.compile(warnSrc, { filename: 'W.svelte', generate: 'client' });
assert(
	'component emits at least one warning to filter',
	Array.isArray(unfiltered.warnings) && unfiltered.warnings.length > 0,
	JSON.stringify(unfiltered.warnings.map((w) => w.code)),
);
const filtered = r.compile(warnSrc, {
	filename: 'W.svelte',
	generate: 'client',
	warningFilter: (w) => !w.code.startsWith('a11y'),
});
assert(
	'warningFilter drops matching warnings',
	filtered.warnings.every((w) => !w.code.startsWith('a11y')) &&
		filtered.warnings.length < unfiltered.warnings.length,
	JSON.stringify(filtered.warnings.map((w) => w.code)),
);

// 11. Dynamic cssHash — a css-dependent hash function routed through the async
//     callback bridge (`compileAsync` -> `compileWithCssHash`).
{
	const src = '<h1>hi</h1><style>h1{color:red}</style>';
	const seen = {};
	const dyn = await r.compileAsync(src, {
		filename: 'Dyn.svelte',
		generate: 'client',
		css: 'injected',
		cssHash: ({ hash, css, name, filename }) => {
			seen.name = name;
			seen.filename = filename;
			seen.hasHashFn = typeof hash === 'function';
			return `x-${hash(css)}`;
		},
	});
	assert(
		'dynamic cssHash receives name/filename/hash',
		seen.hasHashFn === true && seen.name === 'Dyn' && seen.filename === 'Dyn.svelte',
		JSON.stringify(seen),
	);
	assert(
		'dynamic cssHash class appears in output',
		/x-[0-9a-z]+/.test(dyn.js.code),
		dyn.js.code.slice(0, 160),
	);

	// Svelte defaults filename to '(unknown)' — the callback must see that, not undefined.
	let seenFilename;
	await r.compileAsync('<h1>hi</h1><style>h1{color:red}</style>', {
		generate: 'client',
		css: 'injected',
		cssHash: ({ hash, css, filename }) => {
			seenFilename = filename;
			return `x-${hash(css)}`;
		},
	});
	assert('cssHash filename defaults to (unknown)', seenFilename === '(unknown)', String(seenFilename));

	// Different CSS must yield a different hash (proves it is content-driven).
	const a = await r.compileAsync('<h1>a</h1><style>h1{color:red}</style>', {
		filename: 'A.svelte',
		generate: 'client',
		css: 'injected',
		cssHash: ({ hash, css }) => `x-${hash(css)}`,
	});
	const b = await r.compileAsync('<h1>b</h1><style>h1{color:blue}</style>', {
		filename: 'B.svelte',
		generate: 'client',
		css: 'injected',
		cssHash: ({ hash, css }) => `x-${hash(css)}`,
	});
	const clsOf = (code) => (code.match(/x-[0-9a-z]+/) || [])[0];
	assert(
		'dynamic cssHash varies with CSS content',
		clsOf(a.js.code) && clsOf(b.js.code) && clsOf(a.js.code) !== clsOf(b.js.code),
		`${clsOf(a.js.code)} vs ${clsOf(b.js.code)}`,
	);

	// A throwing cssHash surfaces as a compile error (matches upstream) without
	// crashing the process during TSFN teardown.
	let cssHashThrew = false;
	try {
		await r.compileAsync(src, {
			filename: 'F.svelte',
			generate: 'client',
			css: 'injected',
			cssHash: () => {
				throw new Error('boom');
			},
		});
	} catch (e) {
		cssHashThrew = /boom/.test(String((e && e.message) || e));
	}
	assert('throwing cssHash surfaces as a compile error', cssHashThrew);

	// A non-string return falls back to the compiler's default hash.
	const fell = await r.compileAsync(src, {
		filename: 'F.svelte',
		generate: 'client',
		css: 'injected',
		cssHash: () => 42,
	});
	assert(
		'non-string cssHash return falls back to default hash',
		fell.js.code.includes('svelte-'),
		fell.js.code.slice(0, 160),
	);

	// The synchronous entry rejects a dynamic cssHash rather than dropping it.
	let threw = false;
	try {
		r.compile(src, { filename: 'S.svelte', generate: 'client', cssHash: () => 'x' });
	} catch {
		threw = true;
	}
	assert('sync compile throws on a dynamic cssHash', threw);

	// compileBatch rejects a dynamic cssHash instead of silently dropping it.
	let batchThrew = false;
	try {
		r.compileBatch([{ source: src, options: { filename: 'Bt.svelte', cssHash: () => 'x' } }]);
	} catch {
		batchThrew = true;
	}
	assert('compileBatch throws on a dynamic cssHash', batchThrew);

	// compileBatchAsync rejects a dynamic cssHash too (no per-file callback bridge).
	let batchAsyncThrew = false;
	try {
		await r.compileBatchAsync([
			{ source: src, options: { filename: 'Bt.svelte', cssHash: () => 'x' } },
		]);
	} catch {
		batchAsyncThrew = true;
	}
	assert('compileBatchAsync throws on a dynamic cssHash', batchAsyncThrew);
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail > 0 ? 1 : 0);
