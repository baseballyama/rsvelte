// Asserts the result object matches the upstream `svelte2tsx` surface:
// `map` is a magic-string-style SourceMap object, `exportedNames.has(name)`,
// and `events.getAll()`.
import assert from 'node:assert/strict';
import test from 'node:test';

import { svelte2tsx } from '../index.js';

const source = `
<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  export let name: string;
  export const version = '1';
  const dispatch = createEventDispatcher();
  function greet() { dispatch('greet', name); }
</script>

<h1 on:click={greet}>Hello, {name}!</h1>
`;
const opts = { filename: 'Hello.svelte', isTsFile: true, version: '5' };

test('map is a SourceMap-like object (not a JSON string)', () => {
	const { map } = svelte2tsx(source, opts);
	assert.equal(typeof map, 'object');
	assert.notEqual(map, null);
	assert.equal(map.version, 3);
	assert.equal(typeof map.mappings, 'string', 'map.mappings is the encoded VLQ string');
	assert.ok(Array.isArray(map.sources), 'map.sources is an array');
	assert.ok(Array.isArray(map.names), 'map.names is an array');
});

test('map.toString() is valid JSON and toUrl() is a data URI', () => {
	const { map } = svelte2tsx(source, opts);
	const roundTripped = JSON.parse(map.toString());
	assert.equal(roundTripped.version, 3);
	assert.equal(roundTripped.mappings, map.mappings);
	assert.ok(map.toUrl().startsWith('data:application/json;charset=utf-8;base64,'));
});

test('exportedNames.has(name) reflects every exported name', () => {
	const { exportedNames } = svelte2tsx(source, opts);
	assert.equal(typeof exportedNames.has, 'function');
	assert.equal(exportedNames.has('name'), true);
	assert.equal(exportedNames.has('version'), true);
	assert.equal(exportedNames.has('doesNotExist'), false);
	// Backward-compatible rsvelte extension.
	assert.ok(Array.isArray(exportedNames.props));
	assert.ok(exportedNames.props.includes('name'));
});

test('events.getAll() returns { name, type }[]', () => {
	const { events } = svelte2tsx(source, opts);
	assert.equal(typeof events.getAll, 'function');
	const all = events.getAll();
	assert.ok(Array.isArray(all), 'getAll() returns an array');
	const greet = all.find((e) => e.name === 'greet');
	assert.ok(greet, 'the dispatched "greet" event is present');
	assert.equal(typeof greet.type, 'string');
});

test('events.getAll() is an empty array for a component with no events', () => {
	const { events } = svelte2tsx('<p>hi</p>', {});
	assert.deepEqual(events.getAll(), []);
});
