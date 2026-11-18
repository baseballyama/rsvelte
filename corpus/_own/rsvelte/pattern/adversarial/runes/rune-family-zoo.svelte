<script>
	const uid = $props.id();
	let raw = $state.raw({ deep: { n: 1 } });
	let live = $state({ n: 2 });
	const snap = $derived($state.snapshot(live));
	const lazy = $derived.by(() => raw.deep.n + snap.n);
	$effect.pre(() => {
		console.log('pre', lazy);
	});
	$effect(() => {
		console.log('post', $effect.tracking());
	});
</script>

<p id={uid}>{lazy}</p>
<button onclick={() => (raw = { deep: { n: raw.deep.n + 1 } })}>raw</button>
<button onclick={() => (live.n += 1)}>live</button>
