<script>
	let count = $state(0);

	$effect(() => {
		// $inspect.trace must be the first statement of a function body
		$inspect.trace();
		count;
	});
</script>
