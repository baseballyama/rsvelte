<script>
	function load() {}
	let awaitable = 1;
	async function f(p = await load()) { return p; }
</script>

<p>ok</p>
