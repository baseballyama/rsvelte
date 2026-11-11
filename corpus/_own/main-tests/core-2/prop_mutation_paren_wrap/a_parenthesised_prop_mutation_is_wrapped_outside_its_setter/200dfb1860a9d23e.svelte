<script>
	let { p = $bindable() } = $props();
	const f = () => { const q = (p.x = 1); return q; };
</script>
<p>{p}</p>
