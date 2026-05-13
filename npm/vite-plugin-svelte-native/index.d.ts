// Public surface of the rsvelte NAPI binding. Mirrors the `#[napi]` exports in
// `src/napi.rs`. All options/results are loosely typed via `unknown`/records to
// keep this file shim-friendly — the JS shim above can layer richer types over
// the boundary where they're actually consumed.

export interface CompileResult {
	js: { code: string; map: unknown };
	css: { code: string; map: unknown; hasGlobal: boolean } | null;
	warnings: unknown[];
	metadata: Record<string, unknown>;
	ast: unknown;
}

export function compile(source: string, options?: Record<string, unknown>): CompileResult;
export function compileModule(source: string, options?: Record<string, unknown>): CompileResult;

export interface Svelte2TsxResult {
	code: string;
	map: unknown;
	exportedNames: { props: string[]; all: string[] };
	events: Record<string, unknown>;
}
export function svelte2tsx(source: string, options?: Record<string, unknown>): Svelte2TsxResult;

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

export interface PreprocessGroup {
	markup?: (input: { content: string; filename?: string }) => unknown;
	script?: (input: {
		content: string;
		filename?: string;
		attributes: Record<string, unknown>;
	}) => unknown;
	style?: (input: {
		content: string;
		filename?: string;
		attributes: Record<string, unknown>;
	}) => unknown;
}

export function preprocess(
	source: string,
	groups: PreprocessGroup | PreprocessGroup[],
	options?: { filename?: string },
): Promise<{ code: string; map?: unknown; dependencies?: string[] }>;
