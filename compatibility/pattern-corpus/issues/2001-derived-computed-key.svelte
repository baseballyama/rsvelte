<script>
	let obj = $state({});
	const k = 'x';
	let { a, [k]: c, 'weird-name': w } = $derived(obj);
</script>

<p>{a}{c}{w}</p>
