<script>
	let a = 1;
	// svelte-ignore state_referenced_locally
	$: b = a;
</script>
<span>{b}</span>
