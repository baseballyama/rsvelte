// `report.ts <report.md> <results directory>…`: compares the arms from what `measure.ts` wrote,
// one results directory per workload and platform. A ratio is an arm over the official tool, so
// below 1 means the arm is faster or smaller.
import fs from 'node:fs';
import path from 'node:path';

const [reportFile, ...directories] = process.argv.slice(2);
if (!reportFile || directories.length === 0)
	throw new Error('expected <report.md> <results directory>…');

const exists = (directory: string, name: string) => fs.existsSync(path.join(directory, name));
const text = (directory: string, name: string) =>
	fs.readFileSync(path.join(directory, name), 'utf8');
const json = (directory: string, name: string) => JSON.parse(text(directory, name));
const rows = (directory: string, name: string) =>
	text(directory, name)
		.split('\n')
		.filter((line) => line !== '');

const quantile = (values: number[], q: number) => {
	const s = values.toSorted((a, b) => a - b);
	if (s.length === 0) return NaN;
	const position = (s.length - 1) * q;
	const [low, high] = [Math.floor(position), Math.ceil(position)];
	return s[low]! + (s[high]! - s[low]!) * (position - low);
};
const median = (values: number[]) => quantile(values, 0.5);
const ms = (ns: number) => (Number.isNaN(ns) ? '-' : (ns / 1e6).toFixed(1));
const ratio = (arm: number, official: number) =>
	Number.isNaN(arm) || Number.isNaN(official) ? '-' : (arm / official).toFixed(3);
const mib = (bytes: number) => (Number.isNaN(bytes) ? '-' : (bytes / 2 ** 20).toFixed(1));
const table = (header: string[], body: (string | number)[][]) =>
	[
		`| ${header.join(' | ')} |`,
		`| ${header.map(() => '---').join(' | ')} |`,
		...body.map((row) => `| ${row.join(' | ')} |`),
	].join('\n');

type Run = {
	arm: string;
	task: string;
	allocator: string;
	threads: number;
	setup_ns: number;
	round_ns: number[];
	peak_resident_bytes: number;
	repetition: number;
};

const measured = directories.filter((d) => exists(d, 'platform.json'));
const workloads = ['compile', 'format'];
const out: string[] = [
	'# Compile and format: the official tools, main and experimental',
	'',
	'Every arm runs the same components with the same filenames, read before the timing starts. A',
	'ratio is an arm over the official tool: below 1 means the arm is faster or smaller. Times are',
	"the median over processes of each process's fastest warm round; the cold round is each",
	"process's first. A Node arm with more than one thread runs one compiler or formatter in each",
	'worker thread, and its peak resident set is the whole process. The Rust arms are built from',
	'`tools/performance/workloads/versus-official` with one profile and harness, and run with the',
	'allocator in the `allocator` column; the Node arms have only V8, so their row repeats.',
	'',
];

