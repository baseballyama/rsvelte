// `measure.ts <command> --main <arm> --experimental <arm> --out <directory> [options]` runs the two
// arms that `arms.ts` writes, and writes what it measures to `<directory>`:
//
// - `universe`: the rules both arms run, `rules.txt` for mode `rules` and
//   `product-<arm>.txt` for mode `product`, and `universe.json` with every rule left out and why.
// - `check --inputs <file> --sample <k>`: `inputs.txt`, the components neither arm fails on in
//   either mode; `excluded.tsv`, the others with the reason; `sample.txt`, every k-th input.
// - `findings`: `findings-<mode>-<arm>.tsv`, the findings of each rule.
// - `wall --repetitions <n> --rounds <n> --threads <list> --allocators <list>`: `wall.jsonl`, one
//   process per line. Each repetition runs every configuration in both arm orders, alternating.
// - `files --rounds <n>`: `files-<mode>-<arm>.tsv`, each input's fastest round alone.
// - `instructions --part whole|rules-<i>-of-<n>`: `instructions-<part>.jsonl`, Valgrind's
//   instruction count of one round less that of no round. `whole` lints `inputs.txt` with all the
//   rules; `rules-<i>-of-<n>` lints `sample.txt` with each rule of its share alone, and with no rule.
// - `platform --main-revision <sha> --experimental-revision <sha>`: `platform.json`.
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

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
const arms = { main: options.main ?? '', experimental: options.experimental ?? '' };
type ArmName = keyof typeof arms;
const armNames: ArmName[] = ['main', 'experimental'];
const modes = ['rules', 'product'] as const;
type Mode = (typeof modes)[number];

function run(file: string, args: string[], env: Record<string, string> = {}): string {
	const result = spawnSync(file, args, {
		encoding: 'utf8',
		maxBuffer: 1 << 30,
		env: { ...process.env, ...env },
	});
	if (result.error) throw result.error;
	if (result.status !== 0)
		throw new Error(`${file} ${args.join(' ')} exited ${result.status}:\n${result.stderr}`);
	return result.stdout;
}

const lines = (text: string) => text.split('\n').filter((line) => line !== '');
const read = (name: string) => lines(fs.readFileSync(at(name), 'utf8'));
const write = (name: string, rows: string[]) =>
	fs.writeFileSync(at(name), rows.map((row) => row + '\n').join(''));
const rulesFile = (mode: Mode, arm: ArmName) =>
	mode === 'rules' ? at('rules.txt') : at(`product-${arm}.txt`);

function universe() {
	const main = new Map(
		lines(run(arms.main, ['rules'])).map((row) => row.split('\t') as [string, string]),
	);
	write('candidates.txt', [...main.keys()]);
	const experimental = new Map(
		lines(run(arms.experimental, ['rules', at('candidates.txt')])).map(
			(row) => row.split('\t') as [string, string],
		),
	);
	const excluded: { rule: string; reason: string }[] = [];
	const rules: string[] = [];
	const meta: string[] = [];
	for (const [rule, kind] of main) {
		const status = experimental.get(rule);
		if (status === undefined) excluded.push({ rule, reason: 'only main has it' });
		else if (status !== 'ok') excluded.push({ rule, reason: `experimental: ${status}` });
		else if (kind === 'type-aware') excluded.push({ rule, reason: 'type-aware in main' });
		else if (kind === 'meta') meta.push(rule);
		else rules.push(rule);
	}
	for (const [rule, status] of experimental)
		if (!main.has(rule)) excluded.push({ rule, reason: `only experimental has it (${status})` });
	// `main`'s full lint compiles each component anyway; `svelte/valid-compile` would compile again.
	const product = [...rules, ...meta.filter((rule) => rule !== 'svelte/valid-compile')].toSorted();
	write('rules.txt', rules);
	write('product-main.txt', product);
	write(
		'product-experimental.txt',
		[
			...product,
			...(experimental.get('svelte/valid-compile') === 'ok' ? ['svelte/valid-compile'] : []),
		].toSorted(),
	);
	const summary = {
		rules: rules.length,
		meta,
		product: { main: product.length, experimental: read('product-experimental.txt').length },
		excluded,
	};
	fs.writeFileSync(at('universe.json'), JSON.stringify(summary, null, '\t') + '\n');
	process.stdout.write(JSON.stringify(summary, null, '\t') + '\n');
}

function check() {
	const all = lines(fs.readFileSync(option('inputs'), 'utf8'));
	const sample = Number(option('sample'));
	const excluded = new Map<string, string[]>();
	for (const mode of modes)
		for (const arm of armNames)
			for (const row of lines(
				run(arms[arm], ['check', mode, rulesFile(mode, arm), option('inputs')]),
			)) {
				const [file, reason] = row.split('\t') as [string, string];
				excluded.set(file, [...(excluded.get(file) ?? []), `${arm} ${mode}: ${reason}`]);
			}
	const inputs = all.filter((file) => !excluded.has(file));
	write('inputs.txt', inputs);
	write(
		'sample.txt',
		inputs.filter((_, index) => index % sample === 0),
	);
	write(
		'excluded.tsv',
		[...excluded].map(([file, reasons]) => `${file}\t${reasons.join('; ')}`),
	);
	process.stdout.write(
		JSON.stringify({ inputs: all.length, linted: inputs.length, excluded: excluded.size }) + '\n',
	);
}

