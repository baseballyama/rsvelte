import { proseFiles, readProse, writingLinter } from './prose.ts';

const linter = await writingLinter();
const files = proseFiles('src');
const passages = files.flatMap((file) => readProse(file).map((chunk) => ({ file, chunk })));
if (!passages.length) throw new Error('No visible prose was checked');
const results = await Promise.all(
	passages.map(({ chunk }) => linter.lintText(chunk.text, 'prose.md')),
);
let errors = 0;
for (const [i, { file, chunk }] of passages.entries()) {
	for (const message of results[i]!.messages) {
		console.error(`${file}:${chunk.line} [${message.ruleId}] ${message.message}\n  ${chunk.text}`);
		errors++;
	}
}
console.log(`Checked ${passages.length} passages in ${files.length} files; ${errors} errors.`);
process.exitCode = errors ? 1 : 0;
