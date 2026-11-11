<script>
	import { flip } from 'svelte/animate';
	const items = [{ id: 1 }];
</script>

{#each items as item, i (item.id)}
	{#if i}
		<span animate:flip>{i}</span>
	{/if}
{/each}
