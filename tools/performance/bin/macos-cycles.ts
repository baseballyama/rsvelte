import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { parseArgs } from 'node:util';
import { sampleOrder, validateWorkload, validateWorkloadOutput, type Workload } from '../workload.ts';
import { checkLoad, hostRecord, parseCounters, resolveExecutable, summarizeArm, type Counters } from '../rusage.ts';

type Sample = { arm: string; counters: Counters; stdout_sha256: string; load_1m: number };
if (process.platform !== 'darwin') throw new Error('CPU counter collection requires macOS');
const { values, positionals } = parseArgs({ allowPositionals: true, options: { 'allow-busy': { type: 'boolean', default: false }, 'max-load': { type: 'string' } } });
const [configPath, reportPath] = positionals;
if (!configPath || !reportPath || positionals.length !== 2) throw new Error('expected <config.json> <report.json> [--max-load <n>] [--allow-busy]');
// The same idle rule as tools/buildtime: a quarter of the logical CPUs.
const loadLimit = values['max-load'] === undefined ? os.availableParallelism() / 4 : values['max-load'].trim() === '' ? Number.NaN : Number(values['max-load']);
if (!Number.isFinite(loadLimit) || loadLimit < 0) throw new Error('invalid --max-load');
const config: Workload = JSON.parse(fs.readFileSync(configPath, 'utf8'));
validateWorkload(config);
const executables = new Map(config.arms.map(arm => [arm.name, resolveExecutable(arm.command[0])]));
const startLoad = checkLoad(loadLimit, values['allow-busy']);
const host = hostRecord(startLoad, loadLimit, values['allow-busy']);
fs.mkdirSync(path.dirname(path.resolve(reportPath)), { recursive: true });
const directory = path.resolve(`${reportPath}.samples`);
fs.mkdirSync(directory, { recursive: true });
fs.rmSync(reportPath, { force: true });
const source = path.resolve(import.meta.dirname, '../macos-counters.c');
const library = path.join(directory, 'macos-counters.dylib');
const build = spawnSync('clang', ['-O2', '-dynamiclib', source, '-o', library], { encoding: 'utf8' });
if (build.status !== 0) throw new Error(build.stderr);
const hash = (value: string | Buffer) => crypto.createHash('sha256').update(value).digest('hex');
const identities = new Map([...executables].map(([name, file]) => [name, { executable: file, executable_realpath: fs.realpathSync(file), executable_sha256: hash(fs.readFileSync(file)) }]));
const samples: Sample[] = [];
for (const arm of sampleOrder(config.arms, config.repetitions)) {
	const counterPath = path.join(directory, `sample-${samples.length}.json`);
	fs.rmSync(counterPath, { force: true });
	const load = os.loadavg()[0]!;
	const result = spawnSync(executables.get(arm.name)!, arm.command.slice(1), {
		argv0: arm.command[0], encoding: 'utf8', maxBuffer: 16 * 1024 * 1024,
		env: { ...process.env, RSVELTE_COUNTER_CHILD: undefined, RSVELTE_COUNTER_REPORT: counterPath, DYLD_INSERT_LIBRARIES: [library, process.env.DYLD_INSERT_LIBRARIES].filter(Boolean).join(':') }
	});
	fs.writeFileSync(path.join(directory, `sample-${samples.length}.log`), result.stdout + result.stderr);
	if (result.status !== 0) throw new Error(`${arm.name} exited ${result.status}: ${result.stderr}`);
	validateWorkloadOutput(config, result.stdout);
	if (!fs.existsSync(counterPath)) throw new Error(`${arm.name}: hardware counter report is missing (a protected binary, or a process that replaced itself with exec)`);
	samples.push({ arm: arm.name, counters: parseCounters(fs.readFileSync(counterPath, 'utf8')), stdout_sha256: hash(result.stdout), load_1m: load });
	fs.writeFileSync(reportPath, JSON.stringify({ status: 'running', config, host, source_sha256: hash(fs.readFileSync(source)), samples }, null, 2) + '\n');
}
// Another writer may rebuild an arm while it is measured; the hash must describe every sample.
for (const [name, identity] of identities) if (hash(fs.readFileSync(identity.executable)) !== identity.executable_sha256) throw new Error(`${name}: the executable changed during the measurement`);
const summary = config.arms.map(({ name, command }) => ({
	name, command, ...identities.get(name)!,
	...summarizeArm(samples.filter(sample => sample.arm === name).map(sample => sample.counters), config.rounds)
}));
fs.writeFileSync(reportPath, JSON.stringify({ status: 'complete', config, host, source_sha256: hash(fs.readFileSync(source)), samples, summary }, null, 2) + '\n');
for (const arm of summary) for (const key of arm.unmeasured) process.stderr.write(`${arm.name} ${key}: UNMEASURED\n`);
process.stdout.write(JSON.stringify(summary, null, 2) + '\n');
