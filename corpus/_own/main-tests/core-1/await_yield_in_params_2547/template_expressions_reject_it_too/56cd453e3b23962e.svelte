<script>
	function load() {}
	let awaitable = 1;
</script>

<p>{[async (p = await load()) => p].length}</p>
