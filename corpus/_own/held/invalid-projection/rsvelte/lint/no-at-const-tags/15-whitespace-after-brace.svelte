<svelte:options runes={true} />

{#if true}
	{  @const spaced = 1}
	{	@const tabbed = 2}
	{
		@const wrapped = 3}
	<span>{spaced}{tabbed}{wrapped}</span>
{/if}
