<script>
	function load() {}
	let awaitable = 1;
	const f = async function (p = await load()) { return p; };
</script>

<p>ok</p>
