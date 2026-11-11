<script>
	let props = $props();
	let q = true;
	let [a, b = q ? 1 : 2] = $derived(props);
</script>
<p>{a}{b}</p>