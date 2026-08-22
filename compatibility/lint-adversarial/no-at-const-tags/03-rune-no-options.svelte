<script>
	let count = $state(0);
</script>

{#if count >= 0}
	{@const label = 'n'}
	<button onclick={() => count++}>{label}{count}</button>
{/if}
