<script>
	function load() {}
	let awaitable = 1;
	const f = async ([p = await load()] = []) => p;
</script>

<p>ok</p>
