<svelte:options runes={false} />

<script>
	let src = $state(0);
	let dest = $state(0);
	let doubled = $derived.by(() => src * 2);

	$effect(() => {
		dest = src * 2;
	});

	$inspect(dest);
</script>

<p>{dest}{doubled}</p>
