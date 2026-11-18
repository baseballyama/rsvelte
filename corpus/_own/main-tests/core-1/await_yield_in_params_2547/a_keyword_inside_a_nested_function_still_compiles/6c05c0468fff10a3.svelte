<script>
	function load() {}
	let awaitable = 1;
	const f = async (p = class { async m() { return await load(); } }) => p;
</script>

<p>ok</p>
