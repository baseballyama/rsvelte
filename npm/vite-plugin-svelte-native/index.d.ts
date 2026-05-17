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
	/** A standard SourceMap v3 JSON object. */
	map: unknown;
}

export interface CompileResultCss {
	code: string;
	/** A standard SourceMap v3 JSON object. */
	map: unknown;
	hasGlobal: boolean;
}

export interface CompileResult {
	js: CompileResultJs;
	css: CompileResultCss | null;
	warnings: Warning[];
	metadata: { runes?: boolean } & Record<string, unknown>;
	ast: unknown;
}

export function compile(source: string, options?: CompileOptions): CompileResult;
export function compileModule(
	source: string,
	options?: ModuleCompileOptions,
): CompileResult;

/**
 * Raw-transfer variant of {@link compile}: returns the same logical
 * shape but with `js.code` / `js.map` / `css.code` / `css.map` as raw
 * `Buffer`s. Avoids the V8 string copy and `serde_json` round-trip
 * the legacy {@link compile} pays on every call; callers lift to
 * `string` via `buf.toString('utf8')` only when they actually need it.
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
