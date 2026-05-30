#!/usr/bin/env node
// Smoke test for the @rsvelte/vite-plugin-svelte-native NAPI surface.
//
// Wave 3 acceptance hinges on the JS shim (forked vite-plugin-svelte) being
// able to call into the rsvelte NAPI bindings end-to-end. The shim itself
// lives in `submodules/vite-plugin-svelte` and is tested there; this script
// is a fast, dependency-light guard that runs in CI without needing the
// upstream pnpm workspace.
//
// Run: `node scripts/dev/test-vps-shim.mjs` (after `cargo build --release
// --features napi --lib` and `cp target/release/libsvelte_compiler_rust.dylib
// npm/vite-plugin-svelte-native-<triple>/rsvelte.node`).

import { createRequire } from 'node:module';
import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, '../..');
const shimEntry = resolve(repoRoot, 'npm/vite-plugin-svelte-native/index.cjs');

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

// ---------------------------------------------------------------------------
// 1. compile() — the hot path of the Vite `transform` hook
// ---------------------------------------------------------------------------
const compiled = r.compile('<h1>{name}</h1>', {
	filename: 'Foo.svelte',
	generate: 'client',
});
assert(
	'compile() returns js.code',
	typeof compiled?.js?.code === 'string' && compiled.js.code.length > 0,
);
assert('compile() returns source map', compiled?.js?.map != null);

// ---------------------------------------------------------------------------
// 2. compileModule() — used by the `.svelte.js` / `.svelte.ts` path
// ---------------------------------------------------------------------------
const m = r.compileModule('export const x = $state(0);', {
	filename: 'foo.svelte.js',
	generate: 'client',
});
assert('compileModule() returns js.code', typeof m?.js?.code === 'string');

// ---------------------------------------------------------------------------
// 3. hmrDiff() — the fast-path HMR optimization the shim can consult
// ---------------------------------------------------------------------------
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

// ---------------------------------------------------------------------------
// 4. resolveId() — used by Vite's `resolveId` hook for `<script src=...>`
// ---------------------------------------------------------------------------
const resolved = r.resolveId('./Bar.svelte', '/abs/path/Foo.svelte');
assert(
	'resolveId() returns string-or-null for unresolvable importee',
	typeof resolved === 'string' || resolved === null,
);

// ---------------------------------------------------------------------------
// 5. preprocess() — async pipeline; verifies the threadsafe-function bridge
// ---------------------------------------------------------------------------
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

// ---------------------------------------------------------------------------
// 6. VERSION constant — feature detection in the shim
// ---------------------------------------------------------------------------
assert(
	'VERSION exposes upstream Svelte semver',
	typeof r.VERSION === 'string' && /^\d+\.\d+\.\d+/.test(r.VERSION),
	r.VERSION,
);

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail > 0 ? 1 : 0);
