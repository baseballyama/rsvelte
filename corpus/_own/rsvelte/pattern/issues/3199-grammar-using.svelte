<script>
	function scoped() {
		using resource = {
			[Symbol.dispose]() {},
		};
		return resource;
	}

	const held = scoped();
</script>

<b>{typeof held}</b>
