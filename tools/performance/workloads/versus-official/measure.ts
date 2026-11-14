// `measure.ts <command> --workload compile|format --official official.ts --main <arm>
// --experimental <arm> [--oxfmt oxfmt.ts] --out <directory> [options]` runs the arms and writes what
// it measures to `<directory>`. Workload `compile` runs the tasks `compile-client` and
// `compile-server`; `format` runs `format`, and oxfmt when `--oxfmt` names `oxfmt.ts`.
//
// - `check --inputs <file> --root <directory> --sources all|real`: every arm writes its output for
//   every input of the sources (`real` leaves out this project's own cases, the sources `rsvelte…`).
//   `inputs.txt` is the inputs no arm fails on in any task of the workload; `excluded.tsv` the
//   others with the reasons; `matches.json`, for each task and arm, how many outputs equal the
//   official one byte for byte and, for JavaScript, as the corpus's canonical tree.
// - `control`: breaks the experimental arm on purpose (`ARM_DEFECT` in `harness.rs`) and fails
//   unless `matches.json` and the output size catch it; writes `control.json`.
// - `wall --repetitions <n> --rounds <n> --threads <list> --allocators <list>`: `wall.jsonl`, one
//   process per line. Each repetition runs every configuration with the arms in a rotated order.
//   Every process of an arm must report the same output size over the same inputs.
// - `platform --main-revision <sha> --experimental-revision <sha> [--label <name>]`:
//   `platform.json`, with the tools' versions.
import { spawnSync } from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import os from 'node:os';
import path from 'node:path';
import { parseJs } from '../../../oracle/canonical.ts';
import { readPack } from '../../../oracle/pack.ts';

const root = path.resolve(import.meta.dirname, '../../../..');
const [command, ...rest] = process.argv.slice(2);
const options: Record<string, string> = {};
for (let i = 0; i < rest.length; i += 2) {
	const key = rest[i]!;
	if (!key.startsWith('--') || rest[i + 1] === undefined) throw new Error(`bad option ${key}`);
	options[key.slice(2)] = rest[i + 1]!;
}
const option = (name: string): string => {
	const value = options[name];
	if (value === undefined) throw new Error(`--${name} is required`);
	return value;
};
const out = path.resolve(option('out'));
fs.mkdirSync(out, { recursive: true });
const at = (name: string) => path.join(out, name);
const workload = option('workload');
if (workload !== 'compile' && workload !== 'format') throw new Error(`bad workload ${workload}`);
const tasks = workload === 'compile' ? ['compile-client', 'compile-server'] : ['format'];
const arms: Record<string, string> = {
	official: option('official'),
	main: option('main'),
	experimental: option('experimental'),
	...(workload === 'format' && options.oxfmt ? { oxfmt: options.oxfmt } : {}),
};
const armNames = Object.keys(arms);
const rustArms = new Set(['main', 'experimental']);

function run(arm: string, args: string[], env: Record<string, string> = {}): string {
	let [file, all] = [arms[arm]!, args];
	if (file.endsWith('.ts')) [file, all] = [process.execPath, [file, ...args]];
	const result = spawnSync(file, all, {
		encoding: 'utf8',
		maxBuffer: 1 << 30,
		env: { ...process.env, ...env },
	});
	if (result.error) throw result.error;
	if (result.status !== 0)
		throw new Error(`${arm}: ${all.join(' ')} exited ${result.status}:\n${result.stderr}`);
	return result.stdout;
}

const lines = (text: string) => text.split('\n').filter((line) => line !== '');
const read = (name: string) => lines(fs.readFileSync(at(name), 'utf8'));
const write = (name: string, rows: string[]) =>
	fs.writeFileSync(at(name), rows.map((row) => row + '\n').join(''));
const packFile = (task: string, arm: string, suffix = '') =>
	path.join(out, 'outputs', `${task}-${arm}${suffix}.pack`);

/** Each component's compared parts, `part\0text` joined, keyed by its name. */
function outputsOf(file: string) {
	const byName = new Map<string, Map<string, string>>();
	for (const entry of readPack(file)) {
		const parts = byName.get(entry.path) ?? new Map<string, string>();
		parts.set(entry.attributes[0]!, entry.body);
		byName.set(entry.path, parts);
	}
	return byName;
}

const same = (a: Map<string, string> | undefined, b: Map<string, string> | undefined) =>
	a !== undefined &&
	b !== undefined &&
	a.size === b.size &&
	[...a].every(([part, text]) => b.get(part) === text);

/** The corpus's canonical tree of a module, as text. */
function tree(code: string) {
	try {
		return JSON.stringify(parseJs(code));
	} catch (error) {
		return `unparsable: ${(error as Error).message}`;
	}
}

/**
 * How many of `names` the arm's outputs match the official ones, and a digest of what it wrote.
 * `matched` names the components equal as the corpus compares them: JavaScript as a canonical
 * tree, everything else as text.
 */
