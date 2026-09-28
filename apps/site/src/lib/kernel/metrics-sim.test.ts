import { describe, expect, it } from 'vitest';
import { account } from './metrics-sim.ts';

describe('phase accounting', () => {
	it('charges nested time to the child, not the parent', () => {
		const rows = account([
			{
				name: 'task',
				start: 0,
				end: 10,
				allocs: 2,
				children: [{ name: 'parse', start: 1, end: 7, allocs: 5, children: [] }]
			}
		]);
		expect(rows).toEqual([
			{ name: 'parse', calls: 1, selfNs: 6, totalNs: 6, selfAllocs: 5 },
			{ name: 'task', calls: 1, selfNs: 4, totalNs: 10, selfAllocs: 2 }
		]);
	});

	it('self times add up to the wall time of the roots', () => {
		const rows = account([
			{ name: 'a', start: 0, end: 5, allocs: 0, children: [{ name: 'b', start: 1, end: 3, allocs: 0, children: [] }] },
			{ name: 'c', start: 5, end: 9, allocs: 0, children: [{ name: 'b', start: 6, end: 7, allocs: 0, children: [] }] }
		]);
		expect(rows.reduce((n, r) => n + r.selfNs, 0)).toBe(9);
		expect(rows.find((r) => r.name === 'b')?.calls).toBe(2);
	});
});
