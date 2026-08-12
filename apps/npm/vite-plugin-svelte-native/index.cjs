// Resolve the rsvelte NAPI binding for the current platform and re-export it.
// Mirrors the loader pattern napi-rs generates: resolve a platform-specific
// dependency that ships a single `rsvelte.node` artifact.

const { decodeEnvelope, decodeBatch } = require('./envelope.js');
const { decodeParseEnvelope } = require('./parse-envelope.js');
const { resolveTriple } = require('./platform.cjs');

const { platform, arch } = process;

const triple = resolveTriple(process);
if (!triple) {
	const muslHint = platform === 'linux' ? ' (musl/Alpine is not yet supported)' : '';
	throw new Error(
		`[@rsvelte/vite-plugin-svelte-native] Unsupported platform: ${platform}-${arch}${muslHint}. ` +
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

// The NAPI boundary can't accept function values, so resolve them here: evaluate
// `customElement`/`css`/`runes` and hand back `warningFilter` for the caller to
// post-filter warnings (which never affect codegen).
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

// Port of Svelte's `hash()` (submodules/svelte/packages/svelte/src/utils.js),
// handed to a user `cssHash` callback so custom scope classes match upstream's digest.
const regexReturnCharacters = /\r/g;
function hash(str) {
	str = str.replace(regexReturnCharacters, '');
	let h = 5381;
	let i = str.length;
	while (i--) h = ((h << 5) - h) ^ str.charCodeAt(i);
	return (h >>> 0).toString(36);
}

// Adapt a user `cssHash` to the bridge shape. It must never reject: a rejected
// Promise crossing the NAPI boundary can crash V8 during threadsafe-function
// teardown — so a throw becomes `{ error }` (Rust turns it into a compile failure)
// and a non-string return becomes `{ value: null }` (Rust falls back to the default hash).
function makeCssHashCallback(userCssHash) {
	return async (name, filename, css) => {
		try {
			const result = await userCssHash({ hash, css, name, filename });
			return { value: typeof result === 'string' ? result : null };
		} catch (err) {
			return { error: err instanceof Error ? err.message : String(err) };
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
// raw-transfer envelope: the Rust side hands us
// one `Buffer`, the JS side lazy-decodes only the fields the caller
// reads. This avoids the V8 string copy + `serde_json` round-trip
// that the legacy JSON path pays for every call. The wrapper-only
// native entry points leave `sourcesContent` external so the source
// already owned by JavaScript is not copied into the envelope.
//
// Callers that need the raw envelope (e.g. to ship it across a worker
// boundary without re-encoding) can still grab `binding.compileEnvelope`
// directly, except with modernAst: the v1 envelope has no AST field.
// The legacy JSON path is preserved as `compileLegacy` for parity testing
// and as an escape hatch.
function compile(source, options) {
	if (typeof options?.cssHash === 'function') {
		// A dynamic cssHash needs the Rust→JS callback bridge, which would deadlock
		// the JS event loop on the sync path; direct the caller to `compileAsync`.
		throw new Error(
			'[@rsvelte/vite-plugin-svelte-native] A dynamic `cssHash` function requires the async compile path; call `compileAsync(source, options)` instead. (A constant hash can use `cssHashOverride`.)',
		);
	}
	const { options: resolved, warningFilter } = prepareCompileOptions(options);
	if (resolved?.modernAst) {
		return applyWarningFilter(binding.compile(source, resolved), warningFilter);
	}
	return applyWarningFilter(
		decodeEnvelope(binding.compileEnvelopeExternalSources(source, resolved), source),
		warningFilter,
	);
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
// Batch compilation runs on rayon workers with no JS event loop to service the
// callback, so a dynamic cssHash can't be bridged here — reject it rather than drop it.
function assertNoDynamicCssHash(options) {
	if (typeof options?.cssHash === 'function') {
		throw new Error(
			'[@rsvelte/vite-plugin-svelte-native] A dynamic `cssHash` function is not supported in compileBatch; compile such files individually with `compileAsync`.',
		);
	}
}

function compileBatch(inputs) {
	const filters = [];
	const prepared = inputs.map((input, i) => {
		assertNoDynamicCssHash(input.options);
		const { options, warningFilter } = prepareCompileOptions(input.options);
		if (warningFilter) filters[i] = warningFilter;
		return options === input.options ? input : { source: input.source, options };
	});
	if (prepared.some((input) => input.options?.modernAst)) {
		return prepared.map((input, i) =>
			applyWarningFilter(binding.compile(input.source, input.options), filters[i]),
		);
	}
	const sourceContents = prepared.map((input) => input.source);
	const results = decodeBatch(
		binding.compileBatchExternalSources(prepared),
		sourceContents,
	);
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
		// The bridge entry returns a plain (JSON) CompileResult, not an envelope.
		const result = await binding.compileWithCssHash(
			source,
			resolved,
			makeCssHashCallback(options.cssHash),
		);
		return applyWarningFilter(result, warningFilter);
	}
	if (resolved?.modernAst) {
		return applyWarningFilter(binding.compile(source, resolved), warningFilter);
	}
	return applyWarningFilter(
		decodeEnvelope(
			await binding.compileEnvelopeExternalSourcesAsync(source, resolved),
			source,
		),
		warningFilter,
	);
}

async function compileBatchAsync(inputs) {
	const filters = [];
	const prepared = inputs.map((input, i) => {
		assertNoDynamicCssHash(input.options);
		const { options, warningFilter } = prepareCompileOptions(input.options);
		if (warningFilter) filters[i] = warningFilter;
		return options === input.options ? input : { source: input.source, options };
	});
	if (prepared.some((input) => input.options?.modernAst)) {
		return prepared.map((input, i) =>
			applyWarningFilter(binding.compile(input.source, input.options), filters[i]),
		);
	}
	const sourceContents = prepared.map((input) => input.source);
	const results = decodeBatch(
		await binding.compileBatchExternalSourcesAsync(prepared),
		sourceContents,
	);
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
module.exports.buildInfo = binding.buildInfo;
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
module.exports.VERSION = '5.56.8';
