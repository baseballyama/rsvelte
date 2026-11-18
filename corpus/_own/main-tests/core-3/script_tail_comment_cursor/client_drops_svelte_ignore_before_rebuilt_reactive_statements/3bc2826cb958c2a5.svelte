<script>
	export let a = 1;
	let b = 0;
	// svelte-ignore a11y_no_static_element_interactions
	$: b = a * 2;
</script>
<p>{b}</p>