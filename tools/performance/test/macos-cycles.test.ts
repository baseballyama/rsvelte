import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync, type SpawnSyncReturns } from 'node:child_process';
import { test } from 'node:test';

const runner = path.resolve(import.meta.dirname, '../bin/macos-cycles.ts');
const counters = path.resolve(import.meta.dirname, '../macos-counters.c');
const darwin = { skip: process.platform !== 'darwin' };
// `work N` loops N times; `fork N` runs the loop in a reaped child; `exec N` replaces itself with `work N`;
// `forkexit N PIDS` leaves an unreaped child that never execs and outlives the parent;
// `swap NEW OLD N` renames NEW over OLD (its own executable) and then works.
const WORK = String.raw`#include <stdlib.h>
#include <stdio.h>
#include <string.h>
#include <unistd.h>
#include <sys/wait.h>
#include <fcntl.h>
static int work(const char *count, int empty) { volatile unsigned long long n=1; for (unsigned long long i=0;i<strtoull(count,0,10);i++) n=n*31+i; puts(empty ? "{\"documents\":0,\"output_bytes\":0}" : "{\"documents\":1,\"output_bytes\":16}"); return n==0; }
int main(int argc,char **argv) {
 if (!strcmp(argv[1],"fork")) { pid_t child=fork(); if (!child) { execl(argv[0],argv[0],argv[2],"quiet",(char*)0); _exit(1); } int status; waitpid(child,&status,0); return work("0",0); }
 if (!strcmp(argv[1],"forkexit")) { pid_t child=fork(); if (!child) { int null=open("/dev/null",O_RDWR); dup2(null,0); dup2(null,1); dup2(null,2); FILE *pids=fopen(argv[3],"a"); fprintf(pids,"%d\n",getpid()); fclose(pids); usleep(200000); volatile unsigned long long n=1; for (unsigned long long i=0;i<strtoull(argv[2],0,10);i++) n=n*31+i; exit(n==0); } return work("0",0); }
 if (!strcmp(argv[1],"swap")) { rename(argv[2],argv[3]); return work(argv[4],0); }
 if (!strcmp(argv[1],"exec")) { execl(argv[0],argv[0],argv[2],(char*)0); return 1; }
 if (argc>2 && !strcmp(argv[2],"quiet")) { volatile unsigned long long n=1; for (unsigned long long i=0;i<strtoull(argv[1],0,10);i++) n=n*31+i; return n==0; }
 return work(argv[1], argc>2);
}`;

function compile(output: string, ...flags: string[]): void {
	const build = spawnSync('clang', ['-x', 'c', ...flags, '-o', output, '-'], { input: WORK, encoding: 'utf8' });
	assert.equal(build.status, 0, build.stderr);
}

function fixture(): { directory: string; executable: string; config: string; report: string; measure: (body: object, ...flags: string[]) => SpawnSyncReturns<string> } {
	const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'rsvelte-cycles-'));
	const executable = path.join(directory, 'work');
	compile(executable, '-O2');
	const config = path.join(directory, 'config.json');
	const report = path.join(directory, 'report.json');
	const measure = (body: object, ...flags: string[]) => {
		fs.writeFileSync(config, JSON.stringify({ rounds: 1, repetitions: 1, ...body }));
		return spawnSync(process.execPath, [runner, config, report, ...flags], { encoding: 'utf8', env: { ...process.env, PATH: `${directory}${path.delimiter}${process.env.PATH}` } });
	};
	return { directory, executable, config, report, measure };
}

test('hardware counters detect added work and reject missing measurements', darwin, () => {
	const { directory, executable, report, measure } = fixture();
	try {
		const measured = measure({ expect_stdout: { documents: 1 }, minimum_output_bytes: 16, arms: [{ name: 'light', command: [executable, '0'] }, { name: 'heavy', command: [executable, '1000000'] }] }, '--allow-busy');
		assert.equal(measured.status, 0, measured.stderr);
		const { samples }: { samples: { arm: string; counters: { cycles: number; instructions: number } }[] } = JSON.parse(fs.readFileSync(report, 'utf8'));
		const light = samples.filter(sample => sample.arm === 'light');
		const heavy = samples.filter(sample => sample.arm === 'heavy');
		assert.equal(samples.length, 4);
		assert.ok(heavy.every(sample => sample.counters.instructions > Math.max(...light.map(sample => sample.counters.instructions)) + 1000000));
		assert.ok(heavy.every(sample => sample.counters.cycles > Math.max(...light.map(sample => sample.counters.cycles))));
		const empty = measure({ expect_stdout: { documents: 1 }, minimum_output_bytes: 16, arms: [{ name: 'empty-workload', command: [executable, '0', 'empty'] }] }, '--allow-busy');
		assert.notEqual(empty.status, 0);
		assert.match(empty.stderr, /workload documents/);
		assert.ok(!fs.existsSync(report));
		const missing = measure({ arms: [{ name: 'signed-system-binary', command: ['/usr/bin/true'] }] }, '--allow-busy');
		assert.notEqual(missing.status, 0);
		assert.match(missing.stderr, /hardware counter report is missing/);
		assert.ok(!fs.existsSync(report));
	} finally {
		fs.rmSync(directory, { recursive: true, force: true });
	}
});

