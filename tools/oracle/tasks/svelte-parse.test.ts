import assert from 'node:assert/strict';
import { test } from 'node:test';
import { canonical } from './svelte-parse.ts';

test('the canonical text sorts keys at every depth and keeps the order of arrays', () => {
	assert.equal(
		canonical({ b: 1, a: [{ d: 2, c: 3 }, 'x'], e: { g: null, f: true } }),
		'{"a":[{"c":3,"d":2},"x"],"b":1,"e":{"f":true,"g":null}}',
	);
});

test('a bigint or a regular expression is null, and what JSON leaves out stays out', () => {
	assert.equal(
		canonical({ value: 10n, pattern: /a/g, missing: undefined }),
		'{"pattern":null,"value":null}',
	);
});
