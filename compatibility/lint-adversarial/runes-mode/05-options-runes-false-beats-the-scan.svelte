<svelte:options runes={false} />

<script>
	const holder = { $derived: 1 };
	export let count;
	let total;
	$: {
		total = count * 2;
	}
	void holder;
</script>

{total}
