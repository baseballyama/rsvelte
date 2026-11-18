<script>
	let { p } = $props();
	let list = $state([]);
	list.forEach((p) => { p.x = 1; });
</script>
{p}{list}