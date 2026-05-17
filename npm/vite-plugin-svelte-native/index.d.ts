// Public surface of the rsvelte NAPI binding. Mirrors the `#[napi]` exports in
// `src/napi.rs`. The structural types below match the upstream Svelte
// (`svelte/compiler`) names where they map cleanly, so consumers — including
// the `@rsvelte/vite-plugin-svelte` fork — can stay drop-in compatible with
// the official surface.

// ---------------------------------------------------------------------------
// Options
// ---------------------------------------------------------------------------

/**
 * Component compile options. Loosely follows `svelte/compiler#CompileOptions`.
 */
export interface CompileOptions {
	/** Enable dev mode (instrumentation, warnings, etc.). */
	dev?: boolean;
	/** Generate client- or server-side code, or skip codegen. */
	generate?: 'client' | 'server' | false;
	/** Source filename. Used in source maps and error frames. */
	filename?: string;
	/** Project root, used to compute relative source-map paths. */
	rootDir?: string;
	/** Component identifier hint. */
	name?: string;
	/** Compile as a custom element. */
	customElement?: boolean;
	/** Generate `accessors`. */
	accessors?: boolean;
	/** HTML namespace. */
	namespace?: 'html' | 'svg' | 'mathml';
	/** Hint that bindings are immutable. */
	immutable?: boolean;
	/** Output CSS injected into the bundle or as an external asset. */
	css?: 'injected' | 'external';
	/** Custom hash function for CSS scoping — currently honored as a string-mapper. */
	cssHash?: (args: {
		hash: (input: string) => string;
		css: string;
		name: string;
		filename: string | undefined;
	}) => string;
	/** Preserve HTML comments in output. */
	preserveComments?: boolean;
	/** Preserve whitespace in the template. */
	preserveWhitespace?: boolean;
	/** Force runes mode (`true`), legacy (`false`), or auto-detect (`undefined`). */
	runes?: boolean;
	/** Disclose the compiler version in the output banner. */
	discloseVersion?: boolean;
	/** Source-map options (forwarded through magic-string). */
	sourcemap?: object | string;
	/** Output JS filename for `file` in the JS source map. */
	outputFilename?: string;
	/** Output CSS filename for `file` in the CSS source map. */
	cssOutputFilename?: string;
	/** Enable HMR-friendly output (used by `@rsvelte/vite-plugin-svelte`). */
	hmr?: boolean;
	/** Emit the modern AST shape (default). */
	modernAst?: boolean;
	/** Filter compiler warnings. */
	warningFilter?: (warning: Warning) => boolean;
}

/**
 * Module compile options. Subset of {@link CompileOptions} that applies to
 * `.svelte.js` / `.svelte.ts` modules.
 */
export interface ModuleCompileOptions {
	dev?: boolean;
	generate?: 'client' | 'server' | false;
	filename?: string;
	rootDir?: string;
	warningFilter?: (warning: Warning) => boolean;
}

// ---------------------------------------------------------------------------
// Diagnostics
// ---------------------------------------------------------------------------

export interface SourcePosition {
	line: number;
	column: number;
	character: number;
}

/** Compiler warning matching `svelte/compiler#Warning`. */
export interface Warning {
	code: string;
	message: string;
	filename?: string;
	start?: SourcePosition;
	end?: SourcePosition;
	position?: [number, number];
	frame?: string;
}

// ---------------------------------------------------------------------------
// Compile result
// ---------------------------------------------------------------------------

export interface CompileResultJs {
	code: string;
	/**
	 * A standard SourceMap v3 JSON object. Accessing this triggers a
	 * one-time `JSON.parse` of the underlying envelope bytes. For
	 * callers that immediately re-serialize (writing to disk,
	 * sending over the wire) prefer {@link mapBytes} / {@link mapText}
	 * to skip the parse round-trip.
	 */
	map: unknown;
	/**
	 * Zero-copy `Buffer` / `Uint8Array` view over the raw sourcemap
	 * JSON bytes in the envelope. `null` if no map was produced. Stable
	 * for the lifetime of the parent `CompileResult` (becomes invalid
	 * once a `compileEnvelopeZeroCopy` buffer is GC'd).
	 */
	mapBytes: Buffer | Uint8Array | null;
	/** Raw sourcemap JSON as a string — no `JSON.parse`. `null` if no map. */
	mapText: string | null;
}

