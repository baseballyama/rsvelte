<script>
	/* eslint svelte/no-inner-declarations: ["warn", "functions", { "blockScopedFunctions": "disallow" }] */
	const x = 1;
	if (x) {
		function inner() {}
		inner();
	}
	function ok() {
		if (x) {
			function bad() {}
			bad();
		}
	}
	ok();
</script>
