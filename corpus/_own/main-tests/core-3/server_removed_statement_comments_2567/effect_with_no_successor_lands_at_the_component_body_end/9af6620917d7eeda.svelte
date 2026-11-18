<script>
	let a = $state(1);

	// leading
	$effect(() => {
		// interior
		console.log(a);
	});
</script>

<p>{a}</p>