test('only the started process is measured, and child work is rejected instead of hidden', darwin, () => {
	const { directory, executable, report, measure } = fixture();
	try {
		const forked = measure({ arms: [{ name: 'fork', command: [executable, 'fork', '100000000'] }] }, '--allow-busy');
		assert.notEqual(forked.status, 0, 'a reaped child ran 1e8 iterations outside the counters');
		assert.match(forked.stderr, /child processes/);
		assert.ok(!fs.existsSync(report));
		const replaced = measure({ arms: [{ name: 'exec', command: [executable, 'exec', '1000'] }] }, '--allow-busy');
		assert.notEqual(replaced.status, 0, 'the measured process was replaced by another executable');
		assert.match(replaced.stderr, /report is missing/);
	} finally {
		fs.rmSync(directory, { recursive: true, force: true });
	}
});

test('an arm is resolved and hashed before the first sample', darwin, () => {
	const { directory, executable, report, measure } = fixture();
	try {
		const bare = measure({ arms: [{ name: 'bare', command: ['work', '1000'] }] }, '--allow-busy');
		assert.equal(bare.status, 0, bare.stderr);
		const { summary } = JSON.parse(fs.readFileSync(report, 'utf8'));
		assert.equal(summary[0].executable, executable);
		assert.equal(summary[0].executable_sha256, crypto.createHash('sha256').update(fs.readFileSync(executable)).digest('hex'));
		fs.rmSync(`${report}.samples`, { recursive: true, force: true });
		const unknown = measure({ arms: [{ name: 'valid', command: [executable, '1000'] }, { name: 'unknown', command: ['no-such-rsvelte-arm', '1'] }] }, '--allow-busy');
		assert.notEqual(unknown.status, 0);
		assert.match(unknown.stderr, /executable not found: no-such-rsvelte-arm/);
		assert.ok(!fs.existsSync(`${report}.samples/sample-0.log`), 'no sample may run before every arm resolves');
	} finally {
		fs.rmSync(directory, { recursive: true, force: true });
	}
});

test('a busy machine is refused before any sample, and the start load is recorded', darwin, () => {
	const { directory, executable, report, measure } = fixture();
	try {
		const arms = [{ name: 'work', command: [executable, '1000'] }];
		if (os.loadavg()[0]! > 0) {
			const busy = measure({ arms }, '--max-load', '0');
			assert.notEqual(busy.status, 0);
			assert.match(busy.stderr, /load .* is above 0/);
			assert.ok(!fs.existsSync(`${report}.samples`));
		}
		const accepted = measure({ arms }, '--max-load', '1000000');
		assert.equal(accepted.status, 0, accepted.stderr);
		const { host, samples } = JSON.parse(fs.readFileSync(report, 'utf8'));
		assert.equal(host.load_limit, 1000000);
		assert.equal(host.allow_busy, false);
		assert.ok(Number.isFinite(host.start_load_1m));
		assert.ok(samples.every((sample: { load_1m: number }) => Number.isFinite(sample.load_1m)));
		assert.notEqual(measure({ arms }, '--max-load', 'many').status, 0);
		assert.match(measure({ arms }, '--max-load', '').stderr, /invalid --max-load/);
		const busy = measure({ arms }, '--allow-busy');
		assert.equal(busy.status, 0, busy.stderr);
		const recorded = JSON.parse(fs.readFileSync(report, 'utf8')).host;
		assert.equal(recorded.load_limit, os.availableParallelism() / 4);
		assert.equal(recorded.allow_busy, true);
	} finally {
		fs.rmSync(directory, { recursive: true, force: true });
	}
});

