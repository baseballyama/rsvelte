import assert from 'node:assert/strict';
import { copyFileSync, mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const source = new URL(
	'../node_modules/svelte/src/compiler/phases/1-parse/utils/entities.js',
	import.meta.url,
);
const { default: entities }: { default: unknown } = await import(source.href);
assert.ok(
	typeof entities === 'object' && entities !== null && !Array.isArray(entities),
);

const root = fileURLToPath(new URL('../../../', import.meta.url));
const directory = path.join(
	root,
	'crates/languages/svelte/syntax/src/syntax/vendor',
);
const entries = Object.entries(entities);
for (const [name, code] of entries) {
	assert.match(name, /^[A-Za-z0-9]+;?$/);
	assert.ok(
		typeof code === 'number' &&
			Number.isInteger(code) &&
			code > 0 &&
			code <= 0x10ffff,
	);
}
mkdirSync(directory, { recursive: true });
entries.sort(([left], [right]) => (left < right ? -1 : left > right ? 1 : 0));
writeFileSync(
	path.join(directory, 'entities.rs'),
	`[\n${entries.map(([name, code]) => `    ("${name}", ${String(code).replace(/\B(?=(\d{3})+(?!\d))/g, '_')}),`).join('\n')}\n]\n`,
);
copyFileSync(
	path.join(root, 'tools/fixtures/node_modules/svelte/LICENSE.md'),
	path.join(directory, 'LICENSE.svelte.md'),
);
writeFileSync(
	path.join(directory, 'README.md'),
	'Named character reference data from the MIT-licensed Svelte compiler.\n\nRegenerate with `mise exec -- node tools/fixtures/bin/svelte-entities.ts`.\nThe installed oracle version is recorded in `tools/fixtures/package-lock.json`.\n',
);
console.log(`Wrote ${entries.length} named character references`);
