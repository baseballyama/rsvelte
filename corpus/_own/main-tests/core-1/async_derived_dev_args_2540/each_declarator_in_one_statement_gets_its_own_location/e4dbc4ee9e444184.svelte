<script>
	let { p, q } = $props();
	const a = $derived(await p), b = $derived(await q);
</script>

<p>{typeof a}{typeof b}</p>
