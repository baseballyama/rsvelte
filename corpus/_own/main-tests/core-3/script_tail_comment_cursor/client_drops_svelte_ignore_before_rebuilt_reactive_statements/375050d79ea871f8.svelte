<script>
	export let a = 1;
	let b = 0;
	// svelte-ignore a11y_no_static_element_interactions
	$: if (b > 2) { console.log(b); }
</script>
<p>{b}</p>