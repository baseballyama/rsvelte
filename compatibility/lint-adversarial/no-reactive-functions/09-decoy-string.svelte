<script>
	export let count;
	const doc = `usage: $: f = () => {}`;
	// $: g = () => {}
	let f;
	$: f = count + doc.length;
</script>

{f}
