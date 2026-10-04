import assert from 'node:assert/strict';
import { test } from 'node:test';
import { sampleOrder, validateWorkload, validateWorkloadOutput, type Workload } from '../workload.ts';

test('all counter backends use the same sample order and population checks', () => {
	assert.deepEqual([...sampleOrder(['before', 'after'], 2)], ['before', 'after', 'after', 'before', 'before', 'after', 'after', 'before']);
	assert.deepEqual([...sampleOrder(['rewrite', 'old', 'official'], 1)], ['rewrite', 'old', 'official', 'official', 'old', 'rewrite']);
	const arm = { name: 'compiler', command: ['/compiler'] as [string] };
	validateWorkload({ rounds: 2, repetitions: 1, arms: [arm] });
	assert.throws(() => validateWorkload({ rounds: 0, repetitions: 1, arms: [arm] }), /population/);
	assert.throws(() => validateWorkload({ rounds: 2, repetitions: 1, arms: [arm, arm] }), /arms/);
});

test('output controls reject skipped or empty work without accepting invalid counts', () => {
	const config: Workload = { rounds: 2, repetitions: 1, arms: [{ name: 'compiler', command: ['/compiler'] }], expect_stdout: { documents: 3, skipped: 0, rounds: 2, metrics: false }, minimum_output_bytes: 16 };
	validateWorkload(config);
	const output = { documents: 3, skipped: 0, rounds: 2, metrics: false, output_bytes: 16 };
	validateWorkloadOutput(config, JSON.stringify(output));
	for (const defect of [{ documents: 0 }, { skipped: 1 }, { rounds: 1 }, { metrics: true }, { output_bytes: 0 }, { output_bytes: '16' }, { output_bytes: 16.5 }]) {
		assert.throws(() => validateWorkloadOutput(config, JSON.stringify({ ...output, ...defect })), /workload/);
	}
	for (const text of ['null', '[]', '16', '{}', 'invalid json']) assert.throws(() => validateWorkloadOutput(config, text));
	validateWorkloadOutput({ rounds: 1, repetitions: 1, arms: [] }, 'plain stdout');
	assert.throws(() => validateWorkload({ ...config, minimum_output_bytes: 0 }), /minimum/);
	assert.throws(() => validateWorkload({ ...config, expect_stdout: { documents: Number.NaN } }), /value/);
});
