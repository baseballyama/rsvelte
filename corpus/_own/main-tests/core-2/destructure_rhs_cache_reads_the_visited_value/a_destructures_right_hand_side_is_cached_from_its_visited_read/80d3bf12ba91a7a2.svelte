<script>
	let { data = $bindable() } = $props();
	let g = $state([]);
	export function go() { ({ g } = data); }
</script>
<p>{g}</p>