function findings() {
	for (const mode of modes)
		for (const arm of armNames)
			fs.writeFileSync(
				at(`findings-${mode}-${arm}.tsv`),
				run(arms[arm], ['findings', mode, rulesFile(mode, arm), at('inputs.txt')]),
			);
}

function wall() {
	const repetitions = Number(option('repetitions'));
	const rounds = option('rounds');
	const threads = option('threads')
		.split(',')
		.map((t) => (t === 'all' ? String(os.availableParallelism()) : t));
	const allocators = option('allocators').split(',');
	const file = at('wall.jsonl');
	fs.writeFileSync(file, '');
	for (let repetition = 0; repetition < repetitions; repetition++)
		for (const mode of modes)
			for (const allocator of allocators)
				for (const thread of new Set(threads)) {
					const order = repetition % 2 === 0 ? armNames : armNames.toReversed();
					order.forEach((arm, position) => {
						const output = run(
							arms[arm],
							['lint', mode, rulesFile(mode, arm), at('inputs.txt'), rounds, thread],
							{ LINT_ALLOCATOR: allocator },
						);
						const record = { ...JSON.parse(output), repetition, position };
						if (record.allocator !== allocator)
							throw new Error(`asked for ${allocator}, ran ${record.allocator}`);
						fs.appendFileSync(file, JSON.stringify(record) + '\n');
					});
				}
}

function files() {
	const rounds = option('rounds');
	for (const mode of modes)
		for (const arm of armNames)
			fs.writeFileSync(
				at(`files-${mode}-${arm}.tsv`),
				run(arms[arm], ['files', mode, rulesFile(mode, arm), at('inputs.txt'), rounds]),
			);
}

// Instructions of one round, less those of no round: the set-up and reading cost nothing here.
function instructions(arm: ArmName, mode: Mode, rules: string, inputs: string) {
	const count = (rounds: string) => {
		const profile = path.join(os.tmpdir(), `lint-versus-main-${process.pid}.cg`);
		const stdout = run(
			'valgrind',
			[
				'--tool=cachegrind',
				'--cache-sim=no',
				`--cachegrind-out-file=${profile}`,
				arms[arm],
				'lint',
				mode,
				rules,
				inputs,
				rounds,
				'1',
			],
			{ LINT_ALLOCATOR: 'system' },
		);
		const summary = fs.readFileSync(profile, 'utf8').match(/^summary: (\d+)/m);
		fs.rmSync(profile);
		if (!summary) throw new Error(`no summary in the Cachegrind output of ${arm}`);
		return { instructions: Number(summary[1]), report: JSON.parse(stdout) };
	};
	const none = count('0');
	const one = count('1');
	return {
		arm,
		mode,
		documents: one.report.documents,
		rules: one.report.rules,
		findings: one.report.findings,
		round: one.instructions - none.instructions,
		setup: none.instructions,
	};
}

function instructionsPart() {
	const part = option('part');
	const file = at(`instructions-${part}.jsonl`);
	fs.writeFileSync(file, '');
	const append = (record: object) => fs.appendFileSync(file, JSON.stringify(record) + '\n');
	if (part === 'whole') {
		for (const mode of modes)
			for (const arm of armNames)
				append({
					scope: 'whole',
					...instructions(arm, mode, rulesFile(mode, arm), at('inputs.txt')),
				});
		return;
	}
	const share = part.match(/^rules-(\d+)-of-(\d+)$/);
	if (!share) throw new Error(`bad part ${part}`);
	const [index, parts] = [Number(share[1]), Number(share[2])];
	const rules = read('rules.txt').filter((_, i) => i % parts === index);
	const single = path.join(os.tmpdir(), `lint-versus-main-rule-${process.pid}.txt`);
	for (const rule of index === 0 ? ['', ...rules] : rules) {
		fs.writeFileSync(single, rule === '' ? '' : rule + '\n');
		for (const arm of armNames)
			append({
				scope: 'rule',
				rule: rule || null,
				...instructions(arm, 'rules', single, at('sample.txt')),
			});
	}
}

function platform() {
	const cpu = os.cpus()[0]?.model ?? 'unknown';
	// Both arms build with the toolchain this tree pins.
	const toolchain = fs
		.readFileSync(path.join(import.meta.dirname, '../../../../rust-toolchain.toml'), 'utf8')
		.match(/^channel = "(.*)"$/m)?.[1];
	const record = {
		os: `${os.type()} ${os.release()}`,
		arch: os.arch(),
		cpu,
		parallelism: os.availableParallelism(),
		memory_bytes: os.totalmem(),
		rust: toolchain ?? null,
		node: process.version,
		main: option('main-revision'),
		experimental: option('experimental-revision'),
		runner: process.env.RUNNER_NAME ?? null,
		label: options.label ?? null,
	};
	fs.writeFileSync(at('platform.json'), JSON.stringify(record, null, '\t') + '\n');
}

const commands: Record<string, () => void> = {
	universe,
	check,
	findings,
	wall,
	files,
	instructions: instructionsPart,
	platform,
};
const selected = command === undefined ? undefined : commands[command];
if (!selected) throw new Error(`expected one of ${Object.keys(commands).join(', ')}`);
selected();
