import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { sampleOrder, validateWorkload, validateWorkloadOutput, type Workload } from '../workload.ts';

type Counters = { cycles: number; instructions: number; user_time_ns: number; system_time_ns: number };
type Sample = { arm: string; counters: Counters; stdout_sha256: string };
if (process.platform !== 'darwin') throw new Error('CPU counter collection requires macOS');
const [configPath, reportPath] = process.argv.slice(2);
if (!configPath || !reportPath) throw new Error('expected <config.json> <report.json>');
const config: Workload = JSON.parse(fs.readFileSync(configPath, 'utf8'));
validateWorkload(config);
fs.mkdirSync(path.dirname(path.resolve(reportPath)), { recursive: true });
const directory = path.resolve(`${reportPath}.samples`);
fs.mkdirSync(directory, { recursive: true });
fs.rmSync(reportPath, { force: true });
const source = path.resolve(import.meta.dirname, '../macos-counters.c');
const library = path.join(directory, 'macos-counters.dylib');
const build = spawnSync('clang', ['-O2', '-dynamiclib', source, '-o', library], { encoding: 'utf8' });
if (build.status !== 0) throw new Error(build.stderr);
const samples: Sample[] = [];
const hash = (value: string | Buffer) => crypto.createHash('sha256').update(value).digest('hex');
for (const arm of sampleOrder(config.arms, config.repetitions)) {
	const counterPath = path.join(directory, `sample-${samples.length}.json`);
	fs.rmSync(counterPath, { force: true });
	const result = spawnSync(arm.command[0], arm.command.slice(1), {
		encoding: 'utf8', maxBuffer: 16 * 1024 * 1024,
		env: { ...process.env, RSVELTE_COUNTER_REPORT: counterPath, DYLD_INSERT_LIBRARIES: [library, process.env.DYLD_INSERT_LIBRARIES].filter(Boolean).join(':') }
	});
	fs.writeFileSync(path.join(directory, `sample-${samples.length}.log`), result.stdout + result.stderr);
	if (result.status !== 0) throw new Error(`${arm.name} exited ${result.status}: ${result.stderr}`);
	validateWorkloadOutput(config, result.stdout);
	if (!fs.existsSync(counterPath)) throw new Error(`${arm.name}: hardware counter report is missing`);
	const counters: Counters = JSON.parse(fs.readFileSync(counterPath, 'utf8'));
	for (const key of ['cycles', 'instructions', 'user_time_ns', 'system_time_ns'] as const) {
		const value = counters[key];
		if (!Number.isSafeInteger(value) || value < 0) throw new Error(`invalid ${key} counter`);
	}
	if (counters.cycles === 0 || counters.instructions === 0) throw new Error('hardware counters did not increase');
	samples.push({ arm: arm.name, counters, stdout_sha256: hash(result.stdout) });
	fs.writeFileSync(reportPath, JSON.stringify({ status: 'running', config, source_sha256: hash(fs.readFileSync(source)), samples }, null, 2) + '\n');
}
const median = (values: number[]) => {
	const sorted = values.toSorted((a, b) => a - b);
	const middle = Math.floor(sorted.length / 2);
	if (!sorted.length) throw new Error("no samples");
	return sorted.length % 2 ? sorted[middle]! : (sorted[middle - 1]! + sorted[middle]!) / 2;
};
const summary = config.arms.map(({ name, command }) => {
	const selected = samples.filter(sample => sample.arm === name);
	const cycles = selected.map(sample => sample.counters.cycles / config.rounds);
	return { name, samples: selected.length, executable_sha256: hash(fs.readFileSync(command[0])), median_cycles_per_round: median(cycles), min_cycles_per_round: Math.min(...cycles), max_cycles_per_round: Math.max(...cycles), median_instructions_per_round: median(selected.map(sample => sample.counters.instructions / config.rounds)) };
});
fs.writeFileSync(reportPath, JSON.stringify({ status: 'complete', config, source_sha256: hash(fs.readFileSync(source)), samples, summary }, null, 2) + '\n');
process.stdout.write(JSON.stringify(summary, null, 2) + '\n');
