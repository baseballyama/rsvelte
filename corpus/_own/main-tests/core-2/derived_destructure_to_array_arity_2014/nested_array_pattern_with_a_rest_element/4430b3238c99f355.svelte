<script>
	let obj = $state({});
	let { list: [a, ...b] } = $derived(obj);
</script>
<p>{a}{b}</p>