import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { test } from 'node:test';

const runner = path.resolve(import.meta.dirname, '../bin/macos-cycles.ts');
test('hardware counters detect added work and reject missing measurements', { skip: process.platform !== 'darwin' }, () => {
	const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'rsvelte-cycles-'));
	try {
		const executable = path.join(directory, 'work');
		const source = '#include <stdlib.h>\n#include <stdio.h>\nint main(int argc,char **argv) { volatile unsigned long long n=1; for (unsigned long long i=0;i<strtoull(argv[1],0,10);i++) n=n*31+i; puts(argc>2 ? "{\\"documents\\":0,\\"output_bytes\\":0}" : "{\\"documents\\":1,\\"output_bytes\\":16}"); return n==0; }';
		const build = spawnSync('clang', ['-x', 'c', '-O2', '-o', executable, '-'], { input: source, encoding: 'utf8' });
		assert.equal(build.status, 0, build.stderr);
		const config = path.join(directory, 'config.json');
		const report = path.join(directory, 'report.json');
		fs.writeFileSync(config, JSON.stringify({ rounds: 1, repetitions: 1, expect_stdout: { documents: 1 }, minimum_output_bytes: 16, arms: [{ name: 'light', command: [executable, '0'] }, { name: 'heavy', command: [executable, '1000000'] }] }));
		const measured = spawnSync(process.execPath, [runner, config, report], { encoding: 'utf8' });
		assert.equal(measured.status, 0, measured.stderr);
		const { samples }: { samples: { arm: string; counters: { cycles: number; instructions: number } }[] } = JSON.parse(fs.readFileSync(report, 'utf8'));
		const light = samples.filter(sample => sample.arm === 'light');
		const heavy = samples.filter(sample => sample.arm === 'heavy');
		assert.equal(samples.length, 4);
		assert.ok(heavy.every(sample => sample.counters.instructions > Math.max(...light.map(sample => sample.counters.instructions)) + 1000000));
		assert.ok(heavy.every(sample => sample.counters.cycles > Math.max(...light.map(sample => sample.counters.cycles))));
		fs.writeFileSync(config, JSON.stringify({ rounds: 1, repetitions: 1, expect_stdout: { documents: 1 }, minimum_output_bytes: 16, arms: [{ name: 'empty-workload', command: [executable, '0', 'empty'] }] }));
		const empty = spawnSync(process.execPath, [runner, config, report], { encoding: 'utf8' });
		assert.notEqual(empty.status, 0);
		assert.match(empty.stderr, /workload documents/);
		assert.ok(!fs.existsSync(report));
		fs.writeFileSync(config, JSON.stringify({ rounds: 1, repetitions: 1, arms: [{ name: 'signed-system-binary', command: ['/usr/bin/true'] }] }));
		const missing = spawnSync(process.execPath, [runner, config, report], { encoding: 'utf8' });
		assert.notEqual(missing.status, 0);
		assert.match(missing.stderr, /hardware counter report is missing/);
		assert.ok(!fs.existsSync(report));
	} finally {
		fs.rmSync(directory, { recursive: true, force: true });
	}
});
