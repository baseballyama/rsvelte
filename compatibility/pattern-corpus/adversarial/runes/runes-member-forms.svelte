<script>
	let raw = $state.raw({ frozen: true });
	let list = $state([1, 2]);
	let total = $derived.by(() => {
		let sum = 0;
		for (const n of list) sum += n;
		return sum;
	});
	const uid = $props.id();

	$effect.pre(() => {
		if ($effect.tracking()) {
			console.log($state.snapshot(list));
		}
	});

	function reset() {
		raw = { frozen: false };
		list = $state.snapshot(list).slice(0, 1);
	}
</script>

<button id={uid} onclick={reset}>{total}:{raw.frozen}</button>
