<svelte:options runes={false} />

<script>
	let src = $state(0);
	let dest = $state(0);
	$effect(() => {
		dest = src * 2;
	});
</script>

{dest}
