<script>
	let props = $props();
	let q = true;
	let { a, b: bb = q ? 1 : 2 } = $derived(props);
</script>
<p>{a}{bb}</p>