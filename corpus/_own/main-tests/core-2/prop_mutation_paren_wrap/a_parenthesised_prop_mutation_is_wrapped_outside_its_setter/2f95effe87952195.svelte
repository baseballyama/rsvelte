<script>
	let { p = $bindable() } = $props();
	p.x = 1;
</script>
<p>{p}</p>
