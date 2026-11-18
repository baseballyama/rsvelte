<script>
	let src = $state(0);
	let plain = 0;
	$effect(() => {
		plain = src;
	});
</script>

{plain}
