<script>
	let n = 1;
</script>

<svelte:element class="a" this={n > 0 ? 'em' : 'i'}
>ternary with a greater-than inside this</svelte:element>

<svelte:element this={n > 2 ? 'b' : 's'}>no other attributes</svelte:element>
