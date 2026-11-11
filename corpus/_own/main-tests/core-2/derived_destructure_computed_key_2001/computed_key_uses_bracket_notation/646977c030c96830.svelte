<script>
	let obj = $state({});
	const k = 'x';
	let { a, [k]: c } = $derived(obj);
</script>
<p>{a}{c}</p>