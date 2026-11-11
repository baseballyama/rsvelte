<svelte:options runes />
<script>
	let a = 1;
	$: b = a;
</script>
{b}
