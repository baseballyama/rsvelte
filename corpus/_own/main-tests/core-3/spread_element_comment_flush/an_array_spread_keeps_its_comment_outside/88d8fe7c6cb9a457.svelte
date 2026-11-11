<script>
	let a = [1];
	const b = [
		// ; c
		...(a.length ? [] : [2]),
	];
</script>
<p>{b.length}</p>