function compare(task: string, names: string[], arm: Map<string, Map<string, string>>) {
	const official = outputsOf(packFile(task, 'official'));
	const canonical = new Map<string, string>();
	const hash = crypto.createHash('sha256');
	let bytes = 0;
	let trees = 0;
	const differ: string[] = [];
	const matched: string[] = [];
	for (const name of names) {
		const [mine, theirs] = [arm.get(name), official.get(name)];
		for (const [part, text] of mine ?? []) hash.update(`${name}\0${part}\0${text}\0`);
		if (same(mine, theirs)) {
			bytes++;
			trees++;
			matched.push(name);
			continue;
		}
		differ.push(name);
		if (task === 'format' || !mine || !theirs) continue;
		// The corpus compares JavaScript as a canonical tree and the stylesheet as text.
		if (mine.get('css') !== theirs.get('css')) continue;
		const expected = canonical.get(name) ?? tree(theirs.get('js') ?? '');
		canonical.set(name, expected);
		if (tree(mine.get('js') ?? '') === expected) {
			trees++;
			matched.push(name);
		}
	}
	const summary = {
		files: names.length,
		bytes_equal: bytes,
		trees_equal: task === 'format' ? null : trees,
		digest: hash.digest('hex'),
		first_differences: differ.slice(0, 20),
	};
	return { summary, matched };
}

function check() {
	const list = path.resolve(option('inputs'));
	const stagingRoot = path.resolve(option('root'));
	const prefix = stagingRoot + '/';
	const sources = option('sources');
	if (sources !== 'all' && sources !== 'real') throw new Error(`bad sources ${sources}`);
	// `real` leaves out the sources named `rsvelte…`, the cases written for this project.
	const all = lines(fs.readFileSync(list, 'utf8')).filter(
		(file) => sources === 'all' || !file.slice(prefix.length).startsWith('rsvelte'),
	);
	const selection = path.join(out, 'selected.txt');
	fs.writeFileSync(selection, all.map((file) => file + '\n').join(''));
	fs.mkdirSync(path.join(out, 'outputs'), { recursive: true });
	const excluded = new Map<string, string[]>();
	for (const task of tasks)
		for (const arm of armNames)
			for (const row of lines(
				run(arm, ['outputs', task, selection, stagingRoot, packFile(task, arm)]),
			)) {
				const [name, reason] = row.split('\t') as [string, string];
				excluded.set(name, [...(excluded.get(name) ?? []), `${arm} ${task}: ${reason}`]);
			}
	const inputs = all.filter((file) => !excluded.has(file.slice(prefix.length)));
	write('inputs.txt', inputs);
	write(
		'excluded.tsv',
		[...excluded].toSorted().map(([name, reasons]) => `${name}\t${reasons.join('; ')}`),
	);
	const names = inputs.map((file) => file.slice(prefix.length));
	const matches: Record<string, Record<string, unknown>> = {};
	for (const task of tasks) {
		matches[task] = {};
		for (const arm of armNames)
			matches[task][arm] = compare(task, names, outputsOf(packFile(task, arm))).summary;
	}
	fs.writeFileSync(at('matches.json'), JSON.stringify(matches, null, '\t') + '\n');
	const summary = {
		sources,
		inputs: all.length,
		measured: inputs.length,
		excluded: excluded.size,
	};
	fs.writeFileSync(at('check.json'), JSON.stringify(summary, null, '\t') + '\n');
	process.stdout.write(JSON.stringify(summary) + '\n');
}

function control() {
	const task = tasks[0]!;
	const stagingRoot = path.resolve(option('root'));
	const inputs = read('inputs.txt');
	const names = inputs.map((file) => file.slice(stagingRoot.length + 1));
	// The defect changes every seventh output; the ones that matched must stop matching.
	const clean = compare(task, names, outputsOf(packFile(task, 'experimental')));
	const sound = new Set(clean.matched);
	const broken = names.filter((name, index) => index % 7 === 0 && sound.has(name)).length;
	run(
		'experimental',
		['outputs', task, at('inputs.txt'), stagingRoot, packFile(task, 'experimental', '-corrupt')],
		{ ARM_DEFECT: 'corrupt' },
	);
	const corrupt = compare(task, names, outputsOf(packFile(task, 'experimental', '-corrupt')));
	// The defect leaves every second component out of a timed round; its output must shrink.
	const timed = (defect: string) =>
		JSON.parse(
			run('experimental', ['run', task, at('inputs.txt'), stagingRoot, '1', '1'], {
				ARM_DEFECT: defect,
			}),
		);
	const [whole, skipped] = [timed(''), timed('skip')];
	const record = {
		task,
		corrupt: {
			matched: clean.matched.length,
			expected_with_defect: clean.matched.length - broken,
			with_defect: corrupt.matched.length,
			digest_changed: corrupt.summary.digest !== clean.summary.digest,
		},
		skip: { output_bytes: whole.output_bytes, with_defect: skipped.output_bytes },
	};
	fs.writeFileSync(at('control.json'), JSON.stringify(record, null, '\t') + '\n');
	if (
		broken === 0 ||
		corrupt.matched.length !== clean.matched.length - broken ||
		!record.corrupt.digest_changed ||
		skipped.output_bytes >= whole.output_bytes
	)
		throw new Error(`the deliberate defects went unseen: ${JSON.stringify(record)}`);
	process.stdout.write(JSON.stringify(record) + '\n');
}

