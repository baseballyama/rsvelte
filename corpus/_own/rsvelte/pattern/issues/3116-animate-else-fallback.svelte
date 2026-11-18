<script>
	import { flip } from 'svelte/animate';
	const items = [{ id: 1 }];
</script>

{#each items as item (item.id)}
	<b>{item.id}</b>
{:else}
	<span animate:flip>empty</span>
{/each}
