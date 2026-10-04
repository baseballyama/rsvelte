import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import os from 'node:os';
import { spawnSync } from 'node:child_process';
import { HARDWARE_EVENTS, parsePerfStat, type HardwareCounts } from '../perf-stat.ts';
import { sampleOrder, validateWorkload, validateWorkloadOutput, type Workload } from '../workload.ts';

if (process.platform !== 'linux') throw new Error('perf hardware counters require Linux');
const [configPath, reportPath] = process.argv.slice(2);
if (!configPath || !reportPath) throw new Error('expected <config.json> <report.json>');
const config: Workload = JSON.parse(fs.readFileSync(configPath, 'utf8'));
validateWorkload(config);
const directory = path.resolve(`${reportPath}.samples`);
fs.mkdirSync(directory, { recursive: true });
fs.rmSync(reportPath, { force: true });
const samples: { arm: string; counts: HardwareCounts; status: number | null; raw: string; error?: string }[] = [];
const version = spawnSync('perf', ['--version'], { encoding: 'utf8' });
const metadata = {
	backend: 'perf-hardware', platform: `${process.arch}-${process.platform}`, kernel: os.release(),
	perf: version.status === 0 ? version.stdout.trim() : 'UNMEASURED', config,
	binaries: config.arms.map(arm => ({ name: arm.name, sha256: crypto.createHash('sha256').update(fs.readFileSync(arm.command[0])).digest('hex') }))
};
const save = (status: string) => fs.writeFileSync(reportPath, JSON.stringify({ ...metadata, status, samples }, null, 2) + '\n');
save('running');
for (const arm of sampleOrder(config.arms, config.repetitions)) {
	const raw = path.join(directory, `${samples.length}.perf`);
	fs.rmSync(raw, { force: true });
	const run = spawnSync('perf', ['stat', '-x', ';', '-o', raw, '-e', HARDWARE_EVENTS.join(','), '--', ...arm.command], { encoding: 'utf8', maxBuffer: 1 << 28, env: { ...process.env, LC_ALL: 'C' } });
	fs.writeFileSync(`${raw}.stdout`, run.stdout ?? '');
	fs.writeFileSync(`${raw}.stderr`, run.stderr ?? '');
	const counts = parsePerfStat(fs.existsSync(raw) ? fs.readFileSync(raw, 'utf8') : '');
	samples.push({ arm: arm.name, counts, status: run.status, raw, ...(run.error ? { error: run.error.message } : {}) });
	if (run.status !== 0 || counts.cycles === 0 || counts.instructions === 0 || HARDWARE_EVENTS.some(event => counts[event] === 'UNMEASURED')) {
		save('UNMEASURED');
		process.stderr.write(`Hardware event collection was incomplete. See ${raw} and ${raw}.stderr.\n`);
		process.exitCode = 1;
		break;
	}
	validateWorkloadOutput(config, run.stdout);
	save('running');
}
if (!process.exitCode) save('complete');
