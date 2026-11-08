import path from 'node:path';
import { proseFiles, readProse, writingLinter } from './prose.ts';

const linter = await writingLinter();
// pnpm runs the script in this directory; INIT_CWD is where the command was typed.
const typedIn = process.env.INIT_CWD ?? process.cwd();
const only = process.argv
	.slice(2)
	.map((file) => path.relative(process.cwd(), path.resolve(typedIn, file)));
const all = proseFiles('src');
const unknown = only.filter((file) => !all.includes(file));
if (unknown.length) throw new Error(`Not a file with checked prose: ${unknown.join(', ')}`);
const files = only.length ? only : all;
const passages = files.flatMap((file) => readProse(file).map((chunk) => ({ file, chunk })));
if (!passages.length)
	throw new Error(`No visible prose was checked in ${only.join(', ') || 'src'}`);
let errors = 0;
for (const { file, chunk } of passages) {
	// oxlint-disable-next-line no-await-in-loop -- linting every passage at once runs out of memory with the synonym dictionary
	for (const message of (await linter.lintText(chunk.text, 'prose.md')).messages) {
		console.error(`${file}:${chunk.line} [${message.ruleId}] ${message.message}\n  ${chunk.text}`);
		errors++;
	}
}
console.log(`Checked ${passages.length} passages in ${files.length} files; ${errors} errors.`);
process.exitCode = errors ? 1 : 0;
