<script>
	let { p, q } = $props();
	// svelte-ignore await_waterfall
	const a = $derived(await p), b = $derived(await q);
</script>

<p>{typeof a}</p>
