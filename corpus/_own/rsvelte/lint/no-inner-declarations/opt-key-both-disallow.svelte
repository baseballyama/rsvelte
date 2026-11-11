<script>
	/* eslint svelte/no-inner-declarations: ["warn","both",{"blockScopedFunctions":"disallow"}] */
	const v = 1;
	if (v) {
		function inBlock() {}
		var inVar = 1;
		void inBlock; void inVar;
	}
</script>

<div>{v}</div>
