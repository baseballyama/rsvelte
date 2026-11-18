<script>
	let src = $state(0);
	let dest = $state(0);
	$effect.pre(() => {
		dest = src + 1;
	});
</script>

{dest}
