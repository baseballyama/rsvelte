<script>
	let { p } = $props();
	// svelte-ignore state_referenced_locally
	const a = $derived(await p);
</script>

<p>{typeof a}</p>
