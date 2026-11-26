// rsvelte/compiler in Node.js: the official svelte/compiler API over the native addon, or over the
// WebAssembly module where the addon does not load, as in a WebContainer.
import { readFileSync } from 'node:fs';

import { compiler } from './compiler-api.js';
import { wasmBinding } from './wasm-binding.js';

export { preprocess } from 'svelte/compiler';

/** @returns {Promise<import('./compiler-api.js').Compiler>} */
async function load() {
	try {
		return (await import('./binding.js')).default;
	} catch (error) {
		// An addon named on purpose, as the tests name theirs, does not fall back.
		if (process.env.RSVELTE_BINDING) throw error;
		try {
			const wasm = await import('#wasm');
			wasm.initSync({
				module: readFileSync(new URL('./generated/wasm/rsvelte_bg.wasm', import.meta.url)),
			});
			return wasmBinding(wasm);
		} catch {
			throw error;
		}
	}
}

const binding = await load();

/** The version of svelte whose output this compiler reproduces. */
export const VERSION = binding.VERSION;
export const { compile, compileModule } = compiler(binding);
