<svelte:options runes={false} />
<script>
	let a = $state(1);
	$effect(() => { console.log(a); });
	$inspect(a);
</script>
<p>{a}</p>
