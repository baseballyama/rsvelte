<script>
	import { writable } from 'svelte/store';
	import Wrapper from './Wrapper.svelte';

	const foo = writable({});
	const items = [1];
</script>

{#each items as item}
	{@const key = item + 1}
	<p>{$foo[key]}</p>
	<p>{$foo.plain}</p>
{/each}

<Wrapper let:slotKey>
	<p>{$foo[slotKey]}</p>
</Wrapper>

{#snippet card(cardKey = 1)}
	<p>{$foo[cardKey]}</p>
{/snippet}
{@render card()}
