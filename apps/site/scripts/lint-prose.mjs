import { createLinter, loadTextlintrc } from 'textlint';
import { proseFiles, readProse } from './prose.mjs';

const descriptor = await loadTextlintrc({ configFilePath: '.textlintrc.cjs' });
if (!descriptor.configBaseDir) throw new Error('The writing rules failed to load');
const linter = createLinter({ descriptor });
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
