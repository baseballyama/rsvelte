<script>
	let { p = $bindable() } = $props();
	let q = (p.x = 1);
</script>
<p>{p}</p>
