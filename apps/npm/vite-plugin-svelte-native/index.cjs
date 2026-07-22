// Resolve the rsvelte NAPI binding for the current platform and re-export it.
// Mirrors the loader pattern napi-rs generates: resolve a platform-specific
// dependency that ships a single `rsvelte.node` artifact.

const { decodeEnvelope, decodeBatch } = require('./envelope.js');
const { decodeParseEnvelope } = require('./parse-envelope.js');

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

// Resolve the function-form compile options the NAPI boundary can't accept:
// evaluate `customElement`/`css`/`runes` (`({ filename }) => value`) once and hand
// the plain value to Rust, and return any `warningFilter` for the caller to
// post-filter the warnings array (warnings never affect codegen, so post-filtering
// equals Svelte's emit-time filter). A dynamic `cssHash` uses the callback bridge
// (`compileWithCssHash`); constant hashes go through `cssHashOverride`. When no
// field is a function the original object is returned as-is.
function prepareCompileOptions(options) {
	if (options == null) return { options, warningFilter: undefined };
	const { customElement, css, runes, warningFilter } = options;
	const hasParametric =
		typeof customElement === 'function' ||
		typeof css === 'function' ||
		typeof runes === 'function';
	const hasWarningFilter = typeof warningFilter === 'function';
	if (!hasParametric && !hasWarningFilter) {
		return { options, warningFilter: undefined };
	}
	// Svelte defaults `filename` to '(unknown)' before invoking these functions.
	const meta = { filename: options.filename ?? '(unknown)' };
	const resolved = { ...options };
	if (typeof customElement === 'function') resolved.customElement = customElement(meta);
	if (typeof css === 'function') resolved.css = css(meta);
	if (typeof runes === 'function') resolved.runes = runes(meta);
	if (hasWarningFilter) delete resolved.warningFilter;
	return { options: resolved, warningFilter: hasWarningFilter ? warningFilter : undefined };
}

// Port of Svelte's `hash()` (submodules/svelte/packages/svelte/src/utils.js) —
// handed verbatim to a user `cssHash` callback as its `hash` argument so custom
// scope-class functions produce the same digest as upstream Svelte.
const regexReturnCharacters = /\r/g;
function hash(str) {
	str = str.replace(regexReturnCharacters, '');
	let h = 5381;
	let i = str.length;
	while (i--) h = ((h << 5) - h) ^ str.charCodeAt(i);
	return (h >>> 0).toString(36);
}

// Wrap a user `cssHash({ hash, css, name, filename }) => string` into the
// `(name, filename, css) => Promise<string | null>` shape the NAPI callback
// bridge expects. It must never reject: a rejected Promise crossing the NAPI
// boundary can crash V8 during threadsafe-function teardown, so recoverable
// failures resolve to `null` (Rust then falls back to the default hash).
function makeCssHashCallback(userCssHash) {
	return async (name, filename, css) => {
		try {
			const result = await userCssHash({
				hash,
				css,
				name,
				filename: filename === '(unknown)' ? undefined : filename,
			});
			return typeof result === 'string' ? result : null;
		} catch {
			return null;
		}
	};
}

function applyWarningFilter(result, warningFilter) {
	if (!warningFilter || result == null) return result;
	const warnings = result.warnings;
	if (Array.isArray(warnings) && warnings.length) {
		// `warnings` is a lazy getter on the envelope-decoded result; redefine it
		// as a plain data property so the filtered array replaces the accessor.
		Object.defineProperty(result, 'warnings', {
			value: warnings.filter((warning) => warningFilter(warning)),
			writable: true,
			enumerable: true,
			configurable: true,
		});
	}
	return result;
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
	if (typeof options?.cssHash === 'function') {
		// A dynamic cssHash depends on the component's CSS, so it needs the
		// Rust→JS callback bridge, which can't run on the synchronous path
		// without deadlocking the JS event loop. Direct the caller to the async
		// entry instead of silently dropping the option.
		throw new Error(
			'[@rsvelte/vite-plugin-svelte-native] A dynamic `cssHash` function requires the async compile path; call `compileAsync(source, options)` instead. (A constant hash can use `cssHashOverride`.)',
		);
	}
	const { options: resolved, warningFilter } = prepareCompileOptions(options);
	return applyWarningFilter(decodeEnvelope(binding.compileEnvelope(source, resolved)), warningFilter);
}

