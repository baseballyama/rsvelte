<script>
	let direct = $derived(1);
	let by_expression = $derived.by(() => 1);
	let base = $state(0);
	let transitive = $derived(base + 1);
	let by_block = $derived.by(() => {
		return 1;
	});
</script>

<b>{direct}</b>
<b>{typeof by_expression}</b>
<b>{transitive}</b>
<b>{by_block}</b>
