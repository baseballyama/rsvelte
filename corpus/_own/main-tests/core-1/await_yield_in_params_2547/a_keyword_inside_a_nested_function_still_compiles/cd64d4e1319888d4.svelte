<script>
	function load() {}
	let awaitable = 1;
	const f = async (p = (async () => await load())) => p;
</script>

<p>ok</p>
