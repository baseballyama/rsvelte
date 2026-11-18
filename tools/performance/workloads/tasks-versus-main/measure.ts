// `measure.ts <command> --main <arm> --experimental <arm> --official official.ts --out <directory>
// [options]` runs the three arms and writes what it measures to `<directory>`:
//
// - `check --inputs <file> --tasks <list>`: for each task, `inputs-<task>.txt`, the components no
//   arm fails on, and `excluded-<task>.tsv`, the others with each arm's reason.
// - `wall --tasks <list> --threads <list> --repetitions <n> --rounds <n>`: `wall.jsonl`, one
//   process per line. Each repetition runs every configuration with the arms in one order, and the
//   next repetition in the reverse order.
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
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
const list = (name: string) => option(name).split(',').filter(Boolean);
const out = path.resolve(option('out'));
fs.mkdirSync(out, { recursive: true });
const at = (name: string) => path.join(out, name);
const arms = {
	main: path.resolve(option('main')),
	experimental: path.resolve(option('experimental')),
	official: path.resolve(option('official')),
};
const armNames = Object.keys(arms) as (keyof typeof arms)[];
const tasks = list('tasks');
for (const task of tasks)
	if (!['parse', 'client', 'server', 'format'].includes(task)) throw new Error(`bad task ${task}`);

function run(arm: keyof typeof arms, args: string[]): string {
	let [file, argv] = [arms[arm], args];
	if (file.endsWith('.ts')) [file, argv] = [process.execPath, [file, ...args]];
	const result = spawnSync(file, argv, { encoding: 'utf8', maxBuffer: 1 << 30 });
	if (result.error) throw result.error;
	if (result.status !== 0)
		throw new Error(`${arm} ${args.join(' ')} exited ${result.status}:\n${result.stderr}`);
	return result.stdout;
}
const lines = (text: string) => text.split('\n').filter((line) => line !== '');

switch (command) {
	case 'check': {
		const inputs = lines(fs.readFileSync(option('inputs'), 'utf8'));
		for (const task of tasks) {
			const reasons = new Map<string, string[]>();
			for (const arm of armNames)
				for (const line of lines(run(arm, ['check', task, option('inputs')]))) {
					const [file, reason] = line.split('\t');
					reasons.set(file!, [...(reasons.get(file!) ?? []), `${arm}: ${reason}`]);
				}
			const kept = inputs.filter((file) => !reasons.has(file));
			fs.writeFileSync(at(`inputs-${task}.txt`), kept.join('\n') + '\n');
			fs.writeFileSync(
				at(`excluded-${task}.tsv`),
				[...reasons].map(([file, why]) => `${file}\t${why.join('; ')}\n`).join(''),
			);
			process.stdout.write(`${task}: ${kept.length} kept, ${reasons.size} excluded\n`);
		}
		break;
	}
	case 'wall': {
		const threads = list('threads').map(Number);
		const repetitions = Number(option('repetitions'));
		const rounds = option('rounds');
		const file = at('wall.jsonl');
		for (let repetition = 0; repetition < repetitions; repetition++) {
			const order = repetition % 2 === 0 ? armNames : armNames.toReversed();
			for (const task of tasks)
				for (const count of threads)
					for (const [position, arm] of order.entries()) {
						// The official tools run as they are called plainly, on one thread.
						if (arm === 'official' && count !== 1) continue;
						const report = JSON.parse(
							run(arm, ['run', task, at(`inputs-${task}.txt`), rounds, String(count)]),
						);
						fs.appendFileSync(file, JSON.stringify({ ...report, repetition, position }) + '\n');
						process.stdout.write(
							`${task} ${arm} ${count} thread(s): ${(Math.min(...report.round_ns) / 1e9).toFixed(3)} s\n`,
						);
					}
		}
		break;
	}
	default:
		throw new Error('expected the command `check` or `wall`');
}
