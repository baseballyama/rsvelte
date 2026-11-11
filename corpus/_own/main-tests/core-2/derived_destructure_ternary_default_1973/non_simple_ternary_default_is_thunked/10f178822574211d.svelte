<script>
	let props = $props();
	let q = true;
	let o = {};
	let { a, b = q ? o.x : 2 } = $derived(props);
</script>
<p>{a}{b}</p>