// Resolve the rsvelte NAPI binding for the current platform and re-export it.
// Mirrors the loader pattern napi-rs generates: resolve a platform-specific
// dependency that ships a single `rsvelte.node` artifact.

const { decodeEnvelope, decodeBatch } = require('./envelope.js');

const { platform, arch } = process;

function resolveTriple() {
	if (platform === 'darwin') {
		if (arch === 'arm64') return 'darwin-arm64';
		if (arch === 'x64') return 'darwin-x64';
	} else if (platform === 'linux') {
		// Node 18+ exposes the runtime glibc version in the report header. An
		// empty value means we're on musl (Alpine, distroless, etc.).
		let isMusl = false;
		try {
			const header = process.report.getReport().header;
			isMusl = !header.glibcVersionRuntime;
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
	throw new Error(
		`[@rsvelte/vite-plugin-svelte-native] Unsupported platform: ${platform}-${arch}. ` +
			`Open an issue at https://github.com/baseballyama/rsvelte/issues if you'd like it supported.`,
	);
}

const pkgName = `@rsvelte/vite-plugin-svelte-native-${triple}`;
let binding;
try {
	binding = require(`${pkgName}/rsvelte.node`);
} catch (err) {
	throw new Error(
		`[@rsvelte/vite-plugin-svelte-native] Couldn't load the native binding "${pkgName}".\n` +
			`This usually means npm/pnpm skipped the optional dependency for your platform.\n` +
			`Try reinstalling: npm install --include=optional ${pkgName}\n\n` +
			`Original error: ${err.message}`,
	);
}

// `compile` / `compileModule` are wrapped to route through the
// raw-transfer envelope (`compileEnvelope`): the Rust side hands us
// one `Buffer`, the JS side lazy-decodes only the fields the caller
// reads. This avoids the V8 string copy + `serde_json` round-trip
// that the legacy JSON path pays for every call.
//
// Callers that need the raw envelope (e.g. to ship it across a worker
// boundary without re-encoding) can still grab `binding.compileEnvelope`
// directly. The legacy JSON path is preserved as `compileLegacy` for
// parity testing and as an escape hatch.
function compile(source, options) {
	return decodeEnvelope(binding.compileEnvelope(source, options));
}

function compileModule(source, options) {
	return decodeEnvelope(binding.compileModuleEnvelope(source, options));
}

// `compileBatch([{source, options}, …])` compiles N files in
// parallel (rayon on the Rust side) and crosses the NAPI boundary
// exactly once. The returned array is the same length as the input;
// each slot is either a `CompileResult` or an `Error` (parse
// failures don't abort the whole batch).
function compileBatch(inputs) {
	return decodeBatch(binding.compileBatch(inputs));
}

// Re-export every NAPI function as its own named binding so node's
// `cjs-module-lexer` can pick them up when this file is imported via
// ESM (e.g. `import { compile, preprocess, VERSION } from …`). A bare
// `module.exports = binding` would only expose the default export
// reliably; explicit `module.exports.X = …` lines are what the lexer
// scans for.
//
// The static list mirrors `src/napi.rs`'s `#[napi(js_name = ...)]`
// attributes — keep it in sync when adding/removing NAPI exports.
module.exports.compile = compile;
module.exports.compileModule = compileModule;
module.exports.compileLegacy = binding.compile;
module.exports.compileModuleLegacy = binding.compileModule;
module.exports.compileEnvelope = binding.compileEnvelope;
module.exports.compileModuleEnvelope = binding.compileModuleEnvelope;
// Zero-copy variants: same envelope format, but the returned Buffer
// is a view into bumpalo arena memory (no Vec copy). Use these when
// you know the buffer will be consumed once and discarded — the
// arena is freed when the Buffer is GC'd. For long-lived buffers
// passed across worker boundaries, prefer `compileEnvelope` which
// hands you an owned Vec.
module.exports.compileEnvelopeZeroCopy = binding.compileEnvelopeZeroCopy;
module.exports.compileModuleEnvelopeZeroCopy = binding.compileModuleEnvelopeZeroCopy;
module.exports.compileBuffers = binding.compileBuffers;
module.exports.compileModuleBuffers = binding.compileModuleBuffers;
module.exports.compileBatch = compileBatch;
module.exports.compileBatchRaw = binding.compileBatch;
module.exports.decodeEnvelope = decodeEnvelope;
module.exports.decodeBatch = decodeBatch;
module.exports.preprocess = binding.preprocess;
module.exports.svelte2tsx = binding.svelte2tsx;
module.exports.hmrDiff = binding.hmrDiff;
module.exports.resolveId = binding.resolveId;
// Upstream Svelte version this binding emits code for — used by
// downstream consumers (the `@rsvelte/vite-plugin-svelte` fork, etc.)
// for `gte(VERSION, '5.36.0')`-style feature detection. Synced
// manually against `submodules/svelte/packages/svelte/package.json`.
module.exports.VERSION = '5.51.3';
