<script>
	let a = [1];
	const b = [
		// ; c
		...(a.length ? [] : [2]),
	];
	const c = f(
		// ; c2
		...(a.length ? [] : [2]),
	);
</script>

<p>{b.length}{c}</p>
