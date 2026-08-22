<svelte:options runes={false} />

<script>
	let count = 0;
	const holder = { $effect: 1 };
	$: Promise.resolve(count).then(() => {
		count = count + 1;
	});
	void holder;
</script>

{count}
