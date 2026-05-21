#!/usr/bin/env node
// Wave 3 fixture-level smoke test: mimic what Vite's `transform` hook does
// when a user authors `import { svelte } from '@rsvelte/vite-plugin-svelte'`
// in `vite.config.js`. We don't spin up an actual Vite dev server — the
// shim's plugin lifecycle is tested upstream — but we exercise the
// real-world payload path:
//   1. Read a `.svelte` file off disk.
//   2. Call `compile()` from the NAPI shim with realistic options.
//   3. Verify the emitted JS imports from `svelte/internal/client` (the
//      hot path users land on in production builds).
//   4. Run `preprocess()` with a JS preprocessor group ahead of compile
//      (the exact two-step pipeline the shim wires together).

import { createRequire } from 'node:module';
import { existsSync, mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, '..');
const shimEntry = resolve(repoRoot, 'npm/vite-plugin-svelte-native/index.cjs');

if (!existsSync(shimEntry)) {
	console.error(`[vps-vite-fixture] missing shim entry: ${shimEntry}`);
	console.error('Run `pnpm run build:vps-native` first.');
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

// Create a fixture in a tmpdir so the test never leaves stale files behind.
const tmp = mkdtempSync(join(tmpdir(), 'rsvelte-vps-fixture-'));
try {
	const svelteFile = join(tmp, 'Counter.svelte');
	const source = `<script>
		let count = $state(0);
		const doubled = $derived(count * 2);
	</script>
	<button onclick={() => count++}>+</button>
	<p>count: {count} doubled: {doubled}</p>
	<style>
		button { color: blue; }
	</style>`;
	writeFileSync(svelteFile, source);

	// Step 1: preprocess (no-op markup transform — mirrors a typical
	// `vitePreprocess()` invocation that just normalizes whitespace).
	const preprocessed = await r.preprocess(
		source,
		[
			{
				name: 'noop',
				markup: async ({ content }) => ({ code: content }),
			},
		],
		{ filename: svelteFile },
	);
	assert(
		'preprocess() returns code',
		typeof preprocessed?.code === 'string' && preprocessed.code.length > 0,
	);

	// Step 2: compile the (preprocessed) source — the Vite `transform` payload.
	const out = r.compile(preprocessed.code, {
		filename: svelteFile,
		generate: 'client',
		dev: true,
		hmr: true,
		css: 'external',
	});
	assert(
		'compile(client) emits js.code',
		typeof out?.js?.code === 'string' && out.js.code.length > 0,
	);
	assert(
		'compile() js.code imports svelte runtime',
		out.js.code.includes('svelte/internal/client'),
		out.js.code.slice(0, 200),
	);
	assert(
		'compile() emits CSS for the <style> block',
		typeof out?.css?.code === 'string' && out.css.code.includes('color'),
	);

	// Step 3: SSR compile (the other half of dev builds for hydrated apps).
	const ssr = r.compile(preprocessed.code, {
		filename: svelteFile,
		generate: 'server',
		dev: true,
	});
	assert(
		'compile(server) emits js.code',
		typeof ssr?.js?.code === 'string' && ssr.js.code.includes('svelte/internal/server'),
		ssr?.js?.code?.slice(0, 200),
	);

	// Step 4: HMR diff — same content twice should be unchanged; a button
	// label edit should be hot-update-able.
	const before = preprocessed.code;
	const after = before.replace('>+<', '>++<');
	const diff = r.hmrDiff(before, after);
	assert(
		'hmrDiff() flags a template-text edit as hot-update',
		diff?.change === 'hot-update',
		JSON.stringify(diff),
	);

	console.log(`\n${pass} passed, ${fail} failed`);
} finally {
	rmSync(tmp, { recursive: true, force: true });
}
process.exit(fail > 0 ? 1 : 0);
