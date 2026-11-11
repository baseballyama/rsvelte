<script>
	import Child from './Child.svelte';
	let obj = { n: 1 };
</script>

<svelte:boundary>
	{const h = $derived(await Promise.resolve({ n: 42 }))}
	{const n = $derived(h.n)}
	<Child value={n}>{n}</Child>
	<div class={n}></div>
	<Child value={obj.n} />
	<div class={obj.n}></div>
</svelte:boundary>
