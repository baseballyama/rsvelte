<script>
	import C from './C.svelte';
	import D from './D.svelte';
	let items = [];
</script>
{#each items as a (a.id)}{#each a.kids as b (b.id)}<D bind:item={b} />{#each b.kids as c (c.id)}<C bind:item={c} bind:items />{/each}{/each}{/each}
