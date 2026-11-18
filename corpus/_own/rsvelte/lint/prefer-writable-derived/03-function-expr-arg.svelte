<script>
	let src = $state(0);
	let d = $state(0);
	$effect(function () {
		d = src + 1;
	});
</script>

{d}
