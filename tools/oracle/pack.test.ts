import assert from 'node:assert/strict';
import { test } from 'node:test';
import { formatPack, parsePack } from './pack.ts';

test('a pack keeps any body and sorts by path in UTF-8 byte order', () => {
	const entries = [
		{ path: 'b', attributes: ['js'], body: '=== 3 fake\nheader\n' },
		{ path: 'a/b', attributes: [], body: '' },
		{ path: '\u{1f600}', attributes: [], body: 'x' },
		{ path: '\u{ffff}', attributes: [], body: 'é' },
		{ path: 'a', attributes: ['svelte', 'runes', '-'], body: 'no newline' },
	];
	const text = formatPack(entries);
	const read = parsePack(Buffer.from(text), 'test');
	// U+FFFF is EF BF BF and U+1F600 is F0 9F 98 80: UTF-16 order would put the emoji first.
	assert.deepEqual(
		read.map((e) => e.path),
		['a', 'a/b', 'b', '\u{ffff}', '\u{1f600}'],
	);
	assert.deepEqual(read[0], entries[4]);
	assert.equal(read[2]!.body, '=== 3 fake\nheader\n');
});

test('the Rust reader reads this exact text', () => {
	// crates/language_independent/corpus/src/pack/tests.rs reads_the_format_the_oracle_writes
	assert.equal(
		formatPack([{ path: 'x.svelte', attributes: ['svelte', 'runes', '-'], body: 'é' }]),
		'# rsvelte pack 1\n=== 2 x.svelte\tsvelte\trunes\t-\né\n',
	);
});

test('a wrong length or a field with a tab is refused', () => {
	assert.throws(() => parsePack(Buffer.from('# rsvelte pack 1\n=== 2 a\nabc\n'), 't'));
	assert.throws(() => formatPack([{ path: 'a\tb', attributes: [], body: '' }]));
});
