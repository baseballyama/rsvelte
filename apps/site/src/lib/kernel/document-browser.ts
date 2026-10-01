import initializeBrowserBindings, {
	renderDocument as renderDocumentJson,
	stringWidth,
	type InitInput
} from '$lib/wasm/kernel/rsvelte_kernel_browser.js';

export type TraceEvent =
	| { kind: 'group'; layoutInstructionIdentifier: number; position: number; remainingWidth: number; mode: 'flat' | 'break'; why: 'fits' | 'does-not-fit' | 'broken' | 'parent-flat' }
	| { kind: 'fill'; layoutInstructionIdentifier: number; position: number; contentFits: boolean; separatorFits: boolean | null }
	| { kind: 'refused'; layoutInstructionIdentifier: number; position: number }
	| { kind: 'remeasure'; position: number };

type ResultFields = {
	trace: TraceEvent[];
	origins: [number, number][];
};

export type RenderResult =
	| ({ ok: true; output: string } & ResultFields)
	| ({ ok: false; refused: true; message: string } & ResultFields)
	| ({ ok: false; refused: false; message: string; at: number } & ResultFields);

let initialized: Promise<void> | undefined;

export function initializeDocumentPrinter(input?: InitInput | Promise<InitInput>): Promise<void> {
	initialized ??= (input === undefined ? initializeBrowserBindings() : initializeBrowserBindings({ module_or_path: input })).then(() => undefined);
	return initialized;
}

export function renderDocument(source: string, width: number, tabs: boolean): RenderResult {
	return JSON.parse(renderDocumentJson(source, width, tabs)) as RenderResult;
}

export { stringWidth };
