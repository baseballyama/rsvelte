<script>
	const data = { g: 1 };
	let g = $state([]);
	export function go() { ({ g } = data); }
</script>
<p>{g}</p>
