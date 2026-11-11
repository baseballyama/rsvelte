<script>
	let obj = $state({});
	const k = 'x';
	let { a, [k]: c, 'weird-name': w, 0: n } = $derived(obj);
</script>
<p>{a}{c}{w}{n}</p>