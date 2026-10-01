import initWasm, {
	renderDoc as renderDocJson,
	stringWidth,
	type InitInput
} from '$lib/wasm/kernel/rsv_kernel_wasm.js';

export type TraceEvent =
	| { kind: 'group'; doc: number; pos: number; rem: number; mode: 'flat' | 'break'; why: 'fits' | 'does-not-fit' | 'broken' | 'parent-flat' }
	| { kind: 'fill'; doc: number; pos: number; contentFits: boolean; separatorFits: boolean | null }
	| { kind: 'refused'; doc: number; pos: number }
	| { kind: 'remeasure'; pos: number };

type ResultFields = {
	trace: TraceEvent[];
	origins: [number, number][];
};

export type RenderResult =
	| ({ ok: true; out: string } & ResultFields)
	| ({ ok: false; refused: true; message: string } & ResultFields)
	| ({ ok: false; refused: false; message: string; at: number } & ResultFields);

let initialized: Promise<void> | undefined;

export function initializeDocWasm(input?: InitInput | Promise<InitInput>): Promise<void> {
	initialized ??= (input === undefined ? initWasm() : initWasm({ module_or_path: input })).then(() => undefined);
	return initialized;
}

export function renderDoc(source: string, width: number, tabs: boolean): RenderResult {
	return JSON.parse(renderDocJson(source, width, tabs)) as RenderResult;
}

export { stringWidth };
