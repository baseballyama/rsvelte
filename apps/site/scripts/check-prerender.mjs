// The English paths of prerendered pages are not route paths. If the build does not write them, the server
// answers /en and /en/why with the Japanese file and nothing fails, so the build checks the files it wrote.
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

const output = '.svelte-kit/output/prerendered/pages';
// The prerender origin SvelteKit uses when none is set; an absolute link built from it would be broken.
const DEFAULT_ORIGIN = 'sveltekit-prerender';
const expected = { 'index.html': 'ja', 'why.html': 'ja', 'en.html': 'en', 'en/why.html': 'en' };

const problems = [];
const files = readdirSync(output, { recursive: true, encoding: 'utf8' }).filter((file) => file.endsWith('.html'));
for (const [file, lang] of Object.entries(expected)) {
	if (!files.includes(file)) {
		problems.push(`${file}: not written`);
		continue;
	}
	const found = /<html lang="([^"]*)"/.exec(readFileSync(path.join(output, file), 'utf8'))?.[1];
	if (found !== lang) problems.push(`${file}: <html lang="${found}">, expected "${lang}"`);
}
for (const file of files) {
	if (readFileSync(path.join(output, file), 'utf8').includes(DEFAULT_ORIGIN)) problems.push(`${file}: contains ${DEFAULT_ORIGIN}`);
}
for (const problem of problems) console.error(`[prerender] ${problem}`);
console.log(`Checked ${files.length} prerendered pages; ${problems.length} problems.`);
process.exitCode = problems.length ? 1 : 0;
