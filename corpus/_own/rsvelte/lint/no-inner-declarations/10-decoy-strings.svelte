<script>
	/* eslint svelte/no-inner-declarations: ["warn", "both"] */
	const s = 'if (a) { var fake = 1; }';
	const t = `function g() {} if (b) { function h() {} }`;
	// if (c) { var alsoFake = 2; }
	if (s) {
		var real = t;
	}
</script>

{real}
