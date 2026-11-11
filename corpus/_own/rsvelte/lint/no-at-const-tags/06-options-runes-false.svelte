<svelte:options runes={false} />

<script>
	/* mentions $effect in prose only */
	export let flag;
</script>

{#if flag}
	{@const note = 'legacy'}
	<span>{note}</span>
{/if}
