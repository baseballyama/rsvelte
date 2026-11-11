<svelte:options runes={true} />

{#if true}
	{const modern = 1}
	{@const legacy = 2}
	<span>{modern}{legacy}</span>
{/if}