function wall() {
	const stagingRoot = path.resolve(option('root'));
	const repetitions = Number(option('repetitions'));
	const rounds = option('rounds');
	const threads = [
		...new Set(
			option('threads')
				.split(',')
				.map((t) => (t === 'all' ? String(os.availableParallelism()) : t)),
		),
	];
	const allocators = option('allocators').split(',');
	const documents = read('inputs.txt').length;
	const sizes = new Map<string, number>();
	const file = at('wall.jsonl');
	fs.writeFileSync(file, '');
	for (let repetition = 0; repetition < repetitions; repetition++)
		for (const task of tasks)
			for (const allocator of allocators)
				for (const thread of threads) {
					// Each arm takes each place in turn.
					const order = armNames.map((_, i) => armNames[(i + repetition) % armNames.length]!);
					order.forEach((arm, position) => {
						// A Node arm has no allocator to pick, so it runs once.
						if (!rustArms.has(arm) && allocator !== allocators[0]) return;
						const output = run(arm, ['run', task, at('inputs.txt'), stagingRoot, rounds, thread], {
							ARM_ALLOCATOR: allocator,
						});
						const record = { ...JSON.parse(output), repetition, position };
						if (rustArms.has(arm) && record.allocator !== allocator)
							throw new Error(`asked for ${allocator}, ran ${record.allocator}`);
						if (record.documents !== documents)
							throw new Error(`${arm} ran ${record.documents} of ${documents} inputs`);
						const key = `${arm}\t${task}`;
						const size = sizes.get(key) ?? record.output_bytes;
						if (record.output_bytes !== size || size === 0)
							throw new Error(
								`${arm} ${task} produced ${record.output_bytes} bytes, before ${size}`,
							);
						sizes.set(key, size);
						fs.appendFileSync(file, JSON.stringify(record) + '\n');
					});
				}
}

const installed = (require: NodeJS.Require, name: string): string =>
	JSON.parse(fs.readFileSync(require.resolve(`${name}/package.json`), 'utf8')).version;

function platform() {
	const registry = JSON.parse(
		fs.readFileSync(path.join(root, 'corpus/_registry/oracles.json'), 'utf8'),
	);
	const pinned: Record<string, string> =
		registry[workload === 'compile' ? 'svelte.compile' : 'svelte.format'].oracles;
	// The installed packages must be the versions the corpus's expected output came from.
	const oracle = createRequire(path.join(root, 'tools/oracle/package.json'));
	const versions: Record<string, string> = {};
	for (const [name, version] of Object.entries(pinned)) {
		const found = installed(oracle, name);
		if (found !== version)
			throw new Error(`${name} ${found} is installed, the corpus pins ${version}`);
		versions[name] = found;
	}
	if (arms.oxfmt) {
		const directory = process.env.OXFMT_DIRECTORY;
		if (!directory) throw new Error('OXFMT_DIRECTORY is not set');
		const near = createRequire(path.join(path.resolve(directory), 'package.json'));
		versions.oxfmt = installed(near, 'oxfmt');
		versions['svelte (next to oxfmt)'] = installed(near, 'svelte');
	}
	// Both Rust arms build with the toolchain this tree pins.
	const toolchain = fs
		.readFileSync(path.join(root, 'rust-toolchain.toml'), 'utf8')
		.match(/^channel = "(.*)"$/m)?.[1];
	const record = {
		workload,
		os: `${os.type()} ${os.release()}`,
		arch: os.arch(),
		cpu: os.cpus()[0]?.model ?? 'unknown',
		parallelism: os.availableParallelism(),
		memory_bytes: os.totalmem(),
		rust: toolchain ?? null,
		node: process.version,
		main: option('main-revision'),
		experimental: option('experimental-revision'),
		runner: process.env.RUNNER_NAME ?? null,
		versions,
		label: options.label ?? null,
	};
	fs.writeFileSync(at('platform.json'), JSON.stringify(record, null, '\t') + '\n');
}

const commands: Record<string, () => void> = { check, control, wall, platform };
const selected = command === undefined ? undefined : commands[command];
if (!selected) throw new Error(`expected one of ${Object.keys(commands).join(', ')}`);
selected();
