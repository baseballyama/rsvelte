<script>
	const k = 'x';
	let { [k]: a, 0: n, ...r } = $state({});
</script>
<p>{a}{n}{r.q}</p>