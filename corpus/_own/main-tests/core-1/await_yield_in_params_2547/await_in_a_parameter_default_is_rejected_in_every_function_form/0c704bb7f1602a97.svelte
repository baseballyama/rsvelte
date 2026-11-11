<script>
	function load() {}
	let awaitable = 1;
	class C { async m(p = await load()) { return p; } }
</script>

<p>ok</p>
