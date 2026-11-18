<svelte:options runes={false} />

<script>
	let value = 'outer';
	export let prop = 'outer prop';
</script>

{#each [{ value: 1, nested: { count: 1 } }] as { value, nested }}
	<button onclick={() => { value += 2; nested.count += 1; }}>write</button>
{/each}

{#each ['outer'] as same}
	{#each ['inner'] as same}
		<button onclick={() => { same = 'written'; }}>nested write</button>
	{/each}
{/each}

{#each ['shadow'] as prop}
	{String(prop)}
{/each}
