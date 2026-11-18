<script>
	let obj = $state({});
	let { a, 'weird-name': w, ...r } = $derived(obj);
</script>
<p>{a}{w}{r}</p>