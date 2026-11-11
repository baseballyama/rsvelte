<script>
	let { p = $bindable() } = $props();
	const f = () => p.x = 1;
</script>
<p>{p}</p>
