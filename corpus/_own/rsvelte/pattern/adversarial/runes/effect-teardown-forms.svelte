<script>
	let running = $state(false);
	let ticks = $state(0);

	$effect(() => {
		if (!running) return;
		const id = setInterval(() => {
			ticks += 1;
		}, 100);
		return () => clearInterval(id);
	});

	$effect(() => {
		const controller = new AbortController();
		document.addEventListener('click', () => (ticks = 0), { signal: controller.signal });
		return controller.abort.bind(controller);
	});

	const stop = $effect.root(() => {
		$effect(() => void ticks);
	});
</script>

<button onclick={() => (running = !running)}>{ticks}</button>
<button onclick={stop}>stop</button>
