<script>
	let props = $props();
	let { a, b = { x: 1, y: 2 } } = $derived(props);
</script>
<p>{a}{b}</p>