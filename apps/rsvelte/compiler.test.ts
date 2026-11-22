// rsvelte/compiler returns what svelte/compiler returns. RSVELTE_BINDING names the built addon;
// crates/hosts/node's test builds it and runs this file.
import assert from 'node:assert/strict';
import { test } from 'node:test';

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

test('an error is thrown as the official CompileError', () => {
	const source = '<div>\n\t<p>{</p>\n</div>\n';
	const ours = thrown(() => rsvelte.compile(source, { filename: 'Broken.svelte' }));
	const theirs = thrown(() => official.compile(source, { filename: 'Broken.svelte' }));
	assert.equal(ours.name, 'CompileError');
	assert.ok(ours instanceof Error);
	assert.deepEqual(fields(ours), fields(theirs));
	assert.equal(String(ours), String(theirs));
});

test('positions count UTF-16 code units, as the official ones do', () => {
	// "é" is 2 UTF-8 bytes and 1 UTF-16 code unit; "😀" is 4 and 2.
	const source = 'é😀\n<p>{</p>\n';
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
		() => rsvelte.compile('', { sourcemap: {} }),
		/does not take the option `sourcemap`/,
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
