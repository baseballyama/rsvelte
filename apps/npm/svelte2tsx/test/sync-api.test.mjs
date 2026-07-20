import assert from 'node:assert/strict';
import test from 'node:test';

import { svelte2tsx, initialize } from '../index.js';

const source = `
<script lang="ts">
  let { name }: { name: string } = $props();
</script>

<h1>Hello, {name}!</h1>
`;
const opts = { filename: 'Hello.svelte', isTsFile: true, version: '5' };

test('svelte2tsx() is synchronous and returns a plain result (not a Promise)', () => {
	const result = svelte2tsx(source, opts);
	assert.ok(!(result instanceof Promise), 'result must not be a Promise');
	assert.equal(typeof result, 'object');
	assert.equal(typeof result.code, 'string');
	assert.ok(result.code.length > 0, 'code is non-empty');
	assert.ok('map' in result, 'has map field');
	assert.ok(Array.isArray(result.exportedNames.props), 'exportedNames.props is an array');
	assert.deepEqual(result.exportedNames.props, ['name']);
	assert.equal(typeof result.events, 'object');
});

test('await svelte2tsx() keeps working (awaiting a plain value)', async () => {
	const sync = svelte2tsx(source, opts);
	const awaited = await svelte2tsx(source, opts);
	assert.equal(awaited.code, sync.code);
});

test('repeated calls reuse the initialised module', () => {
	const a = svelte2tsx('<p>a</p>', {});
	const b = svelte2tsx('<p>b</p>', {});
	assert.ok(a.code.length > 0 && b.code.length > 0);
});

test('initialize() returns a Promise and is a no-op once ready', async () => {
	const p = initialize();
	assert.ok(p instanceof Promise);
	await p;
});

test('default export is the named svelte2tsx', async () => {
	const mod = await import('../index.js');
	assert.equal(mod.default, mod.svelte2tsx);
});

test('options is optional and defaults are applied synchronously', () => {
	const result = svelte2tsx('<p>hi</p>');
	assert.ok(!(result instanceof Promise));
	assert.equal(typeof result.code, 'string');
});
