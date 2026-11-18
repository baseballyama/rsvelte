<script>
	let obj = $state({});
	let { "weird-name": w, ...r } = $derived(obj);
</script>
<p>{w}{r}</p>