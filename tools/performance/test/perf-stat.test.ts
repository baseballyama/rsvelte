import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { test } from 'node:test';
import { parsePerfStat } from '../perf-stat.ts';

test('perf counts keep unavailable events separate from zero', () => {
	const counts = parsePerfStat('123;;cycles;100;100\n0;;L1-dcache-load-misses;100;100\n<not supported>;;LLC-loads;0;0\n');
	assert.equal(counts.cycles, 123);
	assert.equal(counts['L1-dcache-load-misses'], 0);
	assert.equal(counts['LLC-loads'], 'UNMEASURED');
	assert.equal(counts['LLC-load-misses'], 'UNMEASURED');
	assert.throws(() => parsePerfStat('NaN;;cycles'), /invalid/);
	assert.throws(() => parsePerfStat('1;;cycles\n2;;cycles'), /duplicate/);
});

test('Linux hardware collection reports unavailable counters without stale success', { skip: process.platform !== 'linux' }, () => {
	const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'rsvelte-perf-'));
	try {
		const config = path.join(directory, 'config.json');
		const report = path.join(directory, 'report.json');
		fs.writeFileSync(config, JSON.stringify({ rounds: 1, repetitions: 1, arms: [{ name: 'process', command: ['/bin/true'] }] }));
		fs.writeFileSync(report, JSON.stringify({ status: 'complete', samples: [] }));
		const runner = path.resolve(import.meta.dirname, '../bin/linux-counters.ts');
		const run = spawnSync(process.execPath, [runner, config, report], { encoding: 'utf8' });
		const measured = JSON.parse(fs.readFileSync(report, 'utf8'));
		assert.ok(measured.samples.length > 0);
		if (run.status === 0) {
			assert.equal(measured.status, 'complete');
			assert.ok(measured.samples.every((sample: { counts: { cycles: number; instructions: number } }) => sample.counts.cycles > 0 && sample.counts.instructions > 0));
		} else {
			assert.equal(run.status, 1, run.stderr);
			assert.equal(measured.status, 'UNMEASURED');
			assert.ok(fs.existsSync(`${report}.samples/0.perf.stderr`));
		}
	} finally {
		fs.rmSync(directory, { recursive: true, force: true });
	}
});
