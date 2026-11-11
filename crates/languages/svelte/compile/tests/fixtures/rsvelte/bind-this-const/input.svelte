<script>
	let items = $state([{ id: 1 }]);
	let els = $state({});
	let refs = $state([]);
	let n = $state(0);
</script>
{#each items as item, i}
	{@const key = item.id}
	{@const k2 = key + n}
	<div bind:this={els[key]}></div>
	<p bind:this={refs[k2][i]}></p>
	{#if n}
		{@const inner = item.id}
		<span bind:this={els[inner]}></span>
	{/if}
{/each}
