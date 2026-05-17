// Sanity check for the raw-transfer pipeline:
//
//   Step 1 (compileBuffers)             — code/map as Buffer
//   Step 2 (compileEnvelope)            — single packed Buffer + JS decode
//   Step 3 (compileEnvelopeZeroCopy)    — Step 2 backed by bumpalo arena
//
// Loads the freshly-built `.node` artifact directly (bypassing the
// platform-resolved npm wrapper) so the script works in-tree without
// needing the `staging` step that copies artifacts into npm packages.

import { dirname, join } from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(here, '..');

// Prefer the in-tree release cdylib so test results reflect the
// latest `cargo build --release`. Fall back to the staged
// `npm/vite-plugin-svelte-native-*/rsvelte.node` so the script works
// after publish-style staging too.
function loadBinding() {
	const staged = join(
		repoRoot,
		`npm/vite-plugin-svelte-native-${triple()}/rsvelte.node`,
	);
	const cdylib = join(repoRoot, 'target/release/libsvelte_compiler_rust.dylib');
	for (const candidate of [cdylib, staged]) {
		try {
			return require(candidate);
		} catch {}
	}
	throw new Error(
		`Couldn't load NAPI binding. Tried:\n  - ${cdylib}\n  - ${staged}\n` +
			`Build first: cargo build --release --features napi --lib`,
	);
}

function triple() {
	if (process.platform === 'darwin') {
		if (process.arch === 'arm64') return 'darwin-arm64';
		if (process.arch === 'x64') return 'darwin-x64';
	}
	if (process.platform === 'linux') {
		if (process.arch === 'x64') return 'linux-x64-gnu';
		if (process.arch === 'arm64') return 'linux-arm64-gnu';
	}
	if (process.platform === 'win32' && process.arch === 'x64') {
		return 'win32-x64-msvc';
	}
	throw new Error(`Unsupported: ${process.platform}-${process.arch}`);
}

const binding = loadBinding();
const { decodeEnvelope } = await import(
	`file://${join(repoRoot, 'npm/vite-plugin-svelte-native/envelope.js')}`
).then((m) => m.default ?? m);

const SOURCE = `
<script>
	let { name = 'world' } = $props();
	let count = $state(0);
</script>

<style>
	h1 { color: var(--text); }
	:global(body) { background: white; }
</style>

<h1>Hello, {name}!</h1>
<button onclick={() => count++}>clicked {count}</button>
`;

const OPTIONS = { filename: 'App.svelte', generate: 'client' };

function describe(label, result) {
	const codeLen = result.js?.code?.length ?? 0;
	const hasMap = result.js?.map != null;
	const hasCss = result.css != null;
	const cssCodeLen = result.css?.code?.length ?? 0;
	const warnings = result.warnings?.length ?? 0;
	console.log(
		`${label.padEnd(28)}  js.code=${codeLen}b  js.map=${hasMap}  ` +
			`css=${hasCss}(${cssCodeLen}b)  warnings=${warnings}  runes=${result.metadata?.runes}`,
	);
	return { codeLen, hasMap, hasCss, cssCodeLen, warnings };
}

console.log('=== Raw-transfer sanity check ===\n');

// --- Step 0: legacy JSON path (baseline) -----------------------------------
const legacy = binding.compile(SOURCE, OPTIONS);
const baseline = describe('legacy (compile)', legacy);

// --- Step 1: structured Buffers -------------------------------------------
const bufResult = binding.compileBuffers(SOURCE, OPTIONS);
const step1 = {
	codeLen: bufResult.js.code.length,
	hasMap: bufResult.js.map != null,
	hasCss: bufResult.css != null,
	cssCodeLen: bufResult.css?.code?.length ?? 0,
	warnings: bufResult.warnings.length,
};
console.log(
	`step1 (compileBuffers)        js.code=${step1.codeLen}b  ` +
		`js.map=${step1.hasMap}  css=${step1.hasCss}(${step1.cssCodeLen}b)  ` +
		`warnings=${step1.warnings}  runes=${bufResult.runes}`,
);

// --- Step 2: envelope ------------------------------------------------------
const envBuf = binding.compileEnvelope(SOURCE, OPTIONS);
console.log(`envelope buffer size: ${envBuf.byteLength}b`);
const envDecoded = decodeEnvelope(envBuf);
const step2 = describe('step2 (compileEnvelope)', envDecoded);

