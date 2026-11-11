<svelte:options runes={false} />
<script>export let items = [];</script>
{#each items as x}
	{@const y = x * 2}
	<p>{y}</p>
{/each}