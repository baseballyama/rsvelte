<script>
	let { p = $bindable() } = $props();
	const q = (p.x++);
</script>
<p>{p}</p>
