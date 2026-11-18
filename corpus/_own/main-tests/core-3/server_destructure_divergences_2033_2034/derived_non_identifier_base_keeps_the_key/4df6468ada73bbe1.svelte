<script>
	let obj = $state({});
	const k = 'x';
	let { [k]: c } = $derived({ ...obj });
</script>
<p>{c}</p>