import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { compile, VERSION } from 'svelte/compiler';
import { firstDiff, parseJs } from '../src/canonical.ts';

const root = path.resolve(import.meta.dirname, '../../../crates/languages/svelte/compile/tests/fixtures/special-elements');
const cases = fs.readdirSync(root).sort();
assert.ok(cases.length > 0, 'special element cases must exist');

for (const name of cases) {
	const directory = path.join(root, name);
	const source = fs.readFileSync(path.join(directory, 'input.svelte'), 'utf8');
	for (const generate of ['client', 'server'] as const) {
		test(`${name}/${generate} matches Svelte ${VERSION}`, () => {
			const official = compile(source, { filename: `special-elements/${name}.svelte`, runes: true, generate }).js.code;
			const accepted = fs.readFileSync(path.join(directory, 'expected', `${generate}.js`), 'utf8');
			const difference = firstDiff(parseJs(official), parseJs(accepted));
			assert.equal(difference, null, `first AST difference: ${difference}`);
		});
	}
}

test('the comparison detects a changed boundary runtime call', () => {
	const source = '<svelte:boundary><p>Hello</p></svelte:boundary>';
	const official = compile(source, { runes: true }).js.code;
	const defective = official.replace('$.boundary(', '$.element(');
	assert.notEqual(official, defective, 'the control must introduce a defect');
	assert.notEqual(firstDiff(parseJs(official), parseJs(defective)), null);
});
