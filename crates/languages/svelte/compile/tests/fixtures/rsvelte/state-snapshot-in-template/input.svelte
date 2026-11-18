<script>
	let items = $state([1, 2]);
</script>

<p>{$state.snapshot(items).length}</p>
