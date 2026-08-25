#!/usr/bin/env node
// Differential gate for the `cssHash` compile option at the NAPI boundary
// (issue #3294), with the official compiler as the oracle.
//
// `cssHash` is the one compile option whose value is a *callback*, which is why
// no other gate reaches it: `test-napi-compile-options.mjs` compares two
// results that differ in one key, and a key the boundary silently drops produces
// two identical results, so that gate's own `differs` check is what a dropped
// scalar trips. A dropped *callback* was invisible to it because the option was
// never declared at the boundary at all.
//
// Three things are asserted here, and each has its own failure mode:
//
//  1. The synchronous entries REJECT a function-valued `cssHash`. They cannot
//     call back into JavaScript, and dropping it hands the caller a different
//     scope class than it asked for — in `css.code` and in every `class`
//     attribute of `js.code` — with no error.
//  2. `compileWithCssHash` invokes the callback the way upstream does: ONE
//     argument, `{ hash, css, name, filename }`, with `hash` a real function.
//     Comparing only the resulting scope class would pass against a callback
//     invoked with the right VALUES in the wrong SHAPE, so the argument list is
//     inspected directly as well.
//  3. A throwing callback becomes a rejected promise. napi's `call_async` routes
//     a JS throw through `napi_fatal_exception` (i.e. it kills the process), so
//     this is a live hazard rather than a hypothetical one — the bridge has to
//     use `call_async_catch`.
//
// The raw addon is loaded directly, like `test-napi-compile-options.mjs`, and in
// its own process: two rsvelte addons in one process have been observed to
// SIGSEGV.
//
// Prereq: `pnpm run build:vps-native`.

import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { compile as officialCompile } from '../../submodules/svelte/packages/svelte/src/compiler/index.js';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, '../..');

let pass = 0;
let fail = 0;
function assert(label, cond, detail) {
	if (cond) {
		pass += 1;
		console.log(`  ok   ${label}`);
	} else {
		fail += 1;
		console.error(`  FAIL ${label}${detail ? ` — ${detail}` : ''}`);
	}
}

function resolveTriple() {
	const { platform, arch } = process;
	if (platform === 'darwin') {
		if (arch === 'arm64') return 'darwin-arm64';
		if (arch === 'x64') return 'darwin-x64';
	} else if (platform === 'linux') {
		let isMusl = false;
		try {
			isMusl = !process.report.getReport().header.glibcVersionRuntime;
		} catch {
			isMusl = false;
		}
		const libc = isMusl ? 'musl' : 'gnu';
		if (arch === 'x64') return `linux-x64-${libc}`;
		if (arch === 'arm64') return `linux-arm64-${libc}`;
	} else if (platform === 'win32') {
		if (arch === 'x64') return 'win32-x64-msvc';
	}
	return null;
}

const triple = resolveTriple();
if (!triple) {
	console.error(`[napi-csshash] unsupported platform ${process.platform}/${process.arch}`);
	process.exit(2);
}
const addonPath = resolve(repoRoot, `apps/npm/vite-plugin-svelte-native-${triple}/rsvelte.node`);
const require_ = createRequire(import.meta.url);
let napi;
try {
	napi = require_(addonPath);
} catch (e) {
	console.error(
		`[napi-csshash] cannot load ${addonPath}\n  run \`pnpm run build:vps-native\` first\n  ${e.message}`,
	);
	process.exit(2);
}

const SRC = '<p class="k">hi</p>\n<style>.k { color: red }</style>';
const OPTS = { filename: 'Probe.svelte', generate: 'client', css: 'external' };

// ---------------------------------------------------------------------------
// 1. The synchronous entries reject rather than drop
// ---------------------------------------------------------------------------
console.log('\n# synchronous entries');

for (const [label, entry] of [
	['compile', (options) => napi.compile(SRC, options)],
	['compileEnvelope', (options) => napi.compileEnvelope(SRC, options)],
]) {
	let message = null;
	try {
		entry({ ...OPTS, cssHash: () => 'fixed-hash' });
	} catch (e) {
		message = String(e?.message ?? e);
	}
	assert(
		`${label} rejects a function-valued cssHash`,
		message != null && /compileWithCssHash/.test(message),
		message ?? 'no error thrown',
	);
}

