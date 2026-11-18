<script>
	let props = $props();
	let { a, b: bb = 'x,y' } = $derived(props);
</script>
<p>{a}{bb}</p>