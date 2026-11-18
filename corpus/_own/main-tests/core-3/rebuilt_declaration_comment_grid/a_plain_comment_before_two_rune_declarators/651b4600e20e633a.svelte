<script>
	let { p, q } = $props();
	// c
	const a = $derived(await p), b = $derived(await q);
</script>

<p>{typeof a}</p>
