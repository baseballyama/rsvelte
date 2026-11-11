<script>
	let obj = $state({});
	let { "a\u0041b": v, ...r } = $derived(obj);
</script>
<p>{v}{r}</p>