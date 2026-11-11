<script>
	let a = $state(1);
	// eslint-disable-next-line svelte/no-inspect
	$inspect(a);
	/* eslint-disable svelte/no-inspect */
	$inspect(a);
	/* eslint-enable svelte/no-inspect */
	$inspect(a);
</script>
<p>{a}</p>
