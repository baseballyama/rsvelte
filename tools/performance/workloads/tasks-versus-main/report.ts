// `report.ts <results> <report.md>`: one table per task from what `run.ts` measured. Time is the
// fastest warm round of each process (every round but the first), as a median over processes;
// for the type check it is each warm run of the whole command.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const [resultsDirectory, reportFile] = process.argv.slice(2);
if (!resultsDirectory || !reportFile) throw new Error('expected <results> <report.md>');
const at = (...parts: string[]) => path.join(resultsDirectory, ...parts);
const read = (file: string) => (fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : null);
const jsonl = (file: string) =>
	(read(file) ?? '')
		.split('\n')
		.filter(Boolean)
		.map((line) => JSON.parse(line));
const median = (values: number[]) => {
	const sorted = values.toSorted((a, b) => a - b);
	const middle = sorted.length >> 1;
	return sorted.length % 2 ? sorted[middle]! : (sorted[middle - 1]! + sorted[middle]!) / 2;
};
const seconds = (s: number) => (s >= 10 ? s.toFixed(1) : s >= 1 ? s.toFixed(2) : s.toFixed(3));
const mib = (bytes: number) => Math.round(bytes / 2 ** 20).toLocaleString('en-US');
const times = (ratio: number) => `${ratio >= 10 ? ratio.toFixed(0) : ratio.toFixed(1)}x`;
const lines: string[] = [];
const run = JSON.parse(read(at('run.json')) ?? '{}');

type Row = { arm: string; threads: number; round_ns: number[]; peak_resident_bytes: number };
/** A table of time by thread count, with each arm's ratio to `experimental`. */
function table(rows: Row[], arms: [string, string][]) {
	const threads = [...new Set(rows.map((row) => row.threads))].toSorted((a, b) => a - b);
	const cell = (arm: string, count: number) => {
		const own = rows.filter((row) => row.arm === arm && row.threads === count);
		if (own.length === 0) return null;
		return {
			time: median(own.map((row) => Math.min(...row.round_ns.slice(1)) / 1e9)),
			peak: median(own.map((row) => row.peak_resident_bytes)),
			n: own.length,
		};
	};
	const others = arms.filter(([arm]) => arm !== 'experimental');
	lines.push(
		`| Threads | ${arms.map(([, label]) => label).join(' | ')} | ${others.map(([, label]) => `${label} / \`experimental\``).join(' | ')} | Peak MiB, ${arms.map(([, label]) => label).join(' / ')} |`,
		`| --- | ${arms.map(() => '---').join(' | ')} | ${others.map(() => '---').join(' | ')} | --- |`,
	);
	for (const count of threads) {
		const cells = arms.map(([arm]) => cell(arm, count));
		const own = cells[arms.findIndex(([arm]) => arm === 'experimental')];
		const ratios = others.map(([arm]) => {
			const other = cell(arm, count);
			return other && own ? times(other.time / own.time) : '–';
		});
		lines.push(
			`| ${count} | ${cells.map((c) => (c ? `${seconds(c.time)} s` : '–')).join(' | ')} | ${ratios.join(' | ')} | ${cells.map((c) => (c ? mib(c.peak) : '–')).join(' / ')} |`,
		);
	}
	const processes = arms.map(([arm]) => rows.filter((row) => row.arm === arm).length);
	lines.push('', `Processes per arm: ${processes.join(', ')}.`, '');
}

const count = (file: string) => (read(file) ?? '').split('\n').filter(Boolean).length;
lines.push(
	'# Tasks versus main',
	'',
	`- \`experimental\` ${run.revisions?.experimental ?? 'UNMEASURED'}, \`main\` ${run.revisions?.main ?? 'UNMEASURED'}`,
	`- Machine: ${os.cpus()[0]?.model || os.machine()}, ${os.availableParallelism()} logical CPUs, ${process.platform} ${process.arch}, Node ${process.version}`,
	`- Every ${run.every ?? '?'}th component from real projects; ${run.repetitions ?? '?'} repetitions of ${run.rounds ?? '?'} rounds per process.`,
	`- Seconds per step: ${JSON.stringify(run.durations ?? {})}`,
	'',
);

const tasks = jsonl(at('tasks', 'wall.jsonl'));
for (const [task, title] of [
	['parse', 'Parse'],
	['client', 'Compile, client'],
	['server', 'Compile, server'],
	['format', 'Format'],
] as const) {
	const rows = tasks.filter((row) => row.task === task);
	if (rows.length === 0) continue;
	lines.push(
		`## ${title}`,
		'',
		`${count(at('tasks', `inputs-${task}.txt`))} components; ${count(at('tasks', `excluded-${task}.tsv`))} left out because an arm fails on them (\`tasks/excluded-${task}.tsv\`).`,
		'',
	);
	table(rows, [
		['main', '`main`'],
		['experimental', '`experimental`'],
		['official', task === 'format' ? 'Prettier' : 'svelte'],
	]);
}

const lint = jsonl(at('lint', 'wall.jsonl')).filter((row) => row.mode === 'rules');
if (lint.length > 0) {
	lines.push(
		'## Lint',
		'',
		`${count(at('lint', 'inputs.txt'))} components, ${count(at('lint', 'rules.txt'))} rules alone; ${count(at('lint', 'excluded.tsv'))} left out (\`lint/excluded.tsv\`).`,
		'',
	);
	table(lint, [
		['main', '`main`'],
		['experimental', '`experimental`'],
		['eslint', 'ESLint'],
	]);
}

const checks = fs.existsSync(at('check'))
	? fs.readdirSync(at('check')).filter((file) => file.endsWith('.json'))
	: [];
for (const file of checks) {
	const report = JSON.parse(fs.readFileSync(at('check', file), 'utf8'));
	type Sample = { wallMs: number; treePeakRssKiB: number };
	type Arm = {
		label: string;
		errors: number | null;
		warm: Sample[];
		broken: { problem: string }[];
	};
	const arms = report.arms as Record<string, Arm>;
	const time = (arm: Arm) => median(arm.warm.map((sample) => sample.wallMs)) / 1000;
	// tsrs is the checker this branch runs on; tsgo is there to compare.
	const own = arms['rsvelte-tsrs'] ?? arms['rsvelte-tsgo'];
	lines.push(
		`## Type check, ${report.env.id}`,
		'',
		`${report.env.programComponents} components in the program. Each arm's whole command, ${report.env.protocol.rounds} warm runs; TypeScript diagnostics only.`,
		'',
		'| Arm | Time | Arm / `experimental` | Peak MiB, whole process tree | Errors |',
		'| --- | --- | --- | --- | --- |',
	);
	for (const arm of Object.values(arms)) {
		if (arm.warm.length === 0) {
			lines.push(`| ${arm.label} | broken: ${arm.broken[0]?.problem ?? 'no run'} | – | – | – |`);
			continue;
		}
		const ratio = own?.warm.length && arm !== own ? times(time(arm) / time(own)) : '–';
		const peak = median(arm.warm.map((sample) => sample.treePeakRssKiB)) * 1024;
		lines.push(
			`| ${arm.label} | ${seconds(time(arm))} s | ${ratio} | ${mib(peak)} | ${arm.errors} |`,
		);
	}
	if (report.control) lines.push('', `Positive control: ${JSON.stringify(report.control.arms)}`);
	lines.push('');
}

fs.writeFileSync(reportFile, lines.join('\n'));
process.stdout.write(lines.join('\n') + '\n');
