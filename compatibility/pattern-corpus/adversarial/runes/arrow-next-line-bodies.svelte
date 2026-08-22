<script>
	let xs = $state([1, 2, 3]);
	const total = $derived(
		xs.reduce(
			(a, b) =>
				a + b,
			0
		)
	);
	const pick = $derived.by(() =>
		xs
			.filter((x) =>
				x > 1
			)
			.map((x) =>
				x * 10
			)
	);
</script>

<p>{total} {pick.join(',')}</p>
