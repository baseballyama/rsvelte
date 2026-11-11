<script>
	/* eslint svelte/no-inner-declarations: ["warn", "both"] */
	const o = {
		m() {
			var ok = 1;
			if (ok) {
				var bad = 2;
			}
			return bad;
		},
		get g() {
			var ok2 = 3;
			return ok2;
		}
	};
	o.m();
</script>

{o.g}
