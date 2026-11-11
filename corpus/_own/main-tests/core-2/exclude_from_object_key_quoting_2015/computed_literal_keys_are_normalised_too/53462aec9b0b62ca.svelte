<script>
	let obj = $state({});
	let { ["lit"]: c, [0]: z, ...r } = $derived(obj);
</script>
<p>{c}{z}{r}</p>