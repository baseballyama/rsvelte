<script>
	const k = 'x';
	let { [k + 1]: c } = $state({});
</script>
<p>{c}</p>