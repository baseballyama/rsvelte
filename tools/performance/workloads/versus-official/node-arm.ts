// The measuring half of the Node arms (`official.ts`, `oxfmt.ts`): the commands and reports of
// `harness.rs`, so `measure.ts` runs every arm the same way. More than one thread runs one tool in
// each worker thread, which loads its own copy of the library.
// The rule expects a window's `postMessage`; a worker thread's port takes no origin.
/* oxlint-disable unicorn/require-post-message-target-origin */
import fs from 'node:fs';
import { Worker, isMainThread, parentPort, workerData } from 'node:worker_threads';

export type Task = 'compile-client' | 'compile-server' | 'format';
const tasks: ReadonlySet<string> = new Set(['compile-client', 'compile-server', 'format']);

/** The parts compared with the official output, and the size of what is produced but not compared. */
export interface Output {
	compared: [part: string, text: string][];
	otherBytes: number;
}
export type Tool = (filename: string, source: string) => Output | Promise<Output>;

const now = () => process.hrtime.bigint();
const lines = (file: string) =>
	fs
		.readFileSync(file, 'utf8')
		.split('\n')
		.filter((line) => line !== '');
const bytes = (output: Output) =>
	output.compared.reduce((sum, [, text]) => sum + Buffer.byteLength(text), output.otherBytes);

/** Each input's name relative to the staging root, the filename every arm passes, and its text. */
function inputs(list: string, root: string) {
	const prefix = root.replace(/\/$/, '') + '/';
	return lines(list).map((file) => {
		if (!file.startsWith(prefix)) throw new Error(`${file} is not under ${root}`);
		return { name: file.slice(prefix.length), source: fs.readFileSync(file, 'utf8') };
	});
}

type Files = ReturnType<typeof inputs>;

async function one(tool: Tool, file: Files[number]) {
	let output = tool(file.name, file.source);
	if (output instanceof Promise) output = await output;
	return bytes(output);
}

type Request = { task: Task; list: string; root: string; next: SharedArrayBuffer };

/**
 * Runs the arm `name` from its module `entry` (`import.meta.url`), whose `make` sets up a tool for
 * a task. In a worker thread, it serves the passes the main thread asks for.
 */
export async function arm(name: string, entry: string, make: (task: Task) => Promise<Tool>) {
	if (!isMainThread) {
		const { task, list, root, next } = workerData as Request;
		const files = inputs(list, root);
		const tool = await make(task);
		const index = new Int32Array(next);
		parentPort!.on('message', async () => {
			let produced = 0;
			for (let i = Atomics.add(index, 0, 1); i < files.length; i = Atomics.add(index, 0, 1))
				// A worker takes the next component once it finishes the last.
				// oxlint-disable-next-line no-await-in-loop
				produced += await one(tool, files[i]!);
			parentPort!.postMessage(produced);
		});
		parentPort!.postMessage('ready');
		return;
	}
	const [command, task, list, root, ...rest] = process.argv.slice(2);
	if (!command || !task || !tasks.has(task) || !list || !root)
		throw new Error(
			'expected `outputs <task> <inputs.txt> <root> <output.pack>` or `run <task> <inputs.txt> <root> <rounds> <threads>`',
		);
	const selected = task as Task;
	if (command === 'outputs') {
		const files = inputs(list, root);
		const tool = await make(selected);
		const pack = fs.openSync(rest[0]!, 'w');
		fs.writeSync(pack, '# rsvelte pack 1\n');
		for (const file of files) {
			let output: Output;
			try {
				// The components go one at a time, as in the Rust arms.
				// oxlint-disable-next-line no-await-in-loop
				output = await tool(file.name, file.source);
			} catch (error) {
				const reason = String((error as Error).message ?? error).split('\n')[0]!;
				process.stdout.write(`${file.name}\t${reason.replace(/\t/g, ' ')}\n`);
				continue;
			}
			for (const [part, text] of output.compared)
				fs.writeSync(pack, `=== ${Buffer.byteLength(text)} ${file.name}\t${part}\n${text}\n`);
		}
		fs.closeSync(pack);
		return;
	}
	if (command !== 'run') throw new Error(`unknown command ${command}`);
	const rounds = Number(rest[0]);
	const threads = Math.max(1, Number(rest[1]));
	if (!Number.isSafeInteger(rounds) || !Number.isSafeInteger(threads))
		throw new Error(`bad rounds ${rest[0]} or threads ${rest[1]}`);
	const next = new SharedArrayBuffer(4);
	const shared = new Int32Array(next);
	const workers: Worker[] = [];
	let pass: () => Promise<number>;
	let documents: number;
	if (threads === 1) {
		const files = inputs(list, root);
		const tool = await make(selected);
		documents = files.length;
		pass = async () => {
			let produced = 0;
			// oxlint-disable-next-line no-await-in-loop
			for (const file of files) produced += await one(tool, file);
			return produced;
		};
	} else {
		documents = lines(list).length;
		const request: Request = { task: selected, list, root, next };
		const ready: Promise<unknown>[] = [];
		for (let i = 0; i < threads; i++) {
			const worker = new Worker(new URL(entry), { workerData: request });
			ready.push(new Promise((resolve) => worker.once('message', resolve)));
			worker.on('error', (error) => {
				throw error;
			});
			workers.push(worker);
		}
		await Promise.all(ready);
		pass = async () => {
			Atomics.store(shared, 0, 0);
			const produced = workers.map(
				(worker) => new Promise<number>((resolve) => worker.once('message', resolve)),
			);
			for (const worker of workers) worker.postMessage('pass');
			return (await Promise.all(produced)).reduce((sum, n) => sum + n, 0);
		};
	}
	// From the start of the process, so the set-up counts loading the library.
	const setupNs = Math.round(performance.now() * 1e6);
	const roundNs: number[] = [];
	let produced: number | undefined;
	for (let round = 0; round < rounds; round++) {
		const begun = now();
		// The rounds are timed one after another.
		// oxlint-disable-next-line no-await-in-loop
		const found = await pass();
		roundNs.push(Number(now() - begun));
		if (produced !== undefined && produced !== found)
			throw new Error(`a round produced ${found} bytes, another ${produced}`);
		produced = found;
	}
	await Promise.all(workers.map((worker) => worker.terminate()));
	process.stdout.write(
		JSON.stringify({
			arm: name,
			task: selected,
			allocator: 'v8',
			documents,
			rounds,
			threads,
			output_bytes: produced ?? 0,
			setup_ns: setupNs,
			round_ns: roundNs,
			// The whole process, worker threads included; Node reports kibibytes on every platform.
			peak_resident_bytes: process.resourceUsage().maxRSS * 1024,
			allocations: null,
			allocated_bytes: null,
		}) + '\n',
	);
}
