// Rune modules made from test262's language tests, so the corpus reads JavaScript syntax no
// component happens to use: `node test262.ts <checkout of test262 at COMMIT>`. A test that must
// fail to parse, or runs only in sloppy mode, is left out, as a module is strict.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { CORPUS } from './paths.ts';

const COMMIT = '4db99ac4dc8924279ae07ed3246385924e878519';
const OUT = path.join(CORPUS, '_own', 'test262');
/** The tests taken from each directory, spread over its sorted files. */
const PER_DIRECTORY = 8;
/** A larger test is mostly generated repetition. */
const MAX_BYTES = 8192;

/** The test262 front matter's flags, and whether it expects an error. */
export function admitted(text: string): boolean {
	const meta = /\/\*---([\s\S]*?)---\*\//.exec(text)?.[1];
	if (meta === undefined || /^negative:/m.test(meta)) return false;
	const flags = /^flags:\s*\[([^\]]*)\]/m.exec(meta)?.[1] ?? '';
	return !/\b(noStrict|raw|CanBlockIsFalse|CanBlockIsTrue)\b/.test(flags);
}

/** Every `.js` file under `dir`, by path relative to `root`, sorted. */
function files(root: string, dir: string): string[] {
	return fs
		.globSync('**/*.js', { cwd: path.join(root, dir) })
		.map((f) => path.join(dir, f))
		.toSorted();
}

/** The tests to copy, by their path in the checkout. */
function chosen(root: string): string[] {
	const byDirectory = new Map<string, string[]>();
	for (const file of files(root, 'test/language')) {
		if (file.includes('_FIXTURE')) continue;
		const text = fs.readFileSync(path.join(root, file), 'utf8');
		if (Buffer.byteLength(text) > MAX_BYTES || !admitted(text)) continue;
		const dir = path.dirname(file);
		byDirectory.set(dir, [...(byDirectory.get(dir) ?? []), file]);
	}
	const out: string[] = [];
	for (const tests of byDirectory.values()) {
		const step = Math.max(1, Math.floor(tests.length / PER_DIRECTORY));
		for (let i = 0, n = 0; i < tests.length && n < PER_DIRECTORY; i += step, n++) {
			out.push(tests[i]!);
		}
	}
	return out;
}

if (import.meta.main) {
	const root = process.argv[2];
	if (!root) throw new Error('usage: node test262.ts <checkout of test262>');
	const head = execFileSync('git', ['-C', root, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
	if (head !== COMMIT) throw new Error(`the checkout is at ${head}, not ${COMMIT}`);
	fs.rmSync(OUT, { recursive: true, force: true });
	const tests = chosen(root);
	for (const file of tests) {
		const to = path.join(OUT, file.replace(/^test\/language\//, '').replace(/\.js$/, '.svelte.js'));
		fs.mkdirSync(path.dirname(to), { recursive: true });
		fs.copyFileSync(path.join(root, file), to);
	}
	fs.copyFileSync(path.join(root, 'LICENSE'), path.join(OUT, 'LICENSE'));
	console.log(`${tests.length} tests`);
}
