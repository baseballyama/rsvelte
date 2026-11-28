import assert from 'node:assert/strict';
import { test } from 'node:test';
import { typescriptArguments } from './typescript.ts';

test('auto leaves the features to the Svelte extension where it is installed', () => {
	assert.deepEqual(typescriptArguments('auto', true), ['--no-typescript']);
	assert.deepEqual(typescriptArguments('auto', false), []);
});

test('on and off hold whatever extensions are installed', () => {
	assert.deepEqual(typescriptArguments('on', true), []);
	assert.deepEqual(typescriptArguments('off', false), ['--no-typescript']);
});
