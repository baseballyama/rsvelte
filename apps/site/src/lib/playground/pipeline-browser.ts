import initializeBrowserBindings, {
	runPipeline as runPipelineJson,
	type InitInput,
} from '#generated/wasm/kernel/rsvelte_browser.js';

export type PipelineRequest = {
	source: string;
	filename: string;
	plugins: string[];
	operations: string[];
	shared: boolean;
};

export type PipelineStep = {
	id: string;
	accesses: { name: string; cached: boolean }[];
	artifacts: { name: string; text: string }[];
	files: { name: string; text: string }[];
	diagnostics: {
		code: string;
		message: string;
		severity: 'error' | 'warning';
		line: number;
		column: number;
	}[];
};

export type PipelineResult =
	| { ok: true; registeredTasks: string[]; steps: PipelineStep[] }
	| { ok: false; message: string };

export function runPipeline(request: PipelineRequest): PipelineResult {
	return JSON.parse(
		runPipelineJson(
			request.source,
			request.filename,
			request.plugins.join(','),
			request.operations.join(','),
			request.shared,
		),
	) as PipelineResult;
}

let initialized: Promise<void> | undefined;

export function initializePipeline(input?: InitInput | Promise<InitInput>): Promise<void> {
	initialized ??= (
		input === undefined
			? initializeBrowserBindings()
			: initializeBrowserBindings({ module_or_path: input })
	).then(() => undefined);
	return initialized;
}
