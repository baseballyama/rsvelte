import assert from 'node:assert/strict';
import test from 'node:test';
import { escapeLoneSurrogates } from './compile-artifacts.ts';

test('a lone surrogate is written as its escape and a pair as itself', () => {
	const lone = String.fromCharCode(0xd800);
	const trail = String.fromCharCode(0xdc00);
	assert.equal(escapeLoneSurrogates(`'a${lone}b'`), "'a\\uD800b'");
	assert.equal(escapeLoneSurrogates(`\`${trail}${lone}\``), '`\\uDC00\\uD800`');
	assert.equal(escapeLoneSurrogates("'😀'"), "'😀'");
});
