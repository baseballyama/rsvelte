// rsvelte/compiler returns what svelte/compiler returns. RSVELTE_BINDING names the built addon;
// crates/hosts/node's test builds it and runs this file.
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { TraceMap, originalPositionFor } from '@jridgewell/trace-mapping';
import { parse } from 'acorn';
import * as official from 'svelte/compiler';

import * as rsvelte from './compiler.js';

const COMPONENT = `<script>
	let count = $state(0);
	let unused = 1;
</script>

<button onclick={() => count++}>{count}</button>
<img src="a.png">

<style>
	button { color: red; }
	.missing { color: blue; }
</style>
`;

/** The program without positions: the corpus compares the code as an AST, not as text. */
function ast(code: string) {
	return JSON.stringify(
		parse(code, { ecmaVersion: 'latest', sourceType: 'module' }),
		(key, value) => (key === 'start' || key === 'end' || key === 'raw' ? undefined : value),
	);
}

/** The fields a caller reads from a warning or an error. */
function fields(diagnostic: any) {
	const { code, message, filename, position, start, end, frame } = diagnostic;
	return { code, message, filename, position, start, end, frame };
}

test('a component compiles to the official code, stylesheet and warnings', () => {
	for (const generate of ['client', 'server'] as const) {
		const options = { filename: 'src/App.svelte', generate };
		const ours = rsvelte.compile(COMPONENT, options);
		const theirs = official.compile(COMPONENT, options);
		assert.equal(ast(ours.js.code), ast(theirs.js.code));
		assert.equal(ours.css?.code, theirs.css?.code);
		assert.deepEqual(ours.warnings.map(fields), theirs.warnings.map(fields));
		assert.equal(ours.js.map.version, 3);
		assert.equal(String(ours.js.map), JSON.stringify(ours.js.map));
	}
});

test('a filename below rootDir, the working directory by default, is read relative to it', () => {
	for (const options of [
		{ filename: `${process.cwd()}/src/App.svelte` },
		{ filename: '/project/src/App.svelte', rootDir: '/project' },
		{ filename: '/elsewhere/App.svelte', rootDir: '/project' },
	]) {
		const ours = rsvelte.compile(COMPONENT, options);
		const theirs = official.compile(COMPONENT, options);
		assert.equal(ours.css?.code, theirs.css?.code);
		assert.deepEqual(ours.warnings.map(fields), theirs.warnings.map(fields));
	}
});

test('a module compiles to the official code', () => {
	const source = 'let count = $state(0);\nexport function increment() {\n\tcount++;\n}\n';
	const options = { filename: 'src/count.svelte.js' };
	assert.equal(
		ast(rsvelte.compileModule(source, options).js.code),
		ast(official.compileModule(source, options).js.code),
	);
});

/** What `compile` throws. */
function thrown(compile: () => unknown) {
	try {
		compile();
	} catch (error) {
		return error as any;
	}
	assert.fail('it compiles');
}

// A Svelte error, since a JavaScript syntax error carries oxc's words and position.
test('an error is thrown as the official CompileError', () => {
	const source = '<div>\n\t</p>\n</div>\n';
	const ours = thrown(() => rsvelte.compile(source, { filename: 'Broken.svelte' }));
	const theirs = thrown(() => official.compile(source, { filename: 'Broken.svelte' }));
	assert.equal(ours.name, 'CompileError');
	assert.ok(ours instanceof Error);
	assert.deepEqual(fields(ours), fields(theirs));
	assert.equal(String(ours), String(theirs));
});

test('positions count UTF-16 code units, as the official ones do', () => {
	// "é" is 2 UTF-8 bytes and 1 UTF-16 code unit; "😀" is 4 and 2.
	const source = 'é😀\n</p>\n';
	assert.deepEqual(
		fields(thrown(() => rsvelte.compile(source, {}))),
		fields(thrown(() => official.compile(source, {}))),
	);
});

test('warningFilter drops the warnings it rejects', () => {
	const options = {
		filename: 'App.svelte',
		warningFilter: (w: any) => w.code !== 'a11y_missing_attribute',
	};
	assert.deepEqual(
		rsvelte.compile(COMPONENT, options).warnings.map((w) => w.code),
		official.compile(COMPONENT, options).warnings.map((w) => w.code),
	);
});

/** Options the official types refuse too. */
const invalid = (options: object) => options as never;

test('an option this compiler does not take throws, and its default is taken', () => {
	assert.throws(() => rsvelte.compile('', { dev: true }), /takes `dev` only as false/);
	assert.throws(() => rsvelte.compile('', { css: 'injected' }), /takes `css` only as "external"/);
	assert.throws(
		() => rsvelte.compile('', { outputFilename: 'App.js' }),
		/does not take the option `outputFilename`/,
	);
	assert.throws(() => rsvelte.compile('', invalid({ generate: 'ssr' })), /"client" or "server"/);
	assert.throws(() => rsvelte.compile('', { generate: false }), /`generate: false`/);
	assert.throws(
		() => rsvelte.compileModule('', invalid({ preserveWhitespace: true })),
		/does not take the option `preserveWhitespace`/,
	);
	const built = rsvelte.compile('<p>a</p>', {
		css: 'external',
		dev: false,
		hmr: false,
		runes: undefined,
	});
	assert.match(built.js.code, /from_html/);
});

test('VERSION names the svelte whose output it reproduces', () => {
	assert.equal(rsvelte.VERSION, official.VERSION);
});

/** The fields of a source map other than its mappings, which differ with the printer. */
function described({ version, file, sources, sourcesContent, names }: any) {
	return { version, file, sources, sourcesContent, names };
}

test('the source map names the file and carries the source, as the official one does', () => {
	const filename = `${process.cwd()}/src/App.svelte`;
	assert.deepEqual(
		described(rsvelte.compile(COMPONENT, { filename }).js.map),
		described(official.compile(COMPONENT, { filename }).js.map),
	);
	const module = 'export const a = $state(1);\n';
	const options = { filename: `${process.cwd()}/src/a.svelte.js` };
	assert.deepEqual(
		described(rsvelte.compileModule(module, options).js.map),
		described(official.compileModule(module, options).js.map),
	);
});

test("a preprocessor's map is merged under the compiler's, as the official one merges it", () => {
	// The preprocessor dropped the first line, so each line came from the one below it.
	const lines = COMPONENT.split('\n').length;
	const map = { version: 3, names: [], mappings: Array(lines).fill('AACA').join(';') };
	const filename = `${process.cwd()}/src/App.svelte`;
	for (const sourcemap of [
		{ ...map, sources: ['App.svelte'] },
		JSON.stringify({ ...map, sources: [''] }),
	]) {
		const traced = (compiled: { js: { code: string; map: any } }) => {
			const at = compiled.js.code.indexOf('count = ');
			const before = compiled.js.code.slice(0, at).split('\n');
			const generated = { line: before.length, column: before.at(-1)!.length };
			return {
				...described(compiled.js.map),
				at: originalPositionFor(new TraceMap(compiled.js.map), generated),
			};
		};
		const ours = traced(rsvelte.compile(COMPONENT, { filename, sourcemap: sourcemap as never }));
		const theirs = traced(official.compile(COMPONENT, { filename, sourcemap: sourcemap as never }));
		assert.deepEqual(ours, theirs);
		assert.equal(ours.at.line, 3);
	}
});
