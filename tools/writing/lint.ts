// Checks the English prose of every first-party Markdown file, or of the files given.

import { readFileSync } from 'node:fs';
import path from 'node:path';
import { englishLinter, markdownFiles, root } from './writing.ts';

const linter = await englishLinter();
// pnpm runs the script in this directory; INIT_CWD is where the command was typed.
const typedIn = process.env.INIT_CWD ?? process.cwd();
const only = process.argv.slice(2).map((file) => path.relative(root, path.resolve(typedIn, file)));
const files = only.length ? only : markdownFiles();
if (!files.length) throw new Error('No Markdown file was found');
let errors = 0;
for (const file of files) {
	const absolute = path.resolve(root, file);
	// oxlint-disable-next-line no-await-in-loop -- one file at a time keeps the report in file order
	const result = await linter.lintText(readFileSync(absolute, 'utf8'), absolute);
	for (const message of result.messages) {
		console.error(
			`${file}:${message.loc.start.line}:${message.loc.start.column + 1} [${message.ruleId}] ${message.message}`,
		);
		errors++;
	}
}
console.log(`Checked ${files.length} Markdown files; ${errors} errors.`);
process.exitCode = errors ? 1 : 0;
