<script>
	let [x] = $state([1]);
	let { y } = $state({ y: 2 });
	const [z] = $derived.by(() => [x]);
</script>
{x}{y}{z}
