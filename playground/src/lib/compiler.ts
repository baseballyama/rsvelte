import type { ParseResultWasm, CompileResultWasm } from '../../../pkg/svelte_compiler_rust';

let wasmModule: typeof import('../../../pkg/svelte_compiler_rust') | null = null;
let initPromise: Promise<void> | null = null;

export async function initCompiler(): Promise<void> {
	if (wasmModule) return;
	if (initPromise) return initPromise;

	initPromise = (async () => {
		const wasm = await import('../../../pkg/svelte_compiler_rust');
		await wasm.default();
		wasmModule = wasm;
	})();

	return initPromise;
}

export function getVersion(): string {
	if (!wasmModule) throw new Error('WASM not initialized');
	return wasmModule.version();
}

export function parse(source: string): ParseResultWasm {
	if (!wasmModule) throw new Error('WASM not initialized');
	return wasmModule.parse_svelte(source);
}

export function compileClient(source: string, name: string): CompileResultWasm {
	if (!wasmModule) throw new Error('WASM not initialized');
	return wasmModule.compile_client(source, name);
}

export function compileServer(source: string, name: string): CompileResultWasm {
	if (!wasmModule) throw new Error('WASM not initialized');
	return wasmModule.compile_server(source, name);
}

export type CompileMode = 'client' | 'server';
export type OutputTab = 'js' | 'css' | 'ast';

export interface CompileStats {
	compileTime: number;
	outputSize: number;
}
