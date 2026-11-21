// Run by `node --input-type=module-typescript --eval`, so only erasable TypeScript syntax is allowed.
// Sorts class lists with the project's prettier-plugin-tailwindcss, one JSON line in and one out.
import { createRequire } from 'node:module';
import path from 'node:path';
import { createInterface } from 'node:readline';
import { pathToFileURL } from 'node:url';

interface Start {
	base: string;
	stylesheet: string | null;
	config: string | null;
}
interface List {
	text: string;
	collapseWhitespace: boolean;
	removeDuplicates: boolean;
}
interface Request {
	file: string;
	lists: List[];
}
interface Sorter {
	sortClassAttributes(classes: string[]): string[];
}
type CreateSorter = (options: Record<string, unknown>) => Promise<Sorter>;

const send = process.stdout.write.bind(process.stdout);
// Tailwind's own logging must not corrupt the protocol.
process.stdout.write = process.stderr.write.bind(process.stderr) as typeof process.stdout.write;

let start: Start | undefined;
let createSorter: CreateSorter | undefined;
const sorters = new Map<string, Promise<Sorter>>();

// The plugin's `sortClassAttributes` applies its own options, so each way of sorting is a sorter.
function sorter(file: string, list: List): Promise<Sorter> {
	const key = `${path.dirname(file)}\0${list.collapseWhitespace}\0${list.removeDuplicates}`;
	let found = sorters.get(key);
	if (found === undefined) {
		found = createSorter!({
			base: start!.base,
			filepath: file,
			stylesheetPath: start!.stylesheet ?? undefined,
			configPath: start!.config ?? undefined,
			preserveWhitespace: !list.collapseWhitespace,
			preserveDuplicates: !list.removeDuplicates,
		});
		sorters.set(key, found);
	}
	return found;
}

for await (const line of createInterface({ input: process.stdin, crlfDelay: Infinity })) {
	try {
		if (start === undefined) {
			start = JSON.parse(line) as Start;
			const require = createRequire(path.join(start.base, 'package.json'));
			let module: string;
			try {
				module = require.resolve('prettier-plugin-tailwindcss/sorter');
			} catch {
				throw new Error(
					`cannot find prettier-plugin-tailwindcss from ${start.base}; install it: npm install -D prettier-plugin-tailwindcss`,
				);
			}
			({ createSorter } = (await import(pathToFileURL(module).href)) as {
				createSorter: CreateSorter;
			});
			send(`${JSON.stringify({ ready: true })}\n`);
			continue;
		}
		const request = JSON.parse(line) as Request;
		const sorted = await Promise.all(
			request.lists.map(
				async (list) => (await sorter(request.file, list)).sortClassAttributes([list.text])[0]!,
			),
		);
		send(`${JSON.stringify({ sorted })}\n`);
	} catch (error) {
		send(`${JSON.stringify({ error: error instanceof Error ? error.message : String(error) })}\n`);
	}
}
