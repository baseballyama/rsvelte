<script>
	function load() {}
	let awaitable = 1;
	const o = { async *m(p = await load()) { return p; } };
</script>

<p>ok</p>
