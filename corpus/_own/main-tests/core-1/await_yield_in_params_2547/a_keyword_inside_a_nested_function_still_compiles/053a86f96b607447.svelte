<script>
	function load() {}
	let awaitable = 1;
	const f = async (p = function* () { yield 1; }) => p;
</script>

<p>ok</p>
