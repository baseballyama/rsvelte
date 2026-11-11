<script>
	let src = $state({});
	let data = $derived(src);
	let g = $state([]);
	export function go() { ({ g } = data); }
</script>
<p>{g}</p>
