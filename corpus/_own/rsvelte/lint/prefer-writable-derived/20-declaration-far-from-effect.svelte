<script>
	let 幅 = $state(0), 高さ = $state(0);
	/* 絵文字🎉🚀 */ let 面積 = $state(0);
	function noop() {}
	noop();
	$effect(() => {
		面積 = 幅 * 高さ;
	});
</script>

{面積}
