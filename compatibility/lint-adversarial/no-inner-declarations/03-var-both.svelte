<script>
	/* eslint svelte/no-inner-declarations: ["warn", "both"] */
	var top = 1;
	if (top) {
		var inner = 2;
	}
	while (top < 0) {
		var loop = 3;
	}
	function f() {
		var ok = 4;
		if (ok) {
			var bad = 5;
		}
		return [ok, bad, inner, loop];
	}
	f();
</script>
