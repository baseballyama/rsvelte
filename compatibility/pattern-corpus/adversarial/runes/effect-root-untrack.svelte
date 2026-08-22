<script>
	import { untrack } from 'svelte';
	let a = $state(1);
	let b = $state(2);
	let log = $state([]);
	$effect(() => {
		const va = a;
		const vb = untrack(() => b);
		log = [...untrack(() => log), va + vb];
	});
	const dispose = $effect.root(() => {
		$effect(() => void a);
		return () => {};
	});
</script>

<button onclick={() => { a += 1; b += 1; }}>{log.join(',')}</button>
<button onclick={dispose}>stop</button>
