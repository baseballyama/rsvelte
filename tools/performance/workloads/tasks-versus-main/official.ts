// `official.ts`: the official tools as a third arm. It takes the Rust arms' commands (`check` and
// `run`) and prints the same reports. Parse and compile call `svelte/compiler`, format calls
// Prettier with prettier-plugin-svelte, with the options of the corpus's oracle. It runs on one
// thread, as the tools do when called plainly; `measure.ts` runs it only at one thread.
import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { FORMAT_OPTIONS } from '../../../oracle/tasks/svelte-format.ts';

const root = path.resolve(import.meta.dirname, '../../../..');
const require = createRequire(path.join(root, 'tools/oracle/package.json'));
const svelte = require('svelte/compiler') as typeof import('svelte/compiler');
// Only the call this arm makes; Prettier's types are not installed in this package.
const prettier = require('prettier') as {
	format(source: string, options: object): Promise<string>;
};
const sveltePlugin = require('prettier-plugin-svelte');

const TASKS = ['parse', 'client', 'server', 'format'] as const;
type Task = (typeof TASKS)[number];
const now = () => process.hrtime.bigint();
const out = (text: string) => process.stdout.write(text + '\n');

const lines = (file: string) =>
	fs
		.readFileSync(file, 'utf8')
		.split('\n')
		.filter((line) => line !== '');

/** The bytes of output for file `index`; throws when the tool rejects it. */
function setUp(task: Task, inputsFile: string) {
	const inputs = lines(inputsFile);
	const sources = inputs.map((file) => fs.readFileSync(file, 'utf8'));
	const run = async (index: number): Promise<number> => {
		const [source, filename] = [sources[index]!, inputs[index]!];
		switch (task) {
			case 'parse':
				svelte.parse(source, { modern: true });
				return 0;
			case 'client':
			case 'server': {
				const result = svelte.compile(source, { filename, runes: true, generate: task });
				return result.js.code.length + (result.css?.code.length ?? 0);
			}
			case 'format': {
				const text = await prettier.format(source, {
					...FORMAT_OPTIONS,
					filepath: filename,
					plugins: [sveltePlugin],
				});
				return text.length;
			}
		}
	};
	return { inputs, run };
}

const [command, taskName, inputsFile, roundsText, threadsText] = process.argv.slice(2);
if (!TASKS.includes(taskName as Task) || !inputsFile)
	throw new Error(
		'expected `check <task> <inputs.txt>` or `run <task> <inputs.txt> <rounds> <threads>`',
	);
const task = taskName as Task;
switch (command) {
	case 'check': {
		const { inputs, run } = setUp(task, inputsFile);
		for (const [index, file] of inputs.entries()) {
			try {
				// One file at a time, so an error names its file.
				// oxlint-disable-next-line no-await-in-loop
				await run(index);
			} catch (error) {
				const reason = (error as Error).message.split('\n')[0]!;
				out(`${file}\t${reason.replace(/\t/g, ' ')}`);
			}
		}
		break;
	}
	case 'run': {
		const rounds = Number(roundsText);
		if (!Number.isSafeInteger(rounds) || threadsText !== '1')
			throw new Error(`bad rounds ${roundsText} or threads ${threadsText}; only one thread runs`);
		const { inputs, run } = setUp(task, inputsFile);
		const pass = async () => {
			let bytes = 0;
			// One file at a time, as the Rust arms' single thread does.
			// oxlint-disable-next-line no-await-in-loop
			for (let index = 0; index < inputs.length; index++) bytes += await run(index);
			return bytes;
		};
		// From the start of the process, so the set-up counts loading the tools.
		const setupNs = Math.round(performance.now() * 1e6);
		const roundNs: number[] = [];
		let output: number | undefined;
		for (let round = 0; round < rounds; round++) {
			const begun = now();
			// The rounds are timed one after another.
			// oxlint-disable-next-line no-await-in-loop
			const bytes = await pass();
			roundNs.push(Number(now() - begun));
			if (output !== undefined && output !== bytes)
				throw new Error(`a round wrote ${bytes} bytes, another ${output}`);
			output = bytes;
		}
		out(
			JSON.stringify({
				arm: 'official',
				task,
				documents: inputs.length,
				rounds,
				threads: 1,
				output_bytes: output ?? 0,
				setup_ns: setupNs,
				round_ns: roundNs,
				peak_resident_bytes: process.resourceUsage().maxRSS * 1024,
			}),
		);
		break;
	}
	default:
		throw new Error(`unknown command ${command}`);
}
