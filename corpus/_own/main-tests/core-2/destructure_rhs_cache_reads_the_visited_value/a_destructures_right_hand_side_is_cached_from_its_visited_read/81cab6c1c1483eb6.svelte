<script>
	let data = $state({});
	let g = $state([]);
	export function go() { ({ g } = data); }
</script>
<p>{g}</p>
