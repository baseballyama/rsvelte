<script>
	let items = $state([1, 2]);
	const cleanup = $effect.root(() => {
		$effect(() => {
			console.log($state.snapshot(items));
		});
		return () => {};
	});
	$effect.root(() => {});
	function copy() {
		return $state.snapshot(items);
	}
</script>

<button onclick={() => console.log(copy(), cleanup)}>{copy().length}</button>
