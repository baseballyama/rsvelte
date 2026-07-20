// Engine selection: native-first, wasm-fallback.
//
// The rsvelte rule engine is available two ways, both returning byte-identical
// JSON: a prebuilt native `.node` (fast, from `@rsvelte/lint-<triple>`) and a
// portable wasm module (from `@rsvelte/compiler`). We prefer native and fall
// back to wasm when the platform package isn't installed.
//
// `RSVELTE_OXLINT_ENGINE=native|wasm` forces one engine (used by the test suite
// to exercise both paths; `native` throws if unavailable rather than silently
// falling back). `RSVELTE_OXLINT_DEBUG` prints the chosen engine once to stderr.

import { loadNativeEngine } from './native.js';
import { loadWasmEngine } from './wasm.js';

const forced = process.env.RSVELTE_OXLINT_ENGINE;

/** @type {{ lint(s: string, f: string): string, lint_rules(): string }} */
let binding;
/** @type {'native' | 'wasm'} */
let kind;

if (forced === 'wasm') {
	binding = await loadWasmEngine();
	kind = 'wasm';
} else if (forced === 'native') {
	const native = loadNativeEngine();
	if (!native) {
		throw new Error(
			'[@rsvelte/oxlint-plugin] RSVELTE_OXLINT_ENGINE=native was set, but no ' +
				'native @rsvelte/lint-<triple> binding could be loaded for this platform.',
		);
	}
	binding = native.binding;
	kind = 'native';
} else {
	const native = loadNativeEngine();
	if (native) {
		binding = native.binding;
		kind = 'native';
	} else {
		binding = await loadWasmEngine();
		kind = 'wasm';
	}
}

if (process.env.RSVELTE_OXLINT_DEBUG) {
	process.stderr.write(`[@rsvelte/oxlint-plugin] engine=${kind}\n`);
}

/** Which engine was selected: `'native'` or `'wasm'`. */
export const engineKind = kind;

/**
 * Lint a full `.svelte` source string, returning rsvelte's diagnostics.
 *
 * @param {string} source Full component source (markup + script + style).
 * @param {string} filename Absolute path, used for filename-aware rules.
 * @returns {Array<{severity:string,line:number,column:number,endLine:number,endColumn:number,code:string,message:string}>}
 */
export function lintSource(source, filename) {
	return JSON.parse(binding.lint(source, filename));
}

/**
 * The catalog of diagnostic ids rsvelte can emit.
 *
 * @returns {Array<{name:string,defaultSeverity:'off'|'warning'|'error',category:string,description:string}>}
 */
export function ruleCatalog() {
	return JSON.parse(binding.lint_rules());
}
