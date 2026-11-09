import assert from 'node:assert/strict';
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { parse } from '@vue/compiler-sfc';

const version = (installed: string): string =>
	JSON.parse(readFileSync(path.join(installed, 'package.json'), 'utf8')).version;

const number = (code: number): string => String(code).replace(/\B(?=(\d{3})+(?!\d))/g, '_');

// `oracle entities`: vendor the named character references, with the code point Svelte's table
// gives each and the text Vue's template parser decodes it to.
export async function main(): Promise<void> {
	const require = createRequire(path.join(import.meta.dirname, 'package.json'));
	const root = fileURLToPath(new URL('../../', import.meta.url));
	const directory = path.join(root, 'crates/languages/html/core/src/vendor');
	const svelte = path.dirname(require.resolve('svelte/package.json'));
	const vue = path.dirname(require.resolve('@vue/compiler-sfc/package.json'));
	const source = path.join(svelte, 'src/compiler/phases/1-parse/utils/entities.js');
	const { default: entities }: { default: Record<string, unknown> } = await import(source);

	const rows = new Map<string, { svelte: number; vue: number[]; legacy: boolean }>();
	for (const [name, code] of Object.entries(entities)) {
		assert.match(name, /^[A-Za-z0-9]+;?$/);
		assert.ok(typeof code === 'number' && Number.isInteger(code) && code > 0 && code <= 0x10ffff);
		const terminated = name.endsWith(';');
		const key = terminated ? name.slice(0, -1) : name;
		const row = rows.get(key) ?? { svelte: code, vue: decodedByVue(`&${key};`), legacy: false };
		assert.equal(row.svelte, code, `${name}: the legacy reference and the terminated one differ`);
		// Svelte's table keeps one code point; the second of a two-code-point reference is dropped.
		assert.equal(row.vue[0], code, `${name}: Svelte and Vue start with different code points`);
		if (!terminated) {
			assert.deepEqual(decodedByVue(`&${key}`), row.vue, `${name}: Vue decodes it differently`);
			row.legacy = true;
		}
		rows.set(key, row);
	}
	for (const key of rows.keys()) assert.ok(Object.hasOwn(entities, `${key};`), key);
	const names = [...rows.keys()].toSorted((left, right) =>
		left < right ? -1 : left > right ? 1 : 0,
	);
	mkdirSync(directory, { recursive: true });
	writeFileSync(
		path.join(directory, 'entities.rs'),
		`// svelte ${version(svelte)}, @vue/compiler-sfc ${version(vue)}\n[\n${names
			.map((name) => {
				const row = rows.get(name)!;
				assert.ok(row.vue.length <= 2, name);
				return `    ("${name}", ${number(row.svelte)}, ${number(row.vue[1] ?? 0)}, ${row.legacy}),`;
			})
			.join('\n')}\n]\n`,
	);
	copyFileSync(path.join(svelte, 'LICENSE.md'), path.join(directory, 'LICENSE.svelte.md'));
	writeFileSync(
		path.join(directory, 'README.md'),
		[
			'The named character references of HTML, from the MIT-licensed Svelte compiler',
			'(`src/compiler/phases/1-parse/utils/entities.js`). A row is the name without its semicolon,',
			'the code point, the second code point the few two-code-point references decode to in Vue',
			"(Svelte's table drops it; 0 for none) and whether the name is also recognized without a",
			'semicolon. The first line of `entities.rs` names the versions, which a test compares with',
			'`tools/oracle/package.json`.',
			'',
			'Regenerate with `mise exec -- node tools/oracle/oracle.ts entities`.',
			'',
		].join('\n'),
	);
	console.log(`Wrote ${names.length} named character references`);
}

/** The code points Vue's template parser decodes `reference` to, in an attribute value. */
function decodedByVue(reference: string): number[] {
	const { descriptor, errors } = parse(`<template><a title="${reference}"></a></template>`);
	assert.equal(errors.length, 0, reference);
	const element = descriptor.template?.ast?.children[0];
	assert.ok(element?.type === 1, reference);
	const [attribute] = element.props;
	assert.ok(attribute?.type === 6 && attribute.value !== undefined, reference);
	return [...attribute.value.content].map((character) => character.codePointAt(0)!);
}
