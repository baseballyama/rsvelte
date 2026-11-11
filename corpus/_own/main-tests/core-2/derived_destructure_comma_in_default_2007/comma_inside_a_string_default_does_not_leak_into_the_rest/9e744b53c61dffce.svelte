<script>
	let props = $props();
	let { a, b = 'x,y', ...r } = $derived(props);
</script>
<p>{a}{b}{r}</p>