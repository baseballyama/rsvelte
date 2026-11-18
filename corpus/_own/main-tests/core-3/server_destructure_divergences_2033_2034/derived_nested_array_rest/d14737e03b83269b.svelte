<script>
	let obj = $state([]);
	let [a, ...[b, ...c]] = $derived(obj);
</script>
<p>{a}{b}{c.length}</p>