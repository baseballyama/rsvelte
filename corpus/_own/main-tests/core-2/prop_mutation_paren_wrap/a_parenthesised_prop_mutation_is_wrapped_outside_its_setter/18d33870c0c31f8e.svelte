<script>
	let { p = $bindable() } = $props();
	const q = (p.x = 1);
</script>
<p>{p}</p>
