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

// Prefer the published `@rsvelte/compiler` dependency; fall back to this repo's
// in-place wasm build at `/pkg` so the plugin runs from a source checkout (and
// this repo's own E2E test) without a publish/link step. The wasm bytes come
// from the package's stable `./wasm` subpath, which never names the internal
// build crate (wasm-pack names its artifacts `rsvelte_lint_*`, but that is not a
// contract) — so this keeps resolving across crate renames.
function resolveCompiler() {
	try {
		return {
			jsUrl: pathToFileURL(require.resolve('@rsvelte/compiler')).href,
			wasmPath: require.resolve('@rsvelte/compiler/wasm'),
		};
	} catch {
		return {
			jsUrl: new URL('../../../../pkg/rsvelte_lint.js', import.meta.url).href,
			wasmPath: fileURLToPath(new URL('../../../../pkg/rsvelte_lint_bg.wasm', import.meta.url)),
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
