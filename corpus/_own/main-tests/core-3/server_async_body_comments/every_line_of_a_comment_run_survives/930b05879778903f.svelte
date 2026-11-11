<script>
	const one = Promise.resolve(1);

	// first line
	// second line
	one.then(() => {});

	const total = $derived(await one);
</script>

<p>{total}</p>
