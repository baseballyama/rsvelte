<script>
	import C from './C.svelte';
	let n = $state(1);
	let d = $derived(n * 2);
	let e = $derived.by(() => n);
	let o = $derived({ a: n });
</script>
<input bind:value={d} />
<input bind:value={o.a} />
<C bind:value={e} />
<div bind:this={d}></div>
