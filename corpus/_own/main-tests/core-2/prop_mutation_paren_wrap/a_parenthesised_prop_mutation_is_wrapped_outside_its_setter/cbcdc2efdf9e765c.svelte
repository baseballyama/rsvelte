<script>
	let { p = $bindable() } = $props();
	var q = (p.x = 1);
</script>
<p>{p}</p>
