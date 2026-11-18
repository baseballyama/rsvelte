<script>
	let obj = $state({});
	const k = 'x';
	let { [k]: [c, d] } = $derived(obj);
</script>
<p>{c}{d}</p>