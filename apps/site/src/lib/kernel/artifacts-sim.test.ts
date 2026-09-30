import { describe, expect, it } from 'vitest';
import { computeCounts, simulate, TASKS } from './artifacts-sim.ts';

describe('artifact model', () => {
	it('parses once when shared and once per task when isolated', () => {
		const doc = { parses: true };
		expect(computeCounts(simulate(TASKS, doc, 'shared'))['svelte.parse']).toBe(1);
		expect(computeCounts(simulate(TASKS, doc, 'isolated'))['svelte.parse']).toBe(5);
	});

	it('records Ctx::computed in the order the kernel pushes (before compute runs)', () => {
		const [client] = simulate(['svelte.compile/client'], { parses: true }, 'shared');
		expect(client.computed).toEqual(['svelte.parse', 'svelte.hir', 'svelte.resolve', 'svelte.analyze', 'svelte.css']);
		expect(client.gets.filter((g) => g.depth > 0).every((g) => !g.computed)).toBe(true);
	});

	it('stops after the parse error', () => {
		const traces = simulate(TASKS, { parses: false }, 'shared');
		expect(computeCounts(traces)).toEqual({
			'svelte.parse': 1,
			'svelte.resolve': 0,
			'svelte.hir': 0,
			'svelte.analyze': 0,
			'svelte.css': 0,
			'ts.view': 1
		});
	});

	it('computes name resolution and the HIR once for compile and lint together', () => {
		const traces = simulate(['svelte.compile/client', 'svelte.lint/default'], { parses: true }, 'shared');
		expect(computeCounts(traces)['svelte.resolve']).toBe(1);
		expect(computeCounts(traces)['svelte.hir']).toBe(1);
		expect(traces[1].gets.map((g) => [g.artifact, g.computed])).toEqual([
			['svelte.parse', false],
			['svelte.resolve', false],
			['svelte.hir', false]
		]);
	});
});
