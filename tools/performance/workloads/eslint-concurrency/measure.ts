// `measure.ts run <stage> <out> <values> <repetitions> <label>` runs the ESLint CLI on the project
// `prepare.ts` wrote, once per `--concurrency` value (`off` passes no flag) and repetition, under
// `/usr/bin/time`, and appends one JSON line per process to `<out>/runs.jsonl`.
// `measure.ts report <out>...` prints a Markdown table per runner from those files.
import { spawn, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const here = import.meta.dirname;
const root = path.resolve(here, '../../../..');
const eslintBin = path.join(root, 'tools/oracle/node_modules/eslint/bin/eslint.js');
const linux = process.platform === 'linux';
const mib = (bytes: number) => bytes / 2 ** 20;

type Run = {
	label: string;
	value: string;
	repetition: number;
	status: number | null;
	wall_s: number;
	max_rss_bytes: number;
	peak_footprint_bytes: number | null;
	workers: number | null;
	max_threads: number | null;
	max_children: number;
	files: number | null;
	findings: number | null;
	rules: Record<string, number> | null;
};

function readText(file: string): string | undefined {
	try {
		return fs.readFileSync(file, 'utf8');
	} catch {
		return undefined;
	}
}

const pids = (parent: string) =>
	spawnSync('pgrep', ['-P', parent], { encoding: 'utf8' })
		.stdout.split('\n')
		.filter((pid) => pid !== '');

// The process `/usr/bin/time` started, and how many threads and child processes it has now.
function sample(timePid: number): { threads: number | null; children: number } | undefined {
	if (linux) {
		const node = readText(`/proc/${timePid}/task/${timePid}/children`)?.trim().split(' ')[0];
		if (!node) return undefined;
		const status = readText(`/proc/${node}/status`);
		const threads = status?.match(/^Threads:\s+(\d+)/m)?.[1];
		let tasks: fs.Dirent[];
		try {
			tasks = fs.readdirSync(`/proc/${node}/task`, { withFileTypes: true });
		} catch {
			// The process has just exited.
			return undefined;
		}
		let children = 0;
		for (const task of tasks)
			children += (readText(`/proc/${node}/task/${task.name}/children`) ?? '')
				.split(' ')
				.filter((pid) => pid !== '' && pid !== '\n').length;
		return { threads: threads ? Number(threads) : null, children };
	}
	const node = pids(String(timePid))[0];
	if (!node) return undefined;
	const threads = spawnSync('ps', ['-M', '-p', node], { encoding: 'utf8' })
		.stdout.split('\n')
		.filter((line) => line !== '').length;
	return { threads: threads > 1 ? threads - 1 : null, children: pids(node).length };
}

async function once(stage: string, out: string, value: string, repetition: number, label: string) {
	const name = `${value}-${repetition}`;
	const timeFile = path.join(out, `${name}.time.txt`);
	const stdoutFile = path.join(out, `${name}.stdout.txt`);
	const stderrFile = path.join(out, `${name}.stderr.txt`);
	const args = [
		linux ? '-v' : '-l',
		'-o',
		timeFile,
		process.execPath,
		eslintBin,
		'--no-cache',
		...(value === 'off' ? [] : ['--concurrency', value]),
		'--format',
		path.join(here, 'count.ts'),
		'files',
	];
	const begun = process.hrtime.bigint();
	const child = spawn('/usr/bin/time', args, {
		cwd: stage,
		env: { ...process.env, DEBUG: 'eslint:eslint' },
		stdio: ['ignore', fs.openSync(stdoutFile, 'w'), fs.openSync(stderrFile, 'w')],
	});
	let maxThreads: number | null = null;
	let maxChildren = 0;
	const timer = setInterval(
		() => {
			const now = sample(child.pid!);
			if (!now) return;
			if (now.threads !== null) maxThreads = Math.max(maxThreads ?? 0, now.threads);
			maxChildren = Math.max(maxChildren, now.children);
		},
		linux ? 500 : 2000,
	);
	const status = await new Promise<number | null>((resolve) => child.on('exit', resolve));
	clearInterval(timer);
	const wall = Number(process.hrtime.bigint() - begun) / 1e9;
	const time = fs.readFileSync(timeFile, 'utf8');
	const rss = linux
		? Number(time.match(/Maximum resident set size \(kbytes\): (\d+)/)![1]) * 1024
		: Number(time.match(/(\d+)\s+maximum resident set size/)![1]);
	const footprint = time.match(/(\d+)\s+peak memory footprint/)?.[1];
	const stderr = fs.readFileSync(stderrFile, 'utf8');
	const used = stderr.match(/Linting using (\d+) worker thread/)?.[1];
	const workers = used ? Number(used) : /Linting in single-thread mode/.test(stderr) ? 0 : null;
	let counts: { files: number; findings: number; rules: Record<string, number> } | undefined;
	try {
		counts = JSON.parse(fs.readFileSync(stdoutFile, 'utf8'));
	} catch {
		counts = undefined;
	}
	const run: Run = {
		label,
		value,
		repetition,
		status,
		wall_s: wall,
		max_rss_bytes: rss,
		peak_footprint_bytes: footprint ? Number(footprint) : null,
		workers,
		max_threads: maxThreads,
		max_children: maxChildren,
		files: counts?.files ?? null,
		findings: counts?.findings ?? null,
		rules: counts?.rules ?? null,
	};
	fs.appendFileSync(path.join(out, 'runs.jsonl'), JSON.stringify(run) + '\n');
	const { rules: _, ...brief } = run;
	process.stdout.write(JSON.stringify(brief) + '\n');
}

async function runAll([stage, out, values, repetitions, label]: string[]) {
	if (!stage || !out || !values || !repetitions || !label)
		throw new Error('expected run <stage> <out> <values> <repetitions> <label>');
	fs.mkdirSync(out, { recursive: true });
	fs.writeFileSync(
		path.join(out, 'platform.json'),
		JSON.stringify({
			label,
			os: `${os.type()} ${os.release()}`,
			arch: os.arch(),
			cpu: os.cpus()[0]?.model,
			parallelism: os.availableParallelism(),
			memory_bytes: os.totalmem(),
			node: process.version,
			tree: process.env.GITHUB_SHA ?? null,
		}) + '\n',
	);
	const list = values.split(',');
	for (let repetition = 1; repetition <= Number(repetitions); repetition++) {
		// Alternate the order so that drift during the job does not favor one value.
		const order = repetition % 2 === 1 ? list : list.toReversed();
		for (const value of order)
			// One process at a time, so they never compete for the runner.
			// oxlint-disable-next-line no-await-in-loop
			await once(path.resolve(stage), path.resolve(out), value, repetition, label);
	}
}

const median = (values: number[]) => {
	const sorted = values.toSorted((a, b) => a - b);
	const middle = sorted.length >> 1;
	return sorted.length % 2 === 1 ? sorted[middle]! : (sorted[middle - 1]! + sorted[middle]!) / 2;
};

function report(directories: string[]) {
	type Platform = {
		label: string;
		cpu: string;
		parallelism: number;
		memory_bytes: number;
		node: string;
	};
	const runs: (Run & { platform: Platform })[] = [];
	for (const directory of directories) {
		const platform = JSON.parse(fs.readFileSync(path.join(directory, 'platform.json'), 'utf8'));
		for (const line of fs.readFileSync(path.join(directory, 'runs.jsonl'), 'utf8').split('\n'))
			if (line !== '') runs.push({ ...(JSON.parse(line) as Run), platform });
	}
	const order = ['off', '1', '2', '4', '8', '16', 'auto'];
	const rank = (value: string) => (order.includes(value) ? order.indexOf(value) : order.length);
	const rows: string[] = [];
	for (const label of [...new Set(runs.map((run) => run.label))].toSorted()) {
		const mine = runs.filter((run) => run.label === label);
		const machines = [
			...new Set(
				mine.map(
					({ platform }) =>
						`${platform.cpu}, ${platform.parallelism} CPUs, ${Math.round(mib(platform.memory_bytes))} MiB, Node ${platform.node}`,
				),
			),
		];
		rows.push(
			`### ${label}`,
			'',
			...machines.map((machine) => `- ${machine}`),
			'',
			'| `--concurrency` | Workers | Peak RSS, median (min to max) | Wall time, median (min to max) | Processes | Max threads | Child processes | Files | Findings |',
			'| --- | --- | --- | --- | --- | --- | --- | --- | --- |',
		);
		const values = [...new Set(mine.map((run) => run.value))].toSorted((a, b) => rank(a) - rank(b));
		for (const value of values) {
			const some = mine.filter((run) => run.value === value);
			const ok = some.filter((run) => run.status === 0 || run.status === 1);
			const rss = ok.map((run) => mib(run.max_rss_bytes));
			const wall = ok.map((run) => run.wall_s);
			const set = (key: 'workers' | 'files' | 'findings' | 'max_threads' | 'max_children') =>
				[...new Set(some.map((run) => run[key]))].join(', ');
			const range = (list: number[], digits: number) =>
				list.length === 0
					? 'none'
					: `${median(list).toFixed(digits)} (${Math.min(...list).toFixed(digits)} to ${Math.max(...list).toFixed(digits)})`;
			rows.push(
				`| ${value} | ${set('workers')} | ${range(rss, 0)} MiB | ${range(wall, 1)} s | ${ok.length} of ${some.length} | ${set('max_threads')} | ${set('max_children')} | ${set('files')} | ${set('findings')} |`,
			);
		}
		rows.push('');
	}
	process.stdout.write(rows.join('\n') + '\n');
}

const [command, ...rest] = process.argv.slice(2);
if (command === 'run') await runAll(rest);
else if (command === 'report') report(rest);
else throw new Error('expected `run` or `report`');
