<script>
	let obj = $state({});
	let { ['lit']: c, ...r } = $derived(obj);
</script>
<p>{c}{r}</p>