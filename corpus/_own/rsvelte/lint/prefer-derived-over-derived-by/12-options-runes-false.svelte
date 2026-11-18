<svelte:options runes={false} />

<script>
	let a = $state(1);
	let v = $derived.by(() => a + 1);
</script>

{v}
