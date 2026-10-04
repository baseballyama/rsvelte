import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import os from 'node:os';
import { spawnSync } from 'node:child_process';
import { CACHE_EVENTS, DEFAULT_CACHE_MODEL, cacheModelKey, compareCache, runCachegrind, type CacheCounts, type CacheModel } from '../cachegrind.ts';
import { sampleOrder, validateWorkload, validateWorkloadOutput, type Workload } from '../workload.ts';

type Config = Workload & { inputs: string[]; sources: string[]; revision?: string; model?: CacheModel; baseline?: string; tolerance?: number };
const [configPath, reportPath] = process.argv.slice(2);
if (!configPath || !reportPath) throw new Error('expected <config.json> <report.json>');
const config: Config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
validateWorkload(config);
if (config.baseline && path.resolve(config.baseline) === path.resolve(reportPath)) throw new Error('baseline and output report must be separate files');
const hash = (bytes: Buffer) => crypto.createHash('sha256').update(bytes).digest('hex');
function manifest(files: string[]) {
	if (!Array.isArray(files) || !files.length || files.some(file => typeof file !== 'string')) throw new Error('inputs and sources must list measured files');
	return files.toSorted().map(file => { const bytes = fs.readFileSync(file); return { path: path.relative(process.cwd(), path.resolve(file)), bytes: bytes.length, sha256: hash(bytes) }; });
}
const model = config.model ?? DEFAULT_CACHE_MODEL;
const modelKey = cacheModelKey(model);
const version = spawnSync('valgrind', ['--version'], { encoding: 'utf8' });
if (version.status !== 0) throw new Error(`Valgrind is unavailable: ${version.error?.message ?? version.stderr}`);
const git = config.revision === undefined ? spawnSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }) : undefined;
if (git && git.status !== 0) throw new Error(`${git.stderr}\nPass revision explicitly for a frozen source snapshot.`);
const revision = config.revision ?? git!.stdout.trim();
if (!/^(?:[a-f0-9]{40}|UNMEASURED)$/.test(revision)) throw new Error('revision must be a full commit hash or UNMEASURED');
const directory = path.resolve(`${reportPath}.samples`);
fs.mkdirSync(directory, { recursive: true });
fs.rmSync(reportPath, { force: true });
const identity = {
	backend: 'cachegrind-simulation', model, model_key: modelKey,
	platform: `${process.arch}-${process.platform}`, kernel: os.release(), valgrind: version.stdout.trim(), revision,
	inputs: manifest(config.inputs), sources: manifest(config.sources),
	harnesses: manifest([import.meta.filename, path.resolve(import.meta.dirname, '../cachegrind.ts'), path.resolve(import.meta.dirname, '../workload.ts')]),
	binaries: config.arms.map(arm => ({ name: arm.name, sha256: hash(fs.readFileSync(arm.command[0])) }))
};
const samples: { arm: string; counts: CacheCounts; raw: string; stdout_sha256: string }[] = [];
const save = (extra: object) => fs.writeFileSync(reportPath, JSON.stringify({ ...identity, config, samples, ...extra }, null, 2) + '\n');
save({ status: 'running' });
for (const arm of sampleOrder(config.arms, config.repetitions)) {
	const raw = path.join(directory, `${samples.length}.cg`);
	const counts = runCachegrind(arm.command, raw, model);
	validateWorkloadOutput(config, fs.readFileSync(`${raw}.stdout`, 'utf8'));
	const annotation = spawnSync('cg_annotate', ['--auto=no', '--threshold=0', '--sort=D1mr,D1mw', raw], { encoding: 'utf8', maxBuffer: 1 << 28 });
	if (annotation.status !== 0) throw new Error(`cg_annotate failed: ${annotation.stderr}`);
	fs.writeFileSync(`${raw}.functions`, annotation.stdout);
	samples.push({ arm: arm.name, counts, raw, stdout_sha256: hash(fs.readFileSync(`${raw}.stdout`)) });
	save({ status: 'running' });
}
const median = (values: number[]) => {
	const sorted = values.toSorted((a, b) => a - b);
	const middle = Math.floor(sorted.length / 2);
	return sorted.length % 2 ? sorted[middle]! : (sorted[middle - 1]! + sorted[middle]!) / 2;
};
const summary = config.arms.map(arm => {
	const selected = samples.filter(sample => sample.arm === arm.name);
	const counts = Object.fromEntries(CACHE_EVENTS.map(event => [event, median(selected.map(sample => sample.counts[event]))])) as CacheCounts;
	return { arm: arm.name, samples: selected.length, counts, per_round: Object.fromEntries(CACHE_EVENTS.map(event => [event, counts[event] / config.rounds])), d1_read_miss_rate: counts.Dr === 0 ? 'UNMEASURED' : counts.D1mr / counts.Dr, d1_write_miss_rate: counts.Dw === 0 ? 'UNMEASURED' : counts.D1mw / counts.Dw };
});
let gate: object = { status: 'UNMEASURED' };
let failed = false;
if (config.baseline) {
	const before = JSON.parse(fs.readFileSync(config.baseline, 'utf8'));
	if (before.status !== 'complete' || before.backend !== identity.backend || before.model_key !== modelKey || before.platform !== identity.platform || before.valgrind !== identity.valgrind || JSON.stringify(before.inputs) !== JSON.stringify(identity.inputs) || before.config.rounds !== config.rounds || before.config.repetitions !== config.repetitions || before.summary.length !== summary.length) throw new Error('baseline population, backend or cache model differs');
	const rows = summary.flatMap(arm => {
		const prior = before.summary.find((row: { arm: string }) => row.arm === arm.arm);
		if (!prior) throw new Error(`baseline has no arm ${arm.arm}`);
		return compareCache(prior.counts, arm.counts, config.tolerance ?? 0.02).map(row => ({ arm: arm.arm, ...row }));
	});
	failed = rows.some(row => row.moved);
	gate = { status: failed ? 'CHANGED' : 'PASS', rows };
}
save({ status: 'complete', summary, gate });
process.stdout.write(JSON.stringify(summary, null, 2) + '\n');
if (failed) process.exitCode = 1;
