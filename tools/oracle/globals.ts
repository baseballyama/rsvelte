import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const version = (installed: string): string =>
	JSON.parse(readFileSync(path.join(installed, 'package.json'), 'utf8')).version;

// `oracle globals`: vendor the global variables the lint oracle declares, ESLint's builtins and
// `globals.browser`, from the versions this package installs.
export async function main(): Promise<void> {
	const require = createRequire(path.join(import.meta.dirname, 'package.json'));
	const root = fileURLToPath(new URL('../../', import.meta.url));
	const directory = path.join(root, 'crates/languages/typescript/semantic/src/vendor');
	const eslint = path.dirname(require.resolve('eslint/package.json'));
	const globals = path.dirname(require.resolve('globals/package.json'));
	const builtins: Record<string, unknown> = require(path.join(eslint, 'conf/globals.js')).es2026;
	const all: Record<string, Record<string, unknown>> = require('globals');
	const rows = new Map<string, string>();
	for (const name of Object.keys(all.browser!))
		rows.set(name, `Global::Browser { node: ${Object.hasOwn(all.node!, name)} }`);
	for (const name of Object.keys(builtins)) rows.set(name, 'Global::Builtin');
	const names = [...rows.keys()].toSorted((left, right) =>
		left < right ? -1 : left > right ? 1 : 0,
	);
	mkdirSync(directory, { recursive: true });
	writeFileSync(
		path.join(directory, 'globals.rs'),
		`// eslint ${version(eslint)}, globals ${version(globals)}\n[\n${names.map((name) => `    (${JSON.stringify(name)}, ${rows.get(name)}),`).join('\n')}\n]\n`,
	);
	copyFileSync(path.join(eslint, 'LICENSE'), path.join(directory, 'LICENSE.eslint.md'));
	copyFileSync(path.join(globals, 'license'), path.join(directory, 'LICENSE.globals.md'));
	writeFileSync(
		path.join(directory, 'README.md'),
		[
			'Global variable names that ESLint declares for `ecmaVersion: "latest"`, from the MIT-licensed',
			'ESLint (`conf/globals.js`, `es2026`), and the names of `globals.browser`, from the',
			'MIT-licensed `globals` (`browser`, with `node` read for whether Node.js declares the name',
			"too). A name in both ESLint's and `browser` is a builtin. The first line of `globals.rs`",
			'names the versions, which a test compares with `tools/oracle/package.json`.',
			'',
			'Each row of `globals.rs` is `(name, Global::Builtin | Global::Browser { node })`, sorted by',
			'byte order for binary search. Regenerate with `node tools/oracle/oracle.ts globals`.',
			'',
		].join('\n'),
	);
	console.log(`Wrote ${names.length} globals`);
}
