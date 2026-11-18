<script>
	import Child from './Child.svelte';
	let t = await Promise.resolve(1);
	let items = [1, 2];
</script>

{#each items as t}
	<Child value={t} />
	<div title={t}></div>
{/each}

<svelte:boundary>
	{const n = $derived(await Promise.resolve(2))}
	{#each items as t}
		<Child value={t + n} />
	{/each}
	<Child value={t + n} />
</svelte:boundary>
