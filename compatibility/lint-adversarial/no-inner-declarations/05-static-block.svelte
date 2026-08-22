<script>
	/* eslint svelte/no-inner-declarations: ["warn", "both"] */
	class C {
		static {
			var direct = 1;
			if (direct) {
				var nested = 2;
			}
		}
	}
	new C();
</script>
