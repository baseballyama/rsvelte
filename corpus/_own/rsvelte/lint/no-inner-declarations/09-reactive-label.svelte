<script>
	/* eslint svelte/no-inner-declarations: ["warn", "both"] */
	export let n;
	$: {
		var doubled = n * 2;
	}
	$: if (n) {
		var quad = n * 4;
	}
</script>

{typeof doubled}{typeof quad}
