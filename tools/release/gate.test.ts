import assert from 'node:assert/strict';
import { test } from 'node:test';
import { missing, ships } from './gate.ts';

test('the sources of the programs ship, their tests and docs do not', () => {
	for (const file of [
		'crates/languages/typescript/check/src/kit.rs',
		'crates/languages/typescript/check/Cargo.toml',
		'crates/languages/svelte/typescript_projection/projection.d.ts',
		'tools/release/launcher.js',
		'apps/eslint-plugin/configs.cjs',
		'apps/eslint-plugin/rules.json',
	])
		assert.equal(ships(file), true, file);
	for (const file of [
		'crates/languages/typescript/check/src/kit/tests.rs',
		'crates/hosts/command_line/tests/project_check.rs',
		'crates/languages/svelte/check/tests/fixtures/a/input.svelte',
		'crates/languages/css/syntax/examples/parse.rs',
		'crates/hosts/README.md',
		'Cargo.lock',
		'tools/release/stage.ts',
		'apps/eslint-plugin/index.test.ts',
		'apps/eslint-plugin/package.json',
		'corpus/svelte/a/input.svelte',
	])
		assert.equal(ships(file), false, file);
});

test('a changeset, even an empty one, lets a change that ships pass', () => {
	const changed = [
		'crates/languages/typescript/check/src/kit.rs',
		'tools/performance/baseline.json',
	];
	assert.deepEqual(missing(changed, []), ['crates/languages/typescript/check/src/kit.rs']);
	assert.deepEqual(missing(changed, ['.changeset/kit.md']), []);
	assert.deepEqual(missing(changed, ['.changeset/README.md']), changed.slice(0, 1));
	assert.deepEqual(missing(['crates/a/src/tests.rs'], []), []);
});
