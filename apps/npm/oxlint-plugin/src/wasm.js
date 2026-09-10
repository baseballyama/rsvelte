// WebAssembly engine loader (the fallback when the native `.node` is
// unavailable for the current platform).
//
// The @rsvelte/compiler bundle is wasm-pack `--target web`, whose default `init`
// is async (`fetch`); it also exposes a synchronous `initSync`, which we drive
// with the `.wasm` bytes read from disk. Loading is a one-time async `import()`
// + sync `initSync`; the returned binding then exposes `lint` / `lint_rules`
// synchronously, matching the native binding's shape.

import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';

const require = createRequire(import.meta.url);

// Resolve the playground export, with a local-build fallback for source checkouts.
function resolveCompiler() {
	try {
		return {
			jsUrl: pathToFileURL(require.resolve('@rsvelte/compiler/playground')).href,
			wasmPath: require.resolve('@rsvelte/compiler/playground/wasm'),
		};
	} catch {
		return {
			jsUrl: new URL('../../../../pkg-playground/rsvelte_lint.js', import.meta.url).href,
			wasmPath: fileURLToPath(new URL('../../../../pkg-playground/rsvelte_lint_bg.wasm', import.meta.url)),
		};
	}
}

/**
 * Initialise the wasm engine and return its binding.
 *
 * @returns {Promise<{ lint(s: string, f: string): string, lint_rules(): string }>}
 */
export async function loadWasmEngine() {
	const { jsUrl, wasmPath } = resolveCompiler();
	const compiler = await import(jsUrl);
	compiler.initSync({ module: readFileSync(wasmPath) });
	return { lint: compiler.lint, lint_rules: compiler.lint_rules };
}
