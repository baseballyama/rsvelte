<script>
	let obj = $state({});
	let { a, b, ...r } = $derived(obj);
</script>
<p>{a}{b}{r}</p>