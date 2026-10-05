import { readFile } from 'node:fs/promises';
import { langs } from '../i18n';
import { beforeAll, describe, expect, it } from 'vitest';
import { initializePipeline, runPipeline } from './pipeline-browser';
import { accessTable, artifactLabel, decodeState, encodeState, examples, operations, plugins, problems, taskLabel } from './pipeline-playground';

beforeAll(async () => {
	await initializePipeline(await readFile(new URL('../wasm/kernel/rsvelte_kernel_browser_bg.wasm', import.meta.url)));
});

function everyStep(shared: boolean) {
	return examples.flatMap((example) => {
		const result = runPipeline({
			source: example.source, filename: example.filename, plugins: plugins.map((plugin) => plugin.id),
			operations: operations.map((operation) => operation.id), shared
		});
		if (!result.ok) throw new Error(result.message);
		return result.steps;
	});
}

describe('playground labels follow the real Rust registry', () => {
	it('gives every registered task its own label', () => {
		const result = runPipeline({ source: '', filename: 'a.svelte', plugins: plugins.map((plugin) => plugin.id), operations: [], shared: true });
		if (!result.ok) throw new Error(result.message);
		expect(result.registeredTasks.length).toBeGreaterThan(0);
		for (const lang of langs) {
			const labels = result.registeredTasks.map((id) => taskLabel(id, lang));
			expect(labels.filter((label, index) => result.registeredTasks[index] === label)).toEqual([]);
			expect(new Set(labels).size).toBe(labels.length);
		}
	});

	it('names every analysis result the tasks read', () => {
		const names = new Set(everyStep(true).flatMap((step) => step.accesses.map((access) => access.name)));
		expect(names.size).toBeGreaterThan(0);
		for (const lang of langs) expect([...names].filter((name) => artifactLabel(name, lang).name === name)).toEqual([]);
	});

	it('falls back to the identifier for an unknown task or result', () => {
		for (const lang of langs) {
			expect(taskLabel('rust.compile/client', lang)).toBe('rust.compile/client');
			expect(artifactLabel('rust.parse', lang).name).toBe('rust.parse');
		}
	});
});

describe('the record table', () => {
	it('counts computed and reused results per task, and leaves unused cells empty', () => {
		const steps = [
			{ id: 'a', accesses: [{ name: 'p', cached: false }, { name: 'p', cached: true }], artifacts: [], files: [], diagnostics: [] },
			{ id: 'b', accesses: [{ name: 'p', cached: true }, { name: 'r', cached: false }], artifacts: [], files: [], diagnostics: [] }
		];
		expect(accessTable(steps)).toEqual([
			{ name: 'p', cells: [{ computed: 1, reused: 1 }, { computed: 0, reused: 1 }] },
			{ name: 'r', cells: [{ computed: 0, reused: 0 }, { computed: 1, reused: 0 }] }
		]);
	});

	it('shows more computation without sharing than with sharing', () => {
		const computed = (shared: boolean) => everyStep(shared).flatMap((step) => step.accesses).filter((access) => !access.cached).length;
		expect(computed(false)).toBeGreaterThan(computed(true));
	});
});

describe('the link state', () => {
	const state = { example: 'vue', source: '<template>日本語 {{ a }}</template>\n', plugins: ['vue'], operations: ['format'], shared: false };

	it('restores the same request from the link', async () => {
		expect(await decodeState(await encodeState(state))).toEqual(state);
	});

	it('ignores a hash without state and rejects broken state', async () => {
		expect(await decodeState('')).toBeNull();
		expect(await decodeState('#overview')).toBeNull();
		await expect(decodeState('#state=not-deflate')).rejects.toThrow();
		const unknown = await encodeState({ ...state, example: 'rust' });
		await expect(decodeState(unknown)).rejects.toThrow('invalid playground state in the link');
	});
});

describe('problems', () => {
	it('lists lint findings with their source position, and none for a clean example', () => {
		const run = (source: string) => {
			const result = runPipeline({ source, filename: 'Counter.svelte', plugins: ['svelte'], operations: ['lint'], shared: true });
			if (!result.ok) throw new Error(result.message);
			return problems(result.steps[0]);
		};
		const found = run('<script>\n  let unused = 1;\n</script>\n');
		expect(found).toEqual([expect.objectContaining({ line: 2, column: 7, code: 'no-unused-vars', kind: 'lint' })]);
		expect(run('<script>\n  let count = $state(0);\n</script>\n\n<p>{count}</p>\n')).toEqual([]);
	});

	it('lists parse errors as diagnostics', () => {
		const result = runPipeline({ source: '<script>\n  let x = ;\n</script>\n', filename: 'Counter.svelte', plugins: ['svelte'], operations: ['compile-client'], shared: true });
		if (!result.ok) throw new Error(result.message);
		expect(problems(result.steps[0])).toEqual([expect.objectContaining({ line: 2, kind: 'diagnostic' })]);
	});
});
