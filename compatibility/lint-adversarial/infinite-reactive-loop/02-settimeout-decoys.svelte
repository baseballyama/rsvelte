<script>
	let n = 0;
	const label = "setTimeout(() => { n = n + 1 })";
	// $: setTimeout(() => { n = n + 1 });
	$: setTimeout(() => {
		n = n + 1;
	}, 10);
</script>

{n}{label}
