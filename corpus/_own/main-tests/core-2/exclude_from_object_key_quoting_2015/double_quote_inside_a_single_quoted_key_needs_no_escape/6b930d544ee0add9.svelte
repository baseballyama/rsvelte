<script>
	let obj = $state({});
	let { 'a"b': v, ...r } = $derived(obj);
</script>
<p>{v}{r}</p>