// Which of svelte's error and warning codes no corpus unit makes the official compiler raise: a
// code no unit raises is a path the corpus never compares, so the list is the work left.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CORPUS } from './paths.ts';
import { readPack } from './pack.ts';

/** The file that lists the codes no unit raises, one per line. */
const UNCOVERED_FILE = path.join(CORPUS, '_registry', 'uncovered-codes.txt');

/** The codes a module of svelte's compiler source declares, as the functions it exports. */
function declared(file: string): string[] {
	const source = fs.readFileSync(file, 'utf8');
	return [...source.matchAll(/^export function ([a-z_0-9]+)\(/gm)].map((m) => m[1]!);
}

/** Every code the official compiler raises in the expected output of the compile tasks. */
function raised(): Set<string> {
	const codes = new Set<string>();
	const packs = fs.globSync('svelte/*/expected/svelte.{compile,compileModule}*/*.pack', {
		cwd: CORPUS,
	});
	for (const pack of packs) {
		for (const entry of readPack(path.join(CORPUS, pack))) {
			for (const m of entry.body.matchAll(/"code":\s*"([a-z_0-9]+)"/g)) codes.add(m[1]!);
		}
	}
	return codes;
}

/** The error and warning codes of the oracle's svelte that no unit raises, sorted. */
export function uncovered(): string[] {
	const compiler = path.dirname(fileURLToPath(import.meta.resolve('svelte/compiler')));
	const codes = [
		...declared(path.join(compiler, 'errors.js')),
		...declared(path.join(compiler, 'warnings.js')),
	];
	const seen = raised();
	return codes.filter((code) => !seen.has(code)).toSorted();
}

/** The codes `UNCOVERED_FILE` lists. */
export function recorded(): string[] {
	return fs
		.readFileSync(UNCOVERED_FILE, 'utf8')
		.split('\n')
		.filter((line) => line && !line.startsWith('#'));
}

if (import.meta.main && process.argv.includes('--update')) {
	const header =
		'# Codes of svelte no corpus unit raises. Write with `node error-coverage.ts --update`.\n';
	fs.writeFileSync(UNCOVERED_FILE, header + uncovered().join('\n') + '\n');
}
