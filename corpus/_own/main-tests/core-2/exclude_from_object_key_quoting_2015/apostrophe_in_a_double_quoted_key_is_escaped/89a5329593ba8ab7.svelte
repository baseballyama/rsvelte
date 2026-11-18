<script>
	let obj = $state({});
	let { "it's": v, ...r } = $derived(obj);
</script>
<p>{v}{r}</p>