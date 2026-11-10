// `eslint.ts`: ESLint with eslint-plugin-svelte as a third arm. It takes the harness's commands
// (`rules`, `check`, `findings`, `files` and `lint`) and prints the same reports, so `measure.ts`
// runs it as it runs the other two. Mode `product` adds the plugin's processor, as its `base`
// configuration does. More than one thread runs one linter in each worker thread.
// The rule expects a window's `postMessage`; a worker thread's port takes no origin.
/* oxlint-disable unicorn/require-post-message-target-origin */
import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { Worker, isMainThread, parentPort, workerData } from 'node:worker_threads';

const root = path.resolve(import.meta.dirname, '../../../..');
const require = createRequire(path.join(root, 'tools/oracle/package.json'));
const { Linter } = require('eslint');
const plugin = require('eslint-plugin-svelte').default;
const svelteParser = require('svelte-eslint-parser');
const typescriptParser = require('@typescript-eslint/parser');

type Mode = 'rules' | 'product';
const now = () => process.hrtime.bigint();
const out = (text: string) => process.stdout.write(text + '\n');
type Message = { fatal?: boolean; ruleId: string | null; message: string };
// A message without a rule is a parse error or a file ESLint did not lint.
const failure = (messages: Message[]) => messages.find((message) => message.ruleId === null);

const lines = (file: string) =>
	fs
		.readFileSync(file, 'utf8')
		.split('\n')
		.filter((line) => line !== '');

