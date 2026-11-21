import assert from 'node:assert/strict';
import { test } from 'node:test';
import { scan } from './rust-scan.ts';

test('braces in literals, char literals and comments do not change the depth', () => {
	const source = 'fn a<\'x>(s: &\'x str) { let _ = "{"; let _ = \'{\'; let _ = r#"}"#; /* { */ }';
	const depth = scan(source);
	const close = source.lastIndexOf('}');
	assert.equal(depth[close], 0);
	assert.equal(depth[source.indexOf('"{"')], -1);
	assert.equal(depth[source.indexOf("'{'")], -1);
	assert.equal(depth[source.indexOf('/*')], -1);
});

test('unbalanced braces are an error', () => {
	assert.throws(() => scan('fn a() {'), /unbalanced braces/);
});
