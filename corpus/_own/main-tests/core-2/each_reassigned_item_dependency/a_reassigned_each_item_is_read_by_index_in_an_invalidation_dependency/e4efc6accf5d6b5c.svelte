<script>
	import C from './C.svelte';
	import D from './D.svelte';
	let items = [];
</script>
{#each items as item (item.id)}<button onclick={() => (item = 1)}>x</button>{#each item.kids as sub (sub.id)}<C bind:item={sub} bind:items />{/each}{/each}
