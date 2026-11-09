import assert from 'node:assert/strict';
import { copyFileSync, mkdirSync, readFileSync, realpathSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const version = (installed: string): string =>
	JSON.parse(readFileSync(path.join(installed, 'package.json'), 'utf8')).version;

const string = (text: string): string => {
	assert.match(text, /^[a-z0-9_]+$/);
	return `"${text}"`;
};

// `oracle warnings`: vendor the warning codes `svelte-ignore` accepts, from the svelte this
// package installs.
export async function main(): Promise<void> {
	const require = createRequire(path.join(import.meta.dirname, 'package.json'));
	const root = fileURLToPath(new URL('../../', import.meta.url));
	const directory = path.join(root, 'crates/languages/svelte/core/src/warnings/vendor');
	const svelte = path.dirname(realpathSync(require.resolve('svelte/package.json')));
	const load = (file: string): Promise<Record<string, unknown>> =>
		import(pathToFileURL(path.join(svelte, 'src', file)).href);

	const warnings = await load('compiler/warnings.js');
	const constants = await load('constants.js');
	// `extract_svelte_ignore` accepts exactly this concatenation.
	const codes = [
		...(warnings.codes as string[]),
		...(constants.IGNORABLE_RUNTIME_WARNINGS as string[]),
	];

	mkdirSync(directory, { recursive: true });
	writeFileSync(
		path.join(directory, 'codes.rs'),
		`// svelte ${version(svelte)}\n[\n${codes.map((code) => `    ${string(code)},\n`).join('')}]\n`,
	);
	copyFileSync(path.join(svelte, 'LICENSE.md'), path.join(directory, 'LICENSE.svelte.md'));
	writeFileSync(
		path.join(directory, 'README.md'),
		[
			'Data printed from the MIT-licensed Svelte compiler. `codes.rs` lists the warning codes',
			'`svelte-ignore` accepts (`compiler/warnings.js` `codes`, then `IGNORABLE_RUNTIME_WARNINGS`).',
			'The first line names the version, which a test compares with `tools/oracle/package.json`.',
			'',
			'Regenerate with `mise exec -- node tools/oracle/oracle.ts warnings`.',
			'',
		].join('\n'),
	);
	console.log(`Wrote ${codes.length} warning codes`);
}
