import { proseFiles, readProse, writingLinter } from './prose.ts';

const linter = await writingLinter();
const files = proseFiles('src');
let passages = 0;
let errors = 0;
for (const file of files) {
	for (const chunk of readProse(file)) {
		passages++;
		const result = await linter.lintText(chunk.text, 'prose.md');
		for (const message of result.messages) {
			console.error(`${file}:${chunk.line} [${message.ruleId}] ${message.message}\n  ${chunk.text}`);
			errors++;
		}
	}
}
if (!passages) throw new Error('No visible prose was checked');
console.log(`Checked ${passages} passages in ${files.length} files; ${errors} errors.`);
process.exitCode = errors ? 1 : 0;
