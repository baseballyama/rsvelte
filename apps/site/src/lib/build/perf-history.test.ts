import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { PLATFORM, perfHistory } from './perf-history';

const root = path.resolve(import.meta.dirname, '../../../../..');
const baseline = JSON.parse(readFileSync(path.join(root, 'tools/perf/baseline.json'), 'utf8'));

describe('perf history', () => {
	const records = perfHistory(root);

	it('reaches back past the current baseline', () => {
		expect(records.filter((r) => r.sha !== null).length).toBeGreaterThan(1);
	});

	it('ends at tools/perf/baseline.json', () => {
		const last = records.at(-1)!;
		expect([last.allocs, last.alloc_bytes, last.instructions, last.load_instructions]).toEqual([
			baseline.allocs,
			baseline.alloc_bytes,
			baseline.instructions[PLATFORM] ?? null,
			baseline.load_instructions?.[PLATFORM] ?? null
		]);
	});

	it('adds a working-tree record only when the uncommitted baseline records other counters', () => {
		const counters = (text: string) => {
			const b = JSON.parse(text);
			return [b.allocs, b.alloc_bytes, b.peak_live_growth_bytes, b.instructions?.[PLATFORM], b.load_instructions?.[PLATFORM]];
		};
		const committed = counters(execFileSync('git', ['-C', root, 'show', 'HEAD:tools/perf/baseline.json'], { encoding: 'utf8' }));
		const now = counters(readFileSync(path.join(root, 'tools/perf/baseline.json'), 'utf8'));
		expect(records.at(-1)!.sha === null).toBe(JSON.stringify(committed) !== JSON.stringify(now));
	});
});
