import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { PLATFORM, performanceHistory } from './performance-history';

const root = path.resolve(import.meta.dirname, '../../../../..');
const baseline = JSON.parse(readFileSync(path.join(root, 'tools/performance/baseline.json'), 'utf8'));

describe('performance history', () => {
	const records = performanceHistory(root);

	it('reaches back past the current baseline', () => {
		expect(records.filter((r) => r.sha !== null).length).toBeGreaterThan(1);
	});

	it('ends at tools/performance/baseline.json', () => {
		const last = records.at(-1)!;
		expect([last.allocations, last.alloc_bytes, last.instructions, last.load_instructions]).toEqual([
			baseline['allocs'],
			baseline.alloc_bytes,
			baseline.instructions[PLATFORM] ?? null,
			baseline.load_instructions?.[PLATFORM] ?? null
		]);
	});

	it('adds a working-tree record only for an uncommitted baseline', () => {
		const recordedFile = execFileSync('git', ['-C', root, 'ls-tree', '--name-only', 'HEAD', '--', 'tools/performance/baseline.json', 'tools/perf/baseline.json'], { encoding: 'utf8' }).trim();
		const committed = execFileSync('git', ['-C', root, 'show', `HEAD:${recordedFile}`], { encoding: 'utf8' });
		const edited = committed !== readFileSync(path.join(root, 'tools/performance/baseline.json'), 'utf8');
		expect(records.at(-1)!.sha === null).toBe(edited);
	});
});
