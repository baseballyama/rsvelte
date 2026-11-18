<script>
	let n = 1;
</script>

<svelte:element class="a" this={n > 0 ? 'em' : 'i'}>gt inside this expression</svelte:element>

<svelte:element this={n > 2 ? 'b' : 's'} >real space before bracket</svelte:element>
