<script>
	function load() {}
	let awaitable = 1;
</script>

<button onclick={async (p = await load()) => p}>go</button>
