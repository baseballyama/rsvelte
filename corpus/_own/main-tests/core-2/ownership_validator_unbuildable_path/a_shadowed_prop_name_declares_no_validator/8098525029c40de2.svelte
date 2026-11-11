<script>
	let { p } = $props();
	let list = $state([]);
	const g = ({ p }) => { p.x = 1; }; g(list[0]);
</script>
{p}{list}