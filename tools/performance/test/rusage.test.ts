import assert from 'node:assert/strict';
import { test } from 'node:test';
import { parseCounters, summarizeArm, type Counters } from '../rusage.ts';

const sample: Counters = { cycles: 1000, instructions: 2000, user_time_ns: 1, system_time_ns: 1, child_time_ns: 0, lifetime_max_phys_footprint_bytes: 4096, rusage_flavor: 6, performance_levels: 2, p_cycles: 900, p_instructions: 1900 };

test('optional P-core counters are UNMEASURED as null, never zero or missing', () => {
	assert.deepEqual(parseCounters(JSON.stringify(sample)), sample);
	const old = { ...sample, rusage_flavor: 4, p_cycles: null, p_instructions: null };
	assert.equal(parseCounters(JSON.stringify(old)).p_cycles, null);
	const { p_cycles: _, ...missing } = sample;
	assert.throws(() => parseCounters(JSON.stringify(missing)), /p_cycles/);
	for (const defect of [{ p_cycles: 1001 }, { p_instructions: 2001 }, { child_time_ns: 1 }, { lifetime_max_phys_footprint_bytes: 0 }, { rusage_flavor: 5 }, { cycles: 0 }, { p_cycles: -1 }, { p_cycles: '900' }]) {
		assert.throws(() => parseCounters(JSON.stringify({ ...sample, ...defect })), Error, JSON.stringify(defect));
	}
});

test('one unmeasured sample makes the arm summary unmeasured instead of a partial median', () => {
	const measured = summarizeArm([sample, { ...sample, cycles: 3000, p_cycles: 1500 }], 1);
	assert.equal(measured.median_cycles_per_round, 2000);
	assert.equal(measured.median_p_cycles_per_round, 1200);
	assert.equal(measured.median_p_instructions_per_round, 1900);
	assert.equal(measured.median_p_cycle_share, (0.9 + 0.5) / 2);
	assert.deepEqual(measured.unmeasured, []);
	const mixed = summarizeArm([sample, { ...sample, rusage_flavor: 4, p_cycles: null, p_instructions: null }], 1);
	assert.equal(mixed.median_p_cycles_per_round, null);
	assert.equal(mixed.median_p_cycle_share, null);
	assert.equal(mixed.median_p_instructions_per_round, null);
	assert.deepEqual(mixed.unmeasured, ['p_cycles', 'p_instructions']);
	assert.equal(mixed.median_cycles_per_round, 1000);
});
