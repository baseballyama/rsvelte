<script>
	let { a: aa, 'weird-name': w, ...r } = $state({});
</script>
<p>{aa}{w}{r}</p>