test('P-core counters and footprint are recorded, or written as null when the host cannot give them', darwin, () => {
	const { directory, executable, report, measure } = fixture();
	try {
		const measured = measure({ arms: [{ name: 'work', command: [executable, '1000000'] }] }, '--allow-busy');
		assert.equal(measured.status, 0, measured.stderr);
		const { samples, summary } = JSON.parse(fs.readFileSync(report, 'utf8'));
		const levels = Number(spawnSync('sysctl', ['-n', 'hw.nperflevels'], { encoding: 'utf8' }).stdout.trim() || 0);
		for (const { counters: sample } of samples) {
			assert.ok(sample.lifetime_max_phys_footprint_bytes > 0);
			assert.equal(sample.child_time_ns, 0);
			if (sample.rusage_flavor === 6 && levels > 1) {
				assert.ok(sample.p_cycles <= sample.cycles && sample.p_instructions <= sample.instructions);
			} else {
				assert.equal(sample.p_cycles, null);
			}
		}
		assert.deepEqual(summary[0].unmeasured, samples.every((sample: { counters: { p_cycles: unknown } }) => sample.counters.p_cycles !== null) ? [] : ['p_cycles', 'p_instructions']);
		// The V4 path is what an older kernel takes; build it directly to see its record.
		const library = path.join(directory, 'v4.dylib');
		assert.equal(spawnSync('clang', ['-O2', '-dynamiclib', '-DRSVELTE_COUNTERS_FORCE_V4', counters, '-o', library]).status, 0);
		const out = path.join(directory, 'v4.json');
		const v4 = spawnSync(executable, ['1000'], { env: { ...process.env, DYLD_INSERT_LIBRARIES: library, RSVELTE_COUNTER_REPORT: out } });
		assert.equal(v4.status, 0);
		const record = JSON.parse(fs.readFileSync(out, 'utf8'));
		assert.equal(record.rusage_flavor, 4);
		assert.equal(record.p_cycles, null);
		assert.equal(record.p_instructions, null);
		assert.ok(record.cycles > 0 && record.lifetime_max_phys_footprint_bytes > 0);
	} finally {
		fs.rmSync(directory, { recursive: true, force: true });
	}
});

test('a child that outlives the parent cannot rewrite the accepted sample', darwin, async () => {
	const { directory, executable, report, measure } = fixture();
	try {
		const pids = path.join(directory, 'pids');
		const measured = measure({ arms: [{ name: 'forkexit', command: [executable, 'forkexit', '1000000', pids] }] }, '--allow-busy');
		assert.equal(measured.status, 0, measured.stderr);
		const files = [0, 1].map(index => path.join(`${report}.samples`, `sample-${index}.json`));
		const accepted = files.map(file => fs.readFileSync(file, 'utf8'));
		const deadline = Date.now() + 20_000;
		const alive = (pid: number) => { try { process.kill(pid, 0); return true; } catch { return false; } };
		for (;;) {
			const children = fs.existsSync(pids) ? fs.readFileSync(pids, 'utf8').trim().split('\n').filter(Boolean).map(Number) : [];
			if (children.length === 2 && !children.some(alive)) break;
			assert.ok(Date.now() < deadline, `children did not finish: ${children.join(',')}`);
			await new Promise(resolve => setTimeout(resolve, 50));
		}
		assert.deepEqual(files.map(file => fs.readFileSync(file, 'utf8')), accepted, 'a forked child rewrote a sample after it was accepted');
	} finally {
		fs.rmSync(directory, { recursive: true, force: true });
	}
});

test('an executable replaced during the measurement fails instead of being reported', darwin, () => {
	const { directory, report, measure } = fixture();
	try {
		const arm = path.join(directory, 'arm');
		const replacement = path.join(directory, 'replacement');
		compile(arm, '-O2');
		compile(replacement, '-O1');
		assert.notEqual(fs.readFileSync(arm).compare(fs.readFileSync(replacement)), 0, 'the replacement must differ in bytes');
		const swapped = measure({ arms: [{ name: 'swap', command: [arm, 'swap', replacement, arm, '1000'] }] }, '--allow-busy');
		assert.notEqual(swapped.status, 0);
		assert.match(swapped.stderr, /swap: the executable changed during the measurement/);
		assert.equal(JSON.parse(fs.readFileSync(report, 'utf8')).status, 'running');
	} finally {
		fs.rmSync(directory, { recursive: true, force: true });
	}
});
