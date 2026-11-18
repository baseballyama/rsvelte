<!-- svelte-ignore state_referenced_locally -->
<script>
	let { a } = $props();
	const suppressed = a;
</script>

<div class="used">{suppressed}</div>

<!-- svelte-ignore css_unused_selector -->
<div class="also-used"></div>

<style>
	.used {
		color: red;
	}
	.also-used {
		color: blue;
	}
	.never-matched {
		color: green;
	}
</style>
