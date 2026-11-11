<script>
	let { data } = $props();
	let g = $state([]);
	export function go() { ({ g } = data); }
</script>
<p>{g}</p>
