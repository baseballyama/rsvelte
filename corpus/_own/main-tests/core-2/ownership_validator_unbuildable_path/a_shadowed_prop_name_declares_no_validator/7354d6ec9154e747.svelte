<script>
	let { p } = $props();
	let list = $state([]);
	function h(p) { p.x = 1; } h(list[0]);
</script>
{p}{list}