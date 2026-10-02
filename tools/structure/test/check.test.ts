import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { checkFiles, isSource, lineCount, parseLimits } from '../src/check.ts';

const limits = parseLimits({ maxLines: 600, exceptions: {} });

function withSource(run: (root: string, file: string) => void): void {
	const root = mkdtempSync(join(tmpdir(), 'rsvelte-structure-'));
	try {
		mkdirSync(join(root, 'crates'));
		run(root, 'crates/example.rs');
	} finally {
		rmSync(root, { recursive: true });
	}
}

test('the actual checker accepts the limit and rejects one extra line', () => {
	withSource((root, file) => {
		writeFileSync(join(root, file), '\n'.repeat(600));
		assert.deepEqual(checkFiles(root, [file, file], limits), { measured: 1, largest: 600, failures: [] });
		writeFileSync(join(root, file), '\n'.repeat(601));
		assert.deepEqual(checkFiles(root, [file], limits).failures, [`${file}: 601 lines exceeds 600`]);
	});
});

test('an existing exception cannot grow and must be removed when it fits', () => {
	withSource((root, file) => {
		const exceptional = parseLimits({ maxLines: 600, exceptions: { [file]: { maxLines: 650, reason: 'Existing kernel source' } } });
		writeFileSync(join(root, file), '\n'.repeat(650));
		assert.equal(checkFiles(root, [file], exceptional).failures.length, 0);
		writeFileSync(join(root, file), '\n'.repeat(651));
		assert.match(checkFiles(root, [file], exceptional).failures[0]!, /exceeds 650/);
		writeFileSync(join(root, file), '\n'.repeat(600));
		assert.match(checkFiles(root, [file], exceptional).failures[0]!, /remove the exception/);
		assert.match(checkFiles(root, [], exceptional).failures[0]!, /no measured source file/);
	});
});

test('counts physical lines with and without a final newline', () => {
	for (const [text, count] of [['', 0], ['a', 1], ['a\n', 1], ['a\r\nb', 2], ['a\n\n', 2]] as const) {
		assert.equal(lineCount(text), count);
	}
});

test('only handwritten sources are measured and an empty population fails', () => {
	assert.equal(isSource('crates/example.rs'), true);
	assert.equal(isSource('tools/types.d.ts'), true);
	assert.equal(isSource('apps/site/src/component.vue'), true);
	assert.equal(isSource('apps/site/src/app.css'), true);
	assert.equal(isSource('apps/site/src/routes/+page.svelte'), true);
	assert.equal(isSource('crates/languages/svelte/compile/tests/fixtures.rs'), true);
	for (const file of ['fixtures/input.svelte', 'crates/a/vendor/types.d.ts',
		'apps/site/src/lib/wasm/kernel/index.js', 'tools/fixtures/test/behaviour/wrong/input.svelte',
		'crates/languages/svelte/compile/tests/fixtures/rsvelte/counter/input.svelte',
		'crates/languages/svelte/compile/tests/fixtures/rsvelte/counter/expected/client.js']) {
		assert.equal(isSource(file), false);
	}
	assert.deepEqual(checkFiles('.', [], limits).failures, ['UNMEASURED: no source files found']);
});

test('invalid limits and exceptions fail at the configuration boundary', () => {
	for (const value of [null, {}, { maxLines: 0, exceptions: {} }, { maxLines: 600, exceptions: [] },
		{ maxLines: 600, exceptions: { file: { maxLines: 700, reason: '' } } },
		{ maxLines: 600, exceptions: { file: { maxLines: 600, reason: 'Already fits' } } }]) {
		assert.throws(() => parseLimits(value));
	}
});
