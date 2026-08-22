<svelte:options runes={true} />

<script>
	let p = Promise.resolve(1);
	let k = 1;
</script>

{#snippet row(v)}
	{@const doubled = v * 2}
	<span>{doubled}</span>
{/snippet}
{@render row(k)}
{#await p then value}
	{@const shown = value + 1}
	<span>{shown}</span>
{/await}
{#key k}
	{@const keyed = k}
	<span>{keyed}</span>
{/key}
<svelte:boundary>
	{#if k}
		{@const inner = k}
		<span>{inner}</span>
	{/if}
</svelte:boundary>
