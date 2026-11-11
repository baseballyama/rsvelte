<script module>
	const data = $state({ list: [] });
	const derived = $derived(data.list.filter(() => true));
	const state = { data, get derived() { return derived } };
</script>
<script>
	data.list.length = 0;
	$inspect(state);
</script>
