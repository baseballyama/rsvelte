<script>
	let obj = $state([]);
	let [a, ...b] = $derived(obj);
</script>

<p>{a}{b.length}</p>
