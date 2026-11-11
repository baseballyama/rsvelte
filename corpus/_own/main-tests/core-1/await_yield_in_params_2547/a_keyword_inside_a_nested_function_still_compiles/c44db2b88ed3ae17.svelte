<script>
	function load() {}
	let awaitable = 1;
	const f = async (p = { async m() { return await load(); } }) => p;
</script>

<p>ok</p>
