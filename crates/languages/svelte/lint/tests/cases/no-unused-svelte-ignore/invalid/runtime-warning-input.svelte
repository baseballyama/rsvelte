<script>
	let { a } = $props();
	// svelte-ignore ownership_invalid_mutation
	a.b = 1;
</script>
<!-- svelte-ignore hydration_html_changed -->
{@html a}
