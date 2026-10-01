import { readFile } from 'node:fs/promises';
import { beforeAll, describe, expect, it } from 'vitest';
import { initializePipeline, runPipeline, type PipelineRequest, type PipelineStep } from './pipeline-browser';
import { accessSummary, computationCount, examples } from './pipeline-playground';

beforeAll(async () => {
	await initializePipeline(await readFile(new URL('../wasm/kernel/rsvelte_kernel_browser_bg.wasm', import.meta.url)));
});

function request(id = 'svelte'): PipelineRequest {
	const example = examples.find((item) => item.id === id)!;
	return {
		source: example.source, filename: example.filename,
		plugins: ['svelte', 'vue', 'svue'], operations: ['compile-client', 'format', 'lint'], shared: true
	};
}

function steps(input: PipelineRequest) {
	const result = runPipeline(input);
	expect(result.ok).toBe(true);
	if (!result.ok) throw new Error(result.message);
	return result.steps;
}

describe('language plugins through the real Rust pipeline in WebAssembly', () => {
	it.each(examples)('compiles the $id example with the matching plugin', (example) => {
		const result = steps(request(example.id));
		expect(result.length).toBeGreaterThan(0);
		expect(result.every((step) => step.id.startsWith(example.plugin + '.'))).toBe(true);
		const compiled = result.find((step) => step.id.includes('.compile/'))!;
		expect(compiled.files.some((file) => file.name === 'js' && file.text.length > 0)).toBe(true);
		expect(compiled.diagnostics).toEqual([]);
		expect(compiled.artifacts.length).toBeGreaterThan(0);
	});

	it('does not run removed plugins, mismatching plugins, or an empty operation list', () => {
		const input = request();
		expect(steps({ ...input, plugins: [] })).toEqual([]);
		expect(steps({ ...input, plugins: ['vue'] })).toEqual([]);
		expect(steps({ ...input, operations: [] })).toEqual([]);
		expect(steps({ ...input, plugins: ['svelte'] }).map((step) => step.id))
			.toEqual(steps(input).map((step) => step.id));
	});

	it('computes only the artifacts needed by the selected task', () => {
		const result = steps({ ...request(), operations: ['format'] });
		expect(result.map((step) => step.id)).toEqual(['svelte.format/default']);
		expect(result[0].artifacts.map((artifact) => artifact.name)).toEqual(['svelte.parse']);
	});

	it('shares parsing between tasks without changing their outputs', () => {
		const shared = steps(request());
		const isolated = steps({ ...request(), shared: false });
		expect(computationCount(shared, 'svelte.parse')).toBe(1);
		expect(computationCount(isolated, 'svelte.parse')).toBe(shared.length);
		expect(shared[1].accesses).toContainEqual({ name: 'svelte.parse', cached: true });
		expect(shared.map(({ id, files, diagnostics }) => ({ id, files, diagnostics })))
			.toEqual(isolated.map(({ id, files, diagnostics }) => ({ id, files, diagnostics })));
	});

	it('reads Vue syntax and translates it to the Svelte compiler representation', () => {
		const result = steps(request('svue'));
		expect(result[0].artifacts.map((artifact) => artifact.name)).toContain('vue.parse');
		expect(result[0].artifacts.map((artifact) => artifact.name)).toContain('svue.frontend');
		expect(result[0].files.find((file) => file.name === 'js')?.text).toContain('svelte');
	});

	it('uses one parser for both Svelte compile targets', () => {
		const result = steps({ ...request(), operations: ['compile-client', 'compile-server'] });
		expect(result.map((step) => step.id)).toEqual(['svelte.compile/client', 'svelte.compile/server']);
		expect(computationCount(result, 'svelte.parse')).toBe(1);
		expect(result[0].files.find((file) => file.name === 'js')?.text)
			.not.toEqual(result[1].files.find((file) => file.name === 'js')?.text);
	});

	it('returns real syntax errors with positions', () => {
		const result = steps({ ...request(), source: '<p>', operations: ['format'] });
		expect(result[0].files).toEqual([]);
		expect(result[0].diagnostics).toEqual([expect.objectContaining({
			severity: 'error', line: expect.any(Number), column: expect.any(Number), message: expect.any(String)
		})]);
	});

	it('rejects unknown selections, deduplicates plugins, and enforces the source limit', () => {
		expect(runPipeline({ ...request(), plugins: ['unknown'] }).ok).toBe(false);
		expect(runPipeline({ ...request(), operations: ['unknown'] }).ok).toBe(false);
		expect(steps({ ...request(), plugins: ['svelte', 'svelte'] }).length).toBeGreaterThan(0);
		expect(runPipeline({ ...request(), source: 'x'.repeat(65_537) }).ok).toBe(false);
	});

	it('summarizes actual accesses without counting reuse as new computation', () => {
		const step: PipelineStep = {
			id: 'test', accesses: [{ name: 'parse', cached: false }, { name: 'parse', cached: true }],
			artifacts: [], files: [], diagnostics: []
		};
		expect(accessSummary(step)).toEqual([{ name: 'parse', computed: 1, reused: 1 }]);
		expect(computationCount([step])).toBe(1);
	});
});
