<script>
	let obj = $state({});
	const k = 'x';
	let { [k]: c = 5 } = $derived(obj);
</script>
<p>{c}</p>