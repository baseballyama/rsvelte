<script>
	let props = $props();
	let { a, b = 'x,y' } = $derived(props);
</script>

<p>{a}{b}</p>
