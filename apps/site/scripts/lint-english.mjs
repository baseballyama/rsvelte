import { readFileSync } from 'node:fs';
import { englishFile, proseFiles, readProse } from './prose.mjs';
import { englishProblems, vagueLinks } from './english.mjs';
import { checkLeaks, japaneseLeaks, sharedFiles } from './japanese.mjs';

const files = proseFiles('src', 'en');
let passages = 0;
let errors = 0;
const report = (file, line, problem, text) => {
	console.error(`${file}:${line} [english] ${problem}\n  ${text}`);
	errors++;
};
for (const file of files) {
	for (const chunk of readProse(file, 'en')) {
		passages++;
		for (const problem of englishProblems(chunk.text, { heading: chunk.heading })) report(file, chunk.line, problem, chunk.text);
	}
	if (!englishFile(file)) continue;
	for (const link of vagueLinks(readFileSync(file, 'utf8'))) report(file, link.line, 'link text must name its target', link.text);
}

const shared = sharedFiles('src');
const leaks = new Map(shared.map((file) => [file, japaneseLeaks(readFileSync(file, 'utf8'), file)]));
const allowlist = JSON.parse(readFileSync('scripts/japanese-allowlist.json', 'utf8'));
for (const leak of checkLeaks(leaks, allowlist)) report(leak.file, leak.line, leak.problem, leak.text);

if (!passages) throw new Error('No English prose was checked');
if (!shared.length) throw new Error('No shared file was scanned for Japanese text');
console.log(`Checked ${passages} English passages in ${files.length} files and ${shared.length} shared files for Japanese text; ${errors} errors.`);
process.exitCode = errors ? 1 : 0;