export interface CompileResultCss {
	code: string;
	/** See {@link CompileResultJs.map}. */
	map: unknown;
	mapBytes: Buffer | Uint8Array | null;
	mapText: string | null;
	hasGlobal: boolean;
}

export interface CompileResult {
	js: CompileResultJs;
	css: CompileResultCss | null;
	warnings: Warning[];
	metadata: { runes?: boolean } & Record<string, unknown>;
	ast: unknown;
}

/**
 * Compile a Svelte component. Internally goes through the raw-transfer
 * envelope (`compileEnvelope` + `decodeEnvelope`) so that heavy strings
 * (generated code, sourcemap JSON) are read out of the underlying
 * `Buffer` only when the caller touches `.code` / `.map`. The shape
 * matches `svelte/compiler#compile`.
 */
export function compile(source: string, options?: CompileOptions): CompileResult;
export function compileModule(
	source: string,
	options?: ModuleCompileOptions,
): CompileResult;

/**
 * Lower-level raw-transfer entry point. Returns a single `Buffer`
 * containing the entire compile result in the rsvelte envelope format
 * (see `src/napi_raw.rs`). Pair with {@link decodeEnvelope} to obtain
 * the legacy {@link CompileResult} shape; or pass the buffer through
 * worker `postMessage` (transferable) to avoid a copy.
 */
export function compileEnvelope(source: string, options?: CompileOptions): Buffer;
export function compileModuleEnvelope(
	source: string,
	options?: ModuleCompileOptions,
): Buffer;

/**
 * Zero-copy variant. Returns a `Buffer` view over `bumpalo` arena
 * memory rather than an owned `Vec<u8>` — no copy whatsoever at the
 * Rust↔JS boundary. The arena is freed when V8 garbage-collects the
 * Buffer, so the data stays valid for as long as JS holds a reference.
 *
 * Trade-offs vs {@link compileEnvelope}:
 *
 * - **Faster:** skips Rust's `Vec` allocation; pre-sized arena slice.
 * - **Limited transferability:** if you `postMessage` the buffer with
 *   `transfer:` between workers, V8 may need to detach the underlying
 *   storage. The arena finalizer only runs when V8 actually GCs the
 *   Buffer wrapper, so detach semantics are safe but may surprise
 *   callers used to `Buffer` semantics.
 */
export function compileEnvelopeZeroCopy(
	source: string,
	options?: CompileOptions,
): Buffer;
export function compileModuleEnvelopeZeroCopy(
	source: string,
	options?: ModuleCompileOptions,
): Buffer;

/** Decode a buffer produced by {@link compileEnvelope}. */
export function decodeEnvelope(buf: Buffer | Uint8Array): CompileResult;

/**
 * Single entry in a {@link compileBatch} worklist. `options` is
 * forwarded to the underlying compile as if you had called
 * `compile(source, options)`.
 */
export interface CompileBatchInput {
	source: string;
	options?: CompileOptions;
}

/**
 * Compile multiple Svelte components in one NAPI call. The Rust side
 * dispatches across rayon workers; the JS side gets one `Buffer`
 * back containing all N results. Per-entry failures surface as
 * `Error` instances at the corresponding slot — they don't abort
 * the rest of the batch.
 *
 * Use this when you'd otherwise loop `compile()` over many files
 * (Vite dev server, SSR pre-render). For one-off compiles the
 * per-call overhead of `compile()` is already small.
 */
export function compileBatch(
	inputs: CompileBatchInput[],
): Array<CompileResult | Error>;

/**
 * Lower-level entry point: returns the raw batch envelope as a single
 * `Buffer`. Pair with {@link decodeBatch} to obtain the same array
 * {@link compileBatch} would, or pass through worker `postMessage`.
 */
export function compileBatchRaw(inputs: CompileBatchInput[]): Buffer;

/** Decode a batch envelope produced by {@link compileBatchRaw}. */
export function decodeBatch(buf: Buffer | Uint8Array): Array<CompileResult | Error>;

/**
 * Async variant of {@link compile}. The Rust side runs on a libuv
 * worker thread; the JS thread stays free to handle other callbacks.
 * Returned `Promise<CompileResult>` resolves when the envelope has
 * been encoded and decoded.
 */
export function compileAsync(
	source: string,
	options?: CompileOptions,
): Promise<CompileResult>;

