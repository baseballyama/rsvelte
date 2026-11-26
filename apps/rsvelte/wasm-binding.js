// The compiler of the WebAssembly module, as the Node.js addon's: its functions return the
// addon's outcome as JSON.

/**
 * @typedef {{
 *   version(): string,
 *   compile(source: string, filename?: unknown, generate?: unknown, preserveWhitespace?: unknown): string,
 *   compileModule(source: string, filename?: unknown, generate?: unknown): string,
 * }} Module
 */

/**
 * @param {Module} wasm
 * @returns {import('./compiler-api.js').Compiler}
 */
export function wasmBinding(wasm) {
	return {
		VERSION: wasm.version(),
		compile: (source, { filename, generate, preserveWhitespace }) =>
			JSON.parse(wasm.compile(source, filename, generate, preserveWhitespace)),
		compileModule: (source, { filename, generate }) =>
			JSON.parse(wasm.compileModule(source, filename, generate)),
	};
}
