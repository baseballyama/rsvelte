<svelte:options runes={false} />
<script>
	let b = $state(1);
	$effect(() => {
		b = 2;
	});
</script>
{b}