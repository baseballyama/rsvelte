<script>
	let obj = $state({});
	const k = 'x';
	let { a, [k]: c, ...r } = $derived(obj);
</script>
<p>{a}{c}{r}</p>