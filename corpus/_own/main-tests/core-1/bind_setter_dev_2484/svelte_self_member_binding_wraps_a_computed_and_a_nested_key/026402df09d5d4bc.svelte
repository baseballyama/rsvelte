<script>
	let v = $state({ x: 1, n: { y: 2 } });
	let k = 'x';
</script>

{#if k}<svelte:self bind:value={v[k]} /><svelte:self bind:value={v.n.y} />{/if}
