<script>
	import { setContext, getContext, hasContext, tick, untrack } from 'svelte';
	let n = $state(0);
	setContext('k', { get n() { return n; } });
	const ctx = hasContext('k') ? getContext('k') : null;
	async function bump() {
		n += 1;
		await tick();
		console.log(untrack(() => n), ctx?.n);
	}
</script>

<button onclick={bump}>{n}</button>
