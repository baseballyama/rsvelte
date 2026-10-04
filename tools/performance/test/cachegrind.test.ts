import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { test } from 'node:test';
import { DEFAULT_CACHE_MODEL, cacheModelKey, compareCache, parseCachegrind, runCachegrind } from '../cachegrind.ts';

test('cache summaries map named events and refuse missing measurements', () => {
	const result = parseCachegrind('events: DLmw D1mw Dw DLmr D1mr Dr ILmr I1mr Ir\nsummary: 1 2 3 4 5 6 7 8 9\n');
	assert.equal(result.Ir, 9);
	assert.equal(result.D1mr, 5);
	assert.throws(() => parseCachegrind('events: Ir\nsummary: 123\n'), /unmeasured/);
	assert.throws(() => parseCachegrind('events: Ir\nsummary: NaN\n'), /invalid/);
	assert.throws(() => parseCachegrind(''), /summary/);
	assert.throws(() => cacheModelKey({ ...DEFAULT_CACHE_MODEL, d1: { bytes: 100, ways: 3, line_bytes: 64 } }), /powers of two/);
	assert.ok(compareCache(result, result, 0).every(row => !row.moved));
	assert.ok(compareCache(result, { ...result, D1mr: result.D1mr + 1 }, 0).some(row => row.event === 'D1mr' && row.moved));
});

test('real cache simulation detects strided access and rejects stale reports', { skip: process.platform !== 'linux' }, () => {
	const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'rsvelte-cache-'));
	try {
		const executable = path.join(directory, 'locality');
		const source = '#include <stdlib.h>\n#include <stdint.h>\nstatic volatile uint64_t data[512*512];\nint main(int argc,char **argv) { uint64_t sum=0; for (int r=0;r<4;r++) for (int i=0;i<512;i++) for (int j=0;j<512;j++) sum+=data[argv[1][0]==\'s\'?i*512+j:j*512+i]; return sum!=0; }';
		const sourcePath = path.join(directory, 'locality.c');
		fs.writeFileSync(sourcePath, source);
		const build = spawnSync('cc', ['-O2', sourcePath, '-o', executable], { encoding: 'utf8' });
		assert.equal(build.status, 0, build.stderr);
		const sequential = runCachegrind([executable, 'sequential'], path.join(directory, 'sequential.cg'), DEFAULT_CACHE_MODEL);
		const scattered = runCachegrind([executable, 'column'], path.join(directory, 'column.cg'), DEFAULT_CACHE_MODEL);
		assert.ok(scattered.D1mr > sequential.D1mr * 4);
		assert.ok(compareCache(sequential, scattered, 0.02).some(row => row.event === 'D1mr' && row.moved));
		const config = path.join(directory, 'config.json');
		const baseline = path.join(directory, 'baseline.json');
		const report = path.join(directory, 'report.json');
		const settings = { rounds: 1, repetitions: 1, revision: 'UNMEASURED', arms: [{ name: 'layout', command: [executable, 'sequential'] }], inputs: [executable], sources: [sourcePath] };
		fs.writeFileSync(config, JSON.stringify(settings));
		const runner = path.resolve(import.meta.dirname, '../bin/cache-profile.ts');
		const accepted = spawnSync(process.execPath, [runner, config, baseline], { encoding: 'utf8' });
		assert.equal(accepted.status, 0, accepted.stderr);
		fs.writeFileSync(config, JSON.stringify({ ...settings, baseline }));
		const unchanged = spawnSync(process.execPath, [runner, config, report], { encoding: 'utf8' });
		assert.equal(unchanged.status, 0, unchanged.stderr);
		fs.writeFileSync(config, JSON.stringify({ ...settings, arms: [{ name: 'layout', command: [executable, 'column'] }], baseline }));
		const rejected = spawnSync(process.execPath, [runner, config, report], { encoding: 'utf8' });
		assert.equal(rejected.status, 1, rejected.stderr);
		assert.equal(JSON.parse(fs.readFileSync(report, 'utf8')).gate.status, 'CHANGED');
		fs.writeFileSync(config, JSON.stringify({ ...settings, expect_stdout: { documents: 1 }, minimum_output_bytes: 1 }));
		const empty = spawnSync(process.execPath, [runner, config, report], { encoding: 'utf8' });
		assert.notEqual(empty.status, 0);
		assert.equal(JSON.parse(fs.readFileSync(report, 'utf8')).status, 'running');
		const raw = path.join(directory, 'failure.cg');
		fs.writeFileSync(raw, 'stale');
		assert.throws(() => runCachegrind(['/no/such/program'], raw, DEFAULT_CACHE_MODEL), /exited/);
		assert.ok(!fs.existsSync(raw));
	} finally {
		fs.rmSync(directory, { recursive: true, force: true });
	}
});