/** Async variant of {@link compileBatch}. */
export function compileBatchAsync(
	inputs: CompileBatchInput[],
): Promise<Array<CompileResult | Error>>;

/** Lower-level: returns `Promise<Buffer>` (the raw envelope). */
export function compileEnvelopeAsync(
	source: string,
	options?: CompileOptions,
): Promise<Buffer>;

/** Lower-level: returns `Promise<Buffer>` (the raw batch envelope). */
export function compileBatchAsyncRaw(inputs: CompileBatchInput[]): Promise<Buffer>;

/**
 * Step-1 variant of {@link compile}: returns the same shape but with
 * `js.code` / `js.map` / `css.code` / `css.map` as raw `Buffer`s. The
 * envelope path ({@link compile}) supersedes this for most callers; it
 * stays exported as an escape hatch for callers that want structured
 * access without the envelope decode.
 */
export interface CompileBuffersResult {
	js: { code: Buffer; map: Buffer | null };
	css: { code: Buffer; map: Buffer | null; hasGlobal: boolean } | null;
	warnings: Warning[];
	runes: boolean;
}
export function compileBuffers(
	source: string,
	options?: CompileOptions,
): CompileBuffersResult;
export function compileModuleBuffers(
	source: string,
	options?: ModuleCompileOptions,
): CompileBuffersResult;

/**
 * The legacy JSON-on-the-boundary path. Kept exported for parity tests
 * and as an escape hatch — production callers should use {@link compile}.
 */
export function compileLegacy(source: string, options?: CompileOptions): CompileResult;
export function compileModuleLegacy(
	source: string,
	options?: ModuleCompileOptions,
): CompileResult;

// ---------------------------------------------------------------------------
// svelte2tsx
// ---------------------------------------------------------------------------

export interface Svelte2TsxResult {
	code: string;
	map: unknown;
	exportedNames: { props: string[]; all: string[] };
	events: Record<string, unknown>;
}
export function svelte2tsx(
	source: string,
	options?: Record<string, unknown>,
): Svelte2TsxResult;

// ---------------------------------------------------------------------------
// HMR / resolver
// ---------------------------------------------------------------------------

export interface HmrDiff {
	change: 'hot-update' | 'full-reload' | 'unchanged';
	instanceChanged: boolean;
	moduleChanged: boolean;
}
export function hmrDiff(prev: string, curr: string): HmrDiff;

export function resolveId(
	importee: string,
	importer: string | null | undefined,
	options?: Record<string, unknown>,
): string | null;

// ---------------------------------------------------------------------------
// Preprocess
// ---------------------------------------------------------------------------

/** Options the preprocessor pipeline forwards to each callback. */
export interface MarkupPreprocessorOptions {
	content: string;
	filename?: string;
}

export interface PreprocessorOptions {
	content: string;
	filename?: string;
	attributes: Record<string, string | boolean>;
	markup?: string;
}

/** Result returned by a preprocessor callback. `undefined`/`null` is a no-op. */
export interface Processed {
	code: string;
	map?: string | object;
	dependencies?: string[];
	attributes?: Record<string, string | boolean>;
	toString?: () => string;
}

export type MarkupPreprocessor = (
	options: MarkupPreprocessorOptions,
) => Processed | void | null | undefined | Promise<Processed | void | null | undefined>;

export type Preprocessor = (
	options: PreprocessorOptions,
) => Processed | void | null | undefined | Promise<Processed | void | null | undefined>;

export interface PreprocessorGroup {
	name?: string;
	markup?: MarkupPreprocessor;
	script?: Preprocessor;
	style?: Preprocessor;
}

/**
 * Run the preprocessor pipeline. Accepts a single group or an array of
 * groups, matching the upstream `svelte/compiler#preprocess` contract.
 */
export function preprocess(
	source: string,
	groups: PreprocessorGroup | PreprocessorGroup[],
	options?: { filename?: string },
): Promise<Processed>;

// ---------------------------------------------------------------------------
// Version
// ---------------------------------------------------------------------------

/**
 * Upstream Svelte version this binding emits code for. Consumers (the
 * `@rsvelte/vite-plugin-svelte` fork, etc.) use this for feature
 * detection (`gte(VERSION, '5.36.0')`), so it follows the *upstream*
 * Svelte semver — not the rsvelte version.
 */
export const VERSION: string;
