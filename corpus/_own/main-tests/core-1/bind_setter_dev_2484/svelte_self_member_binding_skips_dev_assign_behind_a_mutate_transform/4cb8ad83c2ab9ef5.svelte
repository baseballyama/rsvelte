<script>
	let s = $state({ x: 1 });
	let v = $derived(s);
</script>

{#if true}<svelte:self bind:value={v.x} />{/if}
