import assert from 'node:assert/strict';
import test from 'node:test';
import { declaredGlobals } from './lint-shared.ts';

test('a later entry overrides a global, and "off" removes it', () => {
	assert.deepEqual(
		declaredGlobals([
			{ languageOptions: { globals: { window: 'readonly', document: 'readonly', b: true } } },
			{ rules: {} },
			{ languageOptions: { globals: { document: 'off', a: 'writable' } } },
		]),
		['a', 'b', 'window'],
	);
});
