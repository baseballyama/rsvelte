// JS wrapper around the wasm `svelte2tsx` export shipped in @rsvelte/compiler.
//
// The wasm bundle returns a JSON string at the boundary (primitives only, no
// custom wasm_bindgen struct per field), so this module's only real work is
// initialising the wasm module on first use and JSON-parsing the result.
//
// The @rsvelte/compiler wasm bundle is wasm-pack --target web, so its default
// init uses `fetch(new URL(...))`. That works in browsers but fails on Node's
// `file://` URLs. We load the wasm bytes via fs and hand them to init so Node
// (the primary consumer here) works without a global fetch shim.

import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';

import initWasm, { svelte2tsx as wasmSvelte2tsx } from '@rsvelte/compiler';

const require = createRequire(import.meta.url);

let initPromise;
async function ensureReady() {
	if (!initPromise) {
		initPromise = (async () => {
			const wasmPath = require.resolve('@rsvelte/compiler/svelte_compiler_rust_bg.wasm');
			const bytes = await readFile(wasmPath);
			await initWasm({ module_or_path: bytes });
		})();
	}
	await initPromise;
}

/**
 * Convert a Svelte component to TypeScript/TSX.
 *
 * @param {string} source — Svelte component source code
 * @param {{
 *   filename?: string,
 *   isTsFile?: boolean,
 *   mode?: 'ts' | 'dts',
 *   accessors?: boolean,
 *   namespace?: 'html' | 'svg' | 'mathml',
 *   version?: '4' | '5',
 * }} [options]
 * @returns {Promise<{
 *   code: string,
 *   map: string | null,
 *   exportedNames: { props: string[], all: string[] },
 *   events: Record<string, unknown>,
 * }>}
 */
export async function svelte2tsx(source, options = {}) {
	await ensureReady();
	const json = wasmSvelte2tsx(source, JSON.stringify(options));
	const parsed = JSON.parse(json);
	if (parsed.success === false) {
		throw new Error(parsed.error || 'svelte2tsx failed');
	}
	return {
		code: parsed.code,
		map: parsed.map ?? null,
		exportedNames: parsed.exportedNames,
		events: parsed.events ?? {},
	};
}

export default svelte2tsx;
