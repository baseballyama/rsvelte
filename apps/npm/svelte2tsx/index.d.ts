export interface Svelte2TsxOptions {
	filename?: string;
	isTsFile?: boolean;
	mode?: 'ts' | 'dts';
	accessors?: boolean;
	namespace?: 'html' | 'svg' | 'mathml';
	version?: '4' | '5';
}

export interface Svelte2TsxResult {
	code: string;
	map: string | null;
	exportedNames: {
		props: string[];
		all: string[];
	};
	events: Record<string, unknown>;
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
