#!/usr/bin/env node
// E2E test for the @rsvelte/compiler wasm `compile(source, options)` entry and
// its function-form compile options (issue #1680): the `parametric` function
// forms of customElement/css/runes, a warningFilter callback, a constant
// cssHashOverride, and a dynamic cssHash callback.
//
// The bundle is wasm-pack `--target web`, whose default `init` is async
// (`fetch`); it also exposes a synchronous `initSync`, driven here with the
// `.wasm` bytes read from disk (mirrors apps/npm/oxlint-plugin/src/wasm.js).
//
// Prereq: `pnpm run build:wasm:core`.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const jsUrl = new URL('../../pkg/rsvelte_lint.js', import.meta.url).href;
const wasmPath = fileURLToPath(new URL('../../pkg/rsvelte_lint_bg.wasm', import.meta.url));

const compiler = await import(jsUrl);
compiler.initSync({ module: readFileSync(wasmPath) });

let pass = 0;
let fail = 0;
function assert(name, cond, detail) {
	if (cond) {
		pass += 1;
		console.log(`  ok   ${name}`);
	} else {
		fail += 1;
		console.error(`  FAIL ${name}${detail ? ` — ${detail}` : ''}`);
	}
}

const compile = (source, options) => JSON.parse(compiler.compile(source, options));

// 1. Function-form customElement resolves to the same output as the boolean.
const ceBool = compile('<svelte:options customElement="my-el" /><h1>hi</h1>', {
	filename: 'El.svelte',
	generate: 'client',
	customElement: true,
});
const ceFn = compile('<svelte:options customElement="my-el" /><h1>hi</h1>', {
	filename: 'El.svelte',
	generate: 'client',
	customElement: () => true,
});
assert(
	'customElement function form resolves to boolean value',
	ceFn.js.code === ceBool.js.code && ceBool.js.code.length > 0,
);

// 2. Function-form css resolves; `injected` folds CSS into the JS (css == null).
const cssExternal = compile('<h1>hi</h1><style>h1{color:red}</style>', {
	filename: 'C.svelte',
	generate: 'client',
	css: 'external',
});
const cssFn = compile('<h1>hi</h1><style>h1{color:red}</style>', {
	filename: 'C.svelte',
	generate: 'client',
	css: () => 'injected',
});
assert(
	'css function form resolves and injects styles',
	cssFn.css == null && cssFn.js.code !== cssExternal.js.code,
	JSON.stringify({ hasCss: cssFn.css != null }),
);

// 3. Function-form runes compiles.
const runesFn = compile('<script>let count = $state(0);</script><h1>{count}</h1>', {
	filename: 'R.svelte',
	generate: 'client',
	runes: () => true,
});
assert('runes function form compiles', typeof runesFn?.js?.code === 'string');

// 4. cssHashOverride — a constant scope hash appears verbatim in the output.
const hashed = compile('<h1>hi</h1><style>h1{color:red}</style>', {
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

// 5. warningFilter — the compiler drops warnings the filter rejects.
const warnSrc = '<img src="x.png">';
const unfiltered = compile(warnSrc, { filename: 'W.svelte', generate: 'client' });
assert(
	'component emits at least one warning to filter',
	Array.isArray(unfiltered.warnings) && unfiltered.warnings.length > 0,
	JSON.stringify(unfiltered.warnings.map((w) => w.code)),
);
const filtered = compile(warnSrc, {
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
// A throwing warningFilter aborts compilation (matches upstream Svelte / NAPI).
let warnFilterThrew = false;
try {
	compiler.compile(warnSrc, {
		filename: 'W.svelte',
		generate: 'client',
		warningFilter: () => {
			throw new Error('warn-boom');
		},
	});
} catch (e) {
	warnFilterThrew = /warn-boom/.test(String((e && e.message) || e));
}
assert('throwing warningFilter surfaces as a compile error', warnFilterThrew);

// 6. Dynamic cssHash — a css-dependent scope hash bridged through js_sys.
{
	const src = '<h1>hi</h1><style>h1{color:red}</style>';
	const seen = {};
	const dyn = compile(src, {
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

	// Svelte defaults filename to '(unknown)' — the callback must see that.
	let seenFilename;
	compile('<h1>hi</h1><style>h1{color:red}</style>', {
		generate: 'client',
		css: 'injected',
		cssHash: ({ hash, css, filename }) => {
			seenFilename = filename;
			return `x-${hash(css)}`;
		},
	});
	assert('cssHash filename defaults to (unknown)', seenFilename === '(unknown)', String(seenFilename));

	// Different CSS must yield a different hash (proves it is content-driven).
	const a = compile('<h1>a</h1><style>h1{color:red}</style>', {
		filename: 'A.svelte',
		generate: 'client',
		css: 'injected',
		cssHash: ({ hash, css }) => `x-${hash(css)}`,
	});
	const b = compile('<h1>b</h1><style>h1{color:blue}</style>', {
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

	// A throwing cssHash surfaces as a compile error (matches upstream).
	let cssHashThrew = false;
	try {
		compiler.compile(src, {
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
	const fell = compile(src, {
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
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail > 0 ? 1 : 0);
