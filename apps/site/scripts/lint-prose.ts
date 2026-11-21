import path from 'node:path';
import { englishLinter } from '../../../tools/writing/linter.ts';
import { lintPage, proseFiles, readProse } from './prose.ts';

const linter = await englishLinter();
// pnpm runs the script in this directory; INIT_CWD is where the command was typed.
const typedIn = process.env.INIT_CWD ?? process.cwd();
const only = process.argv
	.slice(2)
	.map((file) => path.relative(process.cwd(), path.resolve(typedIn, file)));
const all = proseFiles('src');
const unknown = only.filter((file) => !all.includes(file));
if (unknown.length) throw new Error(`Not a file with checked prose: ${unknown.join(', ')}`);
const files = only.length ? only : all;
let passages = 0;
let errors = 0;
for (const file of files) {
	const chunks = readProse(file);
	passages += chunks.length;
	// oxlint-disable-next-line no-await-in-loop -- linting every page at once runs out of memory with the spelling dictionary
	for (const { chunk, message } of await lintPage(linter, chunks)) {
		console.error(`${file}:${chunk.line} [${message.ruleId}] ${message.message}\n  ${chunk.text}`);
		errors++;
	}
}
if (!passages) throw new Error(`No visible prose was checked in ${only.join(', ') || 'src'}`);
console.log(`Checked ${passages} passages in ${files.length} files; ${errors} errors.`);
process.exitCode = errors ? 1 : 0;
