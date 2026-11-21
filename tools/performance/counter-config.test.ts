import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
	sampleOrder,
	validateCounterConfig,
	validateCounterOutput,
	type CounterConfig,
} from './counter-config.ts';

test('all counter backends use the same sample order and population checks', () => {
	assert.deepEqual(
		[...sampleOrder(['before', 'after'], 2)],
		['before', 'after', 'after', 'before', 'before', 'after', 'after', 'before'],
	);
	assert.deepEqual(
		[...sampleOrder(['rewrite', 'old', 'official'], 1)],
		['rewrite', 'old', 'official', 'official', 'old', 'rewrite'],
	);
	const arm = { name: 'compiler', command: ['/compiler'] as [string] };
	validateCounterConfig({ rounds: 2, repetitions: 1, arms: [arm] });
	assert.throws(
		() => validateCounterConfig({ rounds: 0, repetitions: 1, arms: [arm] }),
		/population/,
	);
	assert.throws(
		() => validateCounterConfig({ rounds: 2, repetitions: 1, arms: [arm, arm] }),
		/arms/,
	);
});

test('output controls reject skipped or empty work without accepting invalid counts', () => {
	const config: CounterConfig = {
		rounds: 2,
		repetitions: 1,
		arms: [{ name: 'compiler', command: ['/compiler'] }],
		expect_stdout: { documents: 3, skipped: 0, rounds: 2, metrics: false },
		minimum_output_bytes: 16,
	};
	validateCounterConfig(config);
	const output = { documents: 3, skipped: 0, rounds: 2, metrics: false, output_bytes: 16 };
	validateCounterOutput(config, JSON.stringify(output));
	for (const defect of [
		{ documents: 0 },
		{ skipped: 1 },
		{ rounds: 1 },
		{ metrics: true },
		{ output_bytes: 0 },
		{ output_bytes: '16' },
		{ output_bytes: 16.5 },
	]) {
		assert.throws(
			() => validateCounterOutput(config, JSON.stringify({ ...output, ...defect })),
			/workload/,
		);
	}
	for (const text of ['null', '[]', '16', '{}', 'invalid json'])
		assert.throws(() => validateCounterOutput(config, text));
	validateCounterOutput({ rounds: 1, repetitions: 1, arms: [] }, 'plain stdout');
	assert.throws(() => validateCounterConfig({ ...config, minimum_output_bytes: 0 }), /minimum/);
	assert.throws(
		() => validateCounterConfig({ ...config, expect_stdout: { documents: Number.NaN } }),
		/value/,
	);
});
