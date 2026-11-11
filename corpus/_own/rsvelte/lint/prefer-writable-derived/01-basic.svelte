<script>
	let b = $state(0);
	let a = $state(0);
	$effect(() => {
		a = b * 2;
	});
</script>

{a}
