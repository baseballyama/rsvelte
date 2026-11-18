<script>
	let { p } = $props();
	const a = $derived(await p);
</script>

<p>{typeof a}</p>
