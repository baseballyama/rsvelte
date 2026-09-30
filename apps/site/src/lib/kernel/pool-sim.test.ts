import { describe, expect, it } from 'vitest';
import { simulate } from './pool-sim.ts';

describe('pool model', () => {
	it('reuses capacity so steady-state documents of the same size allocate nothing', () => {
		const steps = simulate([100, 100, 100], true);
		const perDoc = [0, 1, 2].map((d) => {
			const last = steps.filter((s) => s.doc === d).at(-1)!;
			const prev = d === 0 ? 0 : steps.filter((s) => s.doc === d - 1).at(-1)!.allocs;
			return last.allocs - prev;
		});
		expect(perDoc[0]).toBeGreaterThan(0);
		expect(perDoc[2]).toBe(0);
	});

	it('takes the most recently given buffer, whatever its size', () => {
		const steps = simulate([10, 1000], true);
		const firstTakeOfDoc1 = steps.find((s) => s.doc === 1 && s.event.kind === 'take')!;
		// The last give of document 0 was the parsed tree (the smallest), so it comes back first.
		expect(firstTakeOfDoc1.event.kind === 'take' && firstTakeOfDoc1.event.got).toBe(16);
	});

	it('frees a buffer that would take the pool past its budget, as MAX_BYTES does', () => {
		const steps = simulate([100, 100], true, 200);
		const gives = steps.filter((s) => s.event.kind === 'give').map((s) => s.event.kind === 'give' && s.event.why);
		expect(gives).toContain('budget');
		const unbounded = simulate([100, 100], true).at(-1)!.allocs;
		expect(steps.at(-1)!.allocs).toBeGreaterThan(unbounded);
	});

	it('without the pool every tree grows from empty', () => {
		const on = simulate([100, 100], true).at(-1)!.allocs;
		const off = simulate([100, 100], false).at(-1)!.allocs;
		expect(off).toBeGreaterThan(on);
	});
});
