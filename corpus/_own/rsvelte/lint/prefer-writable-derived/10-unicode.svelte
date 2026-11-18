<script>
	let 高さ = $state(1);
	let 幅 = $state(0);
	$effect(() => {
		幅 = 高さ * 2;
	});
</script>

{幅}
