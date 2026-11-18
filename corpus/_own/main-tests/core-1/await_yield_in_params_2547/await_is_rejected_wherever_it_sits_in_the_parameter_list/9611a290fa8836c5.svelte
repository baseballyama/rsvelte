<script>
	function load() {}
	let awaitable = 1;
	const f = async (p = ((q = await load()) => q)) => p;
</script>

<p>ok</p>
