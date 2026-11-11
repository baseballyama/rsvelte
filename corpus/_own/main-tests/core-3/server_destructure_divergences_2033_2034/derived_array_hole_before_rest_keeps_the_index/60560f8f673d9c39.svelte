<script>
	let obj = $state([]);
	let [, ...b] = $derived(obj);
</script>
<p>{b.length}</p>