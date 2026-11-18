<script>
	let { p, q } = $props();
	// svelte-ignore state_referenced_locally
	const a = $derived(await p), b = $derived(await q);
</script>

<p>{typeof a}</p>
