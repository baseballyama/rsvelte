<script>
	let a = $state.raw({ deep: 1 });
	let b = $state({ deep: 2 });
	const snap = $derived($state.snapshot(b));
	const byRune = $derived.by(() => a.deep + b.deep);
	const id = $props.id();

	$effect.pre(() => {
		void a.deep;
	});

	$effect(() => {
		if ($effect.tracking()) void byRune;
	});

	const stop = $effect.root(() => {
		$effect(() => void b.deep);
		return () => {};
	});

	$inspect(a, b).with((type, ...rest) => void [type, rest]);
</script>

<p id={id}>{snap.deep}{byRune}</p>
<button onclick={() => { b.deep++; stop(); }}>+</button>
