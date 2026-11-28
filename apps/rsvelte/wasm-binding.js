// The compiler of the WebAssembly module, as the Node.js addon's: its functions return what the
// addon returns, with the reports as JSON.

/**
 * @typedef {{
 *   version(): string,
 *   compile(source: string, filename?: unknown, generate?: unknown, preserveWhitespace?: unknown): string,
 *   compileModule(source: string, filename?: unknown, generate?: unknown): string,
 *   parse(source: string): { ast?: string, error?: string, free(): void },
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
		parse(source) {
			const parsed = wasm.parse(source);
			try {
				return { ast: parsed.ast, error: parsed.error && JSON.parse(parsed.error) };
			} finally {
				parsed.free();
			}
		},
	};
}
