import assert from 'node:assert/strict';
import { test } from 'node:test';
import { parse } from 'svelte/compiler';
import { MUTATIONS, nodes } from './mutate.ts';

const src = `<script>
	let value = $state('');
</script>

{#if value}
	{@const upper = value.toUpperCase()}
	<input class="a" bind:value />
	<p>{upper}</p>
{/if}
`;

test('each mutation applies to some node of a component that has the node it breaks', () => {
	const all = [...nodes(parse(src, { modern: true }))];
	for (const [name, mutate] of Object.entries(MUTATIONS)) {
		const mutants = all.map((node) => mutate(src, node)).filter((m) => m !== undefined);
		assert.ok(mutants.length > 0, name);
		for (const m of mutants) assert.notEqual(m, src, name);
	}
});
