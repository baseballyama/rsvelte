<script>
	export let p;
	let list = [];
	const g = ({ p }) => { p.x = 1; }; g(list[0]);
</script>
{p}{list}