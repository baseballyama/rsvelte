<script>
	let obj = $state({});
	let { a, 0: z, ...r } = $derived(obj);
</script>
<p>{a}{z}{r}</p>