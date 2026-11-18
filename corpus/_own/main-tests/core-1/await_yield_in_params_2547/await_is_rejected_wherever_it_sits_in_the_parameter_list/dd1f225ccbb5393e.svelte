<script>
	function load() {}
	let awaitable = 1;
	const f = async (a, p = await load()) => p;
</script>

<p>ok</p>
