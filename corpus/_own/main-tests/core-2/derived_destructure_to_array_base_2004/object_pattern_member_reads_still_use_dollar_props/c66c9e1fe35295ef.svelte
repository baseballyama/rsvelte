<script>
	let props = $props();
	let { a, ...r } = $derived(props);
</script>
<p>{a}{r}</p>