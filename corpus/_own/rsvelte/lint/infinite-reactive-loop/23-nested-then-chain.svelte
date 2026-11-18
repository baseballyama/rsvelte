<script>
	let count = 0;
	$: Promise.resolve(count)
		.then((x) => x + 1)
		.then((x) => {
			count = x;
		});
</script>

{count}