function compileModule(source, options) {
	const { options: resolved, warningFilter } = prepareCompileOptions(options);
	return applyWarningFilter(
		decodeEnvelope(binding.compileModuleEnvelope(source, resolved)),
		warningFilter,
	);
}

// `compileBatch([{source, options}, …])` compiles N files in
// parallel (rayon on the Rust side) and crosses the NAPI boundary
// exactly once. The returned array is the same length as the input;
// each slot is either a `CompileResult` or an `Error` (parse
// failures don't abort the whole batch).
function compileBatch(inputs) {
	const filters = [];
	const prepared = inputs.map((input, i) => {
		const { options, warningFilter } = prepareCompileOptions(input.options);
		if (warningFilter) filters[i] = warningFilter;
		return options === input.options ? input : { source: input.source, options };
	});
	const results = decodeBatch(binding.compileBatch(prepared));
	if (filters.length) {
		results.forEach((result, i) => applyWarningFilter(result, filters[i]));
	}
	return results;
}

// `compileAsync` / `compileBatchAsync` release the JS event loop
// while the Rust side compiles on a libuv worker thread. Useful
// for plugins that interleave compilation with other async work
// (Vite middleware, SSR pre-render) — the await yields control
// instead of blocking V8.
async function compileAsync(source, options) {
	const { options: resolved, warningFilter } = prepareCompileOptions(options);
	if (typeof options?.cssHash === 'function') {
		// Bridge the dynamic cssHash through the async NAPI entry. It returns the
		// plain (JSON) CompileResult shape rather than an envelope.
		const result = await binding.compileWithCssHash(
			source,
			resolved,
			makeCssHashCallback(options.cssHash),
		);
		return applyWarningFilter(result, warningFilter);
	}
	return applyWarningFilter(
		decodeEnvelope(await binding.compileEnvelopeAsync(source, resolved)),
		warningFilter,
	);
}

async function compileBatchAsync(inputs) {
	const filters = [];
	const prepared = inputs.map((input, i) => {
		const { options, warningFilter } = prepareCompileOptions(input.options);
		if (warningFilter) filters[i] = warningFilter;
		return options === input.options ? input : { source: input.source, options };
	});
	const results = decodeBatch(await binding.compileBatchAsync(prepared));
	if (filters.length) {
		results.forEach((result, i) => applyWarningFilter(result, filters[i]));
	}
	return results;
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
module.exports.compileAsync = compileAsync;
module.exports.compileBatchAsync = compileBatchAsync;
module.exports.compileEnvelopeAsync = binding.compileEnvelopeAsync;
module.exports.compileBatchAsyncRaw = binding.compileBatchAsync;
module.exports.decodeEnvelope = decodeEnvelope;
module.exports.decodeBatch = decodeBatch;
module.exports.preprocess = binding.preprocess;
module.exports.svelte2tsx = binding.svelte2tsx;
module.exports.hmrDiff = binding.hmrDiff;
module.exports.resolveId = binding.resolveId;
// Standalone parse surfaces. `parse` returns a JSON string (decode with
// `JSON.parse`); `parseEnvelope` returns the raw-transfer Buffer that skips
// `JSON.parse` entirely — decode it with `decodeParseEnvelope` (re-exported
// below). Both mirror `src/napi.rs`'s `#[napi(js_name = "parse"/"parseEnvelope")]`.
module.exports.parse = binding.parse;
module.exports.parseEnvelope = binding.parseEnvelope;
module.exports.decodeParseEnvelope = decodeParseEnvelope;
// Upstream Svelte version this binding emits code for — used by
// downstream consumers (the `@rsvelte/vite-plugin-svelte` fork, etc.)
// for `gte(VERSION, '5.36.0')`-style feature detection. Kept in sync
// with `submodules/svelte/packages/svelte/package.json` by hand; run
// `node scripts/dev/check-vps-version.mjs` (also wired into CI) to
// catch drift.
module.exports.VERSION = '5.56.4';
