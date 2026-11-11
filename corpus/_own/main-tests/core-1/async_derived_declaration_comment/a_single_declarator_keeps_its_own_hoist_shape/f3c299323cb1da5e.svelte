<script>
	let { p, q } = $props();
	// svelte-ignore await_waterfall
	const a = $derived(await p);
</script>

<p>{typeof a}</p>
