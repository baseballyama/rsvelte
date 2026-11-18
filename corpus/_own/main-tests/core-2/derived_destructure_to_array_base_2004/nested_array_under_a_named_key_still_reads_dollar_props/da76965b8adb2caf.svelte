<script>
	let props = $props();
	let { list: [a, b] } = $derived(props);
</script>
<p>{a}{b}</p>