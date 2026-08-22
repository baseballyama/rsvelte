<svelte:options runes={true} />

{#each [1, 2] as n (n)}
	{@const double = n * 2}
	<span>{double}</span>
{/each}
{#if true}
	{@const x = 1}
	{x}
{/if}
