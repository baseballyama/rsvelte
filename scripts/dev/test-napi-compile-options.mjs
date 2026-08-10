#!/usr/bin/env node
// Per-key gate for the JS-object -> Rust-option mapping in `crates/rsvelte_napi`
// (issue #2539). That crate sets `test = false`, so a `cargo test` never links
// it and deleting a field from `NapiCompileOptions` — or dropping an arm from
// the coercion — fails nothing.
//
// Two halves, and neither works alone:
//
//  1. EXHAUSTIVENESS. The declared option surface is read out of
//     `crates/rsvelte_napi/src/lib.rs` and every key must appear in COVERED or
//     UNCOVERED below. A test that crosses 1 of 40 keys is boundary-valid and
//     worthless; this is what states the denominator and keeps it honest when a
//     new option lands.
//
//  2. DISCRIMINATION. Each covered key compiles a baseline and a variant that
//     differ only in that key, and requires both that the two results differ and
//     that the variant carries a named marker. A key dropped at the boundary
//     produces identical results, so `differs` fails; a key wired to the wrong
//     thing still differs, so the marker is what fails then. Asserting only "the
//     call succeeded" would pass against a binding that ignores every option.
//
// The raw addon is loaded directly rather than through
// `apps/npm/vite-plugin-svelte-native/index.cjs`: the shim pre-resolves
// function-form options in JS, which is a different boundary (already covered by
// `test:vps-shim`). Exactly one addon is loaded per process — two rsvelte addons
// required into the same process have been observed to SIGSEGV.
//
// Prereq: `pnpm run build:vps-native`.

import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

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

// ---------------------------------------------------------------------------
// Load the addon
// ---------------------------------------------------------------------------

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
	console.error(`[napi-options] unsupported platform ${process.platform}/${process.arch}`);
	process.exit(2);
}
const addonPath = resolve(repoRoot, `apps/npm/vite-plugin-svelte-native-${triple}/rsvelte.node`);
const require_ = createRequire(import.meta.url);
let napi;
try {
	napi = require_(addonPath);
} catch (e) {
	console.error(
		`[napi-options] cannot load ${addonPath}\n  run \`pnpm run build:vps-native\` first\n  ${e.message}`
	);
	process.exit(2);
}

// ---------------------------------------------------------------------------
// 1. The declared option surface (the denominator)
// ---------------------------------------------------------------------------

const libSource = readFileSync(resolve(repoRoot, 'crates/rsvelte_napi/src/lib.rs'), 'utf8');

const camel = (s) => s.replace(/_([a-z])/g, (_, c) => c.toUpperCase());

/** Every `#[napi(object)] pub struct X { … }` in lib.rs, with its field names. */
function napiObjectStructs(src) {
	const out = new Map();
	const re = /#\[napi\(object\)\]\s*pub struct (\w+) \{([\s\S]*?)\n\}/g;
	for (const m of src.matchAll(re)) {
		const fields = [...m[2].matchAll(/^\s*pub (\w+):/gm)].map((f) => camel(f[1]));
		out.set(m[1], fields);
	}
	return out;
}

/** The hand-rolled svelte2tsx option reader is not a struct — read its keys. */
function svelte2tsxKeys(src) {
	const body = src.match(/fn parse_svelte2tsx_options\([\s\S]*?\n\}/);
	if (!body) return null;
	return [...body[0].matchAll(/obj\.get\("(\w+)"\)/g)].map((m) => m[1]);
}

const structs = napiObjectStructs(libSource);

// Structs that carry compiler options, and structs that carry results. Splitting
// them explicitly means a NEW `#[napi(object)]` cannot quietly land in neither
// list: the reconciliation below fails on any name absent from both.
const OPTION_STRUCTS = [
	'NapiCompileOptions',
	'NapiModuleCompileOptions',
	'NapiParseOptions',
	'PreprocessOptions',
];
const RESULT_STRUCTS = [
	'CompileBuffersJs',
	'CompileBuffersCss',
	'NapiPosition',
	'NapiWarning',
	'CompileBuffersResult',
	// `{ source, options }` — its `options` field is a NapiCompileOptions, already surveyed.
	'CompileBatchInput',
];

