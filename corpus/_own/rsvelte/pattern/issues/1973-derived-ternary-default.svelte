<script>
	let props = $props();
	const flag = true;
	let { a, b = flag ? 1 : 2 } = $derived(props);
</script>

<p>{a}{b}</p>
