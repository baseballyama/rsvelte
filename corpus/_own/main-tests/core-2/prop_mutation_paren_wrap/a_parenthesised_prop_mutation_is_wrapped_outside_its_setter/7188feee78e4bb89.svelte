<script>
	let { p = $bindable() } = $props();
	const a = 1, q = (p.x = 1);
</script>
<p>{p}</p>