console.log('\n# option surface');
for (const name of [...OPTION_STRUCTS, ...RESULT_STRUCTS]) {
	assert(`lib.rs still declares #[napi(object)] ${name}`, structs.has(name));
}
const unclassified = [...structs.keys()].filter(
	(n) => !OPTION_STRUCTS.includes(n) && !RESULT_STRUCTS.includes(n)
);
assert(
	'every #[napi(object)] struct is classified as options or result',
	unclassified.length === 0,
	unclassified.join(', ')
);

const s2tKeys = svelte2tsxKeys(libSource);
assert('parse_svelte2tsx_options still reads its keys by name', s2tKeys != null && s2tKeys.length > 0);

/** `surface -> [key]`, keyed the way the assertions below name them. */
const DECLARED = new Map([
	['compile', structs.get('NapiCompileOptions') ?? []],
	['compileModule', structs.get('NapiModuleCompileOptions') ?? []],
	['parse', structs.get('NapiParseOptions') ?? []],
	['preprocess', structs.get('PreprocessOptions') ?? []],
	['svelte2tsx', s2tKeys ?? []],
]);

// Keys no input can discriminate, each with the reason. A guess here is worse
// than a gap: it reads as surveyed.
const UNCOVERED = new Map([
	[
		'compile.modernAst',
		'inert in rsvelte_core: `compile` returns `ast: None` unconditionally (compiler/mod.rs), and the napi layer forwards `ast: Value::Null`, so no input can tell `modernAst: true` from the default',
	],
	[
		'compileModule.rootDir',
		'forwarded to CompileOptions but every consumer of `root_dir` (the `$.FILENAME` / HMR key in the client component transform, and the CSS scope hash) is component-only, so a module compile has nothing to observe',
	],
]);

// ---------------------------------------------------------------------------
// 2. Per-key discriminating cases
// ---------------------------------------------------------------------------

const RUNES_SRC = [
	'<script>',
	'\tlet { name } = $props();',
	'\tlet count = $state(0);',
	'</script>',
	'',
	'<h1 class="t">   {name} {count}   </h1>',
	'<style>h1 { color: red }</style>',
].join('\n');

const LEGACY_SRC = [
	'<script>',
	"\texport let name = 'x';",
	'\tlet n = 0;',
	'\t$: doubled = n * 2;',
	'</script>',
	'',
	'<h1>{name}{doubled}</h1>',
	'<style>h1 { color: red }</style>',
].join('\n');

const CE_SRC = '<svelte:options customElement="my-el" /><h1>hi</h1>';
const CSS_SRC = '<h1>hi</h1>\n<style>h1 { color: red }</style>';

const INPUT_MAP = {
	version: 3,
	file: 'A.svelte',
	sources: ['orig.svelte'],
	sourcesContent: [CSS_SRC],
	names: [],
	mappings: 'AAAA;AACA',
};

const warningCodes = (r) => (r.warnings ?? []).map((w) => w.code);

/**
 * Each case: the option key, a baseline, a variant differing only in that key,
 * and a marker the variant must carry. `differs` catches a dropped key; `marker`
 * catches a key wired to the wrong thing.
 *
 * The three removed Svelte-4 options and the renamed `generate: 'dom'` spelling
 * warn through a process-wide `warn_once` latch, so each is exercised exactly
 * once in this process — a second compile with the same key would see no warning.
 */
