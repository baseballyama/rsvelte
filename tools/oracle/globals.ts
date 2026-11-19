import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const version = (installed: string): string =>
	JSON.parse(readFileSync(path.join(installed, 'package.json'), 'utf8')).version;

// `oracle globals`: vendor ESLint's builtins and `globals.browser`, which eslint-plugin-svelte's
// tests declare, and the TypeScript library names typescript-eslint declares, from the versions
// this package installs.
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
	// typescript-eslint's scope manager declares the library of `lib: ['esnext']`, its default
	// without a program; the first declaration of a name decides whether it is a value too.
	const parser = path.dirname(require.resolve('@typescript-eslint/parser/package.json'));
	const fromParser = createRequire(path.join(parser, 'package.json'));
	const scopeManager = path.dirname(
		fromParser.resolve('@typescript-eslint/scope-manager/package.json'),
	);
	const { analyze } = fromParser('@typescript-eslint/scope-manager');
	const empty = { line: 1, column: 0 };
	const program = {
		type: 'Program',
		body: [],
		sourceType: 'module',
		range: [0, 0],
		loc: { start: empty, end: empty },
	};
	const library: [string, boolean][] = [
		...analyze(program, { sourceType: 'module' }).globalScope.set.values(),
	]
		.map(
			(variable: { name: string; isValueVariable: boolean }) =>
				[variable.name, variable.isValueVariable] as [string, boolean],
		)
		.toSorted(([left], [right]) => (left < right ? -1 : left > right ? 1 : 0));
	writeFileSync(
		path.join(directory, 'typescript_library.rs'),
		`// @typescript-eslint/scope-manager ${version(scopeManager)}\n[\n${library.map(([name, value]) => `    (${JSON.stringify(name)}, ${value}),`).join('\n')}\n]\n`,
	);
	copyFileSync(
		path.join(scopeManager, 'LICENSE'),
		path.join(directory, 'LICENSE.typescript-eslint.md'),
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
			'byte order for binary search.',
			'',
			'`typescript_library.rs` holds the names the MIT-licensed `@typescript-eslint/scope-manager`',
			"declares for `lib: ['esnext']`, its default, each with whether it is a value as well as a",
			'type, sorted the same way. Its first line names the version.',
			'',
			'Regenerate both with `node tools/oracle/oracle.ts globals`.',
			'',
		].join('\n'),
	);
	console.log(`Wrote ${names.length} globals and ${library.length} library names`);
}
