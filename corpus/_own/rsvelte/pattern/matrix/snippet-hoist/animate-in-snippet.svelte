<script>
	import { flip } from 'svelte/animate';

	let items = $state([1, 2, 3]);
</script>

{#snippet list()}
	{#each items as item (item)}
		<li animate:flip>{item}</li>
	{/each}
{/snippet}

{@render list()}
