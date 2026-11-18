<script>
	let a = $state(1);

	// leading
	$effect(() => {
		// interior
		console.log(a);
	});

	console.log(2);
</script>

<p>{a}</p>
