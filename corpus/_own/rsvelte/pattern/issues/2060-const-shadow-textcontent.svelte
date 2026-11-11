<script>
	let value = $state(0);
</script>

<button onclick={() => value++}>{value}</button>

{#if value >= 0}
	{@const value = () => 'shadowed'}
	<p>{value}</p>
{/if}
