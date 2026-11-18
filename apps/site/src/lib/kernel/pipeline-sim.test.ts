import { describe, expect, it } from 'vitest';
import { makeDocs, simulate } from './pipeline-sim.ts';

describe('run_each model', () => {
	it('collecting holds every result until the end; streaming holds only waiting ones', () => {
		const docs = makeDocs(40, 0);
		const r = simulate(docs, 4, 5);
		expect(r.peakCollected).toBe(docs.reduce((n, d) => n + d.size, 0));
		expect(r.peakStreaming).toBeLessThan(r.peakCollected);
	});

	it('documents with parts stay live until the project pass', () => {
		const docs = makeDocs(40, 1);
		const r = simulate(docs, 4, 5);
		expect(r.peakStreaming).toBe(r.peakCollected);
		expect(r.projectEnd).toBe(r.parallelEnd + 5);
	});

	it('one worker runs documents back to back', () => {
		const docs = makeDocs(5, 0);
		const r = simulate(docs, 1, 0);
		expect(r.parallelEnd).toBe(docs.reduce((n, d) => n + d.cost, 0));
	});
});
