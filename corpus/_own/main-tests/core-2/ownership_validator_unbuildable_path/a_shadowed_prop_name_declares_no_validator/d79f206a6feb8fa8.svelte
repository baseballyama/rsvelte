<script>
	let { p } = $props();
	let list = $state([]);
	{ let p = list[0]; p.x = 1; }
</script>
{p}{list}