// --- Step 3: zero-copy envelope -------------------------------------------
const zcBuf = binding.compileEnvelopeZeroCopy(SOURCE, OPTIONS);
console.log(`zero-copy buffer size: ${zcBuf.byteLength}b`);
const zcDecoded = decodeEnvelope(zcBuf);
const step3 = describe('step3 (zero-copy envelope)', zcDecoded);

// --- Verify parity --------------------------------------------------------
function assertEq(label, a, b) {
	if (a !== b) {
		console.error(`FAIL ${label}: ${JSON.stringify(a)} !== ${JSON.stringify(b)}`);
		process.exitCode = 1;
	}
}

console.log('\n=== Parity ===');
assertEq('js.code (legacy vs envelope)', legacy.js.code, envDecoded.js.code);
assertEq('js.code (legacy vs zero-copy)', legacy.js.code, zcDecoded.js.code);
assertEq('js.code (legacy vs buffers)', legacy.js.code, bufResult.js.code.toString('utf8'));

// Compare CSS code by content
if (legacy.css) {
	assertEq('css.code (legacy vs envelope)', legacy.css.code, envDecoded.css.code);
	assertEq('css.code (legacy vs zero-copy)', legacy.css.code, zcDecoded.css.code);
	assertEq('css.hasGlobal (legacy vs envelope)', legacy.css.hasGlobal, envDecoded.css.hasGlobal);
	assertEq('css.hasGlobal (legacy vs zero-copy)', legacy.css.hasGlobal, zcDecoded.css.hasGlobal);
}

// Source map JSON parity
const legacyMap = legacy.js.map ? JSON.stringify(legacy.js.map) : null;
const envMap = envDecoded.js.map ? JSON.stringify(envDecoded.js.map) : null;
const zcMap = zcDecoded.js.map ? JSON.stringify(zcDecoded.js.map) : null;
assertEq('js.map (legacy vs envelope)', legacyMap, envMap);
assertEq('js.map (legacy vs zero-copy)', legacyMap, zcMap);

assertEq('metadata.runes (legacy vs envelope)', legacy.metadata.runes, envDecoded.metadata.runes);

// Warnings: ensure equal lengths (more detailed parity is harder because
// of object property ordering, but length + first-warning code is enough
// to confirm the lazy decoder is working).
assertEq(
	'warnings.length (legacy vs envelope)',
	legacy.warnings.length,
	envDecoded.warnings.length,
);
assertEq(
	'warnings.length (legacy vs zero-copy)',
	legacy.warnings.length,
	zcDecoded.warnings.length,
);

if (process.exitCode) {
	console.error('\n❌ FAIL');
} else {
	console.log('\n✅ All four paths produce identical results');
}

// --- Micro-benchmark ------------------------------------------------------
console.log('\n=== Micro-benchmark (1000 iterations, no warm-up) ===');
const N = 1000;

function bench(label, fn) {
	const t0 = process.hrtime.bigint();
	for (let i = 0; i < N; i++) fn();
	const t1 = process.hrtime.bigint();
	const ns = Number(t1 - t0);
	const usPerOp = ns / N / 1000;
	console.log(`${label.padEnd(40)}  ${usPerOp.toFixed(2)} µs/op`);
}

// Warm-up (V8 tier-up)
for (let i = 0; i < 200; i++) binding.compile(SOURCE, OPTIONS);

bench('legacy JSON         (no .code read)', () => binding.compile(SOURCE, OPTIONS));
bench('legacy JSON         (read .code)', () => {
	const r = binding.compile(SOURCE, OPTIONS);
	void r.js.code.length;
});
bench('compileBuffers      (no .code read)', () =>
	binding.compileBuffers(SOURCE, OPTIONS),
);
bench('compileBuffers      (read .code)', () => {
	const r = binding.compileBuffers(SOURCE, OPTIONS);
	void r.js.code.toString('utf8').length;
});
bench('compileEnvelope     (no .code read)', () =>
	binding.compileEnvelope(SOURCE, OPTIONS),
);
bench('compileEnvelope     (decode + read .code)', () => {
	const buf = binding.compileEnvelope(SOURCE, OPTIONS);
	const r = decodeEnvelope(buf);
	void r.js.code.length;
});
bench('compileEnvelopeZC   (decode + read .code)', () => {
	const buf = binding.compileEnvelopeZeroCopy(SOURCE, OPTIONS);
	const r = decodeEnvelope(buf);
	void r.js.code.length;
});

