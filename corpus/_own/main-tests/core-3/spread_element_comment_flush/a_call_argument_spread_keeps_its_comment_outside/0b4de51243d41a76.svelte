<script>
	let a = [1];
	const b = f(
		// ; c
		...(a.length ? [] : [2]),
	);
</script>
<p>{b}</p>
