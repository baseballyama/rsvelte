<svelte:options runes />
<script>
	let c = 0;
	$: d = c + 1;
</script>
<p>{d}</p>