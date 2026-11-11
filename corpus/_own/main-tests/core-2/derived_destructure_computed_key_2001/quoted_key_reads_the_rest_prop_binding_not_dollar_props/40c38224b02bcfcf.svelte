<script>
	let props = $props();
	let { a, 'weird-name': w } = $derived(props);
</script>
<p>{a}{w}</p>