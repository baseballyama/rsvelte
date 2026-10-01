import { runPipeline as runPipelineJson } from '$lib/wasm/kernel/rsvelte_kernel_browser.js';
export { initializeDocumentPrinter as initializePipeline } from './document-browser';

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
	diagnostics: { code: string; message: string; severity: 'error' | 'warning'; line: number; column: number }[];
};

export type PipelineResult =
	| { ok: true; registeredTasks: string[]; steps: PipelineStep[] }
	| { ok: false; message: string };

export function runPipeline(request: PipelineRequest): PipelineResult {
	return JSON.parse(runPipelineJson(
		request.source,
		request.filename,
		request.plugins.join(','),
		request.operations.join(','),
		request.shared
	)) as PipelineResult;
}
