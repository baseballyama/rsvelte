<script>
	let { p } = $props();
	let list = $state([]);
	try { null; } catch (p) { p.x = 1; }
</script>
{p}{list}