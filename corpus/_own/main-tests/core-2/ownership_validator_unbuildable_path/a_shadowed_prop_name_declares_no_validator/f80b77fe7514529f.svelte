<script>
	let { p } = $props();
	let list = $state([]);
	list.map(function (p) { p.x = 1; });
</script>
{p}{list}