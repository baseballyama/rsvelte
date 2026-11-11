<script>
	let a = $state(0);
	const src = [{ a: 1 }];
	function go() {
		[{ a }, ] = src;
	}
</script>
<button onclick={go}>{a}</button>