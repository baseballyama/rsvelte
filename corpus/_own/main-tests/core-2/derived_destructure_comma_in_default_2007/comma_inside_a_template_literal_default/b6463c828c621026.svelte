<script>
	let props = $props();
	let n = 1;
	let { a, b = `x,${n}` } = $derived(props);
</script>
<p>{a}{b}</p>