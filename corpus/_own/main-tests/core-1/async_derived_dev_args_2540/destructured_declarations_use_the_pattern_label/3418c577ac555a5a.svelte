<script>
	let { p } = $props();
	const [a, b] = $derived(await p);
</script>

<p>{typeof a}</p>