function setUp(mode: Mode, rulesFile: string, inputsFile: string) {
	const rules = lines(rulesFile);
	const unknown = rules.filter((rule) => !(rule.replace(/^svelte\//, '') in plugin.rules));
	if (unknown.length > 0) throw new Error(`eslint-plugin-svelte lacks ${unknown.join(', ')}`);
	const config = [
		{
			files: ['**'],
			plugins: { svelte: plugin },
			rules: Object.fromEntries(rules.map((rule) => [rule, 'error'])),
			// The parsers of the corpus's lint oracle, `tools/oracle/tasks/svelte-lint.ts`.
			languageOptions: {
				parser: svelteParser,
				parserOptions: { parser: typescriptParser, svelteFeatures: { runes: true } },
			},
			...(mode === 'product' ? { processor: 'svelte/svelte' } : {}),
		},
	];
	// The staged files live outside this tree, and ESLint ignores a file outside its `cwd`.
	const linter = new Linter({ cwd: path.parse(root).root });
	const inputs = lines(inputsFile);
	const sources = inputs.map((file) => fs.readFileSync(file, 'utf8'));
	const messages = (index: number): Message[] =>
		linter.verify(sources[index]!, config, { filename: inputs[index]! });
	const count = (index: number) => {
		const found = messages(index);
		const fatal = failure(found);
		if (fatal) throw new Error(`${inputs[index]}: ${fatal.message}`);
		return found.length;
	};
	return { rules, inputs, messages, count };
}

type Request = { mode: Mode; rulesFile: string; inputsFile: string; next: SharedArrayBuffer };

if (!isMainThread) {
	const { mode, rulesFile, inputsFile, next } = workerData as Request;
	const { inputs, count } = setUp(mode, rulesFile, inputsFile);
	const index = new Int32Array(next);
	parentPort!.on('message', () => {
		let findings = 0;
		for (let i = Atomics.add(index, 0, 1); i < inputs.length; i = Atomics.add(index, 0, 1))
			findings += count(i);
		parentPort!.postMessage(findings);
	});
	parentPort!.postMessage('ready');
} else {
	const [command, ...rest] = process.argv.slice(2);
	const argument = (index: number) => {
		const value = rest[index];
		if (value === undefined)
			throw new Error(
				'expected `rules <candidates>`, `check|findings <mode> <rules> <inputs>`, `files <mode> <rules> <inputs> <rounds>` or `lint <mode> <rules> <inputs> <rounds> <threads>`',
			);
		return value;
	};
	const number = (index: number) => {
		const value = Number(argument(index));
		if (!Number.isSafeInteger(value) || value < 0) throw new Error(`bad number ${rest[index]}`);
		return value;
	};
	const mode = () => {
		const value = argument(0);
		if (value !== 'rules' && value !== 'product') throw new Error(`bad mode ${value}`);
		return value;
	};
	switch (command) {
		case 'rules':
			for (const rule of lines(argument(0)))
				out(`${rule}\t${rule.replace(/^svelte\//, '') in plugin.rules ? 'ok' : 'unknown'}`);
			break;
		case 'check': {
			const { inputs, messages } = setUp(mode(), argument(1), argument(2));
			inputs.forEach((file, index) => {
				let reason: string | undefined;
				try {
					reason = failure(messages(index))?.message;
				} catch (error) {
					reason = `threw: ${(error as Error).message.split('\n')[0]}`;
				}
				if (reason !== undefined) out(`${file}\t${reason.replace(/[\n\t]/g, ' ')}`);
			});
			break;
		}
		case 'findings': {
			const { inputs, messages } = setUp(mode(), argument(1), argument(2));
			const counts = new Map<string, number>();
			inputs.forEach((_, index) => {
				for (const message of messages(index)) {
					const code = message.ruleId ?? '(fatal)';
					counts.set(code, (counts.get(code) ?? 0) + 1);
				}
			});
			for (const code of [...counts.keys()].toSorted()) out(`${code}\t${counts.get(code)}`);
			break;
		}
		case 'files': {
			const { inputs, count } = setUp(mode(), argument(1), argument(2));
			const rounds = number(3);
			inputs.forEach((file, index) => {
				let fastest = Infinity;
				for (let round = 0; round < rounds; round++) {
					const begun = now();
					count(index);
					fastest = Math.min(fastest, Number(now() - begun));
				}
				out(`${file}\t${fastest}`);
			});
			break;
		}
		case 'lint': {
			const selected = mode();
			const [rulesFile, inputsFile] = [argument(1), argument(2)];
			const rounds = number(3);
			const threads = Math.max(1, number(4));
			const next = new SharedArrayBuffer(4);
			const shared = new Int32Array(next);
			let pass: () => Promise<number>;
			let documents: number;
			let ruleCount: number;
			const workers: Worker[] = [];
			if (threads === 1) {
				const { inputs, rules, count } = setUp(selected, rulesFile, inputsFile);
				[documents, ruleCount] = [inputs.length, rules.length];
				pass = async () => inputs.reduce((sum, _, index) => sum + count(index), 0);
			} else {
				[documents, ruleCount] = [lines(inputsFile).length, lines(rulesFile).length];
				const request: Request = { mode: selected, rulesFile, inputsFile, next };
				const ready: Promise<unknown>[] = [];
				for (let i = 0; i < threads; i++) {
					const worker = new Worker(new URL(import.meta.url), { workerData: request });
					ready.push(new Promise((resolve) => worker.once('message', resolve)));
					worker.on('error', (error) => {
						throw error;
					});
					workers.push(worker);
				}
				await Promise.all(ready);
				pass = async () => {
					Atomics.store(shared, 0, 0);
					const found = workers.map(
						(worker) => new Promise<number>((resolve) => worker.once('message', resolve)),
					);
					for (const worker of workers) worker.postMessage('pass');
					return (await Promise.all(found)).reduce((sum, n) => sum + n, 0);
				};
			}
			// From the start of the process, so the set-up counts loading ESLint.
			const setupNs = Math.round(performance.now() * 1e6);
			const roundNs: number[] = [];
			let findings: number | undefined;
			for (let round = 0; round < rounds; round++) {
				const begun = now();
				// The rounds are timed one after another.
				// oxlint-disable-next-line no-await-in-loop
				const found = await pass();
				roundNs.push(Number(now() - begun));
				if (findings !== undefined && findings !== found)
					throw new Error(`a round found ${found} findings, another ${findings}`);
				findings = found;
			}
			await Promise.all(workers.map((worker) => worker.terminate()));
			out(
				JSON.stringify({
					arm: 'eslint',
					mode: selected,
					allocator: 'v8',
					documents,
					rules: ruleCount,
					rounds,
					threads,
					findings: findings ?? 0,
					setup_ns: setupNs,
					round_ns: roundNs,
					peak_resident_bytes: process.resourceUsage().maxRSS * 1024,
					allocations: null,
					allocated_bytes: null,
				}),
			);
			break;
		}
		default:
			argument(Infinity);
	}
}
