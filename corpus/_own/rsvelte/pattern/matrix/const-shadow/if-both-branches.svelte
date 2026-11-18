<script>
	let value = $state(0);
</script>

<button onclick={() => value++}>{value}</button>

{#if value}
	{@const value = () => 'consequent'}
	<p>{value}</p>
{:else}
	{@const value = () => 'alternate'}
	<p>{value}</p>
{/if}
