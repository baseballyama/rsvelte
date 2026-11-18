<script>
	let obj = $state({});
	const k = 'x';
	let { n: { [k]: c, ...r } } = $derived(obj);
</script>
<p>{c}{r}</p>