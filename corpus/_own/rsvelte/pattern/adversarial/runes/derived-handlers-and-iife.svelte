<script>
	let mode = $state('add');
	let n = $state(0);
	let handler = $derived(mode === 'add' ? () => (n += 1) : () => (n -= 1));
	let snapshot = $derived(
		(() => {
			const copy = { n, mode };
			return JSON.stringify(copy);
		})(),
	);
	let viaNew = $derived(new Set([mode]).size);
</script>

<button onclick={handler}>{snapshot}:{viaNew}</button>
<button onclick={() => (mode = mode === 'add' ? 'sub' : 'add')}>flip</button>
