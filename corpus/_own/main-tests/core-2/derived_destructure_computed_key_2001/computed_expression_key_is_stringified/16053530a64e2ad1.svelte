<script>
	let obj = $state({});
	const k = 'x';
	let { [k + 1]: c, ...r } = $derived(obj);
</script>
<p>{c}{r}</p>