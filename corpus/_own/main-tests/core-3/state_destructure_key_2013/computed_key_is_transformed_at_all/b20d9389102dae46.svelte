<script>
	const k = 'x';
	let { a, [k]: c } = $state({});
</script>
<p>{a}{c}</p>