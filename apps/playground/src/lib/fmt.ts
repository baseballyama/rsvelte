// Lazy loader for the formatter WASM module (built from `crates/rsvelte_fmt_wasm`
// into `pkg-fmt/`). Kept separate from `compiler.ts` because it is a distinct
// wasm binary, loaded on demand only when the `fmt` playground tool is opened.

let fmtModule: typeof import('../../../../pkg-fmt/rsvelte_fmt_wasm') | null = null;
let initPromise: Promise<void> | null = null;

export interface FmtOptions {
	useTabs?: boolean;
	tabWidth?: number;
	printWidth?: number;
}

export interface FmtResult {
	success: boolean;
	code?: string;
	error?: string;
}

export async function initFmt(): Promise<void> {
	if (fmtModule) return;
	if (initPromise) return initPromise;

	initPromise = (async () => {
		const wasm = await import('../../../../pkg-fmt/rsvelte_fmt_wasm');
		await wasm.default();
		fmtModule = wasm;
	})();

	return initPromise;
}

export function getFmtVersion(): string {
	if (!fmtModule) throw new Error('fmt WASM not initialized');
	return fmtModule.version();
}

/**
 * Format a `.svelte` source string. `<style>` bodies survive verbatim — the
 * CLI formats them via a native `oxfmt` subprocess that can't run in a browser.
 */
export function formatSvelte(source: string, options: FmtOptions = {}): FmtResult {
	if (!fmtModule) throw new Error('fmt WASM not initialized');
	const raw = fmtModule.format_svelte(source, JSON.stringify(options));
	try {
		return JSON.parse(raw) as FmtResult;
	} catch {
		return { success: false, error: raw };
	}
}
