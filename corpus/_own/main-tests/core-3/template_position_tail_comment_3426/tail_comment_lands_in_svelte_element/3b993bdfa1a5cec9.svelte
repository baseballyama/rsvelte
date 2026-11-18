<script>
	export let a = 1;
	let b = a;
	// tail
</script>
<svelte:element this={b ? 'p' : 'span'}>x</svelte:element>