const COMPILE_CASES = [
	{
		key: 'dev',
		src: RUNES_SRC,
		base: { filename: 'A.svelte' },
		variant: { filename: 'A.svelte', dev: true },
		marker: (r) => r.js.code.includes("A[$.FILENAME] = 'A.svelte'"),
	},
	{
		key: 'generate',
		src: RUNES_SRC,
		base: { filename: 'A.svelte', generate: 'client' },
		variant: { filename: 'A.svelte', generate: 'server' },
		marker: (r) => r.js.code.includes("from 'svelte/internal/server'"),
	},
	{
		key: 'filename',
		src: RUNES_SRC,
		base: { dev: true, filename: 'A.svelte' },
		variant: { dev: true, filename: 'B.svelte' },
		marker: (r) => r.js.code.includes("B[$.FILENAME] = 'B.svelte'"),
	},
	{
		key: 'rootDir',
		src: RUNES_SRC,
		base: { dev: true, filename: '/root/sub/A.svelte' },
		variant: { dev: true, filename: '/root/sub/A.svelte', rootDir: '/root' },
		marker: (r) => r.js.code.includes("A[$.FILENAME] = 'sub/A.svelte'"),
	},
	{
		key: 'name',
		src: RUNES_SRC,
		base: { filename: 'A.svelte' },
		variant: { filename: 'A.svelte', name: 'Zed' },
		marker: (r) => r.js.code.includes('function Zed('),
	},
	{
		key: 'customElement',
		src: CE_SRC,
		base: { filename: 'A.svelte' },
		variant: { filename: 'A.svelte', customElement: true },
		marker: (r) =>
			r.js.code.includes('$.create_custom_element(') &&
			!warningCodes(r).includes('options_missing_custom_element'),
	},
	{
		key: 'accessors',
		src: LEGACY_SRC,
		base: { filename: 'A.svelte' },
		variant: { filename: 'A.svelte', accessors: true },
		marker: (r) => r.js.code.includes('get name()') && r.js.code.includes('set name('),
	},
	{
		key: 'namespace',
		// The only shape whose codegen reads the option rather than inferring the
		// namespace from the tag name.
		src: '<svelte:element this={"div"} />',
		base: { filename: 'A.svelte', namespace: 'html' },
		variant: { filename: 'A.svelte', namespace: 'svg' },
		marker: (r) => r.js.code.includes('$.element(node, () => "div", true)'),
	},
	{
		key: 'immutable',
		src: LEGACY_SRC,
		base: { filename: 'A.svelte' },
		variant: { filename: 'A.svelte', immutable: true },
		marker: (r) => !r.js.code.includes('$.mutable_source()'),
	},
	{
		key: 'css',
		src: CSS_SRC,
		base: { filename: 'A.svelte', css: 'external' },
		variant: { filename: 'A.svelte', css: 'injected' },
		marker: (r) => r.css == null && r.js.code.includes('$.append_styles('),
	},
	{
		key: 'preserveComments',
		src: '<!-- keep me --><h1>hi</h1>',
		base: { filename: 'A.svelte' },
		variant: { filename: 'A.svelte', preserveComments: true },
		marker: (r) => r.js.code.includes('keep me'),
	},
	{
		key: 'preserveWhitespace',
		src: RUNES_SRC,
		base: { filename: 'A.svelte' },
		variant: { filename: 'A.svelte', preserveWhitespace: true },
		// The blank lines between `</script>` and `<h1>` survive into the template.
		marker: (r) => r.js.code.includes('\n\n<h1 class="t'),
	},
	{
		key: 'runes',
		src: '<h1>{name}</h1>',
		base: { filename: 'A.svelte' },
		variant: { filename: 'A.svelte', runes: true },
		marker: (r) => r.metadata.runes === true,
	},
	{
		key: 'discloseVersion',
		src: CSS_SRC,
		base: { filename: 'A.svelte' },
		variant: { filename: 'A.svelte', discloseVersion: false },
		marker: (r) => !r.js.code.includes("svelte/internal/disclose-version"),
	},
	{
		key: 'sourcemap',
		src: CSS_SRC,
		base: { filename: 'A.svelte' },
		variant: { filename: 'A.svelte', sourcemap: INPUT_MAP },
		// The preprocessor map is chained into the output map's segments.
		marker: (r) => typeof r.js.map.mappings === 'string' && r.js.map.mappings.length > 0,
		differsIn: (r) => r.js.map.mappings,
	},
	{
		key: 'outputFilename',
		src: CSS_SRC,
		base: { filename: 'A.svelte' },
		variant: { filename: 'A.svelte', outputFilename: 'out.js' },
		marker: (r) => r.js.map.file === 'out.js',
	},
	{
		key: 'cssOutputFilename',
		src: CSS_SRC,
		base: { filename: 'A.svelte' },
		variant: { filename: 'A.svelte', cssOutputFilename: 'out.css' },
		marker: (r) => r.css.map.file === 'out.css',
	},
	{
		key: 'hmr',
		src: RUNES_SRC,
		base: { filename: 'A.svelte', dev: true },
		variant: { filename: 'A.svelte', dev: true, hmr: true },
		marker: (r) => r.js.code.includes('$.hmr(A)'),
	},
	{
		key: 'experimental',
		src: '<script>let x = await Promise.resolve(1);</script><h1>{x}</h1>',
		base: { filename: 'A.svelte' },
		variant: { filename: 'A.svelte', experimental: { async: true } },
		// Without the flag the compile is rejected outright.
		baseThrows: /await/,
		marker: (r) => typeof r.js.code === 'string' && r.js.code.length > 0,
	},
	{
		key: 'compatibility',
		src: LEGACY_SRC,
		base: { filename: 'A.svelte' },
		variant: { filename: 'A.svelte', compatibility: { componentApi: 4 } },
		marker: (r) => r.js.code.includes("createClassComponent as $$_createClassComponent"),
	},
	{
		key: 'cssHashOverride',
		src: CSS_SRC,
		base: { filename: 'A.svelte', css: 'injected' },
		variant: { filename: 'A.svelte', css: 'injected', cssHashOverride: 's-DEADBEEF' },
		marker: (r) => r.js.code.includes('s-DEADBEEF'),
	},
	{
		key: 'fragments',
		src: CSS_SRC,
		base: { filename: 'A.svelte', fragments: 'html' },
		variant: { filename: 'A.svelte', fragments: 'tree' },
		marker: (r) => r.js.code.includes('$.from_tree('),
	},
	{
		key: 'enableSourcemap',
		src: CSS_SRC,
		base: { filename: 'A.svelte' },
		variant: { filename: 'A.svelte', enableSourcemap: true },
		marker: (r) => warningCodes(r).includes('options_removed_enable_sourcemap'),
	},
	{
		key: 'hydratable',
		src: CSS_SRC,
		base: { filename: 'A.svelte' },
		variant: { filename: 'A.svelte', hydratable: true },
		marker: (r) => warningCodes(r).includes('options_removed_hydratable'),
	},
	{
		key: 'loopGuardTimeout',
		src: CSS_SRC,
		base: { filename: 'A.svelte' },
		variant: { filename: 'A.svelte', loopGuardTimeout: 100 },
		marker: (r) => warningCodes(r).includes('options_removed_loop_guard_timeout'),
	},
];

