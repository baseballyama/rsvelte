<script>
	function load() {}
	let awaitable = 1;
	const o = { async *g(p = yield 1) { return p; } };
</script>

<p>ok</p>
