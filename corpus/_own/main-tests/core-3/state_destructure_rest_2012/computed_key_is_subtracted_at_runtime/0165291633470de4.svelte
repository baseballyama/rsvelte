<script>
	const k = 'x';
	let { a, [k]: c, ...r } = $state({});
</script>
<p>{a}{c}{r}</p>