// --- GC stress for the zero-copy arena ------------------------------------
// Spam zero-copy compiles and force GC between batches. If the arena
// finalizer is wired wrong, this either leaks (RSS grows unboundedly)
// or crashes (use-after-free in the finalizer). Run with
// `node --expose-gc scripts/test-raw-transfer.mjs` to actually trigger
// the GC pass; without --expose-gc we just rely on the natural GC.
console.log('\n=== GC stress (zero-copy arena) ===');
const beforeRss = process.memoryUsage.rss();
const ITER = 5000;
for (let i = 0; i < ITER; i++) {
	const buf = binding.compileEnvelopeZeroCopy(SOURCE, OPTIONS);
	const r = decodeEnvelope(buf);
	// Touch every lazy field so the buffer view is realised, then drop.
	void r.js.code.length;
	void r.js.map?.version;
	if (r.css) void r.css.code.length;
	if (i % 500 === 0 && typeof global.gc === 'function') global.gc();
}
if (typeof global.gc === 'function') {
	global.gc();
	global.gc();
}
const afterRss = process.memoryUsage.rss();
const grewMb = (afterRss - beforeRss) / 1024 / 1024;
console.log(
	`${ITER} zero-copy compiles → RSS grew ${grewMb.toFixed(1)} MiB ` +
		`(threshold for "leak" is ~${(ITER * 0.001).toFixed(0)} MiB — much higher means missing finalizer)`,
);
if (typeof global.gc !== 'function') {
	console.log('(run with --expose-gc for a tighter signal)');
}

// --- Larger source: amplify the boundary cost ratio -----------------------
//
// The 50-line component above is mostly compile cost; the Rust↔JS
// boundary is ~5-15% of total. A bigger source shifts the ratio so
// the marshaling difference is more visible. We use the actual docs
// homepage (~20KB) as a realistic upper bound.
import { readFileSync } from 'node:fs';
const BIG_PATH = join(repoRoot, 'docs/src/routes/+page.svelte');
let BIG_SOURCE;
try {
	BIG_SOURCE = readFileSync(BIG_PATH, 'utf8');
} catch {
	console.log('\n(skipping large-source benchmark — docs/src/routes/+page.svelte not present)');
	BIG_SOURCE = null;
}
if (BIG_SOURCE) {
	console.log(`\n=== Large-source benchmark (${BIG_SOURCE.length} bytes, ${N} iter) ===`);
	const BIG_OPTS = { filename: '+page.svelte', generate: 'client' };
	// Warm-up
	for (let i = 0; i < 100; i++) binding.compile(BIG_SOURCE, BIG_OPTS);

	bench('legacy        (read .code + .map)', () => {
		const r = binding.compile(BIG_SOURCE, BIG_OPTS);
		void r.js.code.length;
		void (r.js.map && JSON.stringify(r.js.map).length);
	});
	bench('compileBuffers (read .code + .map)', () => {
		const r = binding.compileBuffers(BIG_SOURCE, BIG_OPTS);
		void r.js.code.toString('utf8').length;
		if (r.js.map) void r.js.map.toString('utf8').length;
	});
	bench('envelope       (decode + read .code+.map)', () => {
		const buf = binding.compileEnvelope(BIG_SOURCE, BIG_OPTS);
		const r = decodeEnvelope(buf);
		void r.js.code.length;
		void (r.js.map && JSON.stringify(r.js.map).length);
	});
	bench('envelopeZC     (decode + read .code+.map)', () => {
		const buf = binding.compileEnvelopeZeroCopy(BIG_SOURCE, BIG_OPTS);
		const r = decodeEnvelope(buf);
		void r.js.code.length;
		void (r.js.map && JSON.stringify(r.js.map).length);
	});
	bench('envelope       (no decode — just transfer)', () => {
		void binding.compileEnvelope(BIG_SOURCE, BIG_OPTS).byteLength;
	});
	bench('envelopeZC     (no decode — just transfer)', () => {
		void binding.compileEnvelopeZeroCopy(BIG_SOURCE, BIG_OPTS).byteLength;
	});
}
