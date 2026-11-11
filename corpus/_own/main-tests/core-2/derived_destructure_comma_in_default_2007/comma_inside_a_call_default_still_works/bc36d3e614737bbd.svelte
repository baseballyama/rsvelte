<script>
	let props = $props();
	function f(x, y) { return x; }
	let { a, b = f(1, 2) } = $derived(props);
</script>
<p>{a}{b}</p>