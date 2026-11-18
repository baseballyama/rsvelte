<script>
	let { p } = $props();
	let list = $state([]);
	for (const p of list) { p.x = 1; }
</script>
{p}{list}