let typeMessage = null;
try {
	napi.compile(SRC, { ...OPTS, cssHash: 'not-a-function' });
} catch (e) {
	typeMessage = String(e?.message ?? e);
}
assert(
	'compile reports a non-function cssHash the way validate-options does',
	typeMessage != null && /cssHash should be a function/.test(typeMessage),
	typeMessage ?? 'no error thrown',
);

let asyncTypeMessage = null;
try {
	await napi.compileWithCssHash(
		SRC,
		{ ...OPTS, cssHash: 'not-a-function' },
		() => 'fixed-hash',
	);
} catch (e) {
	asyncTypeMessage = String(e?.message ?? e);
}
assert(
	'compileWithCssHash validates a non-function cssHash instead of dropping it',
	asyncTypeMessage != null && /cssHash should be a function/.test(asyncTypeMessage),
	asyncTypeMessage ?? 'no error thrown',
);

const defaultResult = napi.compile(SRC, OPTS);
assert(
	'compile without cssHash is unaffected',
	typeof defaultResult.js.code === 'string' && defaultResult.css.code.includes('.k.svelte-'),
	defaultResult.css.code,
);

// ---------------------------------------------------------------------------
// 2. compileWithCssHash calls the callback the way upstream does
// ---------------------------------------------------------------------------
console.log('\n# callback shape');

let seenArgs = null;
const fixed = await napi.compileWithCssHash(SRC, OPTS, (...args) => {
	seenArgs = args;
	return 'fixed-hash';
});
assert('the callback receives exactly one argument', seenArgs?.length === 1, `argc=${seenArgs?.length}`);
const arg = seenArgs?.[0];
assert(
	'the argument is { hash, css, name, filename }',
	arg != null &&
		typeof arg === 'object' &&
		typeof arg.hash === 'function' &&
		arg.css.includes('.k { color: red }') &&
		arg.name === 'Probe' &&
		arg.filename === 'Probe.svelte',
	JSON.stringify(arg && { ...arg, hash: typeof arg.hash }),
);
assert(
	'the returned string becomes the scope class in css.code and js.code',
	fixed.css.code.includes('.k.fixed-hash') && fixed.js.code.includes('fixed-hash'),
	fixed.css.code,
);

// ---------------------------------------------------------------------------
// 3. Output parity with the official compiler, per callback shape
// ---------------------------------------------------------------------------
console.log('\n# parity with the official compiler');

const CALLBACKS = [
	// The documented idiom. `hash` must be the compiler's own digest, or the
	// scope class differs while every other field agrees.
	['({ hash, css }) => `zz-${hash(css)}`', ({ hash, css }) => `zz-${hash(css)}`],
	['({ hash, filename }) => …', ({ hash, filename }) => `f-${hash(filename)}`],
	['() => a constant', () => 'fixed-el'],
	['({ name }) => …', ({ name }) => `n-${name}`],
	['({ css }) => …', ({ css }) => `c-${css.length}`],
];

for (const generate of ['client', 'server']) {
	for (const [label, cb] of CALLBACKS) {
		const options = { ...OPTS, generate };
		const want = officialCompile(SRC, { ...options, cssHash: cb });
		const got = await napi.compileWithCssHash(SRC, options, cb);
		assert(
			`[${generate}] css.code matches official for ${label}`,
			got.css?.code === want.css?.code,
			`${got.css?.code} vs ${want.css?.code}`,
		);
		// The scope class also lands in the `class` attribute of the emitted
		// template, which `css.code` alone does not cover.
		const scopeClass = /\.k\.([\w-]+)/.exec(want.css?.code ?? '')?.[1];
		assert(
			`[${generate}] the scope class reaches js.code for ${label}`,
			scopeClass != null && got.js.code.includes(scopeClass),
			`${scopeClass} not in ${got.js.code.slice(0, 200)}`,
		);
	}
}

// ---------------------------------------------------------------------------
// 4. Degenerate returns and throws
// ---------------------------------------------------------------------------
console.log('\n# degenerate callbacks');

const nonString = await napi.compileWithCssHash(SRC, OPTS, () => 42);
assert(
	'a non-string return falls back to the default hash',
	nonString.css.code === defaultResult.css.code,
	nonString.css.code,
);

let thrown = null;
try {
	await napi.compileWithCssHash(SRC, OPTS, () => {
		throw new Error('boom');
	});
} catch (e) {
	thrown = String(e?.message ?? e);
}
assert(
	'a throwing cssHash rejects the promise instead of killing the process',
	thrown != null && /boom/.test(thrown),
	thrown ?? 'no rejection',
);

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
