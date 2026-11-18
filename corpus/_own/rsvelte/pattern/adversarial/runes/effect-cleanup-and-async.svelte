<script>
	let n = $state(0);
	let ticks = $state(0);

	$effect(() => {
		const id = { n };
		return () => void id;
	});

	$effect.pre(() => {
		void n;
		return () => {};
	});

	const stop = $effect.root(() => {
		$effect(() => {
			ticks += 0;
			return () => {};
		});
		return () => {};
	});

	async function load() {
		await Promise.resolve();
		n += 1;
	}
</script>

<button onclick={() => { load(); stop(); }}>{n}{ticks}</button>
