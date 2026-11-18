<script>
	let src = $state(0);
	let a = $state(0);
	$effect(function* () {
		a = src;
	});
</script>

{a}
