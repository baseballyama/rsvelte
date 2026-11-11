<script>
	let src = $state(0);
	let r = $state.raw(0);
	$effect(() => {
		r = src;
	});
</script>

{r}
