export interface Svelte2TsxOptions {
	filename?: string;
	isTsFile?: boolean;
	mode?: 'ts' | 'dts';
	accessors?: boolean;
	namespace?: 'html' | 'svg' | 'mathml';
	version?: '4' | '5';
}

/**
 * The source map returned alongside the generated code. Mirrors the object
 * produced by magic-string's `SourceMap` (the shape upstream `svelte2tsx`
 * returns): the standard v3 fields plus `toString()` / `toUrl()`.
 */
export interface SourceMap {
	version: number;
	file?: string;
	sources: string[];
	sourcesContent?: (string | null)[];
	names: string[];
	/** VLQ-encoded mappings string. */
	mappings: string;
	toString(): string;
	toUrl(): string;
}

/**
 * Names exported from the component. Upstream exposes only `has(name)`; the
 * `props` / `all` arrays are a backward-compatible rsvelte extension.
 */
export interface IExportedNames {
	has(name: string): boolean;
	/** rsvelte extension: exported names that are component props, sorted. */
	props: string[];
	/** rsvelte extension: every exported name, sorted. */
	all: string[];
}

export interface ComponentEvent {
	name: string;
	type: string;
	doc?: string;
}

/**
 * @deprecated Use TypeScript's `TypeChecker` to get the type information
 * instead. This only covers literal typings.
 */
export interface ComponentEvents {
	getAll(): ComponentEvent[];
}

export interface Svelte2TsxResult {
	code: string;
	map: SourceMap | null;
	exportedNames: IExportedNames;
	/**
	 * @deprecated Use TypeScript's `TypeChecker` to get the type information
	 * instead. This only covers literal typings.
	 */
	events: ComponentEvents;
}

/**
 * Convert a Svelte component to TypeScript/TSX.
 *
 * Synchronous, matching the upstream `svelte2tsx` signature. On Node the
 * WebAssembly module self-initialises on first call. In environments without a
 * synchronous filesystem (browsers, bundlers), call `await initialize()` once
 * beforehand.
 */
export function svelte2tsx(source: string, options?: Svelte2TsxOptions): Svelte2TsxResult;

/**
 * Pre-load and initialise the WebAssembly module.
 *
 * Optional on Node (`svelte2tsx()` self-initialises there). For browsers or
 * bundlers without `node:fs`, `await initialize(input)` once — passing the wasm
 * bytes or a compiled `WebAssembly.Module` — after which `svelte2tsx()` can be
 * called synchronously.
 */
export function initialize(input?: unknown): Promise<void>;

export default svelte2tsx;
