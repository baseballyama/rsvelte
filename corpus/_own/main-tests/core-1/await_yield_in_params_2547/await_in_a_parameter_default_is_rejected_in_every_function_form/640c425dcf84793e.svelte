<script>
	function load() {}
	let awaitable = 1;
	const f = (p = await load()) => p;
</script>

<p>ok</p>
