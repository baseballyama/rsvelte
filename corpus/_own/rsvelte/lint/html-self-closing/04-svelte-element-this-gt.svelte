<script>
	let n = 1;
</script>

<svelte:element this={n > 0 ? 'em' : 'i'} />
<svelte:element this={n > 2 ? 'b' : 's'}></svelte:element>
