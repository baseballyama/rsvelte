<script>
	let props = $props();
	const k = 'x';
	let { a, [k]: c, ...r } = $derived(props);
</script>
<p>{a}{c}{r}</p>