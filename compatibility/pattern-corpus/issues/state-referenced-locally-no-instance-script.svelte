{#each [1] as _}
	{let count = $state(0)}
	<input bind:value={count} />
{/each}

{let top = $state(0)}
<input bind:value={top} />
