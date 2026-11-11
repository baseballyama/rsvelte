<script>
	import { writable } from 'svelte/store';

	const foo = writable({});
	const items = [1, 2];
	const p = Promise.resolve(1);
</script>

{#each items as item, i}
	<p>{$foo[item]} {$foo[i]} {$foo.direct}</p>
{/each}
{#await p then v}
	<p>{$foo[v]}</p>
{:catch err}
	<p>{$foo[err]}</p>
{/await}
{#snippet chip(par)}
	<p>{$foo[par]}</p>
{/snippet}
{@render chip(1)}