for (const workload of workloads) {
	const here = measured.filter((d) => json(d, 'platform.json').workload === workload);
	if (here.length === 0) continue;
	const first = here[0]!;
	const p = json(first, 'platform.json');
	const versions = Object.entries(p.versions as Record<string, string>)
		.map(([name, version]) => `${name} ${version}`)
		.join(', ');
	const check = exists(first, 'check.json') ? json(first, 'check.json') : null;
	out.push(
		`## ${workload === 'compile' ? 'Compile' : 'Format'}`,
		'',
		`- main \`${p.main}\`, experimental \`${p.experimental}\`, Rust ${p.rust}, Node ${p.node}.`,
		`- ${versions}.`,
	);
	if (check)
		out.push(
			`- Sources: ${check.sources === 'real' ? "every corpus source but this project's own cases (`rsvelte…`)" : 'the whole corpus'}. ${check.inputs} components; ${check.measured} measured, ${check.excluded} left out because an arm fails on one of them.`,
		);
	out.push('');
	if (exists(first, 'excluded.tsv') && rows(first, 'excluded.tsv').length > 0) {
		const excluded = rows(first, 'excluded.tsv').map((row) => row.split('\t') as [string, string]);
		const byArm = new Map<string, number>();
		for (const [, reasons] of excluded)
			for (const arm of new Set(reasons.split('; ').map((r) => r.split(':')[0]!)))
				byArm.set(arm, (byArm.get(arm) ?? 0) + 1);
		out.push(
			'Components each arm fails on (a component can count for several):',
			'',
			table(
				['arm and task', 'components'],
				[...byArm].toSorted().map(([arm, n]) => [arm, n]),
			),
			'',
			'<details><summary>Components left out (the first 300; the artifact has all)</summary>',
			'',
			table(
				['component', 'reason'],
				excluded
					.slice(0, 300)
					.map(([name, reason]) => [name, reason.replace(/\|/g, '\\|').slice(0, 240)]),
			),
			'',
			'</details>',
			'',
		);
	}
	for (const directory of here) {
		const runner = json(directory, 'platform.json');
		out.push(
			`### ${runner.label ?? runner.os} (${runner.arch}, ${runner.cpu}, ${runner.parallelism} threads)`,
			'',
		);
		if (exists(directory, 'matches.json')) {
			const matches = json(directory, 'matches.json') as Record<
				string,
				Record<string, { files: number; bytes_equal: number; trees_equal: number | null }>
			>;
			out.push(
				'Outputs equal to the official output, over the measured components. JavaScript also compares as the canonical tree the corpus uses (`tools/oracle/canonical.ts`); the stylesheet always compares as text.',
				'',
				table(
					['task', 'arm', 'components', 'byte for byte', 'same tree'],
					Object.entries(matches).flatMap(([task, arms]) =>
						Object.entries(arms)
							.filter(([arm]) => arm !== 'official')
							.map(([arm, m]) => [task, arm, m.files, m.bytes_equal, m.trees_equal ?? '-']),
					),
				),
				'',
			);
		}
		if (exists(directory, 'control.json')) {
			const c = json(directory, 'control.json');
			out.push(
				`Control (\`${c.task}\`): the experimental arm matches ${c.corrupt.matched} components as the corpus compares them; changed on purpose in every seventh output it matches ${c.corrupt.with_defect}, as expected ${c.corrupt.expected_with_defect}. Skipping every second component on purpose, one round produces ${c.skip.with_defect} bytes instead of ${c.skip.output_bytes}.`,
				'',
			);
		}
		if (!exists(directory, 'wall.jsonl')) continue;
		const records = rows(directory, 'wall.jsonl').map((line) => JSON.parse(line) as Run);
		const arms = ['official', 'main', 'experimental', 'oxfmt'].filter((arm) =>
			records.some((r) => r.arm === arm),
		);
		const allocators = [
			...new Set(records.filter((r) => r.allocator !== 'v8').map((r) => r.allocator)),
		];
		const keys = [...new Set(records.map((r) => `${r.task}\t${r.threads}`))];
		const of = (task: string, threads: string, arm: string, allocator: string) =>
			records.filter(
				(r) =>
					r.task === task &&
					String(r.threads) === threads &&
					r.arm === arm &&
					(r.allocator === 'v8' || r.allocator === allocator),
			);
		const warm = (rs: Run[]) => median(rs.map((r) => Math.min(...r.round_ns.slice(1))));
		const cold = (rs: Run[]) => median(rs.map((r) => r.round_ns[0]!));
		const others = arms.filter((arm) => arm !== 'official');
		const time: (string | number)[][] = [];
		const memory: (string | number)[][] = [];
		for (const key of keys) {
			const [task, threads] = key.split('\t') as [string, string];
			for (const allocator of allocators) {
				const runs = Object.fromEntries(
					arms.map((arm) => [arm, of(task, threads, arm, allocator)]),
				);
				const official = runs.official!;
				time.push([
					task,
					allocator,
					threads,
					...arms.map((arm) => ms(warm(runs[arm]!))),
					...others.map((arm) => ratio(warm(runs[arm]!), warm(official))),
					...others.map((arm) => ratio(cold(runs[arm]!), cold(official))),
				]);
				memory.push([
					task,
					allocator,
					threads,
					...arms.map((arm) => mib(median(runs[arm]!.map((r) => r.peak_resident_bytes)))),
					...arms.map((arm) => ms(median(runs[arm]!.map((r) => r.setup_ns)))),
				]);
			}
		}
		const repetitions = new Set(records.map((r) => r.repetition)).size;
		const rounds = records[0]?.round_ns.length ?? 0;
		out.push(
			`Wall-clock time of one pass over every measured component, in ms: ${repetitions} processes per configuration, ${rounds} rounds each.`,
			'',
			table(
				[
					'task',
					'allocator',
					'threads',
					...arms,
					...others.map((arm) => `${arm} / official`),
					...others.map((arm) => `cold ${arm} / official`),
				],
				time,
			),
			'',
			'Peak resident set of the process in MiB, and the set-up in ms (from the start of the process: reading the inputs and loading the library, before the first round).',
			'',
			table(
				[
					'task',
					'allocator',
					'threads',
					...arms.map((arm) => `${arm} MiB`),
					...arms.map((arm) => `${arm} set-up`),
				],
				memory,
			),
			'',
		);
	}
}

fs.writeFileSync(reportFile, out.join('\n') + '\n');