const covered = new Set();

function runCase(surface, compile, c) {
	const id = `${surface}.${c.key}`;
	covered.add(id);
	const call = (opts) => {
		try {
			return { ok: true, value: compile(c.src, opts) };
		} catch (e) {
			return { ok: false, error: e };
		}
	};
	const base = call({ generate: 'client', ...c.base });
	const variant = call({ generate: 'client', ...c.variant });

	if (c.baseThrows) {
		assert(
			`${id}: the baseline is rejected without the option`,
			!base.ok && c.baseThrows.test(String(base.error?.message ?? base.error)),
			base.ok ? 'the baseline compiled' : String(base.error?.message)
		);
	} else if (!base.ok) {
		assert(`${id}: baseline compiles`, false, String(base.error?.message ?? base.error));
		return;
	}
	if (!variant.ok) {
		assert(`${id}: variant compiles`, false, String(variant.error?.message ?? variant.error));
		return;
	}

	if (base.ok) {
		const project = c.differsIn ?? ((r) => JSON.stringify(r));
		assert(
			`${id}: the option changes the result`,
			JSON.stringify(project(base.value)) !== JSON.stringify(project(variant.value)),
			'baseline and variant are identical — the key never reached the compiler'
		);
	}
	assert(`${id}: the change is the expected one`, c.marker(variant.value));
}

console.log('\n# compile options');
for (const c of COMPILE_CASES) runCase('compile', (s, o) => napi.compile(s, o), c);
covered.add('compile.modernAst');

for (const key of ['accessors', 'immutable']) {
	const result = napi.compile(LEGACY_SRC, { filename: 'A.svelte', [key]: false });
	assert(
		`compile.${key}: false still reports the deprecated option`,
		warningCodes(result).includes(`options_deprecated_${key}`)
	);
}

// `generate: 'dom'` is the pre-Svelte-5 spelling of the same key; it must still
// select the client target AND raise the rename warning.
{
	const renamed = napi.compile(CSS_SRC, { filename: 'A.svelte', generate: 'dom' });
	assert(
		'compile.generate: the "dom" spelling selects client and warns',
		renamed.js.code.includes("from 'svelte/internal/client'") &&
			warningCodes(renamed).includes('options_renamed_ssr_dom')
	);
}

// ---------------------------------------------------------------------------
// compileModule
// ---------------------------------------------------------------------------

const MODULE_SRC = 'let x = $state(0);\nexport function inc() { x++; }';

