<script>
	let obj = $state({});
	let k = $derived('x');
	let { [k]: a, ...r } = $derived(obj);
</script>
<p>{a}{r.q}</p>