const MODULE_CASES = [
	{
		key: 'dev',
		src: MODULE_SRC,
		base: { filename: 'm.svelte.js' },
		variant: { filename: 'm.svelte.js', dev: true },
		marker: (r) => r.js.code.includes("$.tag($.state(0), 'x')"),
	},
	{
		key: 'generate',
		src: MODULE_SRC,
		base: { filename: 'm.svelte.js', generate: 'client' },
		variant: { filename: 'm.svelte.js', generate: 'server' },
		marker: (r) => r.js.code.includes("from 'svelte/internal/server'"),
	},
	{
		key: 'filename',
		src: MODULE_SRC,
		base: { filename: 'a.svelte.js' },
		variant: { filename: 'b.svelte.js' },
		marker: (r) => r.js.code.includes('b.svelte.js'),
	},
	{
		key: 'experimental',
		src: 'let d = $derived(await Promise.resolve(1));\nexport function g() { return d; }',
		base: { filename: 'm.svelte.js' },
		variant: { filename: 'm.svelte.js', experimental: { async: true } },
		baseThrows: /await/,
		marker: (r) => typeof r.js.code === 'string' && r.js.code.length > 0,
	},
];

console.log('\n# compileModule options');
for (const c of MODULE_CASES) runCase('compileModule', (s, o) => napi.compileModule(s, o), c);
covered.add('compileModule.rootDir');

// ---------------------------------------------------------------------------
// parse / parseEnvelope
// ---------------------------------------------------------------------------

console.log('\n# parse options');
const PARSE_SRC = '<script>let x = 1 + 2;</script>\n<h1>{x}</h1>\n<style>h1 { color: red }</style>';
{
	covered.add('parse.skipExpressionLoc');
	const full = JSON.parse(napi.parse(PARSE_SRC, {}));
	const skipped = JSON.parse(napi.parse(PARSE_SRC, { skipExpressionLoc: true }));
	const locCount = (v) => JSON.stringify(v).split('"loc"').length - 1;
	assert(
		'parse.skipExpressionLoc: the option changes the result',
		JSON.stringify(full) !== JSON.stringify(skipped)
	);
	assert(
		'parse.skipExpressionLoc: the change is the expected one',
		locCount(full) > 0 && locCount(skipped) < locCount(full),
		`${locCount(full)} -> ${locCount(skipped)}`
	);

	// `skipCssAst` is only read by `parseEnvelope` — `napi_parse` never consults
	// it, so this is the entry point that can observe it.
	covered.add('parse.skipCssAst');
	const envFull = napi.parseEnvelope(PARSE_SRC, {});
	const envSkipped = napi.parseEnvelope(PARSE_SRC, { skipCssAst: true });
	assert(
		'parse.skipCssAst: the option changes the parseEnvelope buffer',
		!envFull.equals(envSkipped)
	);
	assert(
		'parse.skipCssAst: the change is the expected one',
		envSkipped.length < envFull.length,
		`${envFull.length} -> ${envSkipped.length} bytes`
	);
}

// ---------------------------------------------------------------------------
// preprocess
// ---------------------------------------------------------------------------

console.log('\n# preprocess options');
{
	covered.add('preprocess.filename');
	const seen = [];
	const group = [{ markup: ({ filename }) => void seen.push(filename) }];
	await napi.preprocess('<h1>hi</h1>', group, { filename: 'Pp.svelte' });
	await napi.preprocess('<h1>hi</h1>', group);
	assert(
		'preprocess.filename: the option changes what the callback sees',
		seen[0] !== seen[1],
		JSON.stringify(seen)
	);
	assert(
		'preprocess.filename: the change is the expected one',
		seen[0] === 'Pp.svelte',
		JSON.stringify(seen)
	);
}

// ---------------------------------------------------------------------------
// svelte2tsx
// ---------------------------------------------------------------------------

const S2T_SRC = '<script lang="ts">export let a: number = 1;</script>\n<h1>{a}</h1>';
// The upstream `attributes-foreign-ns` shape: only `namespace: 'foreign'` keeps
// the attribute-name casing.
const S2T_NS_SRC = '<element someAttr="hi" someOtherAttribute="there">hello</element>';

const S2T_CASES = [
	{
		key: 'filename',
		src: S2T_SRC,
		base: { filename: 'A.svelte' },
		variant: { filename: 'B.svelte' },
		marker: (r) => JSON.stringify(r.map.sources).includes('B.svelte'),
	},
	{
		key: 'isTsFile',
		src: S2T_SRC,
		base: { filename: 'A.svelte' },
		variant: { filename: 'A.svelte', isTsFile: true },
	},
	{
		key: 'mode',
		src: S2T_SRC,
		base: { filename: 'A.svelte', mode: 'ts' },
		variant: { filename: 'A.svelte', mode: 'dts' },
		marker: (r) => r.code.startsWith('import { SvelteComponentTyped } from "svelte"'),
	},
	{
		key: 'accessors',
		src: S2T_SRC,
		base: { filename: 'A.svelte' },
		variant: { filename: 'A.svelte', accessors: true },
	},
	{
		key: 'namespace',
		src: S2T_NS_SRC,
		base: { filename: 'A.svelte', namespace: 'html' },
		variant: { filename: 'A.svelte', namespace: 'foreign' },
		marker: (r) => r.code.includes('"someOtherAttribute"'),
	},
	{
		key: 'version',
		src: S2T_SRC,
		base: { filename: 'A.svelte', version: '5' },
		variant: { filename: 'A.svelte', version: '4' },
	},
];

console.log('\n# svelte2tsx options');
for (const c of S2T_CASES) {
	const id = `svelte2tsx.${c.key}`;
	covered.add(id);
	const base = napi.svelte2tsx(c.src, c.base);
	const variant = napi.svelte2tsx(c.src, c.variant);
	assert(
		`${id}: the option changes the result`,
		JSON.stringify(base) !== JSON.stringify(variant),
		'baseline and variant are identical — the key never reached svelte2tsx'
	);
	if (c.marker) assert(`${id}: the change is the expected one`, c.marker(variant));
}

// ---------------------------------------------------------------------------
// The one result field with a recorded boundary defect
// ---------------------------------------------------------------------------
//
// `sourcesContent` is the only field this boundary has been observed to lose
// (#2482 / the napi-boundary accounting). `test:vps-shim` covers it on the five
// entry points the JS shim wraps, all of which externalize the source and have
// the decoder restore it; the JSON entries below build the map in Rust and are
// covered by neither, so they are asserted here.

console.log('\n# boundary result fields');
{
	const sc = (map) => map?.sourcesContent?.[0];
	const one = napi.compile(CSS_SRC, { filename: 'A.svelte', generate: 'client' });
	assert('compile(): js.map carries the original source', sc(one.js.map) === CSS_SRC);
	assert('compile(): css.map carries the original source', sc(one.css.map) === CSS_SRC);
	const both = napi.compileBoth(CSS_SRC, { filename: 'A.svelte' });
	assert('compileBoth(): client js.map carries the original source', sc(both.client.js.map) === CSS_SRC);
	assert('compileBoth(): server js.map carries the original source', sc(both.server.js.map) === CSS_SRC);
}

// ---------------------------------------------------------------------------
// Reconcile: declared == covered + uncovered, both directions
// ---------------------------------------------------------------------------

console.log('\n# coverage');
const declared = [];
for (const [surface, keys] of DECLARED) {
	for (const key of keys) {
		// `cssHashOverride` is the test-harness escape hatch for the JS `cssHash`
		// callback; it is a real key and is covered like any other.
		declared.push(`${surface}.${key}`);
	}
}

const missing = declared.filter((id) => !covered.has(id) && !UNCOVERED.has(id));
assert(
	'every declared option key is covered or justified as uncovered',
	missing.length === 0,
	missing.join(', ')
);

const stale = [...covered, ...UNCOVERED.keys()].filter((id) => !declared.includes(id));
assert(
	'no covered/uncovered entry names a key that no longer exists',
	stale.length === 0,
	stale.join(', ')
);

for (const [id, reason] of UNCOVERED) {
	assert(`uncovered ${id} carries a reason`, typeof reason === 'string' && reason.length > 40);
}

const crossed = declared.filter((id) => covered.has(id) && !UNCOVERED.has(id)).length;
console.log(
	`\n${crossed} of ${declared.length} declared option keys crossed the boundary ` +
		`(${UNCOVERED.size} justified as unobservable)`
);
console.log(`${pass} passed, ${fail} failed`);
process.exit(fail > 0 ? 1 